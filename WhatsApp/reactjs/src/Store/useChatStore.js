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

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser || !selectedUser.id) {
      toast.error("No user selected");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        messageData
      );
      console.log("Message sent:", res.data); // Add this
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Send Message Error:", error); // Add this

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
