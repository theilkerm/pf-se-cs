import mongoose from 'mongoose';
import Product from './product.model.js'; // We need to import Product to update it
const { model, models, Schema } = mongoose;

export interface IReview extends mongoose.Document {
    rating: number;
    comment: string;
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    isApproved: boolean;
}

const reviewSchema = new Schema<IReview>({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating'],
    },
    comment: {
        type: String,
        required: [true, 'Please provide a comment'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false, // Reviews need admin approval
    },
}, { timestamps: true });


// Static method to calculate average rating on a product
reviewSchema.statics.calculateAverageRating = async function(productId: mongoose.Types.ObjectId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId, isApproved: true } // Only approved reviews
        },
        {
            $group: {
                _id: '$product',
                numReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);
    
    // Update the product with the calculated stats
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            numReviews: stats[0].numReviews,
            averageRating: stats[0].averageRating.toFixed(1) // Round to one decimal place
        });
    } else {
        // If no reviews, reset to default
        await Product.findByIdAndUpdate(productId, {
            numReviews: 0,
            averageRating: 0
        });
    }
};

// Call the calculator after a review is saved or removed
reviewSchema.post('save', function() {
    // 'this.constructor' refers to the model (Review)
    (this.constructor as any).calculateAverageRating(this.product);
});

reviewSchema.post('remove' as any, function() {
    (this.constructor as any).calculateAverageRating(this.product);
});


const Review: mongoose.Model<IReview> =
    models.Review || model<IReview>('Review', reviewSchema);

export default Review;