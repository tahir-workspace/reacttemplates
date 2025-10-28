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
import Placeholder from "./Placeholder";
import useDualScroll from "./useDualScroll";

const Whatsapp = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToDeletedMessages,
    unSubscribeFromDeletedMessages,
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
  const prevMessageCount = useRef(0);
  const containerRef = useRef();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const scrollRef = useRef(null);

  const [fancyboxRef] = useFancybox({});

  useEffect(() => {
    if (!selectedUser?.id) return;

    const fetchMessages = async () => {
      if (hasMore || page === 1) {
        setIsLoading(true);
        setHasMore(false);
        const result = await getMessages(selectedUser.id, page);
        setIsLoading(false);

        if (result.noData) {
          setHasMore(false); // stop further loading
        } else {
          setHasMore(true); // allow further loading
        }
      }
    };

    fetchMessages();

    // Subscriptions
    subscribeToMessages();
    subscribeToDeletedMessages();

    return () => {
      unsubscribeFromMessages();
      unSubscribeFromDeletedMessages();
    };
  }, [
    selectedUser?.id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    page,
  ]);

  useEffect(() => {
    setHasMore(true);
    setPage(1);
    setIsLoading(false);
    setScrollToBottom(false);
  }, [selectedUser?.id]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      // Only scroll when a new message is added
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCount.current = messages.length;
  }, [messages]);

  useDualScroll({
    scrollRef,
    setPage,
    setScrollToBottom,
    hasMore,
    isLoading,
  });

  const ChevronDownIcon = ({ size = 16, color = "currentColor" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 320 512"
    >
      <path
        d="M143 352.3 7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 
      24.6-9.4 33.9 0L160 284.1l96.4-96.4c9.4-9.4 24.6-9.4 
      33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 
      33.9L177 352.3c-9.4 9.4-24.6 9.4-34 0z"
      />
    </svg>
  );

  const ScrollToBottomButton = ({ onClick }) => {
    if (!scrollToBottom) return null;
    return (
      <button
        onClick={onClick}
        className="fixed bottom-2 right-4 bg-white rounded-full shadow-md p-3 flex items-center justify-center hover:bg-gray-100 transition"
        style={{ bottom: "100px" }}
      >
        <ChevronDownIcon className="text-gray-700 w-5 h-5" />
      </button>
    );
  };

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
            <Placeholder />
          </section>
        ) : (
          <section
            ref={fancyboxRef}
            className="flex flex-col flex-1 h-full fixed inset-0 bg-white z-[1] xl:relative xl:z-auto xl:bg-transparent xl:h-auto animate-slideUp"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
              <Chatheader setRemoteId={setRemoteId} callingfunc={callingfunc} />
            </div>
            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 w-full px-3 py-2 overflow-y-auto bg-gray-50"
              style={{
                scrollBehavior: "smooth",
                paddingBottom: "80px",
                backgroundImage: "url('/background.jpg')",
                backgroundRepeat: "repeat",
                backgroundSize: "450px",
                WebkitOverflowScrolling: "touch",
                height: "100dvh",
              }}
            >
              {isLoading && (
                <div className="flex justify-center my-3">
                  <span
                    className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: "#FFF",
                      color: "#7c7575",
                      fontWeight: "500",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-700">Loading ...</span>
                    </div>
                  </span>
                </div>
              )}
              {messages.map((message, index) => {
                const currentDate = new Date(message.createdAt);
                const prevMessage = messages[index - 1];
                const prevDate = prevMessage
                  ? new Date(prevMessage.createdAt)
                  : null;

                // helper to check if date changed
                const isNewDay =
                  !prevDate ||
                  currentDate.toDateString() !== prevDate.toDateString();

                // helper to format the date row
                const formatDateLabel = (date) => {
                  const today = new Date();
                  const yesterday = new Date();
                  yesterday.setDate(today.getDate() - 1);

                  if (date.toDateString() === today.toDateString())
                    return "Today";
                  if (date.toDateString() === yesterday.toDateString())
                    return "Yesterday";

                  return date.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                };

                return (
                  <React.Fragment key={message.id}>
                    {/* 📅 Date Row */}
                    {isNewDay && (
                      <div className="flex justify-center my-3">
                        <span
                          className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: "#FFF",
                            color: "#7c7575",
                            fontWeight: "500",
                            borderRadius: "8px",
                          }}
                        >
                          {formatDateLabel(currentDate)}
                        </span>
                      </div>
                    )}

                    {/* 💬 Message Bubble */}
                    <div
                      className={`chat ${
                        message.senderId === authUser.id
                          ? "chat-end"
                          : "chat-start"
                      }`}
                    >
                      <div
                        className="chat-bubble flex flex-col relative group"
                        style={{
                          minWidth: 150,
                          backgroundColor:
                            message.senderId === authUser.id
                              ? "#22c55e"
                              : "#fff",
                        }}
                      >
                        {/* 🗑️ Delete Button */}
                        {message.senderId === authUser.id &&
                          message?.status !== "pending" && (
                            <button
                              onClick={() => {
                                setDeleteId(message.id);
                                setShowConfirm(true);
                              }}
                              className="absolute -top-4 -right-4 p-2 rounded-full  opacity-0 group-hover:opacity-100 "
                              title="Delete message"
                              style={{
                                touchAction: "manipulation",
                              }}
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

                        {/* 📎 Media */}
                        {message.file && (
                          <img
                            data-fancybox="gallery"
                            href={message.file}
                            src={message.file.replace(
                              /\/upload\//,
                              "/upload/w_200/"
                            )}
                            alt="Attachment"
                            className="max-w-[200px] rounded-md mb-2"
                          />
                        )}

                        {message.audio && (
                          <div className="bottom-20 mb-5 bg-gray-100 border p-3 rounded-lg flex items-center gap-2">
                            <audio controls src={message.audio} />
                          </div>
                        )}

                        {/* 💬 Text */}
                        {message.text && (
                          <p
                            style={{
                              color:
                                message.senderId === authUser.id
                                  ? "#fff"
                                  : "#000",
                            }}
                          >
                            {message.text}
                          </p>
                        )}

                        <div className="chat-header mb-1 flex justify-between items-center w-full">
                          {/* Left: Message Status */}
                          {message.senderId === authUser.id && (
                            <div className="flex items-center gap-1 text-xs">
                              {message.status === "pending" && (
                                <span className="text-xs text-white opacity-70">
                                  Pending...
                                </span>
                              )}
                              {message.status === "failed" && (
                                <span className="text-xs text-white opacity-70">
                                  Failed
                                </span>
                              )}
                              {/* {(!message.status || message.status === "sent") && (
                              <span className="text-xs text-white opacity-70">
                                Sent
                              </span>
                            )} */}
                            </div>
                          )}

                          {/* Right: Time */}
                          <time
                            className="text-xs text-white opacity-70"
                            style={{
                              color:
                                message.senderId === authUser.id
                                  ? "#fff"
                                  : "#000",
                            }}
                          >
                            {formatMessageTime(message.createdAt)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Keep scroll pinned to bottom */}
              <div ref={messageEndRef}></div>
            </div>
            <ScrollToBottomButton
              onClick={() => {
                messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            />
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
