# ai_agent_builder/agent_service.py
import asyncio
import json
import logging
import os
import smtplib
import uuid
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import List

from croniter import croniter
from models import AgentConfiguration
from utils import gemini, memory

logger = logging.getLogger(__name__)

# Import task handlers
from tasks import (
    ai_research_assistant,
    competitor_watchdog,
    contract_summarizer,
    customer_feedback_analyzer,
    meeting_summarizer,
    post_creator,
    product_recommendation,
    regulatory_compliance_watchdog,
    seo_optimizer,
    smart_email_manager,
)

AGENT_DATA_DIR = "_data"
if not os.path.exists(AGENT_DATA_DIR):
    os.makedirs(AGENT_DATA_DIR)

TASK_HANDLERS = {
    "seo_optimizer": seo_optimizer.handle_seo_optimizer,
    "competitor_watchdog": competitor_watchdog.handle_competitor_watchdog,
    "product_recommendation": product_recommendation.handle_product_recommendation,
    "post_creator": post_creator.handle_post_creator,
    "smart_email_manager": smart_email_manager.handle_smart_email_manager,
    "meeting_summarizer": meeting_summarizer.handle_meeting_summarizer,
    "customer_feedback_analyzer": customer_feedback_analyzer.handle_customer_feedback_analyzer,
    "contract_summarizer": contract_summarizer.handle_contract_summarizer,
    "ai_research_assistant": ai_research_assistant.handle_ai_research_assistant,
    "regulatory_compliance_watchdog": regulatory_compliance_watchdog.handle_regulatory_compliance_watchdog,
}

# Email configuration (move to environment variables)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")  # Gmail SMTP server address
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Gmail SMTP port number
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "sjlchoudhari@gmail.com")  # Your email address
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "vcig ddpk lqoi uaay")  # Your email password
AGENT_DATA_DIR = "_data"
if not os.path.exists(AGENT_DATA_DIR):
    os.makedirs(AGENT_DATA_DIR)


def _agent_file_path(agent_id: str) -> str:
    return os.path.join(AGENT_DATA_DIR, f"{agent_id}.json")


async def _execute_task(task, agent_config):
    """Executes a specific task based on its type."""
    logger.info(f"Executing task: {task.type}")
    task_handler = TASK_HANDLERS.get(task.type)
    if not task_handler:
        logger.warning(f"No handler found for task type: {task.type}")
        return None

    # Check if task_handler is None before awaiting
    if task_handler:
        task_result = await task_handler(task, agent_config)

        # Check if task_result is None before proceeding
        if task_result:
            # 2. AI Processing: Pass result to LLM/AI agent to process
            processed_result = await _process_task_result(task_result, agent_config)

            # 3. Trigger updates if necessary
            await _trigger_updates(processed_result, agent_config)

            return processed_result
        else:
            logger.warning(f"Task handler for {task.type} returned None.")
            return None  # Or some default value that makes sense
    else:
        logger.warning("No task handler to _execute_task. Check list")
        return None  # Task handler is None


async def _process_task_result(task_result, agent_config):
    """Placeholder for processing the task result with the AI agent."""
    logger.info(f"Processing task result: {task_result}")
    return f"Processed result: {task_result}"


async def _trigger_updates(processed_result, agent_config):
    """Placeholder for triggering updates based on the processed result."""
    logger.info(f"Triggering updates with result: {processed_result}")
    for update in agent_config.updates:
        if update.type == "api":
            logger.info(f"  Calling API endpoint: {update.endpoint}")
        elif update.type == "mail":
            logger.info(f"  Sending email to: {update.to}")


async def create_agent(agent_config: AgentConfiguration) -> AgentConfiguration:
    """Creates a new AI agent configuration."""
    agent_id = str(uuid.uuid4())
    agent_config.id = agent_id
    file_path = _agent_file_path(agent_id)
    # need to serialize datatime for the local storage.
    agent_data = agent_config.dict()
    # now update, we need to serialize datatime for the local storage.
    for task in agent_data["tasks"]:
        if "last_run" in task and task["last_run"] is not None:
            task["last_run"] = str(task["last_run"])
    with open(file_path, "w") as f:
        json.dump(agent_data, f, indent=4)
    # since it serializes
    return agent_config


async def list_agents() -> List[AgentConfiguration]:
    """Lists all AI agent configurations."""
    agents = []
    for filename in os.listdir(AGENT_DATA_DIR):
        if filename.endswith(".json"):
            agent_id = filename[:-5]
            file_path = _agent_file_path(agent_id)
            with open(file_path, "r") as f:
                agent_data = json.load(f)
                agents.append(AgentConfiguration(**agent_data))
    return agents


async def get_agent(agent_id: str) -> AgentConfiguration | None:
    """Retrieves a specific AI agent configuration by its ID."""
    file_path = _agent_file_path(agent_id)
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r") as f:
        agent_data = json.load(f)
        # now update, we need to serialize datatime for the local storage.
        try:
            for task in agent_data["tasks"]:
                # logger.debug("Found:" + str(task["last_run"]))
                # now we need to deserialize it for usage.
                task["last_run"] = datetime.strptime(
                    task["last_run"], "%Y-%m-%d %H:%M:%S.%f"
                )
        except Exception as e:
            # we dont do much.
            pass
        # lets turn the models on.
        return AgentConfiguration(**agent_data)


async def update_agent(
    agent_id: str, agent_config: AgentConfiguration
) -> AgentConfiguration | None:
    """Updates an existing AI agent configuration."""
    file_path = _agent_file_path(agent_id)
    if not os.path.exists(file_path):
        return None
    agent_config.id = agent_id

    # now update, we need to serialize datatime for the local storage.
    agent_data = agent_config.dict()
    # now update, we need to serialize datatime for the local storage.
    for task in agent_data["tasks"]:
        if "last_run" in task and task["last_run"] is not None:
            task["last_run"] = str(task["last_run"])

    with open(file_path, "w") as f:
        json.dump(agent_data, f, indent=4)

    return agent_config


async def _agent_scheduler():
    """Continuously check for due tasks and execute them."""
    logger.info("Agent scheduler started.")
    while True:
        try:
            # 1. Get list of all agent IDs
            agent_ids = [
                filename[:-5]
                for filename in os.listdir(AGENT_DATA_DIR)
                if filename.endswith(".json")
            ]

            # 2. Iterate through each agent ID
            for agent_id in agent_ids:
                await _run_scheduled_agent(agent_id)

        except Exception as e:
            logger.error(f"Error in agent scheduler loop: {e}")
        finally:
            # Wait before next iteration. Consider a configurable sleep interval
            await asyncio.sleep(60)  # sleep for 60 seconds

async def _send_progress_email(agent_id: str, report: str):
    """Sends an email with the agent's progress update."""
    try:
        # Load email configuration
        smtp_server = SMTP_SERVER
        smtp_port = SMTP_PORT
        email_address = EMAIL_ADDRESS
        email_password = EMAIL_PASSWORD

        # Construct the email message
        msg = MIMEText(report, "html")  # Specify "html" to handle HTML content
        msg["Subject"] = f"AI Agent Progress Update - {agent_id}"
        msg["From"] = email_address
        msg["To"] = email_address

        # Connect to the SMTP server and send the email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Upgrade the connection to a secure TLS connection
            server.login(email_address, email_password)
            server.sendmail(email_address, [email_address], msg.as_string())

        logger.info(f"Progress update email sent for agent: {agent_id}")
    except Exception as e:
        logger.error(f"Error sending progress email for agent {agent_id}: {e}")


