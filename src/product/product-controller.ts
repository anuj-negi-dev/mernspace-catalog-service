/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request } from "express-jwt";
import { ProductService } from "./product-service";
import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Product, ProductRequest } from "./product-types";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
// import { UploadedFile } from "express-fileupload";
// import { v4 as uuidv4 } from "uuid";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
    ) {
        this.create = this.create.bind(this);
    }
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        // const image = req.files!.image as UploadedFile;
        // const publicId = await this.storage.upload({
        //     folderName: "products",
        //     path: image.tempFilePath,
        //     publicId: "randomstring",
        // });

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as ProductRequest;

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(
                priceConfiguration as unknown as string,
            ),
            attributes: JSON.parse(attributes as unknown as string),
            tenantId,
            categoryId,
            isPublish,
            image: "image.png",
        };

        const newProduct = await this.productService.create(
            product as unknown as Product,
        );

        this.logger.info("New Product is created", {
            id: newProduct._id,
        });

        res.json({
            id: newProduct._id,
        });
    }
}
