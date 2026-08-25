from langgraph.graph import StateGraph, END
from app.ai.state import AgentState
from app.ai.nodes import analyze_query, retrieve_context, generate_response, validate_response, process_attachments

workflow = StateGraph(AgentState)

workflow.add_node("analyze_query", analyze_query)
workflow.add_node("process_attachments", process_attachments)
workflow.add_node("retrieve_context", retrieve_context)
workflow.add_node("generate_response", generate_response)
workflow.add_node("validate_response", validate_response)

workflow.set_entry_point("analyze_query")
workflow.add_edge("analyze_query", "process_attachments")
workflow.add_edge("process_attachments", "retrieve_context")
workflow.add_edge("retrieve_context", "generate_response")
workflow.add_edge("generate_response", "validate_response")
workflow.add_edge("validate_response", END)

agent_graph = workflow.compile()

async def run_agent(
    user_id: str, 
    message: str, 
    conversation_id: str, 
    messages: list = None,
    attachments: list = None,
    document_text: str = None
) -> dict:
    initial_state = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "messages": messages or [],
        "message": message,
        "intent": "",
        "attachments": attachments or [],
        "document_text": document_text or "",
        "retrieved_context": [],
        "response": "",
        "sources": [],
        "actions": [],
        "disclaimer": "",
        "error": None
    }
    
    final_state = await agent_graph.ainvoke(initial_state)
    return final_state
