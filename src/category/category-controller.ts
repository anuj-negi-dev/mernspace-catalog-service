/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });
        this.logger.info(`New category created`, {
            id: category._id,
        });
        res.json({
            id: category._id,
        });
    }

    async getAll(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();
        this.logger.info("All Categories list fetched");
        res.json(categories);
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;
        const category = await this.categoryService.getOne(categoryId);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info(`Getting category`, { id: category._id });
        return res.json(category);
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;
        const deletedCategory = await this.categoryService.delete(categoryId);
        if (!deletedCategory) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info("Category deleted successfully", {
            id: deletedCategory._id,
        });
        return res.json({});
    }
}
