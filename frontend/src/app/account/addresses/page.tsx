'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Adres şeması
const AddressSchema = z.object({
  street: z.string().min(3, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip Code is required'),
  country: z.string().min(2, 'Country is required'),
});

type AddressForm = z.infer<typeof AddressSchema>;

interface Address extends AddressForm {
    _id: string;
}

export default function AddressBookPage() {
    const { user, token, loading: authLoading, updateUser } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [message, setMessage] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
        resolver: zodResolver(AddressSchema)
    });

    useEffect(() => {
        if (user?.addresses) {
            setAddresses(user.addresses);
        }
        setIsLoading(false);
    }, [user]);

    const handleAddNew = () => {
        setEditingAddress(null);
        reset({ street: '', city: '', state: '', zipCode: '', country: '' });
        setIsFormVisible(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        reset(address);
        setIsFormVisible(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!token || !confirm('Are you sure you want to delete this address?')) return;
        try {
            const updatedUser = await fetcher(`/users/me/addresses/${addressId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            updateUser(updatedUser.data.user);
            setMessage('Address deleted successfully!');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setMessage(`Error: ${errorMessage}`);
        }
    };

    const onSubmit = async (data: AddressForm) => {
        if (!token) return;
        setMessage('');
        const endpoint = editingAddress
            ? `/users/me/addresses/${editingAddress._id}`
            : '/users/me/addresses';
        const method = editingAddress ? 'PATCH' : 'POST';

        try {
            const result = await fetcher(endpoint, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            updateUser(result.data.user);
            setMessage(`Address ${editingAddress ? 'updated' : 'added'} successfully!`);
            setIsFormVisible(false);
            setEditingAddress(null);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setMessage(`Error: ${errorMessage}`);
        }
    };

    if (isLoading || authLoading) {
        return <div className="text-center p-10">Loading addresses...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Address Book</h1>
            {message && <div className="p-3 mb-4 text-sm rounded-lg bg-green-100 text-green-700">{message}</div>}

            {!isFormVisible && (
                <button
                    onClick={handleAddNew}
                    className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Add New Address
                </button>
            )}

            {isFormVisible ? (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 shadow-md rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                            <input {...register('street')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input {...register('city')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input {...register('state')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input {...register('zipCode')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input {...register('country')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">Save Address</button>
                        <button type="button" onClick={() => setIsFormVisible(false)} className="bg-gray-200 py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div key={address._id} className="bg-white p-6 shadow-md rounded-lg">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => handleEdit(address)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                <button onClick={() => handleDelete(address._id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && <p>You have no saved addresses.</p>}
                </div>
            )}
        </div>
    );
}