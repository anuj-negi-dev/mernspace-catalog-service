import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newcategory = new CategoryModel(category);
        return await newcategory.save();
    }

    async getAll() {
        return await CategoryModel.find();
    }
}