async def _run_scheduled_agent(agent_id: str, called_once=False):
    """Runs the agent's tasks based on their schedule sequentially and maintains state."""
    logger.info(f"Running scheduled agent: {agent_id}")
    file_path = _agent_file_path(agent_id)
    if not os.path.exists(file_path):
        logger.warning(f"Agent config not found: {agent_id}")
        return

    with open(file_path, "r") as f:
        agent_data = json.load(f)
        agent_config = AgentConfiguration(**agent_data)

    # Generate a progress report of all the tasks.
    report = f"Agent {agent_config.persona.name} ({agent_id}) progress report:\n"

    # Loop through each task and execute sequentially
    for i in range(len(agent_config.tasks)):
        task = agent_config.tasks[i]  # Ensure it is the correct task name on models
        logger.info(
            f"Starting processing for task {task.type} at place:{i} - due to frequency: {task.frequency}"
        )

        is_due = False

        # Determine if the task is due based on its frequency
        now = datetime.now()

        # Define cron iterator.
        checkCron = None

        # check if time should run code now (only if it isn't an on demand task)

        # Check Cron syntax to make sure they are valid
        # if syntax doesn't match, run the program with some errors.
        try:
            _ = croniter("0 * * * *", now)
            checkCron = True
        except:
            checkCron = False

        ## Check for Valid
        if checkCron is True:
            if task.frequency == "daily" and not called_once:
                if task.last_run is None:
                    is_due = True
                else:
                    time_difference = now - task.last_run
                    if time_difference >= timedelta(days=1):
                        is_due = True
            elif task.frequency == "hourly" and not called_once:
                if task.last_run is None:
                    is_due = True
                else:
                    time_difference = now - task.last_run
                    if time_difference >= timedelta(hours=1):
                        is_due = True
            elif task.frequency == "6-hourly" and not called_once:
                if task.last_run is None:
                    is_due = True
                else:
                    time_difference = now - task.last_run
                    if time_difference >= timedelta(hours=6):
                        is_due = True
            elif task.frequency == "monthly" and not called_once:
                if task.last_run is None:
                    is_due = True
                else:
                    time_difference = now - task.last_run
                    if time_difference >= timedelta(days=30):
                        is_due = True
            elif task.frequency == "on-demand" and called_once:
                is_due = True

        ## Not check cron means do not run due time code
        else:
            logger.warning(
                f"Warning! Frequency was {task.frequency} but there was issues checking that Cron format"
            )

        task_result = None  # Initialize task_result

        if is_due:
            # try:
            # Make the task in order now, wait to finish.
            task_result = await _execute_task(task, agent_config)

            # after execution we update the task on the current agentConfig.
            agent_config.tasks[i].last_run = now

            logger.info(f"Persisting with result: {task_result}")
            memory_string = (
                str(task.type) + " : " + str(task_result)
            )  # or make a better way with json or just a better way, no magic
            memory.put(agent_config.id, memory_string)

            # set this to be something new so next task gets the data if anything
            logger.info(f"Completed: {task.type} now wait for other")
        # except Exception as e:
        #     logger.error(f"Error: This is a cron issue , try again to fix. {task.type} has issue : {e}")

            # Build individual report items even if it has been or has not run
            report += f"Task: {task.type}\n"
            report += f"  - Last Run: {task.last_run}\n"

            if is_due:
                report += f"  - Result: {task_result}\n"
            else:
                report += f"  - Skipped (not due)\n"

            # Create a nicely formatted email template
            email_template = f"""
            <html>
            <body>
                <h2>AI Agent Progress Report</h2>
                <p><strong>Agent ID:</strong> {agent_id}</p>
                <p><strong>Agent Name:</strong> {agent_config.persona.name}</p>
                <hr>
                <h3>Task Details</h3>
                <p><strong>Task:</strong> {task.type}</p>
                <p><strong>Last Run:</strong> {task.last_run}</p>
                <p><strong>Status:</strong> {"Completed" if is_due else "Skipped (not due)"}</p>
                {f"<p><strong>Result:</strong> {task_result}</p>" if is_due else ""}
                <hr>
                <p>Thank you,<br>AI Agent System</p>
            </body>
            </html>
            """

            await _send_progress_email(agent_id, email_template)

    # Persist this object in local storage to ensure the last run is maintained.
    file_path = _agent_file_path(agent_id)
    with open(file_path, "w") as f:
        # JSON dump has a few formatting changes, and we should dump the updated config!
        agent_data = agent_config.dict()
        # now update, we need to serialize datatime for the local storage.
        for task in agent_data["tasks"]:
            if "last_run" in task and task["last_run"] is not None:
                task["last_run"] = str(task["last_run"])
        json.dump(agent_data, f, indent=4)

    logger.info(f"Scheduled agent run complete: {agent_id}")

    # Send Progress Mail (every Agent run)
   


