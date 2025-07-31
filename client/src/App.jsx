import React from 'react';
import { Route, Routes } from "react-router";

import HomePage from './pages/HomePage.jsx';
import CallPage from './pages/CallPage.jsx';
import ChatPage from "./pages/ChatPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";

import toast, { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="">
      <div className="my-10">
        Welcome to PingMe App
      </div>
      <div>
        <button className="btn" onClick={() => toast.success("PingMe!")}>Button</button>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App;