import { useContext, useState, useEffect } from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentInputForm } from "../form/CommentInputForm";
import { Trash2 } from "lucide-react";

const pluralize = (count, singular, plural) => count === 1 ? singular : plural;

export const PostComment = ({ item }) => {
  const [, setPosts] = useContext(Context);
  const localUser = useSelector((state) => state.user);
  const [authorMap, setAuthorMap] = useState({});

  useEffect(() => {
    const fetchAuthors = async () => {
      const userNames = [...new Set(item.comments.map((c) => c.userName))];
      if (userNames.length === 0) return;
      
      try {
        const authorData = {};
        for (const userName of userNames) {
          try {
            const res = await api.post("/user/get-user", { userName });
            authorData[userName] = {
              firstName: res.data.firstName,
              lastName: res.data.lastName,
              avatar: res.data.avatar,
              fullName: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim(),
            };
          } catch {
            authorData[userName] = { fullName: userName };
          }
        }
        setAuthorMap(authorData);
      } catch (err) {
        console.error("Error fetching comment authors:", err);
      }
    };
    
    if (item.comments.length > 0) {
      fetchAuthors();
    }
  }, [item.comments]);

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete("/posts/delete-comment", {
        data: { postId: item._id, commentId }
      });
      
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

  const getCommentAuthor = (comment) => {
    const author = authorMap[comment.userName];
    return author?.fullName || comment.userName;
  };

  const getCommentInitials = (comment) => {
    const author = authorMap[comment.userName];
    if (author?.firstName && author?.lastName) {
      return `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`.toUpperCase();
    }
    return comment.userName?.slice(0, 2).toUpperCase() || 'U';
  };

  const getAvatarUrl = (comment) => {
    const author = authorMap[comment.userName];
    if (author?.avatar) {
      if (author.avatar.startsWith("/")) {
        return `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${author.avatar}`;
      }
      return author.avatar;
    }
    return null;
  };

  return (
    <div className="w-full">
      <ScrollArea className="h-56 w-full overflow-x-hidden">
        {item.comments.map((comment) => (
          <div key={comment._id}>
            <Separator className="my-2" />
            <div className="text-sm p-2 flex flex-row justify-between items-start gap-2">
              <div className="left flex flex-row items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(comment)} />
                    <AvatarFallback>{getCommentInitials(comment)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col justify-between items-start min-w-0 flex-1">
                  <div className="font-medium">{getCommentAuthor(comment)}</div>
                  <div className="text-xs text-muted-foreground">@{comment.userName}</div>
                  <div className="text-wrap break-words mt-1">{comment.content}</div>
                </div>
              </div>
              <div className="right flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {comment.likes || 0} {pluralize(comment.likes || 0, 'like', 'likes')}
                </span>
                {(comment.userName === localUser.userName || item.userName === localUser.userName) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteComment(comment._id)}
                    aria-label="Delete comment"
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
    </div>
  );
};
