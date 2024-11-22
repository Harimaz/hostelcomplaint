// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import AdminPortal from "./components/AdminPortal";
import UserPortal from "./components/UserPortal";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
        <Route path="/user-portal" element={<UserPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
