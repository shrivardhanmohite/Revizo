from fastapi import FastAPI
from pydantic import BaseModel
import requests

# ===============================
# External Modules
# ===============================
from pdf_processing.pdf_reader import extract_text_from_pdf
from preprocessing.clean_text import clean_text
from segmentation.topic_splitter import split_topics
from summarization.ollama_summarizer import summarize_text

# ===============================
# FastAPI App
# ===============================
app = FastAPI(title="Revizo ML Service")

# ===============================
# OLLAMA HELPER FUNCTION
# ===============================
def call_ollama(prompt: str):
    url = "http://localhost:11434/api/generate"

    payload = {
        "model": "llama3",   # Make sure this model exists in ollama list
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(url, json=payload)

    if response.status_code != 200:
        raise Exception(f"Ollama API error: {response.text}")

    return response.json().get("response", "No response from model.")


# ===============================
# ROOT CHECK
# ===============================
@app.get("/")
def home():
    return {"status": "Revizo ML service running"}


# ===============================
# PDF PROCESSING
# ===============================
class PDFRequest(BaseModel):
    pdf_path: str


@app.post("/extract-pdf")
def extract_pdf(req: PDFRequest):
    text = extract_text_from_pdf(req.pdf_path)

    if not text.strip():
        return {
            "error": "NO_TEXT",
            "message": "This PDF does not contain selectable text."
        }

    cleaned = clean_text(text)
    return {"cleaned_text": cleaned}


@app.post("/segment-text")
def segment_text(payload: dict):
    cleaned_text = payload.get("cleaned_text", "")
    result = split_topics(cleaned_text)
    return result


# ===============================
# SUMMARIZATION
# ===============================
@app.post("/summarize")
def summarize(payload: dict):
    text = payload.get("text", "")
    mode = payload.get("mode", "exam")

    summary = summarize_text(text, mode)

    return {"summary": summary}


# ===============================
# HELPERBOT
# ===============================
class HelperBotRequest(BaseModel):
    question: str


@app.post("/helperbot")
def helperbot(req: HelperBotRequest):

    prompt = f"""
You are Revizo's AI academic assistant.
Answer clearly, concisely, and academically.
Provide examples if helpful.
Avoid unnecessary fluff.

QUESTION:
{req.question}
"""

    answer = call_ollama(prompt)

    return {"answer": answer}


# ===============================
# MOCK PAPER GENERATION
# ===============================
class MockPaperRequest(BaseModel):
    syllabus: str


@app.post("/mock-paper")
def generate_mock_paper(req: MockPaperRequest):

    prompt = f"""
You are a university examination paper setter.

Generate a 2-hour mock question paper.

FORMAT:
Section A: 5 MCQs
Section B: 5 short answer questions
Section C: 3 long answer questions

Syllabus:
{req.syllabus}
"""

    paper = call_ollama(prompt)

    return {"paper": paper}
