import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("User");

  // Get post author username
  const fetchUsername = async () => {
    if (!post.user_id) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", post.user_id)
      .single();
    if (!error && data) setUsername(data.username);
  };

  // Get likes count
  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post.id);
    if (!error) setLikes(data?.length || 0);
  };

  // Get comments
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, comment")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (!error) setComments(data || []);
  };

  // Like a post
  const likePost = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return alert("Login required to like");
    const user_id = userData.user.id;

    // Check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post.id)
      .eq("user_id", user_id);

    if (existing.length > 0) return alert("You already liked this post");

    // Insert like
    const { error } = await supabase.from("likes").insert([{ post_id: post.id, user_id }]);
    if (error) return console.log("Like error:", error);

    fetchLikes(); // refresh
  };

  // Add comment
  const addComment = async () => {
    if (!comment) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return alert("Login required to comment");
    const user_id = userData.user.id;

    const { error } = await supabase.from("comments").insert([{ post_id: post.id, user_id, comment }]);
    if (error) return console.log("Comment error:", error);

    setComment(""); // clear input
    fetchComments(); // refresh comments
  };

  useEffect(() => {
    fetchUsername();
    fetchLikes();
    fetchComments();
  }, []);

  return (
    <div className="post-card">
      <h4>{username}</h4>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          style={{ width: "100%", borderRadius: "0.625rem", marginTop: "0.5rem", objectFit: "cover" }}
        />
      )}

      <p>{post.description}</p>

      {/* ===== Like button ===== */}
      <div className="like-line" style={{ display: "flex", justifyContent: "flex-start", marginTop: "0.5rem" }}>
        <button
          className="like-btn"
          style={{ width: "5rem", padding: "0.7rem 0", fontSize: "0.9rem", borderRadius: "0.5rem", cursor: "pointer" }}
          onClick={likePost}
        >
          👍 {likes}
        </button>
      </div>

      {/* ===== Comment input + button ===== */}
      <div className="comment-line" style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
        <input
          type="text"
          placeholder="Add comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ flex: 1, padding: "0.7rem 0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.9rem" }}
        />
        <button
          className="comment-btn"
          style={{ width: "6rem", padding: "0.7rem 0", borderRadius: "0.5rem", background: "linear-gradient(135deg, #a78fd2, #926cb8)", color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}
          onClick={addComment}
        >
          Comment
        </button>
      </div>

      {/* Display comments */}
      {comments.map((c) => (
        <p key={c.id} style={{ margin: "0.25rem 0" }}>💬 {c.comment}</p>
      ))}
    </div>
  );
};

export default PostCard;
