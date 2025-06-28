import { Request } from "express";

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
