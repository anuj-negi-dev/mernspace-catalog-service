import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello from catalog service!",
    });
});

app.use(express.json());

app.use("/categories", categoryRouter);

app.use(globalErrorHandler);

export default app;
