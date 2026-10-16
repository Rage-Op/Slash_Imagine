import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, MessageCircle, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HeartButton } from "@/components/pageComponents/HeartButton";
import { ShareButton } from "./ShareButton";
import { PostComment } from "./PostComment";

const pluralize = (count, singular, plural) => count === 1 ? singular : plural;

const useIntersectionObserver = (callback) => {
  const observerRef = useRef(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.7,
    });

    return () => observerRef.current?.disconnect();
  }, [callback]);

  const observe = useCallback((element) => {
    if (element) observerRef.current?.observe(element);
  }, []);

  const unobserve = useCallback((element) => {
    if (element) observerRef.current?.unobserve(element);
  }, []);

  return { observe, unobserve };
};

const PostFeedView = () => {
  const [posts, setPosts, { loadMore, hasMore }] = useContext(Context);
  const localUser = useSelector((state) => state.user);
  const [muted, setMuted] = useState(true);
  const [deletePostId, setDeletePostId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const videoRefs = useRef({});

  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play();
      } else {
        video.pause();
      }
    });
  }, []);

  const { observe, unobserve } = useIntersectionObserver(handleIntersection);

  useEffect(() => {
    if (!observe || !unobserve) return;

    const currentRefs = videoRefs.current;
    Object.values(currentRefs).forEach((video) => {
      if (video) observe(video);
    });

    return () => {
      Object.values(currentRefs).forEach((video) => {
        if (video) unobserve(video);
      });
    };
  }, [observe, unobserve, posts]);

  const handleDeletePost = async (postId) => {
    try {
      await api.delete("/posts/delete-post", { data: { postId } });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
    setDeletePostId(null);
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadMore();
    } catch (err) {
      console.error("Error loading more posts:", err);
    }
    setLoadingMore(false);
  };

  const getInitials = (item) => {
    const firstName = item.author?.firstName || item.fullName?.split(' ')[0] || '';
    const lastName = item.author?.lastName || item.fullName?.split(' ')[1] || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return item.userName?.slice(0, 2).toUpperCase() || 'U';
  };

  const handleStopPropagation = (event) => event.stopPropagation();

  const videoExtensions = ["mp4", "avi", "mkv", "mov"];
  const isVideo = (media) => videoExtensions.some((ext) => media.toLowerCase().includes(ext));

  const getMediaUrl = (media) => {
    if (media.startsWith("/")) {
      return `${import.meta.env.VITE_BASE_URL?.replace("/slash_imagine/api/v1", "")}${media}`;
    }
    return media;
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 pt-0 mb-72">
        {posts.map((item) => (
          <Card key={item._id} className="flex flex-col max-w-[60vw] rounded-lg border p-3">
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex flex-col cursor-pointer">
                  <CardHeader className="p-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={item.author?.avatar ? getMediaUrl(item.author.avatar) : undefined}
                          />
                          <AvatarFallback>{getInitials(item)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0">
                          <div className="text-sm font-medium">{item.fullName || item.userName}</div>
                          <div className="text-xs text-muted-foreground">@{item.userName}</div>
                        </div>
                      </div>
                      <div className="ml-auto text-xs flex items-center gap-2 flex-shrink-0">
                        {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        {item.userName === localUser.userName && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={handleStopPropagation}>
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Post options">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  handleStopPropagation(e);
                                  setDeletePostId(item._id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-2">
                    {item.title && <h3 className="font-semibold mb-2">{item.title}</h3>}
                    <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                    
                    {item.medias && item.medias.length > 0 && (
                      <div onClick={handleStopPropagation} className="mt-4 flex justify-center">
                        <Carousel className="w-full max-w-sm">
                          <CarouselContent>
                            {item.medias.map((media, index) => (
                              <CarouselItem key={index}>
                                <div className="p-1">
                                  {isVideo(media) ? (
                                    <video
                                      src={getMediaUrl(media)}
                                      ref={(el) => { if (el) videoRefs.current[`${item._id}-${index}`] = el; }}
                                      className="w-full rounded-lg max-h-[300px] object-contain"
                                      muted={muted}
                                      loop
                                      playsInline
                                      onClick={() => setMuted(!muted)}
                                    />
                                  ) : (
                                    <img
                                      src={getMediaUrl(media)}
                                      alt={`Media ${index + 1}`}
                                      className="w-full rounded-lg max-h-[300px] object-contain"
                                    />
                                  )}
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {item.medias.length > 1 && (
                            <>
                              <CarouselPrevious />
                              <CarouselNext />
                            </>
                          )}
                        </Carousel>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-2 pt-0 flex flex-col">
                    <Separator className="mb-2 w-full" />
                    <div className="flex w-full justify-between items-center gap-2 px-2">
                      <div onClick={handleStopPropagation} className="flex items-center gap-1">
                        <HeartButton
                          initialLiked={item.likedByUsers?.includes(localUser.userName)}
                          postId={item._id}
                          likeCount={item.likes || 0}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 text-muted-foreground h-8 px-2"
                        aria-label={`${item.comments?.length || 0} ${pluralize(item.comments?.length || 0, 'comment', 'comments')}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{item.comments?.length || 0} {pluralize(item.comments?.length || 0, 'comment', 'comments')}</span>
                      </Button>
                      <div onClick={handleStopPropagation} className="flex items-center gap-1">
                        <ShareButton postId={item._id} shareCount={item.shares || 0} />
                      </div>
                    </div>
                  </CardFooter>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={item.author?.avatar ? getMediaUrl(item.author.avatar) : undefined} />
                      <AvatarFallback>{getInitials(item)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{item.fullName || item.userName}</div>
                      <div className="text-xs text-muted-foreground font-normal">@{item.userName}</div>
                    </div>
                  </DialogTitle>
                  <DialogDescription className="sr-only">Post details</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {item.title && <h2 className="text-xl font-bold">{item.title}</h2>}
                  <p className="whitespace-pre-wrap">{item.content}</p>
                  
                  {item.medias && item.medias.length > 0 && (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {item.medias.map((media, index) => (
                          <CarouselItem key={index}>
                            {isVideo(media) ? (
                              <video
                                src={getMediaUrl(media)}
                                controls
                                className="w-full rounded-lg max-h-[400px] object-contain"
                              />
                            ) : (
                              <img
                                src={getMediaUrl(media)}
                                alt={`Media ${index + 1}`}
                                className="w-full rounded-lg max-h-[400px] object-contain"
                              />
                            )}
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {item.medias.length > 1 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                  )}
                  
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{item.likes || 0} {pluralize(item.likes || 0, 'like', 'likes')}</span>
                    <span>{item.comments?.length || 0} {pluralize(item.comments?.length || 0, 'comment', 'comments')}</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-4">Comments</h3>
                    <PostComment item={item} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
        
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button 
              variant="outline" 
              onClick={loadMorePosts}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeletePost(deletePostId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostFeedView;
