import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

const Sidebar = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const goToCreatePost = () => {
    navigate("/create-post"); // Redirect to create post page
  };

  return (
    <div className="sidebar">
      <h3>My Social App</h3>
      <button onClick={goToCreatePost}>Create Post</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Sidebar;
