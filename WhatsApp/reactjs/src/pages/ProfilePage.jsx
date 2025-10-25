import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Camera, Pencil, Check } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import SideNav from "../components/SideNav";
import Placeholder from "../components/Placeholder";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, updateUserInfo } =
    useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [about, setAbout] = useState(
    authUser?.about || "Hey there! I am using WhatsApp."
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  const handleSave = async () => {
    const unchanged =
      fullName === authUser.fullName && about === authUser.about;

    if (unchanged) {
      toast("No changes to update");
      return;
    }
    try {
      await updateUserInfo({ fullName, about }); // ✅ send both
      setIsEditingName(false);
      setIsEditingAbout(false); // ← if you have a separate flag for about edit
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePhoto: base64Image });
    };
  };

  return (
    <div className="flex">
      {/* First container */}
      <SideNav />
      {/* Profile section */}
      <div className="h-screen w-screen xl:w-[430px] border border-l-0 border-r-gray-100 border-y-0">
        {/* Profile heading */}
        <div>
          <h1 className="text-2xl pt-4 pl-5">Profile</h1>
        </div>
        {/* Profile form for laptop */}
        <form className="xl:flex hidden" action="">
          <div className="flex flex-col justify-center items-center mt-10 gap-14">
            {/* Profile photo */}
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePhoto || "/avatar.png"}
                className="w-[150px] h-[150px] rounded-full"
                alt=""
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="-mt-10 -mb-5 text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
            {/* Name field */}
            <div className="flex flex-col self-start px-9 w-full gap-4">
              <label className="text-gray-500" to="name">
                Your Name
              </label>
              <div className="relative w-full max-w-sm">
                {!isEditingName ? (
                  <>
                    <p>{authUser.fullName}</p>
                    <Pencil
                      className="w-4 h-4 text-gray-500 absolute right-2 top-0.5 cursor-pointer"
                      onClick={() => setIsEditingName(true)}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => {
                        if (fullName === authUser.fullName) {
                          setIsEditingName(false); // close if unchanged
                          handleSave();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave(); // save on Enter
                        }
                      }}
                      className="border border-r-0 border-l-0 border-t-0 border-b-green-500 focus:outline-none w-full "
                    />
                    {fullName !== authUser.fullName ? (
                      <Check
                        className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer"
                        onClick={handleSave}
                      />
                    ) : (
                      <Pencil className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer" />
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Paragraph field */}
            <div className="ml-9 -mt-6">
              <p className="text-base text-gray-500">
                This is not your username or PIN. This name will be visible to
                your WhatsApp contacts.
              </p>
            </div>
            {/* About field */}
            <div className="flex flex-col self-start px-9 w-full">
              <label className="text-gray-500" to="about">
                About
              </label>
              <div className="relative w-full max-w-sm mt-4">
                {!isEditingAbout ? (
                  <>
                    <p className="">{authUser.about}</p>
                    <Pencil
                      className="w-4 h-4 text-gray-500 absolute right-2 top-1 cursor-pointer"
                      onClick={() => setIsEditingAbout(true)}
                    />
                  </>
                ) : (
                  <>
                    <textarea
                      onBlur={() => {
                        if (about === authUser.about) {
                          setIsEditingAbout(false); // close if unchanged
                          handleSave();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave(); // save on Enter
                        }
                      }}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="focus:outline-none w-full"
                    />
                    {about !== authUser.about ? (
                      <Check
                        className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer"
                        onClick={handleSave}
                      />
                    ) : (
                      <Pencil className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
        {/* Profile form for mobile */}
        <form className="xl:hidden flex justify-center" action="">
          <div className="flex flex-col justify-center items-center mt-10 gap-14">
            {/* Profile photo */}
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePhoto || "/avatar.png"}
                className="w-[150px] h-[150px] rounded-full"
                alt=""
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="-mt-10 -mb-5 text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
            {/* Name field */}
            <div className="flex flex-col self-start px-9 w-full gap-4">
              <label className="text-gray-500" to="name">
                Your Name
              </label>
              <div className="relative w-full max-w-sm">
                {!isEditingName ? (
                  <>
                    <p>{authUser.fullName}</p>
                    <Pencil
                      className="w-4 h-4 text-gray-500 absolute right-2 top-0.5 cursor-pointer"
                      onClick={() => setIsEditingName(true)}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => {
                        if (fullName === authUser.fullName) {
                          setIsEditingName(false); // close if unchanged
                          handleSave();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave(); // save on Enter
                        }
                      }}
                      className="border border-r-0 border-l-0 border-t-0 border-b-green-500 focus:outline-none w-full "
                    />
                    {fullName !== authUser.fullName ? (
                      <Check
                        className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer"
                        onClick={handleSave}
                      />
                    ) : (
                      <Pencil className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer" />
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Paragraph field */}
            <div className="w-[350px] ml-9 -mt-6">
              <p className="text-base text-gray-500">
                This is not your username or PIN. This name will be visible to
                your WhatsApp contacts.
              </p>
            </div>
            {/* About field */}
            <div className="flex flex-col self-start px-9 w-full">
              <label className="text-gray-500" to="about">
                About
              </label>
              <div className="relative w-full max-w-sm mt-4">
                {!isEditingAbout ? (
                  <>
                    <p className="">{authUser.about}</p>
                    <Pencil
                      className="w-4 h-4 text-gray-500 absolute right-2 top-1 cursor-pointer"
                      onClick={() => setIsEditingAbout(true)}
                    />
                  </>
                ) : (
                  <>
                    <textarea
                      onBlur={() => {
                        if (about === authUser.about) {
                          setIsEditingAbout(false); // close if unchanged
                          handleSave();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave(); // save on Enter
                        }
                      }}
                      value={about}
                      rows="3"
                      onChange={(e) => setAbout(e.target.value)}
                      className="focus:outline-none pr-5 w-full"
                    />
                    {about !== authUser.about ? (
                      <Check
                        className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer"
                        onClick={handleSave}
                      />
                    ) : (
                      <Pencil className="w-4 h-4 text-green-500 absolute right-2 top-1 cursor-pointer" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      {/* Last container */}
      <div
        className="xl:flex hidden flex-col gap-10 flex-1 justify-center items-center"
        style={{ background: "#f7f5f3" }}
      >
        {/* Profile image field */}
        <Placeholder />
      </div>
      <Navbar />
    </div>
  );
};

export default ProfilePage;
