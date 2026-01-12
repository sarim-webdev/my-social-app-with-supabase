import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("User");

  // ===== Username =====
  const fetchUsername = async () => {
    if (!post.user_id) return;
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", post.user_id)
      .single();

    if (data) setUsername(data.username);
  };

  // ===== Likes count =====
  const fetchLikes = async () => {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id);

    setLikes(data?.length || 0);
  };

  // ===== Comments =====
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, comment")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    setComments(data || []);
  };

  // ===== LIKE POST (Optimistic UI) =====
  const likePost = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return alert("Login required");

    const user_id = userData.user.id;

    const { error } = await supabase.from("likes").insert([
      { post_id: post.id, user_id }
    ]);

    if (error) {
      console.log("Like error:", error.message);
      return;
    }

    // 🔥 instant UI update
    setLikes((prev) => prev + 1);
  };

  // ===== ADD COMMENT (Optimistic UI) =====
  const addComment = async () => {
    if (!comment.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return alert("Login required");

    const user_id = userData.user.id;

    const { data, error } = await supabase
      .from("comments")
      .insert([{ post_id: post.id, user_id, comment }])
      .select()
      .single();

    if (error) {
      console.log("Comment error:", error.message);
      return;
    }

    // 🔥 instant UI update
    setComments((prev) => [...prev, data]);
    setComment("");
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

      {/* COMMENT */}
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
        <p key={c.id} style={{ margin: "0.3rem 0" }}>
          💬 {c.comment}
        </p>
      ))}
    </div>
  );
};

export default PostCard;
