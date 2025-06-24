import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .trim()
        .isEmpty()
        .withMessage("Product name should be a valid string"),

    body("description")
        .exists()
        .withMessage("Description is required")
        .isString()
        .trim()
        .isEmpty()
        .withMessage("Description should be a valid string"),

    body("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required"),

    body("attribute").exists().withMessage("Price configuration is required"),

    body("tenantId")
        .exists()
        .withMessage("Tenant id is required")
        .isString()
        .trim()
        .isEmpty()
        .withMessage("Tenant id should be a valid string"),

    body("categoryId")
        .exists()
        .withMessage("Category ID is required")
        .isMongoId()
        .withMessage("Invalid category ID format"),

    body("image").custom((value, { req }) => {
        if (!req.files) throw new Error("Product image is required");
        return true;
    }),
];
