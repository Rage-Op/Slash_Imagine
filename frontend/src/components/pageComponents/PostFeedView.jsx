import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Context } from "@/pages/Home";
import { useSelector } from "react-redux";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HeartButton } from "@/components/pageComponents/HeartButton";
import { ShareButton } from "./ShareButton";
import { PostComment } from "./PostComment";

const posts = [
  {
    _id: "1",
    fullName: "William Smith",
    email: "williamsmith@example.com",
    userName: "will_smits123",
    content:
      "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share.",
    createdAt: "2023-10-22T09:00:00",
    medias: [
      "https://assets.lummi.ai/assets/Qma1aBRXFsApFohRJrpJczE5QXGY6HhHKz24ybuw1khbou?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmZBpAeh18DHxVNEEcJErt1UXGjZYCedSidJ6cybrDZdeS?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmbMZFEfk2qwQkkmXYncpvHapkNQF5HuTrcascJC7edpfW?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmXm6HVi3wwGy3jaCmECfoL8AULPerjQQh6abKTVhFMewK?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmRy3tpFDCbgA3CQgRpySTGN6tNdomQE96rMpV31HeBUUd?auto=format&w=500",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    ],
    comments: [
      {
        id: "c1",
        user: "JohnDoe",
        content: "Great idea! Looking forward to the meeting.",
        likes: 5,
      },
      {
        id: "c2",
        user: "JaneSmith",
        content: "Can we discuss the budget as well?",
        likes: 3,
      },
      {
        id: "c3",
        user: "MikeJohnson",
        content: "I'll prepare a presentation for the meeting.",
        likes: 7,
      },
      {
        id: "c4",
        user: "EmilyBrown",
        content: "What time should we schedule the meeting?",
        likes: 2,
      },
      {
        id: "c5",
        user: "DavidLee",
        content:
          "I have some concerns about the timeline. Can we address that?",
        likes: 4,
      },
      {
        id: "c6",
        user: "SarahWilson",
        content: "Looking forward to hearing your ideas, William!",
        likes: 6,
      },
      {
        id: "c7",
        user: "RobertTaylor",
        content: "Should we invite the client to join us?",
        likes: 3,
      },
      {
        id: "c8",
        user: "LisaAnderson",
        content: "I'll bring the latest project reports to the meeting.",
        likes: 5,
      },
      {
        id: "c9",
        user: "KevinMoore",
        content: "Can we also discuss resource allocation?",
        likes: 4,
      },
      {
        id: "c10",
        user: "AmyClark",
        content: "I have some new market research to share.",
        likes: 7,
      },
      {
        id: "c11",
        user: "ThomasWhite",
        content: "Let's make sure we set clear action items after the meeting.",
        likes: 6,
      },
      {
        id: "c12",
        user: "OliviaMartin",
        content: "I'll update the project management software before we meet.",
        likes: 3,
      },
      {
        id: "c13",
        user: "DanielHarris",
        content: "Can we review the risk assessment during the meeting?",
        likes: 5,
      },
      {
        id: "c14",
        user: "SophiaLewis",
        content: "I have some ideas for improving our workflow.",
        likes: 4,
      },
      {
        id: "c15",
        user: "JamesWilson",
        content: "Let's not forget to discuss the upcoming milestones.",
        likes: 6,
      },
      {
        id: "c16",
        user: "EmmaThompson",
        content: "I'll prepare a summary of client feedback for the meeting.",
        likes: 7,
      },
      {
        id: "c17",
        user: "ChristopherBaker",
        content: "Can we also touch base on the marketing strategy?",
        likes: 3,
      },
      {
        id: "c18",
        user: "AvaRobinson",
        content: "I have some concerns about the current testing phase.",
        likes: 4,
      },
      {
        id: "c19",
        user: "WilliamTurner",
        content: "Let's make sure we align on the project priorities.",
        likes: 5,
      },
      {
        id: "c20",
        user: "GraceMitchell",
        content: "I'll bring the latest design mockups to the meeting.",
        likes: 6,
      },

      {
        id: "c21",
        user: "JaneSmith",
        content: "Can we discuss the budget as well?",
        likes: 5,
      },
    ],
  },
  {
    _id: "2",
    fullName: "William Smith",
    title: "William Smith",
    email: "williamsmith@example.com",
    userName: "will_smis123",
    content:
      "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
    createdAt: "2023-10-22T09:00:00",
    medias: [
      "https://assets.lummi.ai/assets/Qma1aBRXFsApFohRJrpJczE5QXGY6HhHKz24ybuw1khbou?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmZBpAeh18DHxVNEEcJErt1UXGjZYCedSidJ6cybrDZdeS?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmbMZFEfk2qwQkkmXYncpvHapkNQF5HuTrcascJC7edpfW?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmXm6HVi3wwGy3jaCmECfoL8AULPerjQQh6abKTVhFMewK?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmRy3tpFDCbgA3CQgRpySTGN6tNdomQE96rMpV31HeBUUd?auto=format&w=500",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    ],
    comments: [
      {
        id: "c3",
        user: "AliceJohnson",
        content: "I'll prepare a summary of our progress so far.",
        likes: 5,
      },
      {
        id: "c4",
        user: "BobWilliams",
        content: "Should we invite the client to this meeting?",
        likes: 5,
      },
      {
        id: "c5",
        user: "EvaGreen",
        content: "I have some concerns about the timeline. Let's discuss.",
        likes: 5,
      },
    ],
  },
  {
    _id: "3",
    fullName: "William Smith",
    title: "William Smith",
    email: "williamsmith@example.com",
    userName: "will_mits123",
    content:
      "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
    createdAt: "2023-10-22T09:00:00",
    medias: [
      "https://assets.lummi.ai/assets/Qma1aBRXFsApFohRJrpJczE5QXGY6HhHKz24ybuw1khbou?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmZBpAeh18DHxVNEEcJErt1UXGjZYCedSidJ6cybrDZdeS?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmbMZFEfk2qwQkkmXYncpvHapkNQF5HuTrcascJC7edpfW?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmXm6HVi3wwGy3jaCmECfoL8AULPerjQQh6abKTVhFMewK?auto=format&w=500",
      "https://assets.lummi.ai/assets/QmRy3tpFDCbgA3CQgRpySTGN6tNdomQE96rMpV31HeBUUd?auto=format&w=500",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    ],
    comments: [
      {
        id: "c6",
        user: "CharlieBrown",
        content: "I've got some new market research to share.",
        likes: 5,
      },
      {
        id: "c7",
        user: "DianaClark",
        content: "Can we also discuss the new feature requests?",
        likes: 5,
      },
      {
        id: "c8",
        user: "FrankMiller",
        content: "I'll bring the latest design mockups.",
        likes: 5,
      },
      {
        id: "c9",
        user: "GraceLee",
        content: "Looking forward to hearing your ideas, William!",
        likes: 5,
      },
    ],
  },
];

