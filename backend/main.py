from fastapi import FastAPI
import uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

from apps.product.routers import router as product_router
from apps.category.routers import router as category_router


app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    # app.mongodb_client = AsyncIOMotorClient(settings.DB_URL)
    # app.mongodb = app.mongodb_client[settings.DB_NAME]
    app.mongodb_client = AsyncIOMotorClient("mongodb+srv://realmaz:wow@cluster0.g75jc.mongodb.net/test")
    app.mongodb = app.mongodb_client["farm"]


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()


app.include_router(product_router, tags=["products"], prefix="/product")
app.include_router(category_router, tags=["category"], prefix="/category")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        reload=settings.DEBUG_MODE,
        port=settings.PORT,
    )
