"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, token, loading: authLoading, logout, updateUser } = useAuth(); // updateUser'ı context'ten al
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, authLoading, router]);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    try {
      const response = await fetcher("/users/update-me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileData),
      });
      updateUser(response.data.user); // YENİ: Context'teki kullanıcıyı güncelle
      setProfileMessage("Profile updated successfully!");
    } catch (error: any) {
      setProfileMessage(`Error: ${error.message}`);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    if (passwordData.password !== passwordData.passwordConfirm) {
      return setPasswordMessage("New passwords do not match.");
    }
    try {
      await fetcher("/users/update-my-password", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwordData),
      });
      setPasswordMessage(
        "Password updated successfully! You will be logged out shortly."
      );
      setTimeout(() => logout(), 3000); // Log out after 3 seconds
    } catch (error: any) {
      setPasswordMessage(`Error: ${error.message}`);
    }
  };

  if (authLoading || !user) {
    return <div className="text-center p-10">Loading account details...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Form */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
          {profileMessage && (
            <div
              className={`p-3 mb-4 text-sm rounded-lg ${
                profileMessage.startsWith("Error")
                  ? "text-red-700 bg-red-100"
                  : "text-green-700 bg-green-100"
              }`}
            >
              {profileMessage}
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
          {passwordMessage && (
            <div
              className={`p-3 mb-4 text-sm rounded-lg ${
                passwordMessage.startsWith("Error")
                  ? "text-red-700 bg-red-100"
                  : "text-green-700 bg-green-100"
              }`}
            >
              {passwordMessage}
            </div>
          )}
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                name="passwordConfirm"
                id="passwordConfirm"
                value={passwordData.passwordConfirm}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
