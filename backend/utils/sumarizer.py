import os
import asyncio
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
from gemini import generate_text

async def summarize_text(text: str) -> str:
    """
    Summarizes the provided text using the Gemini API.
    This summary is optimized for vector embeddings by reducing the size
    while retaining the key context.
    
    Args:
        text: The long text string to be summarized.
    
    Returns:
        A concise summary string.
    """
    try:
        prompt = (
            "Summarize the following text in a concise manner, "
            "preserving key details and context for vector embeddings:\n\n"
            f"{text}"
        )
        summary = await generate_text(prompt)
        if not summary or summary.strip() == "":
            raise ValueError("Empty summary returned from Gemini.")
        return summary.strip()
    except Exception as e:
        print(f"Error during summarization: {e}")
        # Fallback: if summarization fails, return the original text
        return text

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF file using PyPDF2.
    
    Args:
        file_path: Path to the PDF file.
        
    Returns:
        Extracted text as a string.
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
        return text
    except Exception as e:
        print(f"Error extracting text from PDF {file_path}: {e}")
        return ""

def extract_text_from_image(file_path: str) -> str:
    """
    Extracts text from an image using pytesseract.
    
    Args:
        file_path: Path to the image file.
        
    Returns:
        Extracted text as a string.
    """
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error extracting text from image {file_path}: {e}")
        return ""

def extract_text_from_file(file_path: str) -> str:
    """
    Reads text content from a plain text or markdown file.
    
    Args:
        file_path: Path to the file.
        
    Returns:
        The file content as a string.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return ""

def extract_text_from_url(url: str) -> str:
    """
    Extracts text content from a URL using requests and BeautifulSoup.
    
    Args:
        url: The web URL.
        
    Returns:
        Extracted textual content from the webpage.
    """
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = "\n".join([p.get_text() for p in paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting text from URL {url}: {e}")
        return ""

async def summarize_multi_input_data(
    pdf_files: list, image_files: list, file_paths: list, urls: list, texts: list
) -> str:
    """
    Aggregates text extracted from various sources (PDFs, images, files, URLs, and raw texts)
    and summarizes the aggregated content using the Gemini API.
    
    Args:
        pdf_files: List of PDF file paths.
        image_files: List of image file paths.
        file_paths: List of text file paths.
        urls: List of URLs to extract text from.
        texts: List of raw text strings.
    
    Returns:
        A concise summary string of the aggregated content.
    """
    aggregated_text = ""
    
    # Extract text from PDF files
    for pdf in pdf_files:
        extracted = extract_text_from_pdf(pdf)
        aggregated_text += "\n" + extracted

    # Extract text from image files
    for image in image_files:
        extracted = extract_text_from_image(image)
        aggregated_text += "\n" + extracted

    # Extract text from plain text or markdown files
    for file in file_paths:
        extracted = extract_text_from_file(file)
        aggregated_text += "\n" + extracted

    # Extract text from URLs
    for url in urls:
        extracted = extract_text_from_url(url)
        aggregated_text += "\n" + extracted

    # Append raw text inputs
    for raw in texts:
        aggregated_text += "\n" + raw

    # Summarize the aggregated text using Gemini
    summary = await summarize_text(aggregated_text)
    return summary

