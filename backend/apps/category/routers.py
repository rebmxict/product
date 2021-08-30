from fastapi import APIRouter, Body, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from .models import CategoryModel, UpdateCategoryModel

router = APIRouter()


@router.post("/", response_description="Add new Category")
async def create_category(request: Request, category: CategoryModel = Body(...)):
    category = jsonable_encoder(category)
    new_category = await request.app.mongodb["category"].insert_one(category)
    created_category = await request.app.mongodb["category"].find_one(
        {"_id": new_category.inserted_id}
    )

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_category)


@router.get("/", response_description="List all Category")
async def list_category(request: Request):
    categories = []
    for doc in await request.app.mongodb["category"].find().to_list(length=100):
        categories.append(doc)
    return categories


@router.get("/{id}", response_description="Get a single Category")
async def show_category(id: str, request: Request):
    if (category := await request.app.mongodb["category"].find_one({"_id": id})) is not None:
        return category

    raise HTTPException(status_code=404, detail=f"category {id} not found")


@router.put("/{id}", response_description="Update a Category")
async def update_category(id: str, request: Request, category: UpdateCategoryModel = Body(...)):
    category = {k: v for k, v in category.dict().items() if v is not None}

    if len(category) >= 1:
        update_result = await request.app.mongodb["category"].update_one(
            {"_id": id}, {"$set": category}
        )

        if update_result.modified_count == 1:
            if (
                updated_category := await request.app.mongodb["category"].find_one({"_id": id})
            ) is not None:
                return updated_category

    if (
        existing_category := await request.app.mongodb["category"].find_one({"_id": id})
    ) is not None:
        return existing_category

    raise HTTPException(status_code=404, detail=f"category {id} not found")


@router.delete("/{id}", response_description="Delete Category")
async def delete_category(id: str, request: Request):
    delete_result = await request.app.mongodb["category"].delete_one({"_id": id})

    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"category {id} not found")
