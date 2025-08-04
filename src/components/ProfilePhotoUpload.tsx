import React, { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { user_service } from "@/context/AppContext";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoUpdate: (photoUrl: string) => void;
  userId?: string;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoUpdate,
  userId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    const token = Cookies.get("token");

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const response = await axios.post(
        `${user_service}/api/v1/update/profile-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.user.profilePhoto?.url) {
        onPhotoUpdate(response.data.user.profilePhoto.url);
        toast.success("Profile photo updated successfully!");
      }
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.response?.data?.message || "Failed to upload photo");
      setPreview(currentPhoto || null); // Reset preview on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Upload overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Upload className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Remove button */}
        {preview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePhoto();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Remove photo"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
        aria-label="Upload profile photo"
        title="Upload profile photo"
      />
    </div>
  );
};

export default ProfilePhotoUpload;