const useIntersectionObserver = (callback) => {
  const observerRef = useRef(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      console.error("IntersectionObserver is not supported by this browser.");
      return;
    }

    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.7,
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

const MyComponent = () => {
  const [posts, setPosts] = useContext(Context);
  console.log(posts);

  const localUser = useSelector((state) => state.user);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const playingStateRefs = useRef({});

  const handlePlayPause = (event) => {
    const video = event.target;
    const id = video.getAttribute("data-id");
    if (video.paused) {
      video.play();
      playingStateRefs.current[id] = true;
      setIsPlaying(true);
    } else {
      video.pause();
      playingStateRefs.current[id] = false;
      setIsPlaying(false);
    }
  };

  const videoRefs = useRef([]);
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
    <div className="flex flex-col gap-2 p-4 pt-0 mb-72">
      {posts.map((item) => (
        <Card
          key={item.userName + item._id}
          className="flex flex-col h-[70vh] max-w-[60vw] rounded-lg border p-3 text-left text-sm transition-all"
        >
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex flex-col h-full">
                <CardHeader className="p-2">
                  <div className="flex items-center">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0">
                        <div className="text-sm font-medium">
                          {item.fullName}
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {item.userName}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "ml-auto text-xs flex flex-row justify-between items-center"
                      )}
                    >
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full ml-2"
                        onClick={handleStopPropagation}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col flex-grow">
                  <div className="px-1 py-1 text-md">{item.content}</div>
                  {item.medias.length > 0 ? (
                    <div
                      onClick={handleStopPropagation}
                      className="media-wrapper flex-grow w-full flex justify-center items-center overflow-hidden"
                    >
                      <Carousel className="w-full max-w-sm h-full">
                        <CarouselContent className="!h-full">
                          {item.medias.map((media, index) => (
                            <CarouselItem key={item.medias[index] + item._id}>
                              <div className="p-1 h-full">
                                <Card className="h-full border-none shadow-none">
                                  <CardContent
                                    className="flex relative items-center justify-center p-0 h-full bg-contain bg-center bg-no-repeat"
                                    style={{
                                      backgroundImage: `url(${media})`,
                                    }}
                                  >
                                    {isVideo(media) ? (
                                      <>
                                        <video
                                          src={media}
                                          ref={(el) => {
                                            if (el) {
                                              videoRefs.current[item._id] = el;
                                              playingStateRefs.current[
                                                item._id
                                              ] = true;
                                            }
                                          }}
                                          data-id={item._id}
                                          onClick={handlePlayPause}
                                          className="object-contain max-h-[300px] w-full h-max"
                                          alt="media"
                                          autoPlay
                                          muted={muted}
                                          loop
                                          playsInline
                                        />
                                        <div
                                          className=" absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-10 h-10 z-50 pointer-events-none opacity-75 bg-contain bg-center bg-no-repeat"
                                          style={{
                                            backgroundImage:
                                              "url(/play-buttton.pngg)",
                                          }}
                                          hidden={
                                            playingStateRefs.current[item._id]
                                          }
                                        ></div>
                                      </>
                                    ) : (
                                      <>
                                        <div></div>
                                        {/* <img
                                        src={media}
                                        className="rounded-sm object-contain h-full max-h-[300px] w-full"
                                        alt="media"
                                      /> */}
                                      </>
                                    )}
                                    <span className="absolute bottom-2 m-1 left-[50%] transform translate-x-[-50%] text-sm px-1 text-white bg-slate-800 opacity-70 rounded-full">
                                      {`${index + 1} of ${item.medias.length}`}
                                    </span>
                                    {isVideo(media) ? (
                                      <span className="absolute m-1 bottom-0 right-0 text-sm text-muted-foreground p-1 rounded-full bg-black opacity-70">
                                        {muted ? (
                                          <VolumeX
                                            className="text-white h-4 w-4"
                                            onClick={() => setMuted(!muted)}
                                          />
                                        ) : (
                                          <Volume2
                                            className="text-white h-4 w-4"
                                            onClick={() => setMuted(!muted)}
                                          />
                                        )}
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
                  <Separator className="w-full mb-1" />
                  <div className="flex flex-row w-full justify-stretch items-center">
                    <div className="flex-grow flex justify-center items-center border-r-2 border-[#e7e5e4]">
                      <div
                        size="icon"
                        className="rounded-full ml-2"
                        onClick={(event) => {
                          handleStopPropagation(event);
                        }}
                      >
                        <HeartButton
                          initialLiked={item.likedByUsers.includes(
                            localUser.userName
                          )}
                          postId={item._id}
                        />
                      </div>
                    </div>
                    <div className="flex-grow flex justify-center items-center border-r-2 border-[#e7e5e4]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full ml-2"
                      >
                        <Subtitles className="h-8 w-8 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="flex-grow flex justify-center items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full ml-2"
                        onClick={handleStopPropagation}
                      >
                        {/* <Share2 className="h-6 w-6 text-muted-foreground" /> */}
                        <ShareButton postId={item._id} />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </div>
            </DialogTrigger>
            <DialogContent className="flex justify-center items-center">
              <Card>
                <div className="left h-[70vh] w-[40vw] p-1 rounded-xl">
                  <div className="flex flex-col h-full">
                    <DialogHeader className="p-2 w-[40vw]">
                      <DialogTitle>
                        <div className="flex items-center">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                              />
                              <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0">
                              <div className="font-semibold">
                                {item.fullName}
                              </div>
                              <div className="line-clamp-2 text-xs text-muted-foreground">
                                {item.userName}
                              </div>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "ml-auto text-xs flex flex-row justify-between items-center"
                            )}
                          >
                            {formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                            })}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full ml-2"
                              onClick={handleStopPropagation}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogTitle>
                      <DialogDescription className="hidden">
                        .
                      </DialogDescription>
                    </DialogHeader>
                    {item.medias.length > 0 ? (
                      <div className="media-wrapper flex-grow w-full flex justify-center items-center overflow-hidden">
                        <Carousel className="w-full max-w-sm h-full">
                          <CarouselContent className="!h-full">
                            {item.medias.map((media, index) => (
                              <CarouselItem key={item.medias[index] + item._id}>
                                <div className="p-1 h-full">
                                  <Card className="h-full border-none shadow-none">
                                    <CardContent
                                      className="flex relative items-center justify-center p-0 h-full bg-contain bg-center bg-no-repeat"
                                      style={{
                                        backgroundImage: `url(${media})`,
                                      }}
                                    >
                                      {isVideo(media) ? (
                                        <>
                                          <video
                                            src={media}
                                            ref={(el) => {
                                              if (el) {
                                                videoRefs.current[item._id] =
                                                  el;
                                              }
                                            }}
                                            // Add onclick propert to toogle play pause
                                            onClick={handlePlayPause}
                                            className="object-contain max-h-[300px] w-full h-max"
                                            alt="media"
                                            autoPlay
                                            muted={muted}
                                            loop
                                            playsInline
                                          />
                                          <div
                                            className=" absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-10 h-10 z-50 pointer-events-none opacity-75 bg-contain bg-center bg-no-repeat"
                                            style={{
                                              backgroundImage:
                                                "url(/play-buttton.pngg)",
                                            }}
                                            hidden={isPlaying}
                                          ></div>
                                        </>
                                      ) : (
                                        <>
                                          <div></div>
                                          {/* <img
                                        src={media}
                                        className="rounded-sm object-contain h-full max-h-[300px] w-full"
                                        alt="media"
                                      /> */}
                                        </>
                                      )}
                                      <span className="absolute bottom-2 m-1 left-[50%] transform translate-x-[-50%] text-sm px-1 text-white bg-slate-800 opacity-70 rounded-full">
                                        {`${index + 1} of ${
                                          item.medias.length
                                        }`}
                                      </span>
                                      {isVideo(media) ? (
                                        <span className="absolute m-1 bottom-0 right-0 text-sm text-muted-foreground p-1 rounded-full bg-black opacity-70">
                                          {muted ? (
                                            <VolumeX
                                              className="text-white h-4 w-4"
                                              onClick={() => setMuted(!muted)}
                                            />
                                          ) : (
                                            <Volume2
                                              className="text-white h-4 w-4"
                                              onClick={() => setMuted(!muted)}
                                            />
                                          )}
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
                    <DialogFooter className="flex-row sm:justify-start gap-4 items-center">
                      {/* <HeartButton
                        initialLiked={item.likedByUsers.includes(
                          localUser.userName
                        )}
                        postId={item._id}
                      /> */}
                      <span className="likesCount !ml-[0px] p-2">{`${item.likes} likes`}</span>
                      {/* <Subtitles className="h-8 w-8 text-muted-foreground" />
                      <span className="likesCount !ml-[5px]">3.8k</span> */}
                      <ShareButton postId={item._id} />
                    </DialogFooter>
                  </div>
                </div>
              </Card>

              <div className="right h-[70vh] flex flex-col gap-4 w-[40vw]">
                <Card className="w-full max-h-[30vh]">
                  <CardHeader className="p-4">
                    <CardTitle>Description</CardTitle>
                    <Separator />
                    <CardDescription className="w-full overflow-scroll scrollbar-hide max-h-[100px]">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      {`${item.content}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="w-full h-full">
                  <CardHeader className="px-4 pt-4 pb-3">
                    <div className="">
                      <CardTitle>
                        Comments{" "}
                        <span className="text-md ml-2 text-gray-500 font-light">
                          {item.comments.length}
                        </span>{" "}
                      </CardTitle>
                      <Separator />
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex flex-col justify-stretch items-center gap-4 grow-1">
                    <PostComment item={item} />
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      ))}
    </div>
  );
};

export default MyComponent;
