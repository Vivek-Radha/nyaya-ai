from pydantic import BaseModel
from typing import List, Optional

class ToolUsed(BaseModel):
    tool_name: str
    result_summary: str

class AIChatRequest(BaseModel):
    message: str
    case_id: Optional[str] = None
    conversation_id: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    tools_used: List[ToolUsed] = []
    conversation_id: str
