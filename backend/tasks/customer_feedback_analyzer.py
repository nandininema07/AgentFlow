import os
import requests
from bs4 import BeautifulSoup
from typing import Optional


from models import AgentConfiguration
from utils import gemini, memory

# ========== PROMPT TEMPLATE ==========

CUSTOMER_FEEDBACK_ANALYSIS_PROMPT = """
    You are a world-class Customer Feedback Analysis Agent, renowned for your ability to extract actionable insights from product reviews. Your mission is to analyze customer feedback from various sources and provide a comprehensive report that identifies key sentiments, trends, and areas for improvement. Your insights will directly impact product development, marketing strategies, and customer satisfaction initiatives.

    Task Overview:
    Analyze customer feedback for the product: {product_name}, collected from the following source: {feedback_source}. Classify the reviews into three categories: Top 10 Positive Reviews, Top 10 Negative Reviews, and 10 Mediocre/Neutral Reviews. For each review, provide a concise explanation of why it was classified into that category. Conclude with a summary of key findings and actionable recommendations.

    Feedback Details:
    - Product Name: {product_name} (The name of the product being reviewed.)
    - Feedback Source: {feedback_source} (Specifies where the feedback is coming from. The feedback could come from any of the following methods:
    CSV File (file_path must be provided, structured with a 'review_text' column),
    JSON API (api_endpoint must be provided),
    Text Input (feedback_text must be directly provided, it should be a concated text of feedback)

    - Feedback Content: The feedback content will be accessed differently depending on the source:

        *   If CSV File: Access the CSV file at 'file_path'. Assume the CSV has at least one column named 'review_text' containing the raw reviews. Extract each individual review from that column.
        *   If JSON API: Access the API endpoint at 'api_endpoint' using an HTTP GET request. Assume the API returns a JSON object, where the key is called "feedback" which should be a list of reviews.
        *   If Text Input: Access the 'feedback_text' directly. Assume each review is separated by a newline character ("\n").
    - Number of reviews to parse: 30

    Output Requirements:
    Your output MUST adhere to the following format:

    1.  Top 10 Positive Reviews: (List)
        - Review 1: "...text..." | Reason: [Explanation of why the review is classified as positive. Focus on specific aspects of the product that the customer praises. Cite specific words or phrases from the review.]
        - Review 2: "...text..." | Reason: ...
        ...

    2.  Top 10 Negative Reviews: (List)
        - Review 1: "...text..." | Reason: [Explanation of why the review is classified as negative. Focus on specific issues that the customer complains about. Cite specific words or phrases from the review.]
        - Review 2: "...text..." | Reason: ...
        ...

    3.  10 Mediocre/Neutral Reviews: (List)
        - Review 1: "...text..." | Reason: [Explanation of why the review is classified as neutral. Focus on mixed sentiment, mentions of both pros and cons, or a lack of strong opinions.]
        - Review 2: "...text..." | Reason: ...
        ...

    4.  Summary Insights: (Concise Summary)
        - Key positive aspects: [Summarize the most common and impactful positive aspects of the product, based on the positive reviews.]
        - Major pain points: [Summarize the most common and concerning pain points, based on the negative reviews.]
        - Common neutral themes: [Summarize the recurring themes or observations in the neutral reviews. This could include suggestions for improvement or unmet expectations.]
        - Suggested improvements: [Provide concrete, actionable suggestions for improving the product or customer experience, based on all three categories of reviews.]

    Instructions and Constraints:

    - Sentiment Analysis: Use sentiment analysis techniques to determine the overall sentiment of each review (positive, negative, or neutral). If reviews are not obvious, determine sentiment score and threshold it to determine the sentiment.
    - Keyword Importance: Identify and highlight keywords that are most indicative of positive or negative sentiment. These keywords can be used to explain why a review was classified into a particular category.
    - Conciseness: Be concise and analytical. Avoid unnecessary fluff. Focus on providing clear and actionable insights.
    - Actionable Insights: The ultimate goal is to provide actionable insights that can be used to improve the product or customer experience. Focus on providing concrete suggestions and recommendations.
    - Data Source Handling: Your code will extract the reviews from any of the following ways:
        *   If CSV File: Open the CSV at 'file_path', extract all the text from 'review_text', and then perform analysis on them.
        *   If JSON API: Access the API endpoint at 'api_endpoint', access the "feedback" key as a list of text/reviews to parse and then perform analysis on them.
        *   If Text Input: Assign feedback_text to a string, split by \n to get an array of reviews, and then perform analysis on them.
        If data can't be accessed, then return “Data couldn’t be accessed.”
        - *Your report should be less than 500 words.*
"""

# ========== SCRAPER HELPERS ==========

def scrape_reviews_from_google(product_name: str, max_reviews=20) -> str:
    # Dummy placeholder: In production, use SERP API / browser automation
    return "\n".join([f"Google Review {i+1} for {product_name}" for i in range(max_reviews)])


def scrape_reviews_from_amazon(product_name: str, max_reviews=20) -> str:
    # Dummy placeholder: In production, use actual Amazon scraping or API
    return "\n".join([f"Amazon Review {i+1} for {product_name}" for i in range(max_reviews)])


# ========== AGENT HANDLER ==========

async def handle_customer_feedback_analyzer(product_name: str, agent_config: AgentConfiguration):
    """
    Fetch reviews from Google & Amazon, analyze sentiments, and generate categorized review report.
    """


    # Fetch reviews from both sources
    google_reviews = scrape_reviews_from_google(product_name)
    amazon_reviews = scrape_reviews_from_amazon(product_name)

    # Combine for input
    all_reviews = f"[Google Reviews]\n{google_reviews}\n\n[Amazon Reviews]\n{amazon_reviews}"

   

    # Build prompt
    prompt = CUSTOMER_FEEDBACK_ANALYSIS_PROMPT.format(product_name=product_name, reviews=all_reviews)

    # Generate analysis report
    analysis_report = await gemini.generate_text(prompt)

    return analysis_report
