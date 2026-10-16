import { useState, useContext } from "react";
import { Context } from "@/pages/Home";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { commentSchema } from "@/schemas/comment_schema";

export const CommentInputForm = ({ postId }) => {
  const [comment, setComment] = useState("");
  const [, setPosts] = useContext(Context);
  const { handleSubmit } = useForm({
    resolver: zodResolver(commentSchema),
  });

  const handleAddComment = async () => {
    try {
      const response = await api.post("/posts/add-comment", {
        postId,
        content: comment,
      });
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
      console.error("Error adding comment:", error.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(handleAddComment)}
      className="flex w-full items-center gap-2 mt-4"
    >
      <Input
        type="text"
        value={comment}
        onChange={(event) => {
          if (event.target.value.length <= 250) {
            setComment(event.target.value);
          }
        }}
        className="rounded-full flex-1"
        placeholder="Add a comment..."
      />
      <Button
        type="submit"
        onClick={handleAddComment}
        className="rounded-full aspect-square p-0 flex-shrink-0"
        aria-label="Send comment"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
