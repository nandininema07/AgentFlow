# ai_agent_builder/utils/gemini.py
import json
import os
import re

import google.generativeai as genai
from dotenv import load_dotenv
from google import genai as streaming_genai
from google.genai import types as streaming_types

# Load API KEY from .env
load_dotenv()

# Configure Gemini API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)


async def generate_text(prompt: str, system_prompt: str = "") -> str:
    """
    Generates text using the Gemini 2.0 Flash model API.

    Args:
        prompt: The user prompt.
        system_prompt: Optional system prompt to guide the model.

    Returns:
        The generated text result.
    """
    try:
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        # Prepare the messages payload
        messages = []
        if system_prompt:
            messages.append({"role": "user", "parts": [system_prompt]})
        messages.append({"role": "user", "parts": [prompt]})

        # Generate the response
        response = model.generate_content(messages)  # type: ignore

        # Check for safety rating or inappropriate content.
        if response.prompt_feedback:
            print(f"PROMPT FEEDBACK {response.prompt_feedback}")

        if not response.text:
            raise ValueError("Empty response from Gemini model.")
        # Print the response
        return response.text  # type: ignore

    except Exception as e:
        print(f"Gemini API Error : {e}")
        return f"Error generating text: {e}"


async def generate_json(
    prompt, system_prompt="Give JSON OUTPUT, follow the schema if given."
):
    client = streaming_genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.0-flash-lite"
    contents = [
        streaming_types.Content(
            role="user",
            parts=[
                streaming_types.Part.from_text(text=system_prompt),
            ],
        ),
        streaming_types.Content(
            role="user",
            parts=[
                streaming_types.Part.from_text(text=prompt),
            ],
        ),
    ]
    generate_content_config = streaming_types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="application/json",
    )

    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        response_text += chunk.text
    print(response_text)
    return json.loads(response_text)
