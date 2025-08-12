# tasks/seo_optimizer.py
from models import SEOOptimizer
from utils import gemini, memory



async def handle_seo_optimizer(task: SEOOptimizer, agent_config):
    """Handles the SEO Optimizer task for blog post content."""
    print("Executing SEO Optimizer Task")

    keywords = task.keywords
    content = task.content
    agent_id = agent_config.id

    # Retrieve previous optimization context if available
    previous_optimization = memory.get_latest(agent_id) or ""

    # Optimize the blog content
    optimized_content = await optimize_blog_content(
        content=content, keywords=keywords, previous_optimization=previous_optimization
    )

    # Store the optimization result in memory
    

    return optimized_content


async def optimize_blog_content(content, keywords, previous_optimization=""):
    """
    Optimizes blog content for SEO with focus on keyword density and placement.

    Args:
        content: The original blog content
        keywords: Target keywords for optimization
        previous_optimization: Previous optimization data if available

    Returns:
        SEO optimized blog content
    """
    # Format keywords for prompt
    if isinstance(keywords, list):
        keyword_text = ", ".join(keywords)
    else:
        keyword_text = keywords

    prompt = f"""
    I need you to optimize this blog post for SEO. Focus on natural integration of keywords while maintaining readability and value.

    BLOG CONTENT:
    {content}

    TARGET KEYWORDS: {keyword_text}

    OPTIMIZATION INSTRUCTIONS:
    1. Maintain a keyword density of 1-2% for primary keywords
    2. Add the primary keyword in the first paragraph
    3. Include keywords in headings and subheadings naturally
    4. Add LSI (Latent Semantic Indexing) keywords and related terms
    5. Improve paragraph structure for better readability (shorter paragraphs)
    6. Add transition phrases between sections
    7. Ensure proper use of bullet points or numbered lists where appropriate
    8. Include a compelling call-to-action
    9. Don't change the overall meaning or key points of the content
    
    PREVIOUS OPTIMIZATION CONTEXT:
    {previous_optimization}
    
    Return ONLY the optimized blog post content, without explanations or analysis.
    """

    system_prompt = """
    You are an expert SEO content optimizer specializing in blog content. Your goal is to enhance content for search engines while maintaining natural language flow and reader value. Focus on strategic keyword placement and content structure improvements without making the content sound artificial or keyword-stuffed.
    """

    # Generate optimized blog content
    optimized_content = await gemini.generate_text(
        prompt=prompt, system_prompt=system_prompt
    )

    return optimized_content


async def analyze_keyword_density(content, keywords):
    """
    Analyzes the keyword density and placement in the content.

    Args:
        content: The content to analyze
        keywords: Target keywords to check for

    Returns:
        Dictionary with keyword analysis
    """
    if isinstance(keywords, str):
        keywords = [kw.strip() for kw in keywords.split(",")]

    prompt = f"""
    Analyze this content for keyword usage and density:

    CONTENT:
    {content}

    KEYWORDS TO ANALYZE: {", ".join(keywords)}

    Provide a detailed analysis including:
    1. Exact count of each keyword appearance
    2. Keyword density percentage for each keyword
    3. Keyword placement (title, headings, first paragraph, etc.)
    4. Missing keywords that should be added
    5. Overused keywords that should be reduced
    
    Format the response as a JSON object with these categories.
    """

    analysis_result = await gemini.generate_text(
        prompt=prompt,
        system_prompt="You are an SEO keyword analyst. Provide accurate, detailed keyword analysis in the requested format.",
    )

    return analysis_result


async def generate_seo_recommendations(content, keywords):
    """
    Generates specific SEO improvement recommendations for the content.

    Args:
        content: The content to analyze
        keywords: Target keywords

    Returns:
        List of specific SEO recommendations
    """
    prompt = f"""
    Based on this blog content and target keywords, provide specific SEO improvement recommendations:

    BLOG CONTENT:
    {content}

    TARGET KEYWORDS: {keywords if isinstance(keywords, str) else ", ".join(keywords)}

    Generate 5-7 specific, actionable recommendations to improve this content's SEO performance.
    Focus on:
    - Keyword placement opportunities
    - Content structure improvements
    - Missing semantic keywords
    - Readability enhancements
    - Internal linking suggestions
    - Meta description optimization
    
    Format as a numbered list of clear, specific recommendations.
    """

    recommendations = await gemini.generate_text(
        prompt=prompt,
        system_prompt="You are an SEO consultant providing practical, specific recommendations to improve content performance.",
    )

    return recommendations
