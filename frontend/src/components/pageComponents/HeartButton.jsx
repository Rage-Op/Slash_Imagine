import { useState, useContext } from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
import api from "@/lib/axios";

export const HeartButton = ({ postId, initialLiked }) => {
  const [isChecked, setIsChecked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const localUser = useSelector((state) => state.user);
  const [, setPosts] = useContext(Context);
  
  const handleChange = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const { data: post } = await api.get(`/posts/get-post/${postId}`);

      if (post.likedByUsers.includes(localUser.userName)) {
        const res = await api.post("/posts/remove-Like", { postId });
        if (res.status === 200) {
          setIsChecked(false);
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    likes: p.likes - 1,
                    likedByUsers: p.likedByUsers.filter((u) => u !== localUser.userName),
                  }
                : p
            )
          );
        }
      } else {
        const res = await api.post("/posts/add-Like", { postId });
        if (res.status === 200) {
          setIsChecked(true);
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    likes: p.likes + 1,
                    likedByUsers: [...p.likedByUsers, localUser.userName],
                  }
                : p
            )
          );
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      type="button"
      className="LikeContainer"
      onClick={handleChange}
      disabled={isLoading}
      aria-label={isChecked ? "Unlike post" : "Like post"}
      aria-pressed={isChecked}
    >
      <div className={`checkmark transform scale-[0.6] ${isChecked ? 'checked' : ''}`}>
        <svg viewBox="0 0 256 256" role="img" aria-hidden="true">
          <rect fill="none" height="256" width="256"></rect>
          <path
            d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z"
            strokeWidth="30px"
            stroke={isChecked ? "red" : "gray"}
            fill={isChecked ? "red" : "none"}
          ></path>
        </svg>
      </div>
    </button>
  );
};
