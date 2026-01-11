import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

const CreatePostPage = () => {
  const [imageUrl, setImageUrl] = useState(""); // URL input
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();

  const uploadPost = async () => {
    if (!imageUrl) return alert("Image URL is required");

    // Get logged-in user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.log("User fetch error:", userError);
      return alert("User not logged in");
    }
    const user = userData.user;

    // Insert post into "posts" table
    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      image_url: imageUrl,
      description: desc,
    });

    if (insertError) {
      console.log("Insert post error:", insertError.message);
      return alert("Failed to create post: " + insertError.message);
    }

    alert("Post uploaded successfully!");
    navigate("/home"); // Redirect to home page after upload
  };

  return (
    <div className="create-post-page">
      <h2>Create Post</h2>
      <input
        type="text"
        placeholder="Enter Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={uploadPost}>Upload Post</button>
    </div>
  );
};

export default CreatePostPage;
