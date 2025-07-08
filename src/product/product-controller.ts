/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request } from "express-jwt";
import { ProductService } from "./product-service";
import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Filter, Product, ProductRequest } from "./product-types";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { AuthRequest } from "../common/types";
import mongoose from "mongoose";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { isAllowed } from "../common/utils/isAllowed";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
    ) {
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();

        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });

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
            image: imageName,
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

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { productId } = req.params;

        const product = await this.productService.getProduct(productId);

        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        const tenant = (req as AuthRequest).auth.tenant;

        if ((req as AuthRequest).auth.role !== "admin") {
            if (isAllowed(tenant, product.tenantId)) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }
        let imageName: string | undefined;
        if (req.files?.image) {
            const oldImage = product.image as unknown as string;

            const image = req.files.image as UploadedFile;

            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await this.storage.delete(oldImage);
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;

        const productToBeUpdate = {
            name,
            description,
            priceConfiguration: JSON.parse(
                priceConfiguration as unknown as string,
            ),
            attributes: JSON.parse(attributes as unknown as string),
            tenantId,
            categoryId,
            isPublish,
            image: imageName ? imageName : product.image,
        };

        const updatedProduct = await this.productService.updateProduct(
            productId,
            productToBeUpdate,
        );

        this.logger.info("Product has been updated", {
            id: updatedProduct?._id,
        });

        res.json({
            id: updatedProduct?._id,
        });
    }

    async getAll(req: Request, res: Response) {
        const { q, tenantId, categoryId, isPublish } = req.query;

        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) {
            filters.tenantId = tenantId as string;
        }

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const products = await this.productService.getProducts(
            q as string,
            filters,
            {
                page: req.query.currentPage
                    ? parseInt(req.query.currentPage as string)
                    : 1,
                limit: req.query.perPage
                    ? parseInt(req.query.perPage as string)
                    : 10,
            },
        );

        const finalProducts: Product[] = (products.data as Product[]).map(
            (product: Product) => {
                return {
                    ...product,
                    image: this.storage.getObjectUri(product.image),
                };
            },
        );

        this.logger.info("All products fetched successfully");

        res.json({
            data: finalProducts,
            total: products.total,
            pageSize: products.perPage,
            currentPage: products.currentPage,
        });
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        const finalProduct: Product = {
            ...product,
            image: this.storage.getObjectUri(product.image),
        };
        if (!product) {
            const error = createHttpError(404, "Product not found!");
            return next(error);
        }
        res.json(finalProduct);
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        const tenant = (req as AuthRequest).auth.tenant;
        if ((req as AuthRequest).auth.role !== "admin") {
            if (tenant !== product.tenantId) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }
        await this.storage.delete(product.image);
        const deletedProduct =
            await this.productService.deleteProduct(productId);
        if (!deletedProduct) {
            const error = createHttpError(404, "Product not found!");
            return next(error);
        }
        this.logger.info("Product has been deleted successfully", {
            id: deletedProduct._id,
        });
        res.json({
            id: deletedProduct._id,
        });
    }
}
