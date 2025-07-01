/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
        if ((req as AuthRequest).auth.role !== "admin") {
            if (!isAllowed((req as AuthRequest).auth.tenant, tenantId)) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to change topping",
                    ),
                );
            }
        }
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

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, price, tenantId, isPublish } = req.body;

        const { toppingId } = req.params;

        const topping = await this.toppingService.getTopping(toppingId);

        if (!topping) {
            const error = createHttpError(404, "Topping not found!");
            next(error);
        }

        if ((req as AuthRequest).auth.role !== "admin") {
            if (
                !isAllowed(
                    (req as unknown as AuthRequest).auth.tenant,
                    tenantId as string,
                )
            ) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to change topping",
                    ),
                );
            }
        }

        //check if image is there or not and delete the old image and save new

        const updateTopping = await this.toppingService.updateTopping(
            toppingId,
            {
                name,
                price,
                tenantId,
                isPublish,
                image: "image.jpg",
            },
        );

        res.json({
            id: updateTopping._id,
        });
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId, tenantId } = req.params;

        const topping = await this.toppingService.getTopping(toppingId);

        if (!topping) {
            const error = createHttpError(404, "Topping not found!");
            next(error);
        }

        if ((req as AuthRequest).auth.role !== "admin") {
            if (
                !isAllowed(
                    (req as unknown as AuthRequest).auth.tenant,
                    tenantId,
                )
            ) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to change topping",
                    ),
                );
            }
        }
        //image deletion code here
        await this.toppingService.deleteTopping(toppingId);
        res.json({});
    };

    getAll = async (req: Request, res: Response) => {
        const toppings = await this.toppingService.getToppings();
        res.json(toppings);
    };
}
