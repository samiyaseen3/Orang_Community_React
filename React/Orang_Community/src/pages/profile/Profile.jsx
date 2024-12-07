import "./profile.scss";
import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { FaEnvelope, FaSchool, FaLinkedin } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaSchool, FaLinkedin } from "react-icons/fa"; // استيراد الأيقونات

import Posts from "../../components/posts/Posts";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Fetch posts filtered by user
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/index");
        const allPosts = response.data.data;
        const filteredPosts = allPosts.filter(
          (post) => post.user_id === user?.id
        );
        setPosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching posts", error);
        toast.error("Failed to load posts");
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Loading state
  if (loading) return <div>Loading...</div>;

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

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();

    for (let key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }

    formDataToSend.append("id", user.id);

    try {
      const response = await axios.post("/profile/edit", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prevUser) => ({
        ...prevUser,
        ...response.data.user,
      }));

      setIsEditing(false);
      toast.success(response.data.message || "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile", error);
      const errorMessage =
        error.response?.data.message ||
        (error.response?.data.errors
          ? Object.values(error.response.data.errors)[0][0]
          : "An error occurred");
      toast.error(errorMessage);
    }
  };

  // Format time function
  const formatTime = (time) => {
    const now = new Date();
    const createdAt = new Date(time);
    const difference = Math.floor((now - createdAt) / (1000 * 60)); // in minutes
    if (difference < 60) return `${difference} minutes ago`;
    const hours = Math.floor(difference / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="profile">
      <div className="images">
        <img
          src="https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="cover"
          className="cover"
        />
        <img
          src={
            user.profile_picture
              ? user.profile_picture
              : "https://via.placeholder.com/150"
          }
          alt="profile"
          className="profilePic"
        />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="center">
            <span className="name">{user.name}</span>
            <div className="info">
       
              <div className="infoItem">
                <FaEnvelope className="icon" />
              </div>
              <div className="infoItem">
                <FaSchool className="icon" />
                <span>{user?.academy}</span>
              </div>
              <div className="infoItem">
                <FaLinkedin className="icon" />
              </div>
            </div>
            <button className="editButton" onClick={handleEditToggle}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
        <Posts />
      </div>
    </div>
  );
};

export default Profile;