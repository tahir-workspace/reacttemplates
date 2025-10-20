import React from "react";
import Chatheader from "./Chatheader";
import { formatMessageTime } from "../lib/utils";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../Store/useAuthStore";
import { useChatStore } from "../Store/useChatStore";
import { useRef } from "react";
const ChatContainer = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const messageEndRef = useRef(null);
  const { authUser } = useAuthStore();
  return (
    <div className="w-screen">
      <section className="flex-1 xl:block hidden h-full">
        <div className="sticky top-0 z-10">
          <Chatheader />
        </div>
        {/* Scrolling chat box */}
        <div className=" w-full px-3 pb-[80px] flex flex-col overflow-y-auto ">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${
                message.senderId === authUser.id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
                <div className="chat-header mb-1 flex justify-end">
                  <time className="text-xs opacity-50 ">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
        <MessageInput />
      </section>
    </div>
  );
};

export default ChatContainer;
