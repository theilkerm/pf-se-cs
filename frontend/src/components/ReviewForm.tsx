'use client';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ApiError } from "@/types";

interface ReviewFormProps {
    productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const { token } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return alert("Please log in to submit a review.");
        if (rating === 0) return setError("Please select a rating.");

        try {
            await fetcher('/api/v1/reviews', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId, rating, comment })
            });
            alert("Review submitted! It will be visible after approval.");
            router.refresh(); // Refresh the page to show updated data
        } catch (err: unknown) {
            const error = err as ApiError;
            setError(error.message || 'An error occurred while submitting the review.');
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Your Rating</label>
                    {/* Star rating input can be added here for better UX */}
                    <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="border rounded p-2" />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Your Comment</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full border rounded p-2"></textarea>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Submit Review</button>
            </form>
        </div>
    );
}