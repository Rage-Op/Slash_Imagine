import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, MessageCircle, VolumeX, Volume2, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HeartButton } from "@/components/pageComponents/HeartButton";
import { ShareButton } from "./ShareButton";
import { PostComment } from "./PostComment";

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
  const [posts, setPosts] = useContext(Context);
  const localUser = useSelector((state) => state.user);
  const [muted, setMuted] = useState(true);
  const [deletePostId, setDeletePostId] = useState(null);
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

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observe(video);
    });

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) unobserve(video);
      });
    };
  }, [observe, unobserve, posts]);

  const handleDeletePost = async (postId) => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/posts/delete-post`;
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": localUser.token,
      };
      await axios.delete(url, { headers, data: { postId } });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
    setDeletePostId(null);
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
                          <AvatarFallback>
                            {item.userName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0">
                          <div className="text-sm font-medium">{item.fullName || item.userName}</div>
                          <div className="text-xs text-muted-foreground">@{item.userName}</div>
                        </div>
                      </div>
                      <div className="ml-auto text-xs flex items-center gap-2">
                        {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        {item.userName === localUser.userName && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={handleStopPropagation}>
                              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
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
                  
                  <CardFooter className="p-2 pt-0">
                    <Separator className="mb-2" />
                    <div className="flex w-full justify-around items-center">
                      <div onClick={handleStopPropagation}>
                        <HeartButton
                          initialLiked={item.likedByUsers?.includes(localUser.userName)}
                          postId={item._id}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{item.comments?.length || 0}</span>
                      </div>
                      <div onClick={handleStopPropagation}>
                        <ShareButton postId={item._id} />
                      </div>
                    </div>
                  </CardFooter>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={item.author?.avatar ? getMediaUrl(item.author.avatar) : undefined} />
                      <AvatarFallback>{item.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                    <span>{item.likes || 0} likes</span>
                    <span>{item.comments?.length || 0} comments</span>
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
