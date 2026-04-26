from fastapi import FastAPI
from pydantic import BaseModel
import requests
from pdf2image import convert_from_path
import base64
from io import BytesIO
import os
from dotenv import load_dotenv

# ===============================
# LOAD ENV VARIABLES
# ===============================
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

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
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(url, json=payload)

    if response.status_code != 200:
        raise Exception(f"Ollama API error: {response.text}")

    return response.json().get("response", "No response from model.")


# ===============================
# PDF → BASE64 IMAGES
# ===============================
def pdf_to_base64_images(pdf_path):
    images = convert_from_path(pdf_path, first_page=1, last_page=2)

    base64_images = []

    for img in images:
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        base64_images.append(img_str)

    return base64_images


# ===============================
# OPENROUTER SUMMARIZER
# ===============================
def summarize_with_openrouter(base64_images):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    # Multi-image support
    image_payload = [
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{img}"
            }
        }
        for img in base64_images
    ]

    messages = [{
        "role": "user",
        "content": [
          {
  "type": "text",
  "text": """
You are an academic assistant.

Analyze the document carefully and generate a detailed, structured summary.

Instructions:
- Explain concepts clearly
- Include important points
- Use bullet points where needed
- Do not be too short
- Keep it exam-oriented
- Avoid skipping technical details

Format:
1. Topic Overview
2. Key Concepts
3. Important Points
4. Short Conclusion
"""
},
            *image_payload
        ]
    }]

    payload = {
        "model": "openai/gpt-4o-mini",  # ✅ vision-capable model
        "messages": messages
    }

    response = requests.post(url, headers=headers, json=payload)

    return response.json()


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
# SUMMARIZATION (OLLAMA)
# ===============================
@app.post("/summarize")
def summarize(payload: dict):
    text = payload.get("text", "")
    mode = payload.get("mode", "exam")

    summary = summarize_text(text, mode)

    return {"summary": summary}


# ===============================
# 🔥 NEW: IMAGE PDF SUMMARIZATION (OpenRouter)
# ===============================
@app.post("/summarize-image-pdf")
def summarize_image_pdf(req: PDFRequest):
    try:
        images = pdf_to_base64_images(req.pdf_path)

        result = summarize_with_openrouter(images)

        print("OpenRouter FULL Response:", result)  # 🔥 ADD THIS

        summary = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not summary:
            summary = "⚠️ Failed to generate summary from OpenRouter."

        return {"summary": summary}

    except Exception as e:
        print("❌ OpenRouter Error:", str(e))  # 🔥 IMPORTANT
        return {"summary": str(e)}  # 👈 return real error


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