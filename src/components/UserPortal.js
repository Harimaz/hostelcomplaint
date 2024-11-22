import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Import from the firebase-config.js file
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import './UserPortal.css'; // Import the CSS file in your component
import { useNavigate } from 'react-router-dom'; // for redirecting

const UserPanel = () => {
  const [complaint, setComplaint] = useState(""); // Complaint input state
  const [status, setStatus] = useState(""); // Status of complaint submission
  const [email, setEmail] = useState(""); // User email (fetched from Firebase Auth)
  const [userComplaints, setUserComplaints] = useState([]); // Store user's complaints

  // Get user email from Firebase Auth (if logged in)
  useEffect(() => {
    const user = auth.currentUser;

  
    if (auth.currentUser) {
      setEmail(auth.currentUser.email);
    }
  }, [auth]);

  // Fetch complaints for the logged-in user
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        if (email) {
          const q = query(collection(db, "complaints"), where("userEmail", "==", email));
          const querySnapshot = await getDocs(q);
          const complaints = querySnapshot.docs.map((doc) => doc.data());
          setUserComplaints(complaints);
        }
      } catch (error) {
        console.error("Error fetching complaints: ", error);
      }
    };

    fetchComplaints();
  }, [email]);

  // Handle complaint submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    if (!complaint) {
      setStatus("Please enter a complaint.");
      return;
    }

    try {
      // Prepare complaint data to be stored in Firestore
      const complaintData = {
        complaint: complaint,
        userEmail: email,
        status: "pending", // Initial status set to 'pending'
        reply: null, // Initially, there is no reply
      };

      // Add the complaint to the Firestore 'complaints' collection
      await addDoc(collection(db, "complaints"), complaintData);
      setComplaint(""); // Clear the complaint input field
      setStatus("Complaint submitted successfully!");

      // Fetch the updated list of complaints
      const q = query(collection(db, "complaints"), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const complaints = querySnapshot.docs.map((doc) => doc.data());
      setUserComplaints(complaints); // Update complaints list after submitting
    } catch (error) {
      console.error("Error adding complaint: ", error);
      setStatus("Error submitting complaint.");
    }
  };

  return (
    <div className="background">
      <h2>User Panel</h2>
      <h3>Raise a Complaint</h3>

      {/* Complaint submission form */}
      <form onSubmit={handleSubmitComplaint}>
        <textarea
          placeholder="Describe your complaint..."
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          rows="4"
          style={{ width: "100%" }}
        />
        <button type="submit">Submit Complaint</button>
      </form>

      {status && <p>{status}</p>}

      {/* Displaying user's complaints */}
      <h3>Your Complaints</h3>
      <div>
        {userComplaints.length === 0 ? (
          <p>No complaints raised yet.</p>
        ) : (
          userComplaints.map((complaint, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <p><strong>Complaint:</strong> {complaint.complaint}</p>
              <p><strong>Status:</strong> {complaint.status}</p>
              <p><strong>Reply:</strong> {complaint.reply || "No reply yet."}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserPanel;
