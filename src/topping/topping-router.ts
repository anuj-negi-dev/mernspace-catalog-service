import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import fileUpload from "express-fileupload";
import { Roles } from "../common/constants";
import createHttpError from "http-errors";
import createToppingValidator from "./create-topping-validator";
import { asyncWrapper } from "../common/utils/wrapper";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import updateToppingValidator from "./update-topping-validator";

const router = express.Router();

const toppingService = new ToppingService();

const toppingController = new ToppingController(toppingService);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "file size exceeds limit");
            next(error);
        },
    }),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

router.patch(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.CUSTOMER]),
    fileUpload({
        limits: {
            fieldSize: 2 * 1024 * 1024,
        },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "file size exceeds limit");
            next(error);
        },
    }),
    updateToppingValidator,
    asyncWrapper(toppingController.update),
);

export default router;
