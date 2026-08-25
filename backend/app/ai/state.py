from typing import TypedDict, List, Dict, Optional, Any

class AgentState(TypedDict):
    user_id: str
    conversation_id: str
    messages: List[Dict[str, str]]
    message: str
    intent: str
    attachments: Optional[List[Dict[str, Any]]]
    document_text: Optional[str]
    retrieved_context: List[Dict[str, Any]]
    response: str
    sources: List[str]
    actions: List[str]
    disclaimer: str
    error: Optional[str]
