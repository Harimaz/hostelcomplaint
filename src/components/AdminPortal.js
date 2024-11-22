import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import * as XLSX from 'xlsx'; // Import xlsx library for handling Excel files
import './AdminPortal.css'; // Import the CSS file for styling
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [file, setFile] = useState(null); // For storing the uploaded Excel file
  const [status, setStatus] = useState(""); // To show success or error messages for file upload

  const auth = getAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      const db = getFirestore();
      const complaintsCollection = collection(db, 'complaints');
      const querySnapshot = await getDocs(complaintsCollection);

      const complaintsData = [];
      querySnapshot.forEach(doc => {
        complaintsData.push({ id: doc.id, ...doc.data() });
      });
      setComplaints(complaintsData);
    };

    fetchComplaints();
  }, []);

  // Handle reply submission
  const handleReply = async (complaintId) => {
    if (!reply) {
      alert("Please enter a reply before submitting.");
      return;
    }

    const db = getFirestore();
    const complaintRef = doc(db, 'complaints', complaintId);

    try {
      await updateDoc(complaintRef, {
        reply: reply,
        status: 'resolved',  // Update status to resolved
      });
      setReply(""); // Clear reply input
      setSelectedComplaintId(null); // Reset the selected complaint after reply is submitted
      alert("Reply submitted successfully!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Error submitting reply!");
    }
  };

  // Handle viewing a specific complaint
  const handleViewComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId); // Set the selected complaint for reply
    setReply(""); // Clear previous reply text
  };

  // Handle file selection for creating users
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  // Handle uploading and processing the Excel file
  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("Please select an Excel file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Parse the Excel file
        const data = reader.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Use the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Convert the sheet data into JSON (array of objects)
        const usersData = XLSX.utils.sheet_to_json(sheet);

        // Loop through each user in the sheet
        for (const user of usersData) {
          const { email, password, role } = user;

          if (!email || !password || !role) {
            setStatus("Error: Missing email, password, or role.");
            continue;
          }

          // Create a user in Firebase Authentication
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

            // Store the user's role in Firestore
            const db = getFirestore();
            const userRef = doc(db, "users", userCredential.user.uid);
            await setDoc(userRef, {
              email: email,
              role: role,
            });

            setStatus("Users created successfully!");
          } catch (error) {
            console.error("Error creating user:", error);
            setStatus("Error creating user.");
          }
        }
      } catch (error) {
        console.error("Error reading the Excel file:", error);
        setStatus("Error reading the Excel file.");
      }
    };

    reader.readAsArrayBuffer(file); // Read the file as an array buffer
  };

  return (
    <div className="admin-panel-container">
      <h2>Complaints</h2>
      
      {/* Display list of complaints */}
      {complaints.length === 0 && <p>No complaints found.</p>}
      
      <div className="row">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Complaint: {complaint.complaint}</h5>
                <p className="card-text"><strong>Status:</strong> {complaint.status}</p>
                <p className="card-text"><strong>User Email:</strong> {complaint.userEmail}</p>
                
                {complaint.reply && (
                  <div>
                    <p><strong>Admin Reply:</strong> {complaint.reply}</p>
                  </div>
                )}

                <button onClick={() => handleViewComplaint(complaint.id)}>
                  reply
                </button>

                {selectedComplaintId === complaint.id && (
                  <div className="mt-3">
                    <textarea
                      className="form-control"
                      placeholder="Write your reply"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button
                      className="btn btn-success mt-2"
                      onClick={() => handleReply(complaint.id)}
                    >
                      Submit Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3>Create Users from Excel Sheet</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button className="btn btn-warning" onClick={handleFileUpload}>Upload Excel Sheet</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default AdminPanel;
