import React, { useState, useContext } from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
import axios from "axios";

export const HeartButton = ({ postId, initialLiked }) => {
  const [isChecked, setIsChecked] = useState(initialLiked);
  const localUser = useSelector((state) => state.user);
  const [posts, setPosts] = useContext(Context);
  const handleChange = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": `${localUser.token}`,
      };
      const body = {
        postId: postId,
      };
      const { data: post } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/posts/get-post/${postId}`,
        { headers }
      );

      if (post.likedByUsers.includes(localUser.userName)) {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/posts/remove-Like`,
          body,
          { headers }
        );
        if (res.status == 200) {
          setIsChecked(false);
          // remove the user from the likedByUsers array of the post and decrease the likes by 1 without changing anything else from the posts array
          setPosts((prevPosts) => {
            return prevPosts.map((post) => {
              if (post._id === postId) {
                console.log("post found");

                return {
                  ...post,
                  likes: post.likes - 1,
                  likedByUsers: post.likedByUsers.filter(
                    (user) => user !== localUser.userName
                  ),
                };
              }
              return post;
            });
          });
        }
        console.log(res.data);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/posts/add-Like`,
          body,
          { headers }
        );
        if (res.status == 200) {
          setIsChecked(true);
          // remove the user from the likedByUsers array of the post and decrease the likes by 1 without changing anything else from the posts array
          setPosts((prevPosts) => {
            return prevPosts.map((post) => {
              if (post._id === postId) {
                console.log("post found");
                return {
                  ...post,
                  likes: post.likes + 1,
                  likedByUsers: [...post.likedByUsers, localUser.userName],
                };
              }
              return post;
            });
          });
        }
        console.log(res.data);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // setInterval(() => {
  //   if (
  //     posts
  //       .find((post) => post._id === postId)
  //       .likedByUsers.includes(localUser.userName) &&
  //     isChecked === false
  //   ) {
  //     setIsChecked(true);
  //     console.log("isChecked changed to" + isChecked);
  //   }

  //   if (
  //     !posts
  //       .find((post) => post._id === postId)
  //       .likedByUsers.includes(localUser.userName) &&
  //     isChecked === true
  //   ) {
  //     setIsChecked(false);
  //     console.log("isChecked changed to" + isChecked);
  //   }
  // }, 5000);

  return (
    <label className="LikeContainer">
      <input checked={isChecked} onChange={handleChange} type="checkbox" />
      <div className="checkmark transform scale-[0.6]">
        <svg viewBox="0 0 256 256">
          <rect fill="none" height="256" width="256"></rect>
          <path
            d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z"
            strokeWidth="30px"
            stroke="gray"
            fill="none"
          ></path>
        </svg>
      </div>
    </label>
  );
};
