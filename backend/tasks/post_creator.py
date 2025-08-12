import os
import json

import urllib.parse
import requests
import asyncio
from datetime import datetime
from models import (
    PostCreator,
    AgentConfiguration,
)  # Assumed to be defined with required fields
from utils import (
    gemini,
    memory,
)  # gemini.generate_text, gemini.generate_json, memory.put, memory.get_latest


# ==== POST CREATION FUNCTION ====
async def create_post(post_input: PostCreator) -> dict:
    """
    Creates a post by generating an image, a caption, and hashtags
    based solely on the PostCreator model. Uses Gemini functions to
    generate text and JSON outputs. Also stores the generated result
    in memory.

    Returns:
        dict: Contains the image path, caption, hashtags, and the
              memory entry.
    """

    prompt = f"""
    You are an AI social media content creator that generate image prompts, captions and hashtags for social media posts. Your goal is to create highly engaging and original content to help grow your clients' audience.

    Your output must be in JSON format.

    Task Details:
    - Post Topic: {post_input.topic} (Be as specific as possible here. Examples: Grandparent & grandchild baking cookies, Old family photo album, Vintage toy shop scene, Sunset over a childhood vacation spot)
    - Platform: {post_input.platform} (e.g., Instagram, Facebook, Twitter.  This influences aspect ratio, length, tone, and potential visual trends.)

    Image Generation:
    - Create a highly detailed and nostalgic image for a {post_input.platform} social media post. Keep it one liner only. The overall feeling should be warm, heartwarming, and subtly melancholy, like remembering a cherished memory.

        Image Composition & Style:

        *   Visual Focus: Specify the core visual element here. e.g., A close-up of wrinkled hands kneading dough, a dusty photo album opened to a specific page, a child's worn teddy bear sitting on a window sill. This should directly relate to the 'Post Topic'.
        *   Color Palette: Primarily warm tones. Think golden yellows, faded oranges, sepia browns, muted reds, and soft creams. The color palette should enhance the nostalgic feeling. Avoid harsh or neon colors.
        *   Lighting: Soft, diffused lighting. Think late afternoon sunlight filtering through curtains, or the warm glow of an old lamp. Emphasize soft shadows to create depth and a sense of comfort.
        *   Artistic Style: Choose a specific artistic style or blend of styles. Examples: Photorealistic with a slightly blurred vintage filter, Impressionistic painting with soft brushstrokes, Digital art reminiscent of a Norman Rockwell illustration, Hand-drawn illustration with watercolor textures. This adds personality.
        *   Level of Detail: High detail. The image should be rich in textures and visual elements that contribute to the overall nostalgic atmosphere. Consider adding small details like dust motes in the air, worn edges on objects, or subtle imperfections.
        *   Emotion & Tone: Evoke feelings of: Warmth, nostalgia, gentle melancholy, comfort, and a sense of connection to the past. The image should resonate with viewers on an emotional level.
        *   Avoid: Anything overly saccharine, cheesy, or overly sentimental. The nostalgia should feel authentic and genuine, not forced.
        *   Technical Considerations: Aspect Ratio: Specify the aspect ratio appropriate for the platform, e.g., 1:1 for Instagram, 16:9 for YouTube thumbnail, etc. This is crucial for preventing cropping issues.
        *   Resolution: High resolution for clear display on various devices.
        *   Important Negative Constraints (What to AVOID): Do not include any text. Do not include any modern technology (e.g., smartphones, laptops). Avoid overly bright or saturated colors. Avoid overly crisp or perfect lines (unless the chosen art style dictates otherwise). Avoid anything that feels futuristic or out of place with the nostalgic theme.

    Caption Generation:
        - Create a catchy and engaging caption for a {post_input.platform} social media post. The caption should directly reference and complement the associated image, evoking warm emotions and resonating with the target audience, while being mindful of the post's frequency and past performance.

        - Image Description:
            - Concise Image Summary: Provide a brief (1-2 sentence) summary of the image's key elements and overall feeling. Example: "A close-up photo of a grandparent and grandchild smiling while kneading dough together. The lighting is warm and golden, creating a feeling of love and connection."
            - Key Visual Details: List 2-3 specific visual details from the image that the caption can reference to make it more engaging. Examples: "The flour dusting the grandparent's hands, the child's mischievous grin, the vintage mixing bowl."
        Caption Requirements:
            * Length: Specify the maximum character count or word count allowed for the platform. e.g., "Maximum 280 characters for Twitter", "Maximum 2200 characters for Instagram, but aim for under 125 characters for optimal visibility". Important for platform compliance.
            * Tone: Warm, nostalgic, heartwarming, and engaging. The tone should align with the image and evoke positive emotions. Avoid overly sentimental or saccharine language. Consider adjusting based on frequency (e.g., daily posts can be more casual, weekly posts slightly more reflective).
            * Call to Action (CTA): Specify whether and what kind of CTA is needed. Examples: "Include a question to encourage engagement (e.g., 'What are your favorite family traditions?')", "Encourage users to share their own related stories", "No CTA required – simply evoke a feeling", "Direct to a relevant product or service page with a clear, concise call to action". Crucial for driving desired behavior. The CTA should be relevant to the image.
        Edge Case Handling & Instructions:
            * First Run: If this is the first run, create a caption that introduces the topic and encourages initial engagement, also highlighting a key detail from the image.
            * Low Engagement Last Run: If the last run indicates low engagement, try a different angle, a more compelling CTA, or a revised hashtag strategy. Analyze the feedback from the last run and address any concerns or questions raised. Focus the caption on a different detail of the image that wasn't emphasized previously.
            * High Engagement Last Run: If the last run indicates high engagement, build on the success of the previous post. Continue the conversation, provide more details, or offer a related piece of content. Reference a specific detail from the image that resonated well with the audience.
            * Negative Sentiment Last Run: If the last run indicates negative sentiment, address the concerns directly and offer a sincere apology or explanation. Reframe the topic in a more positive light.
            * Irrelevant Responses: If the generated caption is irrelevant to the image or topic, try rephrasing the prompt with more specific keywords and examples, especially making sure the Image Description is clear and accurate.

    Hashtag Generation:
        - Create 5 creative, short, and catchy hashtags for a {post_input.platform} social media post. The hashtags should be highly relevant to the post's topic. Do not include hashtags in any other language, or mix languages within a single hashtag.

        Hashtag Requirements:

        * Creativity: The hashtags should be original and attention-grabbing, not just generic keywords.
        * Shortness: Aim for hashtags that are easy to read and remember (ideally under 15 characters).
        * Catchiness: The hashtags should be memorable and encourage users to click and explore related content.
        * Relevance: The hashtags MUST be directly related to the {post_input.topic} and overall theme of the post.
        * Target Audience Appeal: Consider what types of hashtags would resonate with the intended audience for the post. For example, if the audience is younger, consider using trendy hashtags.
        * Mix of Broad & Specific: Include a mix of broader, more popular hashtags (e.g., #nostalgia) and more specific, niche hashtags (e.g., #vintageToys).
        * No Emojis/Special Characters: Only use letters and numbers.

    Output Format:
    ```json
    {{
        "image_prompt": "detailed image prompt",
        "caption": "catchy and engaging caption",
        "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    }}
    ```
    """
    try:
        output = await gemini.generate_json(prompt.strip())
        # output = json.loads(raw_json)
        image_prompt = output.get("image_prompt", "")
        caption = output.get("caption", "")
        hashtags = output.get("hashtags", [])
    except Exception as e:
        print(f"JSON parsing error: {e}")
        image_prompt = ""
        caption = ""
        hashtags = []

    # Image Generation
    encoded_prompt = urllib.parse.quote(image_prompt.strip())
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"


    # Save the generated content to memory
    memory_entry = f"Caption: {caption} | Hashtags: {hashtags}"
    memory.put("post_creator", memory_entry)

    return {
        "image": url,
        "caption": caption,
        "hashtag": hashtags,
    }


async def handle_post_creator(task: PostCreator, ai_config: AgentConfiguration):
    """
    Handles Post Creator tasks by generating the post components
    (image, caption, hashtags) and returning a JSON-ready output.

    Args:
        task (PostCreator): The post creation task details.
        ai_config (AgentConfiguration): The AI configuration settings.

    Returns:
        dict: A JSON object containing the image path, caption, and
              hashtags.
    """
    result = await create_post(task)
    output = {
        "system_prompt": {
            "image": result["image"],
            "caption": result["caption"],
            "hashtag": result["hashtag"],
        }
    }
    return output
