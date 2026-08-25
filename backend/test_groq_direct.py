import asyncio
from groq import AsyncGroq
from app.core.config import settings
import traceback

async def test():
    try:
        print(f"Testing Groq with API KEY length: {len(settings.GROQ_API_KEY)}")
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        completion = await client.chat.completions.create(
            messages=[{"role": "user", "content": "hello"}],
            model=settings.GROQ_MODEL,
            temperature=0.0
        )
        print("Success:", completion.choices[0].message.content)
    except Exception as e:
        print("EXCEPTION OCCURRED:", type(e))
        print("str(e):", str(e))
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
