# 🔐 Scanno-Auth

**Scanno-Auth** is the authentication and AI analysis backend that powers the **Scanno** platform.  
It provides secure user management (Engineer & Admin), role-based JWT authentication, API key control for OpenAI integration, and AI-powered vehicle inspection analysis.

---

## 🚀 Overview

This service combines **authentication**, **AI integration**, and **session management** into one scalable FastAPI backend.

### Core Capabilities

| Category | Features |
|-----------|-----------|
| **Authentication** | JWT login/register system for Engineers and Admins |
| **Role-based Access** | Admin and Engineer separation with enforced permissions |
| **Password Security** | Bcrypt hashing with Passlib |
| **OpenAI Integration** | GPT-4o Vision & Text for car inspection report analysis |
| **Chat Persistence** | Redis session storage with auto-expiry |
| **Admin Control** | Admin can manage and rotate OpenAI API keys |
| **History Management** | Engineers can view, add, and delete chat history |
| **PostgreSQL Database** | Stores users, admins, API keys, and chat history |

---

## 🧱 Project Structure

```plaintext
Scanno_Auth/
│
├── app/
│   ├── main.py               # FastAPI entry point
│   ├── models.py             # SQLAlchemy ORM models
│   ├── auth.py               # JWT creation & verification
│   ├── crud.py               # Database queries and operations
│   ├── schemas.py            # Pydantic request/response models
│   ├── database.py           # SQLAlchemy connection setup
│   ├── config.py             # Environment configuration
│   ├── utils.py              # Password hashing & verification
│   ├── routes/
│   │   ├── user_routes.py    # Engineer registration, login, history, etc.
│   │   ├── admin_routes.py   # Admin login and API key management
│   │   └── chat_core.py      # AI report analysis and chat features
│   └── create_admin_user.py  # Script to create initial Admin user
│
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables
````

---

## ⚙️ Tech Stack

* **FastAPI** — modern, async Python web framework
* **PostgreSQL** — relational database for users & chat history
* **SQLAlchemy ORM** — database modeling & session management
* **Redis** — chat session storage (TTL-based)
* **OpenAI GPT-4o** — text and vision-based inspection report analysis
* **Passlib (bcrypt)** — password hashing
* **Python-JOSE** — JWT encoding and decoding

---

## 📦 Setup & Installation

### 1. Clone the repository

```bash
git clone https://gitlab.com/FrostSight/car-inspector.git
cd Scanno_Auth
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://<user>:<password>@localhost/scanno_db"
JWT_SECRET_KEY="your-secure-secret"
ADMIN_EMAIL="admin@scanno.ai"
ADMIN_PASSWORD="supersecurepassword"
```

### 5. Initialize the database and admin user

```bash
python app/create_admin_user.py
```

### 6. Run the application

```bash
uvicorn app.main:app --reload
```

App will start at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🧩 API Endpoints

### 🔑 Authentication (Engineer)

| Method | Endpoint                     | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| POST   | `/user/register`             | Register a new Engineer               |
| POST   | `/user/login`                | Log in and get JWT tokens             |
| POST   | `/user/password/change`      | Change password                       |
| GET    | `/user/history`              | Get past chat summaries               |
| POST   | `/user/history`              | Add a new chat summary                |
| DELETE | `/user/history`              | Delete all chat history               |
| GET    | `/user/session/{session_id}` | Fetch full session history from Redis |

---

### ⚙️ Admin Endpoints

| Method | Endpoint        | Description                  |
| ------ | --------------- | ---------------------------- |
| POST   | `/admin/login`  | Admin login                  |
| POST   | `/admin/apikey` | Add or update OpenAI API key |
| GET    | `/admin/apikey` | View key status              |
| DELETE | `/admin/apikey` | Delete API key               |

---

### 🤖 AI Chat Core

| Method | Endpoint          | Description                               |
| ------ | ----------------- | ----------------------------------------- |
| POST   | `/analyze-report` | Upload a PDF/image report for AI analysis |
| POST   | `/chat`           | Continue chat on existing session         |

---

## 🧠 AI Report Analysis Workflow

1. **Engineer** uploads a car inspection report (`.pdf`, `.jpg`, `.png`).
2. **System**:

   * Extracts text via `pdfplumber` or image bytes.
   * Calls **OpenAI GPT-4o** (Vision/Text).
   * Returns structured JSON:

     ```json
     {
       "summary": "Overall car in good condition.",
       "risk_level": "Low",
       "issues": ["Minor scratch on rear bumper"],
       "maintenance": ["Polish recommended"],
       "recommendation": "Safe to drive"
     }
     ```
3. Result is saved to:

   * Redis (for temporary chat state)
   * PostgreSQL (as summarized history)

---

## 🗄️ Data Models

| Model        | Description                                  |
| ------------ | -------------------------------------------- |
| **Engineer** | Regular user with chat access                |
| **Admin**    | Has privileges to manage API keys            |
| **APIKey**   | Stores OpenAI API key for GPT-4o integration |
| **History**  | Stores metadata of user chat summaries       |

---

## 🔐 Security

* Passwords stored only as **bcrypt hashes**
* JWT tokens include both `email` and `role`
* Access token expires in **30 minutes**, refresh token in **7 days**
* Role-based route protection (`Admin` vs `Engineer`)
* OpenAI API key is stored securely and editable only by Admin

---

## 🧰 Development Notes

* Redis must be running for chat sessions to work:

  ```bash
  redis-server
  ```
* SQLite can be used for testing by changing the `DATABASE_URL` in `.env`:

  ```bash
  DATABASE_URL="sqlite:///./scanno_test.db"
  ```
* Logs are written to `scanno_integrated.log`.

---

## 🧪 Testing

Use `pytest` for endpoint and logic tests (to be added in `/tests`).

Example test:

```python
def test_register_user(client):
    response = client.post("/user/register", json={"email": "test@test.com", "password": "123456"})
    assert response.status_code == 200
```

