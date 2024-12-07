import { useState, useContext } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import axios from "axios";

const Comments = ({ comments, postId, setComments }) => {
  const { currentUser } = useContext(AuthContext);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("post_id", postId);
      formData.append("content", newComment);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/comments",
        formData
      );

      if (response.data.success) {
        // Add the new comment to the existing comments list
        const newCommentData = {
          ...response.data.comment,
          user: currentUser
        };

        setComments(prevComments => [newCommentData, ...prevComments]);
        
        setNewComment(""); // Clear input
        setCommentError(""); // Clear errors
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      setCommentError("Failed to post comment. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.profilePic} alt="Current User" />
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button 
          onClick={handleSend} 
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
      {commentError && <p className="error">{commentError}</p>}
      {comments.map((comment) => (
        <div className="comment" key={comment.id}>
          <img
            src={comment.user?.image || "default-avatar.jpg"}
            alt="Commenter"
          />
          <div className="info">
          <span>{comment.user?.full_name || comment.user?.name || "Anonymous"}</span>
            <p>{comment.content}</p>
          </div>
          <span className="date">1 hour ago</span>
        </div>
      ))}
    </div>
  );
};

export default Comments;