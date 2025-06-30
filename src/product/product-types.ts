import { Request } from "express";
import mongoose from "mongoose";

export interface attributes {
    name: string;
    value: number | string;
}

export interface PriceConfiguration {
    priceType: {
        type: string;
        enum: ["base", "additional"];
    };
    availableOptions: {
        type: Map<string, number>;
    };
}

export interface Product {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description: string;
    priceConfiguration: PriceConfiguration;
    attributes: [attributes];
    tenantId: string;
    categoryId: string;
    image: string;
}

export interface ProductRequest extends Request {
    name: string;
    description: string;
    priceConfiguration: PriceConfiguration;
    attributes: [attributes];
    tenantId: string;
    categoryId: string;
    image: string;
    isPublish?: boolean;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}
