// src/components/UserPortal.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {  signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const UserPortal = () => {
  const [title, setTitle] = useState("");
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();


  const handleFileComplaint = async () => {
    try {
      await addDoc(collection(db, "complaints"), {
        title,
        status: "Pending",
        userId: auth.currentUser.uid,
      });
      fetchUserComplaints();
    } catch (error) {
      console.error("Error filing complaint:", error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const fetchUserComplaints = async () => {
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComplaints(data);
  };

  useEffect(() => {
    fetchUserComplaints();
  }, []);

  return (
    <div>
      <h1>User Portal</h1>
      <div>
        <h2>File Complaint</h2>
        <input
          type="text"
          placeholder="Complaint Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={handleFileComplaint}>File Complaint</button>
      </div>
      <div>
        <h2>Your Complaints</h2>
        {complaints.map((complaint) => (
          <p key={complaint.id}>
            {complaint.title} - {complaint.status}
          </p>
        ))}
      </div>
      <button onClick={handleLogout}>Logout</button>

    </div>
  );
};

export default UserPortal;
