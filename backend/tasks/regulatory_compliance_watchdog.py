
from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from utils import memory, gemini
from models import AgentConfiguration,RegulatoryComplianceWatchdog




COMPLIANCE_MONITOR_PROMPT = """
    You are a world-class Regulatory Compliance Monitoring Agent, specializing in tracking the latest updates from regulatory bodies and identifying information relevant to specific keywords. Your objective is to provide a concise and accurate summary of regulatory changes that may impact businesses. You will be monitored and measured on speed and accuracy, ensure that you have read through all of the information that is listed on the regulatory bodies, and you are reporting correctly what the changes are.

    Task Overview:
    Scan the latest updates from the following regulatory bodies: {{bodies}}. Identify any updates, announcements, enforcement actions, rule changes, press releases, and policy modifications that are relevant to the following keywords: {{keywords}}.

    Regulatory Details:
    - Regulatory Bodies: {bodies} (This is a list of regulatory bodies that you must monitor. Examples: SEC, FDA, EPA. You must visit their websites and review their latest publications.)
    - Keywords: {keywords}(This is a list of keywords that you must use to filter the regulatory updates. Examples: cybersecurity, AI, financial disclosures, data privacy. Focus on identifying updates that specifically mention these keywords.)

    Output Requirements:
    Your output MUST adhere to the following format:

    Compliance Monitoring Report:
    [Start of Report]
        - Regulatory Body: [Regulatory Body Name]
            *   [Date]: [Update Type] - [Brief description of the update]. Relevance: [Explain how the update relates to the specified keywords].
            *   [Date]: [Update Type] - [Brief description of another update]. Relevance: [Explain how the update relates to the specified keywords].
            *   ...
        - Regulatory Body: [Regulatory Body Name]
            *   [Date]: [Update Type] - [Brief description of the update]. Relevance: [Explain how the update relates to the specified keywords].
            *   ...
    [End of Report]

    Instructions and Constraints:

    - Thoroughness: Scan each regulatory body thoroughly and extract all relevant updates.
    - Accuracy: Ensure that all information is accurate and up-to-date. Provide links to the original source documents whenever possible.
    - Conciseness: Be concise and avoid unnecessary details. Focus on providing the most important information in a clear and easy-to-understand format.
    - Keyword Relevance: Only include updates that are directly relevant to the specified keywords.
    - Structure Compliance: You MUST adhere strictly to the specified output format.
    - If there are no updates of note, then list 'No recent changes identified for this compliance.'
    - Only include results from the last month for the report.
"""

COMPLIANCE_STRATEGY_PROMPT = """
    You are a world-class Compliance Strategist, responsible for reviewing regulatory updates and developing actionable strategies to ensure business compliance. Your objective is to analyze the impact of regulatory changes and provide concrete recommendations for how businesses can adapt to meet the new requirements.

    Task Overview:
    Analyze the following regulatory updates to generate a comprehensive compliance strategy report:
    {compliance_data}

    Regulatory Update Data:
    {compliance_data} (This is a structured report containing the latest updates from regulatory bodies. The report includes information on new rules, enforcement actions, and policy modifications.)

    Output Requirements:
    Your output MUST adhere to the following format:

    Compliance Strategy Report:
    [Start of Report]
        1.  Compliance Summary: (3-4 sentences) Provide a high-level overview of the key regulatory developments. Summarize the most important changes and their potential impact on businesses.

        2.  Risk/Impact Assessment: (Concise Assessment)
            - Risk 1: [Describe a potential compliance risk associated with the regulatory updates. This could include things like fines, lawsuits, or reputational damage.]
            - Risk 2: [Describe another potential compliance risk.]
            - ...

        3.  Recommended Actions: (Actionable Recommendations)
            - Action 1: [Provide a concrete, actionable recommendation for how to address the identified compliance risks. This could include things like updating policies, implementing new controls, or training employees.]
            - Action 2: [Provide another actionable recommendation.]
            - ...

        4.  Critical Alerts: (List of Alerts - if any)
            - Alert: [Describe a critical compliance issue that requires immediate attention. This could include things like a new regulation that goes into effect immediately or an enforcement action that could have significant financial consequences.]
            - ...If there are no alerts, then state: "No critical alerts identified."

        5.  Trending Compliance Keywords: (List of Keywords)
            - [Keyword 1]: (Identify keywords or phrases that are trending in the regulatory information. The list should have high search volume potential.)
            - [Keyword 2]: (Another trending keyword.)
            - ...
    [End of Report]

    Instructions and Constraints:

    - Structure Compliance: MUST adhere strictly to the specified output format.
    - Concise Reporting: Provide only the most important information in a clear and easy-to-understand format.
    - Actionable Insights: Focus on providing concrete suggestions and recommendations for improving the business.
"""


async def handle_regulatory_compliance_watchdog(task: RegulatoryComplianceWatchdog, agent_config: AgentConfiguration):
    

    try:
        # -------- Agent 1: Monitor Updates --------
        monitor_prompt = COMPLIANCE_MONITOR_PROMPT.format(
            bodies="\n".join(task.regulatory_bodies),
            keywords=", ".join(task.keywords)
        )
        compliance_updates = await gemini.generate_text(
            monitor_prompt,
            temperature=agent_config.temperature,
            max_output_tokens=agent_config.max_tokens
        )

        memory.put(task.type, "Compliance Updates:\n" + compliance_updates)

        # -------- Agent 2: Strategic Compliance Report --------
        strategy_prompt = COMPLIANCE_STRATEGY_PROMPT.format(
            compliance_data=compliance_updates
        )
        strategy_report = await gemini.generate_text(
            strategy_prompt,
            temperature=agent_config.temperature,
            max_output_tokens=agent_config.max_tokens
        )

       

        return {
            "task": task.type,
            "status": "success",
            "last_run": task.last_run,
            "compliance_updates": compliance_updates,
            "strategy_report": strategy_report
        }

    except Exception as e:
        error_msg = f"[Regulatory Compliance Watchdog ERROR] {str(e)}"
        memory.put(task.type, error_msg)
        return {
            "task": task.type,
            "status": "error",
            "error": error_msg
        }
