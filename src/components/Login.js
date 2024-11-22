import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, query, where, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const db = getFirestore();

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      console.log("Authenticated User Email:", userEmail);  // Debug log for email

      // Query Firestore for the document where the email matches
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If document is found, extract the role
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const role = userData?.role;
          console.log("User Role from Firestore:", role);  // Debug log for role

          if (role === "admin") {
            navigate("/admin-portal");  // Redirect to admin portal if role is admin
          } else if (role === "user") {
            navigate("/user-portal");   // Redirect to user portal if role is user
          } else {
            setError("Invalid role. Please contact admin.");
          }
        });
      } else {
        setError("No user data found in Firestore.");
      }
    } catch (err) {
      console.error("Login Error:", err); 
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );

};

export default Login;
