'use client';

import { useEffect, useState } from 'react';
import { fetcher } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState('Verifying your email...');
    const [error, setError] = useState('');
    const params = useParams();
    const { token } = params;

    useEffect(() => {
        if (!token) {
            setStatus('');
            setError('Verification token is missing.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetcher(`/auth/verify-email/${token}`, {
                    method: 'GET'
                });
                setStatus(response.message || 'Email verified successfully!');
                setError('');
            } catch (err: unknown) {
                setStatus('');
                const errorMessage = err instanceof Error ? err.message : 'Failed to verify email. The link may be invalid or expired.';
                setError(errorMessage);
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-screen text-center p-4">
            <div className="bg-white p-10 rounded-lg shadow-xl max-w-md w-full">
                <h1 className="text-3xl font-bold mb-4">Email Verification</h1>
                {status && !error && (
                    <p className="text-green-600 text-lg">{status}</p>
                )}
                {error && (
                    <p className="text-red-600 text-lg">{error}</p>
                )}
                <div className="mt-8">
                    <Link href="/login" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                        Proceed to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}