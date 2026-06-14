from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.data import router as data_router

app = FastAPI(title="Nexus CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)


@app.get("/")
def root():
    return {"status": "Nexus CRM backend running"}


@app.get("/api/health")
def health():
    return {"healthy": True}
