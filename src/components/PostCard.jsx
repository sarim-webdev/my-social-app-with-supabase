import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("User");
  const [currentUser, setCurrentUser] = useState(null);

  // ===== Current logged-in user =====
  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setCurrentUser(data.user.id);
  };

  // ===== Post owner username =====
  const fetchUsername = async () => {
    if (!post.user_id) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", post.user_id)
      .single();

    if (error) console.log("Username fetch error:", error);
    else if (data) setUsername(data.username);
  };

  // ===== Likes count =====
  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id);

    if (error) console.log("Likes fetch error:", error);
    else setLikes(data?.length || 0);
  };

  // ===== Comments with usernames =====
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, comment, user_id")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Comments fetch error:", error);
      return;
    }

    // Fetch username for each comment
    const commentsWithUsernames = await Promise.all(
      data.map(async (c) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", c.user_id)
          .single();
        return { ...c, username: profile?.username || "User" };
      })
    );

    setComments(commentsWithUsernames);
  };

  // ===== Like post =====
  const likePost = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return alert("Login required");

    const { error } = await supabase.from("likes").insert([
      { post_id: post.id, user_id: userData.user.id }
    ]);

    if (error) {
      console.log("Like error:", error.message);
      return;
    }

    setLikes((prev) => prev + 1);
  };

  // ===== Add comment =====
  const addComment = async () => {
    if (!comment.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return alert("Login required");

    const { data: newComment, error } = await supabase
      .from("comments")
      .insert([{ post_id: post.id, user_id: userData.user.id, comment }])
      .select()
      .single();

    if (error) {
      console.log("Comment insert error:", error.message);
      return;
    }

    // Fetch username for the new comment
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userData.user.id)
      .single();

    setComments((prev) => [
      ...prev,
      { ...newComment, username: profile?.username || "User" }
    ]);
    setComment("");
  };

  // ===== Delete comment =====
  const deleteComment = async (id) => {
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    getCurrentUser();
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
          style={{
            width: "100%",
            borderRadius: "0.625rem",
            marginTop: "0.5rem",
            objectFit: "cover"
          }}
        />
      )}

      <p>{post.description}</p>

      {/* LIKE */}
      <div style={{ display: "flex", marginTop: "0.5rem" }}>
        <button
          style={{
            width: "5rem",
            padding: "0.6rem 0",
            borderRadius: "0.5rem",
            cursor: "pointer"
          }}
          onClick={likePost}
        >
          👍 {likes}
        </button>
      </div>

      {/* COMMENT INPUT */}
      <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add comment"
          style={{
            flex: 1,
            padding: "0.6rem",
            borderRadius: "0.5rem"
          }}
        />
        <button
          style={{
            width: "6rem",
            borderRadius: "0.5rem"
          }}
          onClick={addComment}
        >
          Comment
        </button>
      </div>

      {/* COMMENTS LIST */}
      {comments.map((c) => (
        <div key={c.id} style={{ marginTop: "0.3rem" }}>
          <strong>{c.username}</strong>
          <p>{c.comment}</p>
          {currentUser === c.user_id && (
            <button
              style={{ fontSize: "0.7rem" }}
              onClick={() => deleteComment(c.id)}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostCard;
