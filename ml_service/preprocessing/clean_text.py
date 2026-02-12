import re
from typing import List


def remove_page_numbers(text: str) -> str:
    # Remove patterns like "Page 1", "PAGE 12"
    return re.sub(r'\bpage\s*\d+\b', '', text, flags=re.IGNORECASE)


def normalize_newlines(text: str) -> str:
    # Convert Windows newlines to Unix
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Reduce excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text


def remove_repeated_lines(lines: List[str]) -> List[str]:
    """
    Removes repeated headers/footers while keeping content order intact.
    """
    seen = set()
    cleaned = []

    for line in lines:
        stripped = line.strip()

        # Keep empty or very short lines
        if len(stripped) < 4:
            cleaned.append(stripped)
            continue

        if stripped not in seen:
            cleaned.append(stripped)
            seen.add(stripped)

    return cleaned


def clean_text(raw_text: str) -> str:
    """
    Main text cleaning pipeline for EduAI.
    Input  : Raw extracted PDF text
    Output : Cleaned, normalized academic text
    """
    if not raw_text:
        return ""

    # Step 1: Normalize newlines
    text = normalize_newlines(raw_text)

    # Step 2: Remove page numbers
    text = remove_page_numbers(text)

    # Step 3: Split into lines
    lines = text.split('\n')

    # Step 4: Remove repeated headers/footers
    cleaned_lines = remove_repeated_lines(lines)

    # Step 5: Rejoin lines
    cleaned_text = '\n'.join(cleaned_lines)

    return cleaned_text.strip()
