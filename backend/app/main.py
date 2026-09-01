from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NyayaAI API",
    description="Justice Made Simple with Artificial Intelligence",
    version="1.0.0"
)

import os

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nyaya-ai-flame.vercel.app"
    "https://nyaya-e4soa34ao-vivek-radhas-projects.vercel.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    clean_frontend_url = frontend_url.strip().rstrip("/")
    if clean_frontend_url and clean_frontend_url not in origins:
        origins.append(clean_frontend_url)

cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    for o in cors_origins_env.split(","):
        clean_o = o.strip().rstrip("/")
        if clean_o and clean_o not in origins:
            origins.append(clean_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test_groq")
async def test_groq_endpoint():
    try:
        from app.core.config import settings
        return {"status": "success", "GROQ_MODEL": settings.GROQ_MODEL, "API_KEY_LEN": len(settings.GROQ_API_KEY)}
    except Exception as e:
        import traceback
        return {"status": "error", "type": str(type(e)), "message": str(e), "traceback": traceback.format_exc()}

@app.get("/debug_env")
async def debug_env():
    from app.core.config import settings
    import os
    return {
        "settings_google_client_id": settings.GOOGLE_CLIENT_ID,
        "os_env_google_client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "env_file_path": str(settings.Config.env_file)
    }


@app.get("/")
def read_root():
    return {"message": "Welcome to NyayaAI API!"}

@app.get("/debug_models")
async def debug_models():
    try:
        from app.core.config import settings
        from groq import Groq
        import traceback
        
        if not settings.GROQ_API_KEY:
            return {"error": "GROQ_API_KEY is empty in settings"}
            
        client = Groq(api_key=settings.GROQ_API_KEY)
        models_response = client.models.list()
        # models_response.data is a list of model objects
        models = [m.id for m in models_response.data]
        return {"status": "success", "models": models}
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}


# Include routers
from app.api.auth import router as auth_router
from app.api.ai import router as ai_router
from app.api.cases import router as cases_router
from app.api.documents import router as documents_router
from app.api.timeline import router as timeline_router
from app.api.judgments import router as judgments_router

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(cases_router, prefix="/api/cases", tags=["Cases"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(timeline_router, prefix="/api/timeline", tags=["Timeline"])
app.include_router(judgments_router, prefix="/api/judgments", tags=["Judgments"])


