import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

export interface IProduct extends mongoose.Document {
    name: string;
    description: string;
    price: number;
    category: mongoose.Types.ObjectId; // Reference to the Category model
    images: string[];
    variants: IVariant[];
    tags: string[];
    isFeatured: boolean;
    averageRating: number;
    numReviews: number;
}

export interface IVariant {
    type: string;
    value: string;
    stock: number; // Stock is now per-variant
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
        variants: [
            {
                type: { type: String, required: true },
                value: { type: String, required: true },
                stock: { type: Number, required: true, min: 0, default: 0 },
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

// Virtual populate for reviews on a product
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id'
});

// To include virtuals in res.json(), you need to set this
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product: mongoose.Model<IProduct> =
    models.Product || model<IProduct>('Product', productSchema);

export default Product;