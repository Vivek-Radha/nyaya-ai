import json
import uuid
from typing import Optional, Any
from datetime import datetime
from groq import AsyncGroq
from app.core.config import settings
from app.core.database import get_db
from app.ai.prompts import SYSTEM_PROMPT
from app.ai.tools import search_documents, analyze_document, search_cases, get_case_timeline, explain_legal_issue, draft_legal_document
from app.ai.schemas import AIChatResponse, ToolUsed

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_documents",
            "description": "Search the user's uploaded documents for specific information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query"},
                    "case_id": {"type": "string", "description": "Optional case ID to filter by"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_document",
            "description": "Analyze a specific document to extract parties, dates, issues, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "document_id": {"type": "string", "description": "The ID of the document"}
                },
                "required": ["document_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_cases",
            "description": "Search the user's legal cases by keyword or topic.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_case_timeline",
            "description": "Retrieve the timeline of events and deadlines for a specific case.",
            "parameters": {
                "type": "object",
                "properties": {
                    "case_id": {"type": "string", "description": "The case ID"}
                },
                "required": ["case_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "explain_legal_issue",
            "description": "Explain legal terminology and issues in simple language.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue": {"type": "string", "description": "The legal issue to explain"},
                    "context": {"type": "string", "description": "Any relevant context from the user's facts"}
                },
                "required": ["issue", "context"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "draft_legal_document",
            "description": "Draft a legal document based on case context.",
            "parameters": {
                "type": "object",
                "properties": {
                    "document_type": {"type": "string", "description": "Type of document (e.g. eviction notice response)"},
                    "case_context": {"type": "string", "description": "Facts to include in the draft"}
                },
                "required": ["document_type", "case_context"]
            }
        }
    }
]

class Agent:
    @staticmethod
    async def process_message(user_id: str, message: str, conversation_id: Optional[str] = None, case_id: Optional[str] = None) -> AIChatResponse:
        db = get_db()
        
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            convo = {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "case_id": case_id,
                "messages": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db["ai_conversations"].insert_one(convo)
        else:
            convo = await db["ai_conversations"].find_one({"conversation_id": conversation_id, "user_id": user_id})
            if not convo:
                raise ValueError("Conversation not found")
                
        groq_messages: list[Any] = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages_list: list[Any] = convo.get("messages", []) # type: ignore
        for msg in messages_list[-10:]:
            groq_messages.append({"role": msg.get("role"), "content": msg.get("content")})
            
        groq_messages.append({"role": "user", "content": message})
        
        chat_completion = await client.chat.completions.create( # type: ignore
            messages=groq_messages,
            model=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=2048,
            tools=GROQ_TOOLS,
            tool_choice="auto"
        )
        
        response_message = chat_completion.choices[0].message
        
        tools_used = []
        sources = []
        
        if response_message.tool_calls:
            groq_messages.append(response_message.model_dump(exclude_unset=True))
            
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                tool_result = ""
                
                try:
                    if function_name == "search_documents":
                        res = await search_documents(query=arguments.get("query", ""), user_id=user_id, case_id=arguments.get("case_id") or case_id)
                        tool_result = json.dumps(res)
                        tools_used.append(ToolUsed(tool_name="Document Search", result_summary=f"Found {len(res)} documents"))
                        for r in res: sources.append(f"Doc: {r.get('title')}")
                    elif function_name == "analyze_document":
                        res = await analyze_document(document_id=arguments.get("document_id", ""), user_id=user_id)
                        tool_result = json.dumps(res)
                        tools_used.append(ToolUsed(tool_name="Document Analysis", result_summary=f"Analyzed {res.get('title','document')}"))
                    elif function_name == "search_cases":
                        res = await search_cases(query=arguments.get("query", ""), user_id=user_id)
                        tool_result = json.dumps(res)
                        tools_used.append(ToolUsed(tool_name="Case Search", result_summary=f"Found {len(res)} cases"))
                    elif function_name == "get_case_timeline":
                        res = await get_case_timeline(case_id=arguments.get("case_id", ""), user_id=user_id)
                        tool_result = json.dumps(res)
                        tools_used.append(ToolUsed(tool_name="Timeline Checked", result_summary="Retrieved events"))
                    elif function_name == "explain_legal_issue":
                        tool_result = explain_legal_issue(arguments.get("issue", ""), arguments.get("context", ""))
                        tools_used.append(ToolUsed(tool_name="Legal Explanation", result_summary="Explaining legal issue"))
                    elif function_name == "draft_legal_document":
                        tool_result = draft_legal_document(arguments.get("document_type", ""), arguments.get("case_context", ""))
                        tools_used.append(ToolUsed(tool_name="Document Drafter", result_summary="Drafting document"))
                except Exception as e:
                    tool_result = f"Error executing tool {function_name}: {str(e)}"
                    
                groq_messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": tool_result,
                })
                
            second_completion = await client.chat.completions.create( # type: ignore
                messages=groq_messages,
                model=settings.GROQ_MODEL,
                temperature=0.3,
                max_tokens=2048
            )
            final_content = second_completion.choices[0].message.content or ""
        else:
            final_content = response_message.content or ""
            
        if "informational purposes only" not in final_content.lower():
            final_content += "\n\n**Disclaimer:** This AI response is for informational purposes only and should not be treated as legal advice. Please consult a qualified legal professional."
            
        await db["ai_conversations"].update_one(
            {"conversation_id": conversation_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "content": message},
                            {"role": "assistant", "content": final_content}
                        ]
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return AIChatResponse(
            response=final_content,
            sources=list(set(sources)),
            tools_used=tools_used,
            conversation_id=conversation_id
        )
