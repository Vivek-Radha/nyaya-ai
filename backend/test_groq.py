import asyncio
from app.ai.nodes import analyze_query
from app.ai.state import AgentState

async def test():
    state = AgentState(
        user_id="test",
        conversation_id="test",
        message="Explain my case in simple language",
        intent="",
        retrieved_context=[],
        response="",
        sources=[],
        error=None
    )
    result = await analyze_query(state)
    print("Result:", result)

if __name__ == "__main__":
    asyncio.run(test())
