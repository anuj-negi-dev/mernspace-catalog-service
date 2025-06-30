import ToppingModel from "./topping-model";
import { CreateTopping, Topping } from "./topping-types";

export class ToppingService {
    async createTopping(topping: CreateTopping) {
        return (await ToppingModel.create(topping)) as Topping;
    }
}
