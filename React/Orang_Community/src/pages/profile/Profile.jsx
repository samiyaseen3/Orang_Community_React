import "./profile.scss";
import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaSchool, FaLinkedin } from "react-icons/fa";
import Posts from "../../components/posts/Posts";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    academy: "",
    socialmedia: "",
    password: "",
    image: null,
  });
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setUser(response.data);
        setFormData({
          full_name: response.data.full_name,
          email: response.data.email,
          academy: response.data.academy,
          socialmedia: response.data.socialmedia || "",
          password: "",
          image: null,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error("Failed to load profile");
        setLoading(false);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  // Toggle edit mode
  const handleEditToggle = () => setIsEditing(!isEditing);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();

    // Append all form data
    for (let key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }

    // Include the user ID
    formDataToSend.append("id", user.id);

    try {
      const response = await axios.post("/profile/edit", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update user state with response data
      setUser(prevUser => ({
        ...prevUser,
        ...response.data.user
      }));

      setIsEditing(false);
      toast.success(response.data.message || "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile", error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        const errorMessage = error.response.data.message || 
                             (error.response.data.errors 
                              ? Object.values(error.response.data.errors)[0][0] 
                              : "An error occurred");
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        toast.error("Error setting up the request");
      }
    }
  };

  // Close modal
  const closeModal = () => {
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile">
      {/* ToastContainer for notifications */}
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="images">
        <img
          src="https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="cover"
          className="cover"
        />
        <div className="profilePicWrapper">
          <img
            src={user.profile_picture || "https://via.placeholder.com/150"}
            alt="profile"
            className="profilePic"
          />
        </div>
      </div>

      <div className="profileContainer">
        <div className="uInfo">
          <div className="center">
            <span className="userName">{user.full_name}</span>
            <div className="info">
              <div className="infoItem" onClick={() => window.location.href = `mailto:${user.email}`}>
                <FaEnvelope className="icon" />
              </div>
              <div className="infoItem">
                <FaSchool className="icon" />
                <span>{user.academy}</span>
              </div>
              <div className="infoItem" onClick={() => window.open(user.socialmedia, '_blank')}>
                <FaLinkedin className="icon" />
              </div>
            </div>
            <button className="editButton" onClick={handleEditToggle}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="modal">
            <form onSubmit={handleSubmit} className="editForm">
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              <input
                type="text"
                name="academy"
                value={formData.academy}
                onChange={handleChange}
                placeholder="Academy"
                required
              />
              <input
                type="text"
                name="socialmedia"
                value={formData.socialmedia}
                onChange={handleChange}
                placeholder="LinkedIn URL"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (optional)"
              />
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              <button type="submit">Save Changes</button>
              <button type="button" className="closeButton" onClick={closeModal}>
                Close
              </button>
            </form>
          </div>
        )}

        <Posts userId={user.id} />
      </div>
    </div>
  );
};

export default Profile;