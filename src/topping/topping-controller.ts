/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AuthRequest } from "../common/types";
import { isAllowed } from "../common/utils/isAllowed";
import { ToppingService } from "./topping-service";
import { CreateRequestBody, Topping } from "./topping-types";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private logger: Logger,
        private storage: FileStorage,
    ) {}

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
        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });
        const topping = await this.toppingService.createTopping({
            name,
            price,
            tenantId,
            isPublish,
            image: imageName,
        });
        this.logger.info("Topping has been created successfully", {
            id: topping._id,
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

        let imageName: string | undefined;

        if (req.files?.image) {
            const oldImage = topping.image;

            const image = req.files.image as UploadedFile;

            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
        }

        const updateTopping = await this.toppingService.updateTopping(
            toppingId,
            {
                name,
                price,
                tenantId,
                isPublish,
                image: imageName ? imageName : topping.image,
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

        await this.storage.delete(topping.image);

        await this.toppingService.deleteTopping(toppingId);
        res.json({});
    };

    getAll = async (req: Request, res: Response) => {
        const toppings = await this.toppingService.getToppings({
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        });
        const finalToppings: Topping[] = (toppings.data as Topping[]).map(
            (topping: Topping) => {
                return {
                    ...topping,
                    image: this.storage.getObjectUri(topping.image),
                };
            },
        );
        res.json({
            data: finalToppings,
            total: toppings.total,
            currentPage: toppings.currentPage,
            perPage: toppings.perPage,
        });
    };
}
