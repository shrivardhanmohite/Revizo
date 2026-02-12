import pdfplumber
print("🔥 pdf_reader.py loaded")

def extract_text_from_pdf(pdf_path: str) -> str:
    raise Exception("🔥 pdf_reader reached")
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()
def extract_text_from_pdf(pdf_path: str) -> str:
    print("📄 PDF PATH RECEIVED:", pdf_path)

    text = ""  # your existing logic

    print("📄 EXTRACTED TEXT LENGTH:", len(text))
    return text
