from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StockQuest AI Service")

origins = [
    "http://localhost:3000",  # NestJS Backend
    "http://localhost:5173",  # Vite Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "stockquest-ai",
        "version": "1.0.0"
    }