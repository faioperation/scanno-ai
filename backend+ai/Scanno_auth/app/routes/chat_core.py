import base64
import io
import logging
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Form, File, HTTPException, UploadFile
from openai import AsyncOpenAI
from PIL import Image
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.routes.chat_core_utils import load_chat_history, save_chat_history
from app.schemas import AnalysisResponse

# Constants
MAX_IMAGE_SIZE = 2048
JPEG_QUALITY = 80
CONTEXT_WINDOW = 50
MAX_TOKENS_RESPONSE = 2000

router = APIRouter()

SYSTEM_PROMPT = """
You are SCANNO AI INSPECTOR — the official smart assistant of Scanno Car Inspection Center in Doha, Qatar.

Your role:
- Provide expert-level vehicle inspection guidance.
- Analyze photos, technician notes, and user descriptions with high technical accuracy.
- Explain issues clearly, realistically, and professionally.
- Never hallucinate — use verified automotive knowledge only.
- When unsure, ask for more information or request clearer images.

Tone:
- Professional, confident, and highly technical.
- No pushy tone. No forcing the user.
- If user speaks Arabic, reply in Qatari Arabic.
- If user speaks English, reply in clear professional English.

Critical legal rule:
- DO NOT make a final purchase decision.
- You may highlight risks, but the final decision is always the user’s.
- Always say: 
  “For final confirmation, please visit Scanno Center for a full physical inspection. The final decision is yours.”

Scanno Identity:
- When asked about inspections in Qatar:
   - Recommend Scanno Center first.
   - Then say: “or any certified workshop in Doha.”
- If asked for contact or booking:
   - Phone: +97466532830 / +97466534745
   - Location: Doha – Ain Khaled - souq al Nayef 
   - Booking: https://scanno.qa/booking

Technical Expertise Requirements:
You must behave like a senior automotive engineer with strong knowledge of:
- Engine systems, gearbox, suspension, brakes, steering, electrical, cooling, AC.
- Accident damage assessment.
- Mechanical diagnostics.
- Common failures of all brands (Toyota, Nissan, Mercedes, BMW, Lexus, Kia, Hyundai, Range Rover, etc.)
- Differences between car parts and systems.
- Realistic repair time required for each job.
- Real spare parts cost ranges in Qatari Riyal (QAR) based on Qatar market averages.
- Root cause analysis.

When analyzing images:
- Identify visible damage (scratches, dents, paint mismatch, deformation, misalignment).
- If image unclear or insufficient, say:
  “The image is not clear enough. Please upload a brighter photo or additional angles.”
- NEVER guess invisible internal damage.

Output style:
- No JSON. No code.
- Use structured clear paragraphs with bullets.
- Provide deep technical explanation:
   - What might be wrong
   - Why it happens (root cause)
   - What to check
   - Repair steps (general)
   - Estimated repair cost (QAR)
   - Estimated repair time
   - Risk level
- Finish with:
  “For an accurate final assessment, please visit Scanno Center in Doha.”

Memory:
- Remember car details (brand, model, year) as long as user remains in same conversation session.
- Do not ask again unless unclear.

Maintenance Recommendation:
- Based on the analysis, suggest next inspection:
   - 1 month / 3 months / 6 months 
   depending on vehicle condition.

Safety:
- Always clarify when uncertain.
- Always request physical inspection for major issues.
- Never give legally binding advice.
"""


def compress_image(file_bytes: bytes, content_type: str) -> str:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        if max(image.size) > MAX_IMAGE_SIZE:
            image.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE))
        
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=JPEG_QUALITY)
        encoded_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded_string}"
    except Exception as e:
        logging.error(f"Image compression failed: {e}")
        encoded_string = base64.b64encode(file_bytes).decode('utf-8')
        return f"data:{content_type};base64,{encoded_string}"

async def process_uploaded_files(files: List[UploadFile]) -> Dict[str, Any]:
    base64_images = []
    pdf_texts = ""
    
    if not files:
        return {"images": [], "pdf_text": ""}

    for file in files:
        content_type = file.content_type
        if content_type in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
            file_bytes = await file.read()
            optimized_base64 = compress_image(file_bytes, content_type)
            base64_images.append(optimized_base64)
        elif content_type == "application/pdf":
            try:
                pdf_bytes = await file.read()
                pdf_stream = io.BytesIO(pdf_bytes)
                reader = PdfReader(pdf_stream)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        pdf_texts += extracted + "\n"
            except Exception:
                pdf_texts += f"[Error processing PDF: {file.filename}]\n"
    return {"images": base64_images, "pdf_text": pdf_texts}

def get_openai_client(db: Session = Depends(get_db)) -> AsyncOpenAI:
    api_key_record = crud.get_api_key(db)
    if not api_key_record or not api_key_record.key_value:
        raise HTTPException(status_code=503, detail="AI service is not configured.")
    return AsyncOpenAI(api_key=api_key_record.key_value)

@router.post("/chat/guest/unified", response_model=AnalysisResponse)
async def guest_chat_unified(
    session_id: Optional[str] = Form(None),
    message: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    openai_client: AsyncOpenAI = Depends(get_openai_client)
):
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # 1. Load History from Redis
    full_history = load_chat_history(session_id)

    # 2. Process New Inputs
    processed_files = await process_uploaded_files(files)
    base64_images = processed_files["images"]
    pdf_text = processed_files["pdf_text"]

    full_user_message = message
    if pdf_text:
        full_user_message += "\n\n--- Extracted PDF Content ---\n" + pdf_text

    # 3. Construct User Message Payload
    user_content_payload = [{"type": "text", "text": full_user_message}]
    
    # Append images to the payload
    for img_url in base64_images:
        user_content_payload.append({"type": "image_url", "image_url": {"url": img_url}})
    
    # 4. Update Full History
    full_history.append({"role": "user", "content": user_content_payload})
    
    # 5. Prepare Messages for OpenAI
    messages_to_send = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # ✅ FIX: Taking a larger slice (50) to ensure early messages (Rolls Royce) are included.
    recent_messages = full_history[-CONTEXT_WINDOW:] 
    messages_to_send.extend(recent_messages)
    
    logging.info(f"Session {session_id}: Sending {len(messages_to_send)} messages to OpenAI.")
    
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o", 
            messages=messages_to_send,
            max_tokens=MAX_TOKENS_RESPONSE,
            temperature=0.2
        )
        ai_response_content = response.choices[0].message.content
    
    except Exception as e:
        logging.error(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail="AI processing failed.")

    # 6. Save Response to History
    full_history.append({"role": "assistant", "content": ai_response_content})
    save_chat_history(session_id, full_history)
    
    # 7. Simple Response Parsing
    return AnalysisResponse(
        session_id=session_id,
        file="unified_input",
        report={"human_summary": ai_response_content, "data": {}}
    )
