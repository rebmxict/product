from fastapi import APIRouter, Body, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import File, Form, UploadFile
from .models import ProductModel, UpdateProductModel, SearchModel
import shutil
from starlette.responses import FileResponse

router = APIRouter()


@router.get("/file/{filename}", response_description="file donwload")
async def download_file(
    request: Request,
    filename: str
):
    print(filename)
    return FileResponse(filename, media_type='application/octet-stream',filename=filename)

@router.post("/", response_description="Add new Product")
async def create_product(
    request: Request, 
    file: UploadFile=File(...), 
    name: str=Form(...),
    price: float=Form(...),
    vendor: str=Form(...),
    store: str=Form(...),
    category: str=Form(...)
    ):
    model = ProductModel()
    model.category = category
    model.vendor = vendor
    model.price = price
    model.name = name
    model.store = store
    filename = f'{model.id}{file.filename}'
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    model.file = filename
    product = jsonable_encoder(model)
    new_product = await request.app.mongodb["products"].insert_one(product)
    created_product = await request.app.mongodb["products"].find_one(
        {"_id": new_product.inserted_id}
    )

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_product)


@router.get("/", response_description="List all Product")
async def list_products(request: Request):
    products = []
    for doc in await request.app.mongodb["products"].find().to_list(length=100):
        products.append(doc)
    return products


@router.get("/{id}", response_description="Get a single Product")
async def show_product(id: str, request: Request):
    if (product := await request.app.mongodb["products"].find_one({"_id": id})) is not None:
        return product

    raise HTTPException(status_code=404, detail=f"product {id} not found")


# @router.put("/{id}", response_description="Update a Product")
# async def update_product(id: str, request: Request, product: UpdateProductModel = Body(...)):
#     product = {k: v for k, v in product.dict().items() if v is not None}

#     if len(product) >= 1:
#         update_result = await request.app.mongodb["products"].update_one(
#             {"_id": id}, {"$set": product}
#         )

#         if update_result.modified_count == 1:
#             if (
#                 updated_product := await request.app.mongodb["products"].find_one({"_id": id})
#             ) is not None:
#                 return updated_product

#     if (
#         existing_product := await request.app.mongodb["products"].find_one({"_id": id})
#     ) is not None:
#         return existing_product

#     raise HTTPException(status_code=404, detail=f"product {id} not found")

@router.put("/{id}", response_description="Update a Product")
async def update_product(id: str, request: Request, 
    file: UploadFile=File(...), 
    name: str=Form(...),
    price: float=Form(...),
    vendor: str=Form(...),
    store: str=Form(...),
    category: str=Form(...)
    ):
    product = UpdateProductModel()
    product.name = name
    product.price = price
    product.vendor = vendor
    product.store = store
    product.category = category

    if file != None and file != '':
        filename = f'{id}{file.filename}'
        with open(filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        product.file = filename

    product = {k: v for k, v in product.dict().items() if v is not None}

    if len(product) >= 1:
        update_result = await request.app.mongodb["products"].update_one(
            {"_id": id}, {"$set": product}
        )

        if update_result.modified_count == 1:
            if (
                updated_product := await request.app.mongodb["products"].find_one({"_id": id})
            ) is not None:
                return updated_product

    if (
        existing_product := await request.app.mongodb["products"].find_one({"_id": id})
    ) is not None:
        return existing_product

    raise HTTPException(status_code=404, detail=f"product {id} not found")


@router.delete("/{id}", response_description="Delete Product")
async def delete_product(id: str, request: Request):
    delete_result = await request.app.mongodb["products"].delete_one({"_id": id})

    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"product {id} not found")

@router.post("/search", response_description="search result for products")
async def get_search_result(request: Request, model: SearchModel = Body(...)):
    keys = {k: v for k, v in model.dict().items() if (v is not None and v != '')}

    if len(keys) >= 1:
        search_result = await request.app.mongodb["products"].find(keys).to_list(100)
    else:
        search_result = await request.app.mongodb["products"].find().to_list(100)
    
    return search_result
