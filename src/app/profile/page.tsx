"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { ArrowLeft, User, Mail, Camera } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { loading, isAuth, user: loggedInUser, logoutUser } = useAppData();
  const [user, setUser] = useState(loggedInUser);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  const handlePhotoUpdate = (photoUrl: string) => {
    if (user) {
      setUser({
        ...user,
        profilePhoto: {
          url: photoUrl,
          publicId: "", // This will be updated by the backend
        },
      });
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdating(true);
    const token = Cookies.get("token");

    try {
      const response = await axios.post(
        `${user_service}/api/v1/update/user`,
        { name: newName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      setIsEditingName(false);
      toast.success("Name updated successfully!");
    } catch (error: any) {
      console.error("Error updating name:", error);
      toast.error(error.response?.data?.message || "Failed to update name");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </Link>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {/* Profile Photo Section */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <ProfilePhotoUpload
                currentPhoto={user.profilePhoto?.url}
                onPhotoUpdate={handlePhotoUpdate}
                userId={user._id}
              />
              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Name</p>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                      disabled={isUpdating}
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating ? "..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user.name);
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{user.name}</p>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-white font-medium"
            >
              <Camera className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;