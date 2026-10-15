import React, { useContext } from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentInputForm } from "../form/CommentInputForm";
import { Trash2 } from "lucide-react";

export const PostComment = ({ item }) => {
  const [posts, setPosts] = useContext(Context);
  const localUser = useSelector((state) => state.user);

  const handleDeleteComment = async (commentId) => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/posts/delete-comment`;
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": localUser.token,
      };
      const body = {
        postId: item._id,
        commentId: commentId,
      };
      
      await axios.delete(url, { headers, data: body });
      
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === item._id) {
            return {
              ...post,
              comments: post.comments.filter((c) => c._id !== commentId),
              commentsCount: Math.max(0, (post.commentsCount || post.comments.length) - 1),
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <>
      <ScrollArea className="h-56 grow w-full">
        {item.comments.map((comment) => (
          <div key={comment._id}>
            <Separator className="my-2" />
            <div className="text-sm p-2 flex flex-row justify-between items-center">
              <div className="left flex flex-row items-start gap-4">
                <div className="p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.userName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col justify-between items-start">
                  <div className="font-medium">{comment.userName}</div>
                  <div className="text-wrap">{comment.content}</div>
                </div>
              </div>
              <div className="right flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {comment.likes || 0} likes
                </span>
                {(comment.userName === localUser.userName || item.userName === localUser.userName) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <CommentInputForm postId={item._id} />
    </>
  );
};
