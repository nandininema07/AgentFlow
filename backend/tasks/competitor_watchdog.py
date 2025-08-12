from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from utils import memory, gemini
from models import AgentConfiguration,CompetitorWatchdog





COMPETITOR_INTELLIGENCE_PROMPT = """
    You are a highly specialized Competitive Intelligence Agent, tasked with monitoring competitor websites and extracting key updates. Your objective is to gather the latest information on competitor activities and present it in a structured format that can be easily analyzed. Focus on providing accurate, up-to-date information that will inform strategic decision-making.

    Task Overview:
    Scan the following competitor websites for the latest updates: {{websites}}. Identify new features, products, pricing changes, blog articles, customer testimonials, partnerships, press releases, or leadership changes.

    Website Details:
    - Websites: {websites} (This is a list of competitor URLs that you must analyze. You must extract information such as new features, products, pricing changes, blog articles, customer testimonials, partnerships, press releases, or leadership changes from each site. If a website is unreachable or lacks relevant information, clearly state that in your report.)

    Output Requirements:
    Your output MUST adhere to the following format:

    Competitor Intelligence Report: (Organized by Website)
    [Start of Report]
        - Website: [Website URL]
            *   [Update 1]: [Brief description of the update.]
            *   [Update 2]: [Brief description of another update.]
            *   ...
        - Website: [Website URL]
            *   [Update 1]: [Brief description of the update.]
            *   ...
        ...
    [End of Report]

    Instructions and Constraints:

    - Thoroughness: Analyze each website thoroughly and extract all relevant information.
    - Accuracy: Ensure that all information is accurate and up-to-date.
    - Conciseness: Be concise and avoid unnecessary details. Focus on providing the most important information in a clear and easy-to-understand format.
    - Structure Compliance: Absolutely adhere to the specified output format. The next agent depends on this structured format for analysis.
    - If there are no updates of note, then list 'No recent changes identified.'
"""
STRATEGIC_REPORT_PROMPT = """
    You are a world-class Market Strategist, responsible for analyzing competitor intelligence and deriving actionable insights to guide business decisions. Your objective is to identify key strategies, recommend action points, extract trending keywords, and highlight market gaps/opportunities based on the information provided.

    Task Overview:
    Analyze the following competitor intelligence data to generate a comprehensive strategic report:
    {intel_data}

    Competitor Intelligence Data:
    {intel_data} (This is a structured report containing the latest updates from competitor websites. The report is organized by website and includes key information such as new features, products, pricing changes, and marketing initiatives.)

    Output Requirements:
    Your output MUST adhere to the following format:

    Strategic Report:
    [Start of Report]
        1.  Executive Summary: (3-4 sentences) Provide a high-level overview of the competitive landscape. Summarize the key strategies observed across competitors and highlight any significant market gaps or opportunities.

        2.  Competitor Strategy Summary: (Concise Summary)
            - Strategy 1: [Describe a key strategy being employed by one or more competitors. This could include things like aggressive pricing, innovative product features, or targeted marketing campaigns.]
            - Strategy 2: [Describe another key strategy being employed by competitors.]
            - ...

        3.  Recommended Business Actions: (Actionable Recommendations)
            - Action 1: [Provide a concrete, actionable recommendation for how to respond to the competitive landscape. This could include things like launching a new product, adjusting pricing, or targeting a new market segment.]
            - Action 2: [Provide another actionable recommendation.]
            - ...

        4.  Top 10 Trending Keywords: (List of Keywords)
            - [Keyword 1]: (Extracted from competitor content. These keywords should be relevant to the industry and have high search volume potential.)
            - [Keyword 2]: (Another trending keyword.)
            - ...

        5.  Identified Market Gaps/Opportunities: (List of Gaps/Opportunities)
            - [Gap/Opportunity 1]: [Describe a market gap or opportunity that is not being addressed by competitors. This could include things like an underserved customer segment, an unmet need, or a new technology.]
            - [Gap/Opportunity 2]: [Describe another market gap or opportunity.]
            - ...
    [End of Report]

    Instructions and Constraints:

    - Structure Compliance: You MUST adhere strictly to the specified output format to make the insights understandable.
    - Concise Reporting: Be concise and avoid unnecessary details. Focus on providing the most important information in a clear and easy-to-understand format.
    - Actionable Insights: The ultimate goal is to provide actionable insights that can be used to improve the business. Focus on providing concrete suggestions and recommendations.
"""


# ========================= HANDLER FUNCTION ==========================
async def handle_competitor_watchdog(task: CompetitorWatchdog, agent_config: AgentConfiguration):
    
    try:
        # --------- Agent 1: Competitor Intelligence Gathering ---------
        intel_prompt = COMPETITOR_INTELLIGENCE_PROMPT.format(
            websites="\n".join(task.websites)
        )
        competitor_intel = await gemini.generate_text(
            intel_prompt,
            temperature=agent_config.temperature,
            max_output_tokens=agent_config.max_tokens
        )

        # --------- Agent 2: Strategic Report Generation ---------
        strategy_prompt = STRATEGIC_REPORT_PROMPT.format(
            intel_data=competitor_intel
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
            "competitor_intelligence": competitor_intel,
            "strategy_report": strategy_report
        }

    except Exception as e:
        error_message = f"[Competitor Watchdog ERROR] {str(e)}"
        memory.put(task.type, error_message)
        return {
            "task": task.type,
            "status": "error",
            "error": error_message
        }