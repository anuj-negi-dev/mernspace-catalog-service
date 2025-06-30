import { paginationLabels } from "../config/pagination";
import ProductModel from "./product-model";
import { PaginateQuery, Product } from "./product-types";
import { Filter } from "./product-types";

export class ProductService {
    async create(product: Product) {
        return (await ProductModel.create(product)) as Product;
    }

    async getProductImage(productId: string) {
        const product = (await ProductModel.findById(productId)) as Product;
        return product?.image;
    }

    async updateProduct(productId: string, product: Product) {
        return (await ProductModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            {
                new: true,
            },
        )) as Product;
    }

    async getProduct(productId: string) {
        return (await ProductModel.findById(productId)) as Product;
    }

    async getProducts(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
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

        return ProductModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }

    async deleteProduct(productId: string) {
        return (await ProductModel.findByIdAndDelete(productId)) as Product;
    }
}
