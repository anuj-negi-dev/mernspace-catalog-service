import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import cookieParser from "cookie-parser";
import productRouter from "./product/product-router";
import cors from "cors";
import config from "config";
import toppingRouter from "./topping/topping-router";

const app = express();

const ALLOWED_DOMAINS = [
    config.get("frontend.adminUI"),
    config.get("frontend.clientUI"),
];

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        credentials: true,
    }),
);

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello from catalog service!",
    });
});

app.use(globalErrorHandler);

export default app;
