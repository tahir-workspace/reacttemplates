import React, { use } from "react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../Store/useChatStore";
import Chatheader from "./Chatheader";
import { Link, useNavigate } from "react-router-dom";
import MiddleContainer from "./MiddleContainer";
import MessageInput from "./MessageInput";
import VideoCall from "../pages/VideoCall";
import Navbar from "./Navbar";
import useFancybox from "../hooks/useFancybox";
import SideNav from "./SideNav";
import ConfirmPopup from "./ConfirmPopup";

const Whatsapp = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const messageEndRef = useRef(null);
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [callingfunc, setCallingfunc] = useState(null);
  const [remoteId, setRemoteId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [fancyboxRef] = useFancybox({});

  useEffect(() => {
    console.log("tahir console", authUser, selectedUser);
    if (!selectedUser?.id) return;

    getMessages(selectedUser.id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?.id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <section className="flex w-screen">
        {/* First container */}
        <SideNav />
        <MiddleContainer />
        {/* First container for small sizes */}
        <Navbar />

        {/* Big right container */}
        {!selectedUser ? (
          <section className="hidden xl:block flex-1">
            {/* <!-- last container --> */}
            <div className="sticky top-0 h-screen flex flex-col justify-center items-center">
              {/* <!-- whatsapp computer image --> */}
              <img className="w-[320px]" src="./whatsappimage.png" alt="" />
              {/* <!-- heading line --> */}
              <h1 className="mt-[30px] text-4xl">Download WhatsApp for Mac</h1>
              <p className="mt-[15px]">
                Make calls and get a faster experience when you download the Mac
                app.
              </p>
              {/* <!-- button line --> */}
              <button className="bg-green-500 rounded-full text-sm mt-[25px] pl-[25px] pr-[25px] pt-[9px] pb-[9px]">
                Get from App Store
              </button>
              {/* <!-- footer line --> */}
              {/* <div className="absolute bottom-10 flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  height="20"
                  width="20"
                  preserveAspectRatio="xMidYMid meet"
                  className=""
                  fill="none"
                >
                  <title>lock-outline</title>
                  <path
                    d="M6.793 22.4C6.29767 22.4 5.875 22.2237 5.525 21.8712C5.175 21.5187 5 21.095 5 20.6V11C5 10.505 5.17625 10.0813 5.52875 9.72875C5.88125 9.37625 6.305 9.2 6.8 9.2H7.4V6.8C7.4 5.472 7.86858 4.34 8.80575 3.404C9.74275 2.468 10.8761 2 12.2057 2C13.5352 2 14.6667 2.468 15.6 3.404C16.5333 4.34 17 5.472 17 6.8V9.2H17.6C18.095 9.2 18.5187 9.37625 18.8712 9.72875C19.2237 10.0813 19.4 10.505 19.4 11V20.6C19.4 21.095 19.2237 21.5187 18.871 21.8712C18.5183 22.2237 18.0943 22.4 17.599 22.4H6.793ZM6.8 20.6H17.6V11H6.8V20.6ZM12.2052 17.6C12.7017 17.6 13.125 17.4233 13.475 17.0698C13.825 16.7163 14 16.2913 14 15.7948C14 15.2983 13.8232 14.875 13.4697 14.525C13.1162 14.175 12.6912 14 12.1947 14C11.6982 14 11.275 14.1767 10.925 14.5302C10.575 14.8837 10.4 15.3087 10.4 15.8052C10.4 16.3017 10.5767 16.725 10.9302 17.075C11.2837 17.425 11.7087 17.6 12.2052 17.6ZM9.2 9.2H15.2V6.8C15.2 5.96667 14.9083 5.25833 14.325 4.675C13.7417 4.09167 13.0333 3.8 12.2 3.8C11.3667 3.8 10.6583 4.09167 10.075 4.675C9.49167 5.25833 9.2 5.96667 9.2 6.8V9.2Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p className="text-sm">
                  Your personal messages are end-to-end encrypted
                </p>
              </div> */}
            </div>
          </section>
        ) : (
          <section
            className="
  flex flex-col flex-1 h-full
  fixed inset-0 bg-white z-[1]
  xl:relative xl:z-auto xl:bg-transparent xl:h-auto
  animate-slideUp
"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
              <Chatheader setRemoteId={setRemoteId} callingfunc={callingfunc} />
            </div>

            {/* Messages area */}
            <div
              ref={fancyboxRef}
              className="flex-1 w-full px-3 py-2 overflow-y-auto bg-gray-50"
              style={{ scrollBehavior: "smooth", paddingBottom: "80px" }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${
                    message.senderId === authUser.id ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-bubble flex flex-col relative group">
                    {/* 🗑️ Delete button (only for own messages) */}
                    {message.senderId === authUser.id && (
                      <button
                        onClick={() => {
                          setDeleteId(message.id);
                          setShowConfirm(true);
                        }}
                        className="absolute top-[-5px] right-[-2px] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete message"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#FFFFFF"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-200"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 9l6 6M15 9l-6 6"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Media (image/audio) */}
                    {message.file && (
                      <img
                        data-fancybox="gallery"
                        href={message.file}
                        src={message.file}
                        alt="Attachment"
                        className="max-w-[200px] rounded-md mb-2"
                      />
                    )}

                    {message.audio && (
                      <div className="bottom-20 mb-5 bg-gray-100 border p-3 rounded-lg flex items-center gap-2">
                        <audio controls src={message.audio} />
                      </div>
                    )}

                    {message.text && <p>{message.text}</p>}

                    <div className="chat-header mb-1 flex justify-end">
                      <time className="text-xs opacity-50">
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                  </div>
                </div>
              ))}

              {/* Keep scroll pinned to bottom */}
              <div ref={messageEndRef}></div>
            </div>

            {/* Input Bar */}
            <div className="sticky bottom-0 bg-white border-t z-20">
              <MessageInput />
            </div>
          </section>
        )}
      </section>
      <VideoCall
        userId={authUser?.id.toString()}
        userName={authUser?.fullName}
        userProfile={authUser.profilePhoto || "/avatar.png"}
        callingfunc={setCallingfunc}
        remoteId={remoteId}
      />
      {showConfirm && (
        <ConfirmPopup
          message="Are you sure you want to delete this message?"
          onConfirm={() => {
            deleteMessage(deleteId);
            setShowConfirm(false);
            setDeleteId(null);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default Whatsapp;
