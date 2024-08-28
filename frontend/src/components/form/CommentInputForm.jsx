import React, { useState, useContext } from "react";
import { Context } from "@/pages/Home";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { commentSchema } from "./../../schemas/comment_schema";

export const CommentInputForm = ({ postId }) => {
  const [comment, setComment] = useState("");
  const [posts, setPosts] = useContext(Context);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentSchema),
  });

  const localUser = useSelector((state) => state.user);
  const handleAddComment = async () => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/posts/add-comment`;
      const body = {
        postId: postId,
        content: comment,
      };
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": `${localUser.token}`,
      };
      const response = await axios.post(url, body, { headers });
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.data.savedComment],
            };
          }
          return post;
        });
        return updatedPosts;
      });
      setComment("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(handleAddComment)}
        className="absolute bottom-0 left-0 flex w-full max-w-sm items-center space-x-2 mx-2"
      >
        <Input
          type="text"
          value={comment}
          onChange={(event) => {
            if (event.target.value.length <= 250) {
              setComment(event.target.value);
            }
          }}
          className="rounded-full w-full"
          placeholder=""
        />
        <Button
          type="submit"
          onClick={handleAddComment}
          className="rounded-full aspect-square p-0"
        >
          <Send />
        </Button>
      </form>
    </>
  );
};
