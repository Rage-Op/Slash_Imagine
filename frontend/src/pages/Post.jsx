import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const pluralize = (count, singular, plural) => count === 1 ? singular : plural;

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [commentAuthors, setCommentAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const localUser = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/get-post/${postId}`);
        setPost(res.data);
        
        // Fetch comment authors
        if (res.data.comments && res.data.comments.length > 0) {
          const userNames = [...new Set(res.data.comments.map((c) => c.userName))];
          const authorData = {};
          for (const userName of userNames) {
            try {
              const authorRes = await api.post("/user/get-user", { userName });
              authorData[userName] = {
                firstName: authorRes.data.firstName,
                lastName: authorRes.data.lastName,
                avatar: authorRes.data.avatar,
                fullName: `${authorRes.data.firstName || ''} ${authorRes.data.lastName || ''}`.trim(),
              };
            } catch {
              authorData[userName] = { fullName: userName };
            }
          }
          setCommentAuthors(authorData);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const imageExtensions = ["jpeg", "jpg", "png", "gif"];
  const videoExtensions = ["mp4", "avi", "mkv", "mov"];

  const isVideo = (media) => {
    return videoExtensions.some((ext) => media.toLowerCase().includes(ext));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-lg text-red-500">{error || "Post not found"}</div>
        <Button onClick={() => navigate("/home")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate("/home")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage
                  src={post.author?.avatar 
                    ? post.author.avatar.startsWith("/")
                      ? `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${post.author.avatar}`
                      : post.author.avatar
                    : undefined}
                  alt={post.author?.fullName || post.userName}
                />
                <AvatarFallback>
                  {post.author?.firstName && post.author?.lastName
                    ? `${post.author.firstName.charAt(0)}${post.author.lastName.charAt(0)}`.toUpperCase()
                    : post.userName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {post.author?.fullName || post.userName}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{post.userName} &middot;{" "}
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{post.title}</h1>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-lg whitespace-pre-wrap">{post.content}</p>

            {post.medias && post.medias.length > 0 && (
              <div className="flex justify-center">
                <Carousel className="w-full max-w-lg">
                  <CarouselContent>
                    {post.medias.map((media, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          {isVideo(media) ? (
                            <video
                              src={media.startsWith("/") ? `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${media}` : media}
                              controls
                              className="w-full rounded-lg"
                            />
                          ) : (
                            <img
                              src={media.startsWith("/") ? `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${media}` : media}
                              alt={`Post media ${index + 1}`}
                              className="w-full rounded-lg object-contain max-h-[500px]"
                            />
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {post.medias.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="py-4">
            <div className="flex gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span>{post.likes || 0} {pluralize(post.likes || 0, 'like', 'likes')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{post.commentsCount || 0} {pluralize(post.commentsCount || 0, 'comment', 'comments')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                <span>{post.shares || 0} {pluralize(post.shares || 0, 'share', 'shares')}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {post.comments && post.comments.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <h2 className="text-xl font-semibold">Comments</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.comments.map((comment) => {
                const author = commentAuthors[comment.userName] || {};
                const avatarUrl = author.avatar
                  ? author.avatar.startsWith("/")
                    ? `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${author.avatar}`
                    : author.avatar
                  : undefined;
                const initials = author.firstName && author.lastName
                  ? `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`.toUpperCase()
                  : comment.userName?.slice(0, 2).toUpperCase();
                
                return (
                <div key={comment._id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{author.fullName || comment.userName}</div>
                    <div className="text-xs text-muted-foreground">@{comment.userName}</div>
                    <div className="text-sm mt-1">{comment.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostPage;
