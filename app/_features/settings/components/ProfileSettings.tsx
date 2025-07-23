"use client";

import { useState, useEffect, useRef } from "react";
import {
  getUserWithProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from "@/app/_api/actions/auth/actions";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

export default function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserWithProfile();
        if (userData) {
          setUser(userData);
          setProfileImage(userData.avatar_url || null);

          setProfile({
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            email: userData.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        showErrorToast("Image size must be less than 2MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        showErrorToast("Please upload a valid image file (PNG, JPG, or WEBP)");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      let newAvatarUrl = profileImage;

      // Upload new image if provided
      if (imageFile) {
        newAvatarUrl = await uploadProfileImage(imageFile);
      }

      // Update profile
      const result = await updateUserProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        avatar_url: newAvatarUrl || undefined,
      });

      if (result.success) {
        showSuccessToast("Profile updated successfully");
        setProfileImage(newAvatarUrl);
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showErrorToast(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getCurrentImage = () => {
    if (imagePreview) return imagePreview;
    if (profileImage) return profileImage;
    return "/auth/photo-1522075469751-3a6694fb2f61 (1).avif"; // Default fallback
  };

  if (loading) {
    return (
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-strong">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-weak">
            Use a permanent address where you can receive mail.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-strong">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-weak">
            Use a permanent address where you can receive mail.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-weak">Unable to load user information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10  py-16  md:grid-cols-3">
      <div>
        <h2 className="text-base/7 font-semibold text-strong">
          Personal Information
        </h2>
        <p className="mt-1 text-sm/6 text-weak">
          Use a permanent address where you can receive mail.
        </p>
      </div>

      <form className="md:col-span-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div className="col-span-full flex items-center gap-x-8">
            <div className="relative">
              <img
                alt="Profile"
                src={getCurrentImage()}
                className="size-24 flex-none rounded-lg bg-neutral object-cover"
              />
              {(imageFile || profileImage) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="rounded-md bg-brand/10 px-3 py-2 text-sm font-semibold text-brand shadow-xs hover:bg-brand/20 cursor-pointer inline-block"
              >
                Change avatar
              </label>
              <p className="mt-2 text-xs/5 text-weak">
                JPG, PNG or WEBP. 2MB max.
              </p>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="first-name"
              className="block text-sm/6 font-medium text-strong"
            >
              First name
            </label>
            <div className="mt-2">
              <input
                id="first-name"
                name="first-name"
                type="text"
                autoComplete="given-name"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="last-name"
              className="block text-sm/6 font-medium text-strong"
            >
              Last name
            </label>
            <div className="mt-2">
              <input
                id="last-name"
                name="last-name"
                type="text"
                autoComplete="family-name"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-strong"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
