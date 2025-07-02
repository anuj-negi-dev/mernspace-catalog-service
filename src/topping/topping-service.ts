import ToppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
    async createTopping(topping: Topping) {
        return (await ToppingModel.create(topping)) as Topping;
    }

    async getTopping(toppingId: string) {
        return (await ToppingModel.findById(toppingId)) as Topping;
    }

    async updateTopping(toppingId: string, topping: Topping) {
        return (await ToppingModel.findByIdAndUpdate(
            toppingId,
            {
                $set: topping,
            },
            {
                new: true,
            },
        )) as Topping;
    }

    async deleteTopping(toppingId: string) {
        await ToppingModel.findByIdAndDelete(toppingId);
    }

    async getToppings() {
        return await ToppingModel.find();
    }
}
