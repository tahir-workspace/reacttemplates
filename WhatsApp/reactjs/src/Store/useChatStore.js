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

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
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
    console.log("selectedUser", selectedUser);
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    console.log("Subscribing to messages with socket:", socket);

    if (!socket) return;

    socket.off("newMessage"); // avoid duplicate listeners
    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser.id;

      if (!isMessageSentFromSelectedUser) return; //If we select one chat then the message will go that person only not to others.

      set({
        messages: [...get().messages, newMessage], //keeping all previous message and adding new one
      });
    });
  },
  //if you logout and close window then message are of
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
