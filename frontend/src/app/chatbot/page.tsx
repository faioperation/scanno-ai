import ChatBot from "@/components/chatbot/ChatBot";
import { BRAND_CONFIG } from "@/lib/constants";

export const metadata = {
  title: `AI Chatbot | ${BRAND_CONFIG.brandName}`,
  description: `Chat with ${BRAND_CONFIG.brandName} for car information, maintenance advice, and damage analysis from photos.`,
};

export default function ChatbotPage() {
  return (
    <main className="flex h-dvh flex-col">
      <ChatBot />
    </main>
  );
}
