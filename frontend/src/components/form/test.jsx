import React, { useState, useEffect, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreVertical,
  Subtitles,
  Share2,
  VolumeX,
  Volume2,
  UserPlus,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HeartButton } from "@/components/pageComponents/HeartButton";
import ImageSwiper from "../animata/image/ImageSwiper";

const posts = [
  // ... (posts data remains unchanged)
];

const useIntersectionObserver = (callback) => {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });

    return () => {
      observerRef.current.disconnect();
    };
  }, [callback]);

  const observe = useCallback((element) => {
    if (element) observerRef.current.observe(element);
  }, []);

  const unobserve = useCallback((element) => {
    if (element) observerRef.current.unobserve(element);
  }, []);

  return { observe, unobserve };
};

const MyComponent = ({ post }) => {
  const [muted, setMuted] = useState(true);
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
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        observe(video);
      }
    });

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          unobserve(video);
        }
      });
    };
  }, [observe, unobserve]);

  const handleStopPropagation = (event) => {
    event.stopPropagation();
  };

  const imageExtensions = ["jpeg", "jpg", "png", "gif"];
  const videoExtensions = ["mp4", "avi", "mkv", "mov"];

  const isVideo = (media) => {
    return videoExtensions.some((ext) => media.toLowerCase().includes(ext));
  };

  const isImage = (media) => {
    return imageExtensions.some((ext) => media.toLowerCase().includes(ext));
  };

  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {posts.map((item) => (
        <Card
          key={item.id}
          className="flex flex-col h-[70vh] max-w-[60vw] rounded-lg border p-3 text-left text-sm transition-all"
        >
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex flex-col h-full">
                <CardHeader className="p-2">
                  {/* ... (CardHeader content remains unchanged) */}
                </CardHeader>
                <CardContent className="p-0 flex flex-col flex-grow">
                  <div className="px-1 py-1 text-xs font-medium">
                    {item.content}
                  </div>
                  {item.medias.length > 0 ? (
                    <div
                      onClick={handleStopPropagation}
                      className="media-wrapper flex-grow w-full flex justify-center items-center overflow-hidden"
                    >
                      <Carousel className="w-full max-w-sm h-full">
                        <CarouselContent>
                          {item.medias.map((media, index) => (
                            <CarouselItem key={index}>
                              <div className="p-1 h-full">
                                <Card className="h-full">
                                  <CardContent className="flex relative items-center justify-center p-0 h-full">
                                    {isVideo(media) ? (
                                      <video
                                        src={media}
                                        ref={(el) => {
                                          if (el) {
                                            videoRefs.current[
                                              `${item.id}-${index}`
                                            ] = el;
                                          }
                                        }}
                                        className="object-contain h-auto max-h-[300px] w-full"
                                        onClick={() => setMuted(!muted)}
                                        alt="media"
                                        muted={muted}
                                        loop
                                        playsInline
                                      />
                                    ) : (
                                      <img
                                        src={media}
                                        className="rounded-sm object-contain h-auto max-h-[300px] w-full"
                                        alt="media"
                                      />
                                    )}
                                    <span className="absolute bottom-0 left-0 text-sm text-muted-foreground p-1">
                                      {`${index + 1} of ${item.medias.length}`}
                                    </span>
                                    {isVideo(media) ? (
                                      <span className="absolute bottom-0 right-0 text-sm text-muted-foreground p-1">
                                        {muted ? <VolumeX /> : <Volume2 />}
                                      </span>
                                    ) : null}
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="flex flex-col w-full justify-between items-center p-0 mt-auto">
                  {/* ... (CardFooter content remains unchanged) */}
                </CardFooter>
              </div>
            </DialogTrigger>
            <DialogContent className="flex justify-center items-center">
              {/* ... (DialogContent remains unchanged) */}
            </DialogContent>
          </Dialog>
        </Card>
      ))}
    </div>
  );
};

export default MyComponent;
