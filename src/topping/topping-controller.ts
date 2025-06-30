import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AuthRequest } from "../common/types";
import { isAllowed } from "../common/utils/isAllowed";
import { ToppingService } from "./topping-service";
import { CreateRequestBody } from "./topping-types";

export class ToppingController {
    constructor(private toppingService: ToppingService) {}

    create = async (
        req: Request<object, object, CreateRequestBody>,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, price, tenantId, isPublish } = req.body;
        if ((req as AuthRequest).auth.role !== "admin")
            isAllowed((req as AuthRequest).auth.tenant, tenantId);
        //TODO: Image upload code here
        const topping = await this.toppingService.createTopping({
            name,
            price,
            tenantId,
            isPublish,
        });
        res.json({
            id: topping._id,
        });
    };
}
