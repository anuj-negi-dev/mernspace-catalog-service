import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const priceConfigurationSchema = new mongoose.Schema({
    priceType: {
        type: String,
        enum: ["base", "additional"],
    },
    availableOptions: {
        type: Map,
        of: Number,
    },
});

const attributeValueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
        },
        attributes: {
            type: [attributeValueSchema],
            required: true,
        },
        tenantId: {
            type: String,
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
        },
        isPublish: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

productSchema.plugin(aggregatePaginate);

export default mongoose.model("product", productSchema);
