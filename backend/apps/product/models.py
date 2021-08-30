from typing import Optional
import uuid
from pydantic import BaseModel, Field
from pydantic.types import StrictBool



class ProductModel(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    # name: str = Field(...)
    # category: str = Field(...)
    # price: float = Field(...)
    # vendor: str = Field(...)
    # store: str = Field(...)
    # file: str = Field(...)
    name: Optional[str]
    category: Optional[str]
    price: Optional[float]
    vendor: Optional[str]
    store: Optional[str]
    file: Optional[str]

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "id": "00010203-0405-0607-0809-0a0b0c0d0e0f",
                "name": "My important task",
                "category": "wine",
                "price": 123,
                "vendor": "sta",
                "store": "department1"
            }
        }


class UpdateProductModel(BaseModel):
    name: Optional[str]
    category: Optional[str]
    price: Optional[float]
    vendor: Optional[str]
    store: Optional[str]
    file: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "name": "My important task",
                "category": "wine",
                "price": 123,
                "vendor": "sta",
                "store": "department1"
            }
        }


class SearchModel(BaseModel):
    name: Optional[str]
    category: Optional[str]
    vendor: Optional[str]
    store: Optional[str]

    class config:
        schema_extra = {
            "example": {
                "name": "RolleyGolf",
                "category": "Golf Course",
                "vendor": "virgin",
                "store": "department1"
            }
        }
