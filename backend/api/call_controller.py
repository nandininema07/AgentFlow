from api import agent_service
from api.call_service import call_with_agent
from fastapi import APIRouter

call_router = APIRouter()


@call_router.get("/")
async def run_call(
    agent_id: str,
    phone_number: str = "+918408873439",
    name: str = "Sujal Vivek Choudhari",
):
    agent = await agent_service.get_agent(agent_id)
    await call_with_agent(agent, phone_number, name)
    return {"message": "Call has been scheduled."}
