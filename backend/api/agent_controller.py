# api/agent_controller.py
import asyncio
from typing import List

from api import agent_service
from fastapi import APIRouter, BackgroundTasks, HTTPException
from models import AgentConfiguration

router = APIRouter()


@router.post("/", response_model=AgentConfiguration)
async def create_agent(agent_config: AgentConfiguration):
    return await agent_service.create_agent(agent_config)


@router.get("/", response_model=List[AgentConfiguration])
async def list_agents():
    return await agent_service.list_agents()


@router.get("/{agent_id}", response_model=AgentConfiguration)
async def get_agent(agent_id: str):
    agent = await agent_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentConfiguration)
async def update_agent(agent_id: str, agent_config: AgentConfiguration):
    agent = await agent_service.update_agent(agent_id, agent_config)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/{agent_id}/run")
async def run_agent(agent_id: str, background_tasks: BackgroundTasks):
    agent = await agent_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    background_tasks.add_task(agent_service._run_scheduled_agent, agent_id, True)
    return {"message": f"Agent {agent_id} execution has been scheduled."}


@router.post("/{agent_id}/interrupt")
async def interrupt_agent(agent_id: str, prompt: str):
    return await agent_service.interrupt_agent(agent_id, prompt)


@router.get("/{agent_id}/status")
async def get_agent_status(agent_id: str):
    return await agent_service.get_status(agent_id)
