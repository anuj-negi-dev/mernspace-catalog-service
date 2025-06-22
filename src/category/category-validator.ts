import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Catergory name is required!")
        .isString()
        .withMessage("Category name should be a string"),
    body("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required!"),
    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price type is required!")
        .custom((value: string) => {
            const validKeys = ["base", "additional"];
            if (!validKeys.includes(value)) {
                throw new Error(
                    `${value} is inavalid attribute for priceType field. Possible value are: [${validKeys.join(
                        ",",
                    )}]`,
                );
            }
        }),
    body("attributes").exists().withMessage("Attributes is required!"),
];