async def interrupt_agent(agent_id: str, prompt: str):
    logger.info(f"Interrupting agent: {agent_id} with prompt: {prompt}")
    agent: AgentConfiguration = await get_agent(agent_id)

    all_tasks = await get_status(agent.id)
    my_memory = memory.get_all(agent_id=agent.id)
    upcoming_tasks = all_tasks["upcoming_tasks"]
    tasks_description = "\n".join(
        [
            f"- {task['task_type']} (Due in: {task['due_in'] or 'No due date'})"
            for task in upcoming_tasks
        ]
    )

    system_prompt = f"""
You are {agent.persona.name}, an advanced conversational AI designed to provide concise and professional project updates.
You embody the following qualities: {agent.persona.qualities}. You are {agent.persona.description}.

Context: You are calling name to provide a project status update. Manager overseeing this project.


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

    return {"message": await gemini.generate_text(prompt, system_prompt)}


async def get_status(agent_id: str) -> dict:
    """
    Retrieves the status of an agent, including a list of upcoming
    scheduled tasks and whether a task is currently running.

    Args:
        agent_id: The ID of the agent.

    Returns:
        A dictionary containing the agent's status, including a list of
        upcoming tasks and their due times.  Example:

        ```json
        {
            "agent_id": "agent_id_here",
            "is_running": false,
            "current_task": null,
            "upcoming_tasks": [
                {
                    "task_type": "seo_optimizer",
                    "due_in": "2 hours"
                },
                {
                    "task_type": "competitor_watchdog",
                    "due_in": "1 day 3 hours"
                }
            ]
        }
        ```
    """
    agent_config = await get_agent(agent_id)
    if not agent_config:
        return {"error": "Agent not found"}

    now = datetime.now()
    upcoming_tasks = []

    # Gather upcoming tasks and their due times.
    for task in agent_config.tasks:
        if task.frequency == "on-demand":
            continue  # Skip on-demand tasks for scheduling purposes.

        # Check when the task should run next
        if task.frequency == "daily":
            if task.last_run is None:
                time_difference = timedelta(seconds=0)
            else:
                time_difference = now - task.last_run
            if time_difference >= timedelta(days=1):
                time_till_run = timedelta(seconds=0)
            else:
                time_till_run = timedelta(days=1) - time_difference

        elif task.frequency == "hourly":
            if task.last_run is None:
                time_difference = timedelta(seconds=0)
            else:
                time_difference = now - task.last_run
            if time_difference >= timedelta(hours=1):
                time_till_run = timedelta(seconds=0)
            else:
                time_till_run = timedelta(hours=1) - time_difference

        elif task.frequency == "6-hourly":
            if task.last_run is None:
                time_difference = timedelta(seconds=0)
            else:
                time_difference = now - task.last_run
            if time_difference >= timedelta(hours=6):
                time_till_run = timedelta(seconds=0)
            else:
                time_till_run = timedelta(hours=6) - time_difference
        elif task.frequency == "monthly":
            if task.last_run is None:
                time_difference = timedelta(seconds=0)
            else:
                time_difference = now - task.last_run
            if time_difference >= timedelta(days=30):
                time_till_run = timedelta(seconds=0)
            else:
                time_till_run = timedelta(days=30) - time_difference

        else:
            logger.warn(f"Skipping, didn't match Cron format {task.frequency}")
            continue

        # Determine "due_in" string.
        days = time_till_run.days
        hours, remainder = divmod(time_till_run.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        due_in_string = ""
        if days > 0:
            due_in_string += str(days) + " days "
        if hours > 0:
            due_in_string += str(hours) + " hours "
        if minutes > 0:
            due_in_string += str(minutes) + " minutes"

        upcoming_tasks.append({"task_type": task.type, "due_in": due_in_string})

    return {
        "agent_id": agent_id,
        "is_running": False,  # Assuming only one task runs at a time.
        "current_task": None,  # Track current task if needed in future
        "upcoming_tasks": upcoming_tasks,
    }
