import csv
import os
from datetime import datetime
from typing import Optional
import fitz  # PyMuPDF
import requests
from bs4 import BeautifulSoup
from models import AgentConfiguration, ProductRecommendation
from utils import gemini, memory

# ========== PROMPT TEMPLATES ==========

DATA_AGENT_PROMPT = """
    You are a highly skilled data collection and summarization agent, specialized in gathering and synthesizing product insights to inform strategic decision-making. Your primary objective is to extract valuable information from various sources and provide a concise, insightful summary. You MUST leverage all available data sources provided, including website reviews, CSV datasets, company PDF reports, and user data types.

    Task Overview:
    Based on the provided data sources and user data, generate a comprehensive summary of key product insights for the following product(s): {products}.

    Data Sources:
    - Website Reviews: {source_url} (If a URL is provided, scrape and analyze customer reviews from this website. If not provided, state "No website URL provided.") Limit to the 10 most relevant reviews. Prioritize reviews that mention specific product features or address common concerns.
    - Uploaded CSV Dataset (if available): Analyze the provided CSV dataset (if available). Focus on extracting key data points related to product sales, customer demographics, purchase patterns, and other relevant metrics. If no CSV path is provided, state "No CSV dataset provided."
    - Company PDF Report (if provided): Analyze the provided PDF report (if available). Extract key business highlights, market trends, competitive analysis, and any other information relevant to product performance and strategic decision-making. If no PDF path is provided, state "No company PDF report provided."
    - User Data Source: {user_data_source} (This indicates the type of user data available. Use this information to guide your analysis and prioritize relevant insights.) Examples: Purchase History (focus on buying patterns), Browsing History (focus on product interests), Demographics (focus on user segments).

    Expected Output:
    Return a summarized context covering the following aspects:

    - Product Sentiments: Analyze website reviews and identify the overall sentiment (positive, negative, neutral) associated with each product. Highlight specific aspects that customers praise or criticize. *Quantify sentiment whenever possible (e.g., "80% of reviews express positive sentiment about the product's durability").*
    - Customer Preferences: Identify key customer preferences based on all available data sources. What product features are most important to customers? What are their pain points? Are there any emerging trends in customer preferences? *Use specific examples from the data sources to support your conclusions.*
    - Usage Trends: Analyze sales data (from CSV and PDF reports) and identify any significant usage trends. Are there any seasonal patterns? Are there any specific user segments that are driving growth? *Include specific metrics (e.g., "Sales of product X increased by 20% in Q4").*
    - Business Highlights from PDF: Extract key business highlights from the company PDF report. Focus on information that is relevant to product strategy, such as market share, competitive positioning, and new product launches. *Provide specific quotes or data points from the PDF to support your analysis.*
    - Overall Summary: Conclude with a concise (2-3 sentence) summary of the key insights that emerged from your analysis. Highlight the most important takeaways for product strategy decision-making.

    Instructions and Constraints:

    - Be concise and avoid unnecessary jargon.
    - Focus on providing actionable insights rather than simply summarizing the data.
    - Prioritize information that is relevant to product strategy decision-making.
    - If a data source is not available, state that it is not available and move on to the next data source. Do not assume or invent data.
    - *Use clear and direct language. Avoid ambiguity and hedging.*
    - *Use quantitative data whenever possible to support your conclusions.*
    - *Focus on trends and patterns rather than individual data points.*
    - Format the output for easy readability. Use bullet points and headings to organize the information.
"""

