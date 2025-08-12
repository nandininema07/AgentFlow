import os
import requests
from bs4 import BeautifulSoup
from models import AIResearchAssistant, AgentConfiguration
from utils import gemini, memory


# ==== WEB SCRAPER UTIL (Basic HTML Titles + Snippets) ====
def search_research_sites(query, max_results=5):
    """
    Searches research sites like Google Scholar, PubMed, and arXiv for a given query.

    Args:
        query (str): The search query.
        max_results (int): The maximum number of results to return.

    Returns:
        list: A list of dictionaries, where each dictionary contains the title and link of a search result.
    """
    search_results = []

    # Research Sites
    search_urls = [
        f"https://scholar.google.com/scholar?q={query}",
        f"https://pubmed.ncbi.nlm.nih.gov/?term={query}",
        f"https://arxiv.org/search/?query={query}&searchtype=all",
    ]

    for url in search_urls:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            soup = BeautifulSoup(response.text, "html.parser")

            # Limit titles and links to max_results for current URL
            titles = [tag.get_text(strip=True) for tag in soup.find_all(["h3", "h2"])][
                :max_results
            ]
            links = [
                a["href"]
                for a in soup.find_all("a", href=True)
                if query.lower() in a["href"].lower() or "pdf" in a["href"]
            ][:max_results]  # Limiting the number of links extracted per site.

            # Zip titles and links; handles mismatched lengths gracefully
            for title, link in zip(titles, links):
                search_results.append({"title": title, "link": link})

        except requests.exceptions.RequestException as e:
            print(f"Error scraping {url}: {e}")
        except Exception as e:  # Catch any other unexpected errors
            print(f"Unexpected error while scraping {url}: {e}")

    return search_results


def internet_research_agent(query):
    """
    Performs internet research using the search_research_sites function and returns a formatted summary.

    Args:
        query (str): The search query.

    Returns:
        str: A formatted summary of the search results.
    """
    results = search_research_sites(query)

    if not results:
        return "No relevant online research sources found."

    output_summary = ""
    for result in results:
        match_percentage = (
            "30%+"
            if "pdf" in result["link"] or "login" in result["link"]
            else "50%-90%"
        )
        comment = (
            "(May be paywalled or locked)"
            if "login" in result["link"] or "doi.org" in result["link"]
            else ""
        )
        output_summary += (
            f"- Title: {result['title']}\n  Link: {result['link']}\n  "
            f"Relevance: {match_percentage} {comment}\n\n"
        )

    return output_summary



async def handle_ai_research_assistant(task: AIResearchAssistant, agent_config: AgentConfiguration):
    """
    Handles the AI research assistant task by performing internet research on the specified topic.

    Args:
        task (AIResearchAssistant): The task object containing details about the research topics.
        agent_config (AgentConfiguration): The configuration object for the agent.

    Returns:
        list: A list of internet links relevant to the first research topic provided in the task.
    """
    internet_links = internet_research_agent(task.research_topics[0])
    return internet_links
