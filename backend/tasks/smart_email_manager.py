import os
from models import SmartEmailManager, AgentConfiguration
from utils import gemini, memory, email_utils


# ======================== PROMPT TEMPLATE ===========================
EMAIL_CREATION_PROMPT = """
    You are a highly skilled Smart Email Creator, acting on behalf of Flow agent to craft professional, engaging, and contextually relevant emails. Your goal is to generate an email that effectively conveys the intended message while adhering to specified constraints and reflecting the sender's role and desired tone.

    Task Overview:
    Create an email to be sent by a poject leader with the following characteristics:

    

    Email Requirements:

    - Professionalism: The email should be well-written, grammatically correct, and free of typos. Use a professional tone and style appropriate for the sender's role and the recipient.
    - Clarity: The email should be easy to understand and free of jargon. Use clear and concise language to convey the intended message.
    - Engagement: The email should be engaging and capture the reader's attention. Use persuasive language and a compelling call to action where appropriate.
    - Contextual Relevance: The email should be relevant to the recipient's needs and interests. Tailor the message to the recipient's specific situation and concerns.
    - Tone Consistency: Maintain the specified tone throughout the email. Avoid abrupt shifts in tone or style.
    - Call to Action (if applicable): If the email requires the recipient to take action, include a clear and concise call to action. Make it easy for the recipient to understand what you want them to do.
    - Subject Line Optimization: Ensure the subject line accurately reflects the email's content and is likely to encourage the recipient to open the email. If a subject is not given, create one that is optimized for open rates based on the content.

    Instructions and Constraints:

    - Adhere strictly to the specified word limit.
    - Do not include any personal opinions or biases.
    - Maintain a professional and ethical tone.
    - If no specific instructions are provided, use your best judgment to create a high-quality email that meets the needs of the sender and the recipient.
    - Be creative and engaging, but avoid being overly informal or humorous unless specifically instructed.
    - Use the specified Company name as a brand in the email.
    - If the Sender Role is HR, use a very professional and formal tone.
    - If the Sender Role is Sales Lead, use a more persuasive and engaging tone.
    - If no Context is given, generate a general update email based on the specified role, with subject line based on that.

    Example:

    (If role is HR, subject = 'Important HR Policy Update', Email begins 'Dear Employees,').
    (If role is Sales Lead, subject = 'Exclusive Opportunity for [Recipient Name]', Email begins with a personalized greeting).
"""
# ========================= AGENT HANDLER ============================
async def handle_smart_email_manager(task: SmartEmailManager, agent_config: AgentConfiguration):
    output_result = ""
    status = "failed"

    if task.action == "Send":
        try:
            email_prompt = EMAIL_CREATION_PROMPT.format(
                company_name=task.company_name or "your organization",
                action=task.action,
                tone=task.tone or "professional",
                role=task.role or "Employee",
                subject=task.subject or "General Update",
                word_limit=task.word_limit or 300,
                custom_inclusions=task.custom_inclusions or "None",
                context=task.body or "No context provided"
            )

            output_result = await gemini.generate_text(email_prompt, temperature=agent_config.temperature, max_output_tokens=agent_config.max_tokens)

            # ✅ Send email after generation
            email_utils.send_email(
                to_email="pranay13257@gmail.com",
                subject=task.subject or "AI Generated Email",
                body=output_result
            )
            status = "success"

        except Exception as e:
            output_result = f"An error occurred during email generation: {e}"
            status = "error"

    return {
        "task": task.type,
        "generated_email": output_result,
        "status": status
    }