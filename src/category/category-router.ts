import express, { Request, Response } from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";

const router = express.Router();

const categoryController = new CategoryController();

router.post("/", categoryValidator, (req: Request, res: Response) =>
    categoryController.create(req, res),
);

export default router;
