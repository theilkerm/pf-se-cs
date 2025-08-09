import { IReview } from "@/types";

interface ReviewListProps {
    reviews: IReview[];
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
            <svg key={index} className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.951a1 1 0 00.95.69h4.158c.969 0 1.371 1.24.588 1.81l-3.363 2.44a1 1 0 00-.364 1.118l1.287 3.951c.3.921-.755 1.688-1.54 1.118l-3.363-2.44a1 1 0 00-1.175 0l-3.363 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.951a1 1 0 00-.364-1.118L2.077 9.378c-.783-.57-.38-1.81.588-1.81h4.158a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
        ))}
    </div>
);

export default function ReviewList({ reviews }: ReviewListProps) {
    if (!reviews || reviews.length === 0) {
        return <p className="text-gray-500 mt-4">There are no reviews for this product yet.</p>;
    }

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
            <div className="space-y-6">
                {reviews.map(review => (
                    <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                            <StarRating rating={review.rating} />
                            <p className="ml-4 font-bold">{review.user.firstName} {review.user.lastName}</p>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}