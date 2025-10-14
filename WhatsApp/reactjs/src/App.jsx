
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage"
import Chatpage from "./components/Chatpage.jsx"
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./Store/useAuthStore";
import { useThemeStore } from "./Store/useThemeStore";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/chatpage" element={!authUser ? <LoginPage /> : <Chatpage/>} />
        <Route path="/profilepage/" element={!authUser ? <LoginPage /> : <ProfilePage/>} />


      </Routes>

      <Toaster />
    </div>
  );
};
export default App;