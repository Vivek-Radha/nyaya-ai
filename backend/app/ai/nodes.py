from typing import Dict, Any, List
from app.ai.state import AgentState
from app.ai.tools import search_cases, search_documents, get_case_timeline
from groq import Groq
from app.core.config import settings
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

async def analyze_query(state: AgentState) -> AgentState:
    try:
        def _call_groq():
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY is missing in backend .env")
                
            client = Groq(api_key=settings.GROQ_API_KEY)
            sys_prompt = """You are NyayaAI's query classifier. 
Classify the user's message into one of these intents:
- general_legal_question
- case_question
- document_question
- deadline_question
- unknown
Return ONLY the classification string without quotes."""
            
            return client.chat.completions.create(
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": state["message"]}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.0
            )
            
        completion = await asyncio.to_thread(_call_groq)
        intent = (completion.choices[0].message.content or "").strip().lower()
        if intent not in ["general_legal_question", "case_question", "document_question", "deadline_question"]:
            intent = "unknown"
            
        return {**state, "intent": intent} # type: ignore
    except Exception as e:
        logger.exception("Failed to analyze query")
        return {**state, "error": f"Failed to analyze query: {str(e)}"} # type: ignore

import re
from collections import Counter

async def process_attachments(state: AgentState) -> AgentState:
    # Deprecated: Document processing and chunking is now handled immediately on upload
    # via the /upload endpoint. This node is kept as a pass-through for graph compatibility.
    if state.get("error"):
        return state
    return state

async def retrieve_context(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
        
    user_id = state["user_id"]
    intent = state["intent"]
    query = state["message"]
    attachments = state.get("attachments", [])
    
    context = []
    sources = []
    
    try:
        from app.core.database import get_db
        db = get_db()
        
        # 1. Specific Document Context (if a document_id is attached to the chat)
        doc_text_combined = ""
        for att in attachments:
            doc_id = att.get("document_id")
            if doc_id:
                logger.info(f"[AI] Retrieving chunks for document_id: {doc_id}")
                cursor = db["document_chunks"].find({"document_id": doc_id, "user_id": user_id})
                chunks = await cursor.to_list(length=100)
                
                if chunks:
                    query_words = set(re.findall(r'\w+', query.lower())) - {"what", "is", "the", "a", "an", "of", "and", "in", "to", "for", "this", "document"}
                    
                    scored_chunks = []
                    for chunk in chunks:
                        chunk_text = chunk.get("text", "")
                        chunk_words = set(re.findall(r'\w+', chunk_text.lower()))
                        score = len(query_words.intersection(chunk_words))
                        scored_chunks.append((score, chunk["chunk_index"], chunk_text))
                        
                    # Take top 5 most relevant chunks
                    scored_chunks.sort(key=lambda x: (x[0], -x[1]), reverse=True)
                    top_chunks = scored_chunks[:5]
                    top_chunks.sort(key=lambda x: x[1])
                    
                    doc_text_combined += f"\n\n[...]\n\n".join([c[2] for c in top_chunks])
                    sources.append(f"Attached Document")
                else:
                    # Maybe it's a small document without chunks, fetch from raw doc if necessary,
                    # but chunks are generated for all sizes now.
                    pass
                    
        # Update the state's document_text so Groq gets it directly
        if doc_text_combined:
            state["document_text"] = doc_text_combined
            logger.info(f"[AI] Relevant chunks retrieved. Combined length: {len(doc_text_combined)}")

        # 2. General Case/Timeline Context
        if intent in ["case_question", "deadline_question"]:
            cases = await search_cases(query, user_id)
            if cases:
                context.append({"type": "cases", "data": cases})
                for c in cases: sources.append(f"Case: {c.get('title')}")
                
        # 3. General Document Context (Searching other documents)
        if intent in ["document_question", "general_legal_question", "unknown"] and not attachments:
            docs = await search_documents(query, user_id)
            if docs:
                context.append({"type": "documents", "data": docs})
                for d in docs: sources.append(f"Doc: {d.get('title')}")
                
        if intent == "deadline_question" and context and context[0]["type"] == "cases":
            case_id = context[0]["data"][0]["id"]
            timeline = await get_case_timeline(case_id, user_id)
            context.append({"type": "timeline", "data": timeline})
            sources.append("Case Timeline")

        return {**state, "retrieved_context": context, "sources": list(set(sources))} # type: ignore
    except Exception as e:
        logger.exception("Failed to retrieve context")
        return {**state, "error": f"Failed to retrieve context: {str(e)}"} # type: ignore

async def generate_response(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
        
    try:
        def _call_groq_gen():
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY is missing in backend .env")
                
            client = Groq(api_key=settings.GROQ_API_KEY)
            from app.ai.prompts import SYSTEM_PROMPT
            
            context_str = json.dumps(state.get("retrieved_context", []), indent=2)
            doc_text_str = state.get("document_text", "")
            
            full_sys_prompt = f"""{SYSTEM_PROMPT}
            
Context retrieved from user data:
{context_str}

{"Attached Document Content:" if doc_text_str else ""}
{doc_text_str}

Remember:
1. Distinguish between general info and retrieved info/document text.
2. Never fabricate citations, numbers, or pages.
3. If context is missing, say so.
4. If the attached document says text extraction is not supported (e.g. an image), you MUST still answer the user's question based on their message text. Do NOT leave the answer empty.
5. CONVERSATION MEMORY: Resolve references like "it", "that", "this section", or "the agreement" using the conversation history provided. Answer follow-up questions within the context of previous messages.
6. You MUST return your response as a raw JSON object with the following structure exactly (DO NOT wrap it in markdown code blocks like ```json):
{{
  "answer": "Your detailed markdown formatted response",
  "intent": "{state.get('intent', 'document_analysis')}",
  "sources": ["source 1 (Page 4)", "source 2"],
  "actions": ["suggested action 1", "suggested action 2"],
  "disclaimer": "NyayaAI provides general legal information and is not a substitute for advice from a qualified lawyer."
}}
"""
            history = state.get("messages", [])
            groq_messages = [{"role": "system", "content": full_sys_prompt}]
            
            # Limit history to the last 10 messages (5 turns) to save tokens
            for msg in history[-10:]:
                groq_messages.append({"role": msg["role"], "content": msg["content"]})
                
            groq_messages.append({"role": "user", "content": state["message"]})
            
            return client.chat.completions.create(
                messages=groq_messages,
                model=settings.GROQ_MODEL,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
        logger.info("[AI] Groq request started")
        completion = await asyncio.to_thread(_call_groq_gen)
        logger.info("[AI] Groq response received")
        raw_response = completion.choices[0].message.content or "{}"
        
        try:
            parsed = json.loads(raw_response)
            answer = parsed.get("answer")
            if not answer: # Catch null, empty string, or missing key
                answer = "I received your request, but the document couldn't be fully processed. Please describe your legal issue directly in the chat."
            sources = state.get("sources", []) + parsed.get("sources", [])
            actions = parsed.get("actions", [])
            disclaimer = parsed.get("disclaimer", "")
            intent = parsed.get("intent", state.get("intent", "unknown"))
        except json.JSONDecodeError:
            answer = raw_response if raw_response and raw_response != "{}" else "I couldn't process the response properly. Please try again."
            sources = state.get("sources", [])
            actions = []
            disclaimer = ""
            intent = state.get("intent", "unknown")
            
        return {
            **state, 
            "response": answer, 
            "sources": list(set(sources)),
            "actions": actions,
            "disclaimer": disclaimer,
            "intent": intent
        } # type: ignore
    except Exception as e:
        logger.exception("Failed to generate response")
        return {**state, "error": f"Failed to generate response: {str(e)}"} # type: ignore

async def validate_response(state: AgentState) -> AgentState:
    if state.get("error"):
        return state
        
    disclaimer = state.get("disclaimer") or "NyayaAI provides general legal information and is not a substitute for advice from a qualified legal professional."
    
    return {**state, "disclaimer": disclaimer} # type: ignore
