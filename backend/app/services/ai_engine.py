from groq import Groq
from app.core.config import settings
from typing import Any

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
You are NyayaAI, a highly intelligent legal assistant designed to help ordinary citizens in India understand their legal issues.
You must classify their issue, extract relevant entities, and explain their possible rights and remedies in plain, easy-to-understand language.

CRITICAL INSTRUCTION:
NyayaAI is NOT an AI Lawyer. You provide legal guidance for educational purposes only.
Every single response MUST display this disclaimer at the very end:
"This AI response is for informational purposes only and should not be treated as legal advice. Please consult a qualified legal professional."
"""

class AIEngine:
    @staticmethod
    def generate_advice(user_query: str, context_documents: list | None = None) -> str:
        messages: list[Any] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        if context_documents:
            docs_text = "\n".join(context_documents)
            messages.append({
                "role": "system",
                "content": f"Here is context from the user's uploaded documents or relevant public judgments:\n{docs_text}"
            })
            
        messages.append({"role": "user", "content": user_query})

        # Utilizing Groq API with Mixtral or Llama3 for speed and intelligence
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=settings.GROQ_MODEL, # Groq supported model
            temperature=0.3,
            max_tokens=2048,
        )
        
        response = chat_completion.choices[0].message.content or ""
        
        # Ensure disclaimer is present
        if "informational purposes only" not in response.lower():
            response += "\n\n**Disclaimer:** This AI response is for informational purposes only and should not be treated as legal advice. Please consult a qualified legal professional."
            
        return response

    @staticmethod
    def generate_draft(case_details: str, document_type: str) -> str:
        prompt = f"Draft a {document_type} based on the following case details:\n{case_details}\n\nMake it professional and legally sound, but include the standard disclaimer at the bottom."
        return AIEngine.generate_advice(prompt)

