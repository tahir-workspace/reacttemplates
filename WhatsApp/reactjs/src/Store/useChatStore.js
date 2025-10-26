import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../Store/useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, page = 1) => {
    if (page === 0) return { noData: true };

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?page=${page}`);
      const messagesFetched = res.data;

      // If first page, replace messages
      if (page === 1) {
        set({ messages: messagesFetched });
      } else {
        // Append messages for subsequent pages
        set((state) => ({ messages: [...state.messages, ...messagesFetched] }));
      }

      // Return flag if no more messages
      return { noData: messagesFetched.length === 0 };
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch messages");
      return { noData: true };
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  deleteMessage: async (messageId) => {
    try {
      // optional: send to backend
      await axiosInstance.delete(`/messages/${messageId}`);

      // remove from local state
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
    } catch (err) {
      console.error("Delete message error:", err);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!selectedUser || !selectedUser.id) {
      toast.error("No user selected");
      return;
    }

    // Create a local temp message with base64 data intact
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      senderId: authUser.id,
      receiverId: selectedUser.id,
      text: messageData?.text || null,
      file: messageData?.file || null, // base64 stays here
      audio: messageData?.audio || null, // base64 stays here
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      _local: true, // marker to avoid UI re-renders
    };

    // Add it locally for instant UI feedback
    set({ messages: [...messages, tempMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        messageData
      );

      const serverMsg = res.data;

      // Merge server message but KEEP the same file/audio reference
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: serverMsg.id,
                status: "sent",
                createdAt: serverMsg.createdAt || msg.createdAt,
                updatedAt: serverMsg.updatedAt || msg.updatedAt,
                _local: false,
                // Keep existing file/audio base64 so React doesn't reload
                file: msg.file || serverMsg.file || null,
                audio: msg.audio || serverMsg.audio || null,
              }
            : msg
        ),
      }));
    } catch (error) {
      console.error("❌ Send Message Error:", error);

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        ),
      }));

      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      console.log("📩 New message received:", newMessage);

      // If this chat is open, append the message
      const isFromSelectedUser =
        selectedUser && newMessage.senderId === selectedUser.id;
      if (isFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage],
        });
      }

      // 🧩 Update last message in users list
      set((state) => {
        // update user's lastMessage
        const updatedUsers = state.users.map((user) =>
          user.id === newMessage.senderId || user.id === newMessage.receiverId
            ? { ...user, lastMessage: newMessage }
            : user
        );

        // sort by latest message (newest on top)
        updatedUsers.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt).getTime()
            : 0;
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt).getTime()
            : 0;
          return timeB - timeA; // descending
        });

        // return updated state
        return { users: updatedUsers };
      });
    });
  },
  //if you logout and close window then message are of
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  subscribeToDeletedMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("messageDeleted");
    socket.on("messageDeleted", ({ messageId, receiverId }) => {
      console.log("🗑️ Message deleted:", messageId, receiverId);

      // 1️⃣ Remove it from local messages
      set({
        messages: get().messages.filter((m) => m.id !== messageId),
      });

      // 2️⃣ Update that user's last message preview
      set((state) => ({
        users: state.users.map((user) =>
          user.lastMessage.id === messageId
            ? {
                ...user,
                lastMessage: {
                  ...user.lastMessage,
                  text: "Message deleted",
                  file: null,
                  audio: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : user
        ),
      }));
    });
  },

  unSubscribeFromDeletedMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
