import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { getMe, updateProfile as apiUpdateProfile, changePassword as apiChangePassword, updateAvatar  } from "@/api/auth.api";
import FilterTabs from "@/components/ui/FilterTabs";
interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
   avatar?: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<"overview" | "edit" | "password">("overview");
  const [user, setUser] = useState<UserType | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(""); // For profile updates
const [passwordMsg, setPasswordMsg] = useState(""); // For password updates
const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

// file select handler
const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];
  setEditAvatarFile(file);
  setEditAvatarPreview(URL.createObjectURL(file)); // preview turant
};

// save function me
const saveProfileWithAvatar = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    setSavingProfile(true);

    let newAvatar: string | undefined = user?.avatar;

    if (editAvatarFile) {
      try {
        const res = await updateAvatar(editAvatarFile, token);
        // Use the avatar URL as returned (already processed in API to handle Cloudinary URLs)
        newAvatar = res.avatar;
        setEditAvatarPreview(null); // reset preview
      } catch (avatarErr: any) {
        console.error("Avatar upload error:", avatarErr);
        const errorMessage = avatarErr?.response?.data?.message || avatarErr?.message || "Failed to upload avatar";
        setProfileMsg(`Avatar upload failed: ${errorMessage}`);
        setTimeout(() => setProfileMsg(""), 5000);
        setSavingProfile(false);
        return; // Stop execution if avatar upload fails
      }
    }


    await apiUpdateProfile({ name: editName, email: editEmail }, token);

    setUser(prev => prev && ({
      ...prev,
      name: editName,
      email: editEmail,
      avatar: newAvatar, // TypeScript safe
    }));

    setProfileMsg("Profile updated successfully");
    setTimeout(() => setProfileMsg(""), 3000);
  } catch (err) {
    console.log(err);
    setProfileMsg("Failed to update profile");
    setTimeout(() => setProfileMsg(""), 3000);
  } finally {
    setSavingProfile(false);
  }
};


useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const data = await getMe(token);
      console.log("Settings Page - User data:", data.user);
      console.log("Settings Page - Avatar from API:", data.user.avatar);
      
      // Handle avatar URL - if it's already a full URL (Cloudinary), use as-is, otherwise prepend API URL
      // Use same logic as axios.ts to get correct API URL for production
      const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((url: string) => url.trim()).filter(Boolean);
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const API_BASE_URL = isLocalhost ? urls[0] : (urls[1] || urls[0] || import.meta.env.VITE_API_URL || "");
      const apiBaseWithoutApi = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
      
      console.log("Settings Page - API Base URL:", API_BASE_URL);
      console.log("Settings Page - API Base without /api:", apiBaseWithoutApi);
      
      // Handle avatar URL - fix localhost URLs in production
      let avatarUrl = data.user.avatar;
      if (avatarUrl) {
        // If it's a localhost URL (from development), replace with production API URL
        if (avatarUrl.includes('localhost') || avatarUrl.includes('127.0.0.1')) {
          // Extract the path from localhost URL
          const urlPath = avatarUrl.replace(/^https?:\/\/[^\/]+/, '');
          avatarUrl = `${apiBaseWithoutApi}${urlPath.startsWith('/') ? urlPath : '/' + urlPath}`;
        } else if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
          // Already a full URL (Cloudinary or production) - use directly
          avatarUrl = avatarUrl;
        } else {
          // Relative path - construct full URL
          avatarUrl = `${apiBaseWithoutApi}${avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl}`;
        }
      }
      
      console.log("Settings Page - Final avatar URL:", avatarUrl);
      console.log("Settings Page - Avatar URL type check:", {
        original: data.user.avatar,
        isCloudinary: data.user.avatar?.includes('cloudinary'),
        final: avatarUrl
      });
      
      setUser({
        ...data.user,
        avatar: avatarUrl
      });
      setEditName(data.user.name);
      setEditEmail(data.user.email);
    } catch (err) {
      console.log(err);
    }
  };

  loadUser();
}, []);


const updateProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    setSavingProfile(true);
    await apiUpdateProfile({ name: editName, email: editEmail }, token);
    setUser((prev) => prev && { ...prev, name: editName, email: editEmail });
    setProfileMsg("Profile updated successfully");
    setTimeout(() => setProfileMsg(""), 3000); // hide after 3 seconds
  } catch (err) {
    console.log(err);
    setProfileMsg("Failed to update profile");
    setTimeout(() => setProfileMsg(""), 3000);
  } finally {
    setSavingProfile(false);
  }
};

const changePassword = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    setChangingPassword(true);
    await apiChangePassword({ oldPassword: oldPass, newPassword: newPass }, token);
    setOldPass("");
    setNewPass("");
    setPasswordMsg("Password updated successfully");
    setTimeout(() => setPasswordMsg(""), 3000);
  } catch (err) {
    console.log(err);
    setPasswordMsg("Failed to update password");
    setTimeout(() => setPasswordMsg(""), 3000);
  } finally {
    setChangingPassword(false);
  }
};




  return (
    <div className="w-full text-black">
      <h1 className="text-2xl font-semibold theme-heading mb-6">Settings</h1>

      {/* PROFILE BOX */}
    
<div className="flex items-center gap-4 mb-6">
   <img
    src={user?.avatar || "/avatar.png"} // fetched avatar ya default
    className="w-20 h-20 rounded-full object-cover border-2"
    style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}
    alt="avatar"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      if (target.src !== "/avatar.png" && !target.src.includes("avatar.png")) {
        target.src = "/avatar.png";
      }
    }}
  />
  <div>
    <h2 className="text-xl font-semibold">{user?.name}</h2>
    <p className="text-gray-500">{user?.role}</p>
  </div>
</div>


      {/* TABS */}
      <div className="mb-4">
        <FilterTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "edit", label: "Edit" },
            { id: "password", label: "Password" },
          ]}
          activeTab={tab}
          onTabChange={(tabId) => setTab(tabId as any)}
        />
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Profile Details</h3>
          <p><strong>Full Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      )}

      {/* EDIT PROFILE */}

{tab === "edit" && (
  <div className="p-6 bg-gray-50 text-black rounded-lg space-y-4">

    {/* Avatar preview + change */}
    <div className="flex items-center gap-4 mb-4">
     <img
  src={editAvatarPreview || user?.avatar || "/avatar.png"}
  alt="avatar"
  className="w-20 h-20 rounded-full object-cover border-2 cursor-pointer"
  style={{ borderColor: "var(--theme-primary, #8B5E3C)" }}
  onClick={() => document.getElementById("avatarInputEdit")?.click()}
/>

<input
  type="file"
  accept="image/*"
  id="avatarInputEdit"
  className="hidden"
  onChange={handleEditAvatarChange}
/>

    </div>

    <div>
      <label className="font-medium">Full Name</label>
      <Input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
      />
    </div>

    <div>
      <label className="font-medium">Email</label>
      <Input
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
      />
    </div>

    <Button onClick={saveProfileWithAvatar} className="theme-button text-white">
  {savingProfile ? "Saving..." : "Save Changes"}
</Button>

    {profileMsg && <p className="text-green-600 mt-2">{profileMsg}</p>}
  </div>
)}

      {/* PASSWORD */}
      {tab === "password" && (
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="font-medium">Old Password</label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <label className="font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <Button onClick={changePassword} className="theme-button text-white">
  {changingPassword ? "Updating..." : "Update Password"}
</Button>
{passwordMsg && <p className="text-green-600 mt-2">{passwordMsg}</p>}

        </div>
      )}


    </div>
  );
}
