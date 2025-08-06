import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

export interface ICategory extends mongoose.Document {
    name: string;
    description: string;
    image: string;
    isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String, // We will store image URL here
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Category: mongoose.Model<ICategory> =
    models.Category || model<ICategory>('Category', categorySchema);

export default Category;