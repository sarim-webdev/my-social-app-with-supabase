import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    // Simple fetch without join
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
      return;
    }

    console.log("POSTS FROM DB:", data); // Debug line
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <p style={{ color: "white", marginBottom: "1rem" }}>
          TOTAL POSTS: {posts.length}
        </p>

        {posts.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            No posts yet.
          </p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
};

export default Home;
