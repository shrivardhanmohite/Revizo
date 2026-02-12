import re

def is_heading(line: str) -> bool:
    line = line.strip()
    if not line:
        return False

    # Unit detection
    if re.match(r'^unit\s+\w+', line, re.IGNORECASE):
        return True

    # Numbered headings: 1. , 1.1
    if re.match(r'^\d+(\.\d+)*\s+', line):
        return True

    # Short title-like lines
    if len(line.split()) <= 6 and line[0].isupper():
        return True

    return False


def split_topics(cleaned_text: str):
    lines = cleaned_text.split("\n")

    unit = None
    topics = []

    current_title = None
    current_content = []

    for line in lines:
        line = line.strip()

        if re.match(r'^unit\s+\w+', line, re.IGNORECASE):
            unit = line
            continue

        if is_heading(line):
            if current_title:
                topics.append({
                    "title": current_title,
                    "content": "\n".join(current_content).strip()
                })
                current_content = []

            current_title = line
        else:
            current_content.append(line)

    if current_title:
        topics.append({
            "title": current_title,
            "content": "\n".join(current_content).strip()
        })

    # 🔥 GUARANTEED FALLBACK
    if not topics:
        topics.append({
            "title": unit or "Complete Document",
            "content": cleaned_text.strip()
        })

    return {
        "unit": unit,
        "topics": topics
    }
