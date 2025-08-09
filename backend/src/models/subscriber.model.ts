import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

export interface ISubscriber extends mongoose.Document {
    email: string;
}

const subscriberSchema = new Schema<ISubscriber>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
);

const Subscriber: mongoose.Model<ISubscriber> =
    models.Subscriber || model<ISubscriber>('Subscriber', subscriberSchema);

export default Subscriber;