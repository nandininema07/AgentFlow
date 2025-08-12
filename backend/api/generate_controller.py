from api import agent_service
from api.call_service import call_with_agent
from models import AgentConfiguration
from fastapi import APIRouter
from utils import gemini

router = APIRouter()


@router.get("/")
async def run_call(
    prompt: str,
):
    system_prompt = """
Make a JSON for the give users prmpt.
The Json is used to create a agent.


The valid parameters are:

from typing import List, Literal, Union, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class Persona(BaseModel):
    name: str = Field(..., description="Name of the persona")
    qualities: str = Field(..., description="Qualities of the persona")
    description: str = Field(..., description="Detailed description of the persona")


class Document(BaseModel):
    name: str = Field(..., description="Name of the document")
    path: str = Field(..., description="Path to the document")

# Define Task Models
class SEOOptimizer(BaseModel):
    type: Literal["seo_optimizer"] = Field(..., description="Type of task")
    keywords: List[str] = Field(..., description="List of keywords to target")
    content: str = Field(..., description="Content to optimize")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class CompetitorWatchdog(BaseModel):
    type: Literal["competitor_watchdog"] = Field(..., description="Type of task")
    websites: List[str] = Field(..., description="List of competitor URLs")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class ProductRecommendation(BaseModel):
    type: Literal["product_recommendation"] = Field(..., description="Type of task")
    products: List[str] = Field(..., description="List of product names/IDs")
    user_data_source: str = Field(
        ..., description="Data source for user information", enum=["Purchase History", "Browsing History", "Demographics"]
    )
    source_url: Optional[str] = Field(None, description="User-provided URL for scraping product reviews or information")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand", "daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="Last time task was run")
    uploaded_csv_path: Optional[str] = Field(None, description="Path to uploaded CSV dataset")
    company_pdf_path: Optional[str] = Field(None, description="Path to company-provided PDF")

class PostCreator(BaseModel):
    type: Literal["post_creator"] = Field(..., description="Type of task")
    topic: str = Field(..., description="Topic of the post")
    platform: str = Field(..., description="Platform to post on", enum=["Facebook", "Twitter", "LinkedIn", "Blog"])
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

# class SmartEmailManager(BaseModel):
#     type: Literal["smart_email_manager"] = Field(..., description="Type of task")
#     action: str = Field(..., description="Action to perform", enum=["Send", "Summarize", "Filter"])
#     to: Optional[str] = Field(None, description="Recipient email (for Send action)")
#     subject: Optional[str] = Field(None, description="Email subject (for Send action)")
#     body: Optional[str] = Field(None, description="Email body (for Send action)")
#     inbox: Optional[str] = Field(None, description="Email inbox URL (for Summarize action)")
#     keywords: Optional[List[str]] = Field(None, description="Keywords to filter (for Filter action)")
#     frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
#     last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class SmartEmailManager(BaseModel):
    type: Literal["smart_email_manager"] = Field(..., description="Type of task")
    action: str = Field(..., description="Action to perform", enum=["Send", "Summarize", "Filter"])
    to: Optional[List[str]] = Field(None, description="List of recipient emails (for Send action)")
    cc: Optional[List[str]] = Field(None, description="CC emails (optional)")
    bcc: Optional[List[str]] = Field(None, description="BCC emails (optional)")
    subject: Optional[str] = Field(None, description="Email subject (for Send action)")
    body: Optional[str] = Field(None, description="Email body (optional override)")
    inbox: Optional[str] = Field(None, description="Email inbox URL (for Summarize or Filter)")
    keywords: Optional[List[str]] = Field(None, description="Keywords to filter (for Filter action)")
    tone: Optional[str] = Field(None, description="Tone of email (e.g., formal, friendly, persuasive, executive)")
    role: Optional[str] = Field(None, description="Sender role (e.g., HR, Manager, Sales Lead)")
    company_name: Optional[str] = Field(None, description="Company or department name")
    custom_inclusions: Optional[str] = Field(None, description="Anything special to include in mail")
    word_limit: Optional[int] = Field(300, description="Maximum word limit for email body")
    template_reuse: Optional[bool] = Field(default=False, description="Whether to reuse previous templates")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand", "daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="Last time task was executed")

class MeetingSummarizer(BaseModel):
    type: Literal["meeting_summarizer"] = Field(..., description="Type of task")
    recording_source: str = Field(..., description="Recording Source", enum=["File Upload", "URL"])
    source_url: str = Field(..., description="Source URL")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class CustomerFeedbackAnalyzer(BaseModel):
    type: Literal["customer_feedback_analyzer"] = Field(..., description="Type of task")
    feedback_source: str = Field(..., description="Feedback Source", enum=["CSV File", "JSON API", "Text Input"])
    file_path: Optional[str] = Field(None, description="Path to the CSV File")
    api_endpoint: Optional[str] = Field(None, description="URL to JSON API")
    feedback_text: Optional[str] = Field(None, description="Text to analyze")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class ContractSummarizer(BaseModel):
    type: Literal["contract_summarizer"] = Field(..., description="Type of task")
    contract_source: str = Field(..., description="Contract Source", enum=["File Upload", "URL"])
    source_url: str = Field(..., description="Source URL")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class AIResearchAssistant(BaseModel):
    type: Literal["ai_research_assistant"] = Field(..., description="Type of task")
    research_topics: List[str] = Field(..., description="List of Research Topics")
    data_sources: List[str] = Field(..., description="Data Sources", enum=["Google Scholar", "Legal Databases"])
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

class RegulatoryComplianceWatchdog(BaseModel):
    type: Literal["regulatory_compliance_watchdog"] = Field(..., description="Type of task")
    regulatory_bodies: List[str] = Field(..., description="Regulatory Bodies", enum=["SEC", "FDA"])
    keywords: List[str] = Field(..., description="Keywords")
    frequency: str = Field(..., description="Frequency of task", enum=["on-demand","daily", "hourly", "monthly", "6-hourly"])
    last_run: Optional[datetime] = Field(default_factory=datetime.now, description="last time ran",)

# Define Update Models
class UpdateAPI(BaseModel):
    type: Literal["api"] = Field(..., description="Type of update")
    endpoint: str = Field(..., description="API endpoint URL")


class UpdateMail(BaseModel):
    type: Literal["mail"] = Field(..., description="Type of update")
    to: str = Field(..., description="Email Address")


UpdateType = Union[UpdateAPI, UpdateMail]  # type: ignore

# Define the AgentConfiguration Model
class AgentConfiguration(BaseModel):
    id: Optional[str] = Field(None, description="Unique ID")
    persona: Persona = Field(..., description="Persona settings")
    documents: List[Document] = Field(..., description="List of documents")
    tasks: List[
        Union[
            SEOOptimizer,
            CompetitorWatchdog,
            ProductRecommendation,
            PostCreator,
            SmartEmailManager,
            MeetingSummarizer,
            CustomerFeedbackAnalyzer,
            ContractSummarizer,
            AIResearchAssistant,
            RegulatoryComplianceWatchdog
        ]
    ] = Field(..., description="List of tasks")
    updates: List[UpdateType] = Field(..., description="List of updates")

    

---
Povide an JSON that will be used to create an agent.
Provide only 1 agent code.
"""
    data = await gemini.generate_json(prompt, system_prompt)
    if isinstance(data, list):
        data = data[0]

    print(data)
    agent = await agent_service.create_agent(AgentConfiguration(**data))
    return agent.dict()
