## API Endpoints

| `POST` | `/register` | Register a new user account 
| `POST` | `/login` | Authenticate user
| `GET` | `/user/profile` | Fetch authenticated user details
| `POST` | `/logout` | Log out user session
| `GET` | `/health` | Server & DB health check

---

 ### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
---

## Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update the PostgreSQL password in `backend/.env`, then create a database
named `user_profile_db`.

Start the backend:

```bash
python -m uvicorn app.main:app --reload --port 8000
```
