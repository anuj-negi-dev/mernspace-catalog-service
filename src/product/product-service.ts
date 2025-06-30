import ProductModel from "./product-model";
import { Product } from "./product-types";
import { Filter } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return await ProductModel.create(product);
    }

    async getProductImage(productId: string) {
        const product = await ProductModel.findById(productId);
        return product?.image;
    }

    async updateProduct(productId: string, product: Product) {
        return await ProductModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            {
                new: true,
            },
        );
    }

    async getProduct(productId: string) {
        return await ProductModel.findById(productId);
    }

    async getProducts(q: string, filters: Filter) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = ProductModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        const result = await aggregate.exec();

        return result as Product[];
    }
}
