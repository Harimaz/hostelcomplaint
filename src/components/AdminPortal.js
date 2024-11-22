import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {  signOut } from "firebase/auth";

const AdminPortal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [complaints, setComplaints] = useState([]);
   const navigate = useNavigate();
  const auth = getAuth();

  const handleCreateUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add role to Firestore
      await setDoc(doc(db, "users", user.uid), { role });

      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`);
    } catch (error) {
      console.error("Error creating user:", error.message);
    }
  };

  
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };


  const fetchComplaints = async () => {
    const querySnapshot = await getDocs(collection(db, "complaints"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComplaints(data);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div>
      <h1>Admin Portal</h1>
      <div>
        <h2>Create User</h2>
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="User Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={handleCreateUser}>Create User</button>
      </div>
      <div>
        <h2>Complaints</h2>
        {complaints.map((complaint) => (
          <div key={complaint.id}>
            <p>
              {complaint.title} - {complaint.status}
            </p>
          </div>
        ))}
      </div>
      <button onClick={handleLogout}>Logout</button>

    </div>
  );
};

export default AdminPortal;
