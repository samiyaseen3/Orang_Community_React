import { useState, useEffect } from "react";
import Posts from "../../components/posts/Posts";
import Share from "../../components/share/Share";
import axios from "axios";
import "./home.scss";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/index");
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []); 

  return (
    <div className="home">
      <Share 
        setPosts={setPosts} 
        posts={posts} 
        fetchPosts={fetchPosts} 
      />
      <Posts initialPosts={posts} />
    </div>
  );
};

export default Home;