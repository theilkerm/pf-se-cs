import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

export interface IProduct extends mongoose.Document {
    name: string;
    description: string;
    price: number;
    category: mongoose.Types.ObjectId; // Reference to the Category model
    images: string[];
    stock: number;
    variants: {
        type: string; // e.g., 'Color' or 'Size'
        value: string; // e.g., 'Red' or 'XL'
    }[];
    tags: string[];
    isFeatured: boolean;
    averageRating: number;
    numReviews: number;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: 0,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category', // This creates the relationship
            required: [true, 'Product must belong to a category'],
        },
        images: [String],
        stock: {
            type: Number,
            required: [true, 'Product stock quantity is required'],
            default: 0,
        },
        variants: [
            {
                type: { type: String },
                value: { type: String },
            },
        ],
        tags: [String],
        isFeatured: {
            type: Boolean,
            default: false,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const Product: mongoose.Model<IProduct> =
    models.Product || model<IProduct>('Product', productSchema);

export default Product;