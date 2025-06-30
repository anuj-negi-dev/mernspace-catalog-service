import express from "express";
import { ProductController } from "./product-controller";
import authenticate from "../common/middlewares/authenticate";
import { Roles } from "../common/constants";
import { asyncWrapper } from "../common/utils/wrapper";
import { canAccess } from "../common/middlewares/canAccess";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./product-service";
import logger from "../config/logger";
import fileUpload from "express-fileupload";
import { CloudinaryStorage } from "../common/services/cloudinaryStorage";
import createHttpError from "http-errors";
import updateProductValidator from "./update-product-validator";

const router = express.Router();

const productService = new ProductService();
const cloudinaryStorage = new CloudinaryStorage();

const productController = new ProductController(
    productService,
    logger,
    cloudinaryStorage,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 2 * 1024 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "file size exceeds limit");
            next(error);
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
);

router.patch(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 2 * 1024 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "file size exceeds limit");
            next(error);
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);

router.get("/", asyncWrapper(productController.getAll));

router.get("/:productId", asyncWrapper(productController.getOne));

router.delete(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.CUSTOMER]),
    asyncWrapper(productController.delete),
);

export default router;
