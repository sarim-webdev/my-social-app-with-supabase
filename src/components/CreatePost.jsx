import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const CreatePost = ({ refresh }) => {
  const [image, setImage] = useState(null);
  const [desc, setDesc] = useState("");

  const uploadPost = async () => {
    if (!image) return alert("Image required");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const fileName = `${Date.now()}-${image.name}`;
    const { data, error } = await supabase.storage
      .from("posts")
      .upload(fileName, image);

    if (error) {
      console.log("Upload error:", error);
      return;
    }

    const imageUrl = supabase.storage
      .from("posts")
      .getPublicUrl(fileName).data.publicUrl;

    await supabase.from("posts").insert({
      user_id: user.id,
      image_url: imageUrl,
      description: desc,
    });

    setImage(null);
    setDesc("");
    refresh();
  };

  return (
    <div className="post-card">
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <textarea
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={uploadPost}>Upload Post</button>
    </div>
  );
};

export default CreatePost;