RECOMMENDATION_AGENT_PROMPT = """
    You are a highly strategic and insightful product recommendation agent, tasked with analyzing product data and generating a comprehensive recommendation report to guide product strategy, marketing, and development. Your primary goal is to provide actionable recommendations based on a thorough understanding of customer needs, market trends, and product performance. You MUST leverage the provided product data summary to formulate your recommendations.

    Task Overview:
    Based on the provided product data summary, generate a high-quality recommendation report outlining key insights and actionable strategies.

    Product Data Summary:
    {product_data} (This is a summary of key product insights gathered from various sources, including website reviews, CSV datasets, company PDF reports, and user data types.)

    Expected Output:
    Generate a recommendation report including the following sections:

    - Top Recommended Product(s) with Reasoning: Based on the data summary, identify the top recommended product(s) and provide a detailed explanation of why you are recommending them. Consider factors such as customer sentiment, usage trends, and market opportunities. *Provide specific evidence from the data summary to support your recommendations.* For example: "Based on overwhelmingly positive customer reviews and a 20% increase in Q4 sales, we recommend focusing on Product X."
    - Customer Demand Trends: Analyze the data summary and identify key trends in customer demand. What product features are most popular? What are customers asking for? Are there any unmet needs? *Provide specific examples from the data summary to illustrate these trends.* For example: "Customers are increasingly requesting integration with [specific platform], indicating a growing demand for this feature."
    - Optimization Strategies: Based on the data summary, identify opportunities to optimize product performance and customer satisfaction. This could include improving product features, addressing customer pain points, or streamlining the user experience. *Provide specific recommendations for optimization strategies.* For example: "Based on negative feedback regarding the product's complexity, we recommend simplifying the user interface."
    - Marketing or Pricing Suggestions: Based on the data summary, suggest potential marketing or pricing strategies to increase sales and market share. This could include targeting specific user segments, highlighting key product benefits, or adjusting pricing to be more competitive. *Provide specific recommendations for marketing or pricing strategies.* For example: "Based on demographic data, we recommend targeting younger users with a social media marketing campaign focused on [specific product feature]."
    - New Feature Ideas (if relevant): Based on the data summary, brainstorm new feature ideas that could address unmet customer needs or capitalize on emerging market trends. *Provide a clear explanation of the proposed feature and its potential benefits.* For example: "Based on customer feedback and market trends, we recommend developing a [specific feature] that would allow users to [achieve a specific goal]."

    Instructions and Constraints:

    - Be concise and avoid unnecessary jargon.
    - Focus on providing actionable recommendations that can be implemented immediately.
    - Prioritize recommendations that are supported by strong evidence from the data summary.
    - *Use clear and direct language. Avoid ambiguity and hedging.*
    - *Quantify your recommendations whenever possible. Provide specific metrics and targets.*
    - *Think strategically about how to leverage product data to drive business growth.*
    - Format the output for easy readability. Use bullet points and headings to organize the information.

"""


# ========== CSV HANDLER ==========


def extract_text_from_csv(csv_path, max_rows=20):
    try:
        lines = []
        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)
            lines.append(f"CSV Headers: {headers}")
            for i, row in enumerate(reader):
                lines.append(f"Row {i + 1}: {row}")
                if i >= max_rows:
                    break
        return "\n".join(lines)
    except Exception as e:
        return f"Error reading CSV: {e}"


# ========== PDF HANDLER ==========


def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        return f"Error extracting PDF content: {e}"


# ========== WEBSITE SCRAPER ==========


def scrape_reviews_from_website(source_url, max_reviews=10):
    if not source_url:
        return "No source URL provided."
    try:
        response = requests.get(source_url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        reviews = [p.get_text(strip=True) for p in soup.find_all("p")][:max_reviews]
        return "\n".join(reviews)
    except Exception as e:
        return f"Error scraping reviews: {e}"


# ========== AGENT 1: DATA COLLECTION ==========


async def product_data_agent(task: ProductRecommendation):
    reviews_text = scrape_reviews_from_website(task.source_url)

    csv_text = (
        extract_text_from_csv(task.uploaded_csv_path) if task.uploaded_csv_path else ""
    )
    pdf_text = (
        extract_text_from_pdf(task.company_pdf_path) if task.company_pdf_path else ""
    )

    prompt = DATA_AGENT_PROMPT.format(
        products=", ".join(task.products),
        source_url=task.source_url if task.source_url else "Not provided",
        user_data_source=task.user_data_source,
    )

    combined_input = f"""{prompt}

[Website Reviews]:
{reviews_text}

[CSV Dataset Insights]:
{csv_text}

[Company PDF Insights]:
{pdf_text}
"""

    data_summary = await gemini.generate_text(combined_input)
    return data_summary


# ========== AGENT 2: STRATEGIC RECOMMENDATION ==========


async def product_recommendation_agent(id, task: ProductRecommendation):
    product_data = memory.get_all("product_data_summary")

    prompt = RECOMMENDATION_AGENT_PROMPT + f"\n\n[Product Data Summary]\n{product_data}"
    recommendation = await gemini.generate_text(prompt)
    return recommendation


# ========== MAIN HANDLER FUNCTION ==========


async def handle_product_recommendation(
    task: ProductRecommendation, agent_config: AgentConfiguration
):
    """
    Runs product recommendation flow using Gemini-based agents.
    """
    agent_id = agent_config.id
    # data_summary = await product_data_agent(task)
    final_recommendation = await product_recommendation_agent(agent_id, task)
    return final_recommendation
