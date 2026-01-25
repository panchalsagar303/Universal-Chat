# Universal Chat 🚀

A high-performance, real-time chat application demonstrating a **Hybrid Backend Architecture**.

This project combines the rapid development of **Django** with the high concurrency of **Go (Golang)**, unified by a shared **PostgreSQL** database and a modern **Next.js** frontend.

![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

## 🏗 System Architecture



The system uses a "Best Tool for the Job" approach:
1.  **Django (Python):** Handles User Authentication (JWT), Admin Panel, and Database Schema Migrations.
2.  **Go (Golang):** Handles the WebSocket Hub, managing real-time connections and broadcasting messages with low latency.
3.  **PostgreSQL:** The shared source of truth. Django creates the tables; Go writes directly to them for speed.
4.  **Next.js (React):** A modern, type-safe frontend that connects to Django for Login and Go for Chatting.

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios.
- **Auth Backend:** Django Rest Framework, SimpleJWT.
- **Real-Time Backend:** Go (Gorilla WebSockets), `lib/pq` driver.
- **Database:** PostgreSQL.
- **DevOps:** Monorepo structure.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Python (v3.10+)
- Go (v1.21+)
- PostgreSQL

### 1. Database Setup
Create a PostgreSQL database and user:
```sql
CREATE DATABASE database_name;
CREATE USER user_name WITH PASSWORD 'user_password'; 
GRANT ALL PRIVILEGES ON DATABASE database_name TO user_name;

```

### 2. Django Setup (Auth & Schema)

```bash
cd backend-django
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Create Tables in Postgres
python manage.py migrate
# Create Admin User
python manage.py createsuperuser
# Run Server
python manage.py runserver

```

### 3. Go Setup (WebSockets)

```bash
cd backend-golang
# Create .env file with: DB_CONN_STRING=postgres://postgres:postgres@127.0.0.1:5432/chat_db?sslmode=disable
go run .

```

### 4. Frontend Setup (UI)

```bash
cd frontend
npm install
npm run dev

```

## 🔄 How It Works

1. **Login:** User logs in via Next.js → Django returns a JWT Access Token.
2. **Connect:** Next.js opens a WebSocket connection to Go, passing the Token.
3. **Verify:** Go verifies the JWT signature using the shared Secret Key.
4. **Chat:**
* User sends a message.
* Go inserts the message directly into PostgreSQL.
* Go broadcasts the message to all connected clients.


5. **History:** Django Admin Interface allows viewing and managing all chat history.

## 📂 Project Structure

```
universal-chat/
├── backend-django/   # Auth, Models, Admin Panel
├── backend-golang/   # WebSocket Hub, High-perf networking
└── frontend/         # Next.js App, Chat UI

```

```

```
