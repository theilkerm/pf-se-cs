import mongoose from 'mongoose';
import { IVariant } from './product.model.js';

const { model, models, Schema } = mongoose;

// This interface now correctly includes the optional variant property
export interface IOrderItem {
    name: string;
    quantity: number;
    price: number;
    image: string;
    product: mongoose.Types.ObjectId;
    variant?: IVariant;
}

export interface IOrder extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    orderItems: IOrderItem[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    totalPrice: number;
    orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paidAt?: Date;
    deliveredAt?: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                image: { type: String, required: true },
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                variant: {
                    type: { type: String },
                    value: { type: String },
                    stock: { type: Number }
                }
            },
        ],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        orderStatus: {
            type: String,
            required: true,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paidAt: { type: Date },
        deliveredAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

const Order: mongoose.Model<IOrder> =
    models.Order || model<IOrder>('Order', orderSchema);

export default Order;