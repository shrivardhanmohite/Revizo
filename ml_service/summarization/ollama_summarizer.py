import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:1b"   # 🔥 Fast model


# ===============================
# SUMMARIZATION FUNCTION
# ===============================
def summarize_text(text: str, mode: str = "exam") -> str:
    if not text or len(text.strip()) < 80:
        return ""

    if mode == "exam":
        prompt = f"""
Create concise exam-oriented notes with bullet points.

CONTENT:
{text}
"""
    else:
        prompt = f"""
Explain simply for understanding.

CONTENT:
{text}
"""

    return call_ollama(prompt)


# ===============================
# GENERIC OLLAMA CALL
# ===============================
def call_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": 150,      # limit output → faster
                    "keep_alive": "10m"      # keep model loaded
                }
            },
            timeout=60   # reduce timeout since model is faster
        )

        if response.status_code != 200:
            return f"Ollama Error: {response.text}"

        data = response.json()
        return data.get("response", "").strip()

    except requests.exceptions.Timeout:
        return "Model response timed out. Please try again."

    except Exception as e:
        return f"Ollama connection error: {str(e)}"
