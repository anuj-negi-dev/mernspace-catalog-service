import mongoose from "mongoose";

export interface Topping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    image: string;
    tenantId: string;
    isPublish?: boolean;
}

export interface CreateTopping {
    name: string;
    price: number;
    tenantId: string;
    isPublish?: boolean;
}

export interface CreateRequestBody {
    name: string;
    price: number;
    tenantId: string;
    isPublish?: boolean;
}
