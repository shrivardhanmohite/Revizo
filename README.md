

🚀 Revizo — AI-Powered Smart Study Platform
Your journey to smarter, AI-driven learning starts here

If you're viewing this on GitHub, open in preview mode for the best formatting experience.

I’m excited you’re exploring Revizo. This project combines full-stack web development with modern AI engineering to build a powerful study management platform.

Some features are straightforward.
Some are technically deep.
Some will genuinely surprise you.

One thing is certain — this project is built to demonstrate real-world AI + SaaS architecture.

🔥 What is Revizo?

Revizo is an AI-powered study platform that helps students:

📄 Upload PDFs and extract structured topics

🧠 Generate AI-based exam summaries

🤖 Chat with an academic AI assistant (HelperBot)

📝 Generate mock question papers

📅 Plan preparation intelligently

📊 Track topic progress and readiness

It uses a microservice architecture combining:

Node.js (Web App)

FastAPI (AI Service)

Ollama (Local LLM)

MongoDB Atlas (Database)

🏗 Project Architecture
Revizo
│
├── web/                  → Node.js + Express Application
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── views/ (EJS)
│   └── public/
│
├── ml_service/           → FastAPI AI Microservice
│   ├── pdf_processing/
│   ├── preprocessing/
│   ├── segmentation/
│   └── summarization/
│
└── MongoDB Atlas         → Cloud Database


Revizo uses a clean MVC structure on the web side and a modular AI pipeline on the ML side.

⚙️ Tech Stack
🔹 Backend (Web Layer)

Node.js

Express.js

MongoDB Atlas

Mongoose

Session-based Authentication

Nodemailer

🔹 Frontend

EJS

Tailwind CSS

Custom SaaS UI system

🔹 AI Layer

FastAPI (Python)

Ollama (Local LLM Runtime)

Tested Models:

gemma3:1b

phi3

llama3

✨ Core Features
📄 Smart Notes System

Upload PDF

Extract text

Clean & preprocess

Segment into topics

Store in database

Designed for academic PDFs and structured note-taking.

🧠 AI Summarization

Two study modes:

Exam Mode → Structured, bullet-based revision notes

Daily Study Mode → Concept-focused explanation

Powered by local LLM via Ollama.

🤖 HelperBot (Chat-Style AI)

WhatsApp-style conversation UI

Session-based message history

Academic-focused responses

Export last Q/A as PDF

Email conversation

Architecture:

User → Express → FastAPI → Ollama → Express → Chat UI

📝 Mock Paper Generator

Automatically generates:

Section A: MCQs

Section B: Short Answer

Section C: Long Answer

Structured like a real university paper.

📅 Study Planner

Track topic stage:

Started

Basics

Practice

Revision

Ready

Importance tagging:

IMP

M-IMP

V-IMP

VV-IMP

Google Calendar integration

🛠 Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/shrivardhanmohite/revizo.git
cd revizo

2️⃣ Setup Web App
cd web
npm install


Create .env:

MONGO_URI=your_mongodb_connection
EMAIL_USER=your_email
EMAIL_PASS=your_app_password


Run:

npm start


App runs on:

http://localhost:3000

3️⃣ Setup ML Service
cd ml_service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt


Run:

uvicorn app:app --reload


Runs on:

http://127.0.0.1:8000

4️⃣ Install Ollama

Download:

👉 https://ollama.com

Pull a lightweight model:

ollama pull gemma3:1b


Recommended for fast local performance.

🔐 Important Notes

.env is ignored

Temp files are ignored

Generated extracted text files are ignored

Python cache is ignored

Clean production-style repository

📈 Future Improvements

Streaming AI responses

Persistent chat history in database

Multi-chat sessions

Cloud deployment

OAuth authentication

Production-grade email service

Advanced analytics dashboard

🧠 What This Project Demonstrates

Revizo showcases:

Full-stack development

AI microservice integration

Local LLM orchestration

Session management

Modular backend design

Clean MVC structure

SaaS-style UI architecture

👨‍💻 Author

Shrivardhan Mohite
AI + Full Stack Engineering Student

GitHub:
https://github.com/shrivardhanmohite

🌟 The Core Philosophy

The best way to learn AI engineering is by building real systems.

Revizo is not a toy project.
It is a structured AI application with modular architecture and real-world patterns.