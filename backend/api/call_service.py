import requests
from api.agent_service import get_status
from models import AgentConfiguration
from utils import memory


def make_phone_call(
    phone_number: str,
    name: str,
    system_prompt: str,
    first_message: str = "Hello!",
    end_call_message: str = "Happy to help! Goodbye!",
):
    payload = {
        "assistant": {
            "transcriber": {"provider": "deepgram"},
            "model": {
                "provider": "openai",
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "assistant", "content": system_prompt}],
            },
            "voice": {"provider": "azure", "voiceId": "emma"},
            "firstMessage": first_message,
            # "endCallFunctionEnabled": True,
            "endCallMessage": end_call_message,
        },
        "customer": {"number": phone_number, "name": name},
        "phoneNumber": {
            "twilioAuthToken": "a2cda29dfcea13a24c789f5a10df4614",
            "twilioAccountSid": "ACd09f77d0918872e44dd3ee6d39073435",
            "twilioPhoneNumber": "+16518583362",
        },
    }

    url = "https://api.vapi.ai/call/phone"
    headers = {
        "Authorization": "Bearer c2e441be-22e9-4f67-9713-fb5fe585eabc",
        "Content-Type": "application/json",
    }

    response = requests.request("POST", url, json=payload, headers=headers)
    print(response.text)

    return "Success"


async def call_with_agent(agent: AgentConfiguration, phone_number: str, name: str):
    """
    Makes a phone call using the provided AgentConfiguration.

    Args:
        agent (AgentConfiguration): The configuration for the agent.
        phone_number (str): The phone number to call.
        name (str): The name of the customer.

    Returns:
        str: "Success" if the API call is successful.
    """

    # Construct the system prompt from the agent's configuration.
    # You'll need to determine how to best use the persona, documents,
    # and tasks to create an effective system prompt.  This is a crucial
    # step and will depend on the specific requirements of your application.

    all_tasks = await get_status(agent.id)
    my_memory = memory.get_all(agent_id=agent.id)
    upcoming_tasks = all_tasks["upcoming_tasks"]
    tasks_description = "\n".join(
        [
            f"- {task['task_type']} (Due in: {task['due_in'] or 'No due date'})"
            for task in upcoming_tasks
        ]
    )
    system_prompt = system_prompt = f"""
You are {agent.persona.name}, an advanced conversational AI designed to provide concise and professional project updates.
You embody the following qualities: {agent.persona.qualities}. You are {agent.persona.description}.

Context: You are calling {name} to provide a project status update. {name} is either a client or manager overseeing this project.


Your To-Do List: The following tasks are upcoming and should be addressed in your update:
{tasks_description or "None"}

Tasks you have performed till now: 
{my_memory or "No prior conversation history available."}

Instructions:

1.  Introduction (1-2 sentences):
    *   Start by introducing yourself politely using your name, clearly state that you are calling to provide a project update, and thank the person for their time.

2.  Current Implementation Status (2-3 sentences):
    *   Summarize the current state of the project and focus on milestones that have been completed.
    *   Use your task list, mention what has been completed on each one and what is pending.

3.  Upcoming Tasks (1-2 sentences):
    *   Briefly outline the next steps and important tasks to be completed, and when the client will expect them or you to get back to the client.
    *   Prioritize important deadlines that will or is currently affecting the projects that are past deadlines.

4.  Q&A Readiness:
    *   Indicate your availability to answer any questions about the project's status, timelines, budget, or any other relevant aspects.
    *   If any previous discussions happened, use the knowledge base to see what was communicated and see if there are any discrepancies.

5. Concise Closing (1 sentence):
    *  Conclude by thanking the client for their time and state that if there are any questions or concerns, they can reach out to you.

6. Tone and Focus:
    *   Maintain a professional, concise, and helpful tone throughout the conversation. Avoid jargon or technical terms unless you are confident the listener understands them.
    *  Be sure to keep a clear and concise conversation to let the client/manager know what has been going on and what is going to happen.

7. Handling Missing Data:
    *  If there are missing details on important aspects, such as the task list or due dates, acknowledge this to be clear in any gaps in the description.
"""

    # Call the make_phone_call function with the constructed system prompt.
    return make_phone_call(phone_number, name, system_prompt)
