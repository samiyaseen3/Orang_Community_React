import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link, useNavigate } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";


const Post = ({ post, showFullComments = false }) => {
  const navigate = useNavigate();
  const [commentOpen, setCommentOpen] = useState(showFullComments);
  const [comments, setComments] = useState(post.comments || []);

  // Check if the post is liked by the current user (placeholder for now)
  const liked = false;

  // Format the time ago from `created_at`
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  // Show only 2 comments if not in full view
  const displayComments = showFullComments 
    ? comments 
    : comments.slice(0, 1);

  const handleShowMoreComments = () => {
    // Navigate to detailed post view
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post">
      <div className="container">
        {/* User Info */}
        <div className="user">
          <div className="userInfo">
            <img
              src={post.user?.image || "default-profile-pic.jpg"}
              alt={`${post.user?.full_name}'s profile`}
            />
            <div className="details">
              <Link
                to={`/profile/${post.user?.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.user?.full_name}</span>
              </Link>
              <span className="date">{timeAgo}</span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>

        {/* Post Content */}
        <div className="content">
          <p>{post.content}</p>
          {post.post_images?.length > 0 && (
            <img
              src={post.post_images[0]?.image_url}
              alt="Post"
            />
          )}
        </div>

        {/* Post Info */}
        <div className="info">
          <div className="item">
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            {post.likes?.length || 0} Likes
          </div>
          <div 
            className="item" 
            onClick={() => setCommentOpen(!commentOpen)}
          >
            <TextsmsOutlinedIcon />
            {comments.length} Comments
          </div>
          <div className="item">
            <BookmarkBorderOutlinedIcon />
            Save
          </div>
        </div>

        {/* Comments Section */}
        {(commentOpen || showFullComments) && (
          <>
            <Comments 
              comments={displayComments} 
              postId={post.id} 
              setComments={setComments}
            />
            
            {/* Show More Comments Link */}
            {!showFullComments && comments.length > 1 && (
              <div 
                className="show-more-comments" 
                onClick={handleShowMoreComments}
                style={{
                  color: 'blue', 
                  cursor: 'pointer', 
                  textAlign: 'center', 
                  marginTop: '10px'
                }}
              >
                Show {comments.length - 1} more comments
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Post;