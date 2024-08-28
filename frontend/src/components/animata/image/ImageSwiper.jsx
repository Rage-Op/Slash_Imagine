import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, VolumeX, Volume2 } from "lucide-react";

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

const ImageSwiper = ({ images, className }) => {
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

  const [muted, setMuted] = useState(true);
  const videoExtensions = ["mp4", "avi", "mkv", "mov"];

  const isVideo = (media) => {
    return videoExtensions.some((ext) => media.toLowerCase().includes(ext));
  };

  const [imgIndex, setImgIndex] = useState(0);

  const dragX = useMotionValue(0);

  const onDragEnd = () => {
    const x = dragX.get();

    if (x <= -10 && imgIndex < images.length - 1) {
      setImgIndex((e) => e + 1);
    } else if (x >= 10 && imgIndex > 0) {
      setImgIndex((e) => e - 1);
    }
  };

  return (
    <div className="group/hover relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 z-10 flex w-full -translate-y-1/2 justify-between px-5 ">
        <button
          style={imgIndex === 0 ? { opacity: 0 } : {}}
          className="pointer-events-auto h-fit w-fit rounded-full bg-white/80 p-2 opacity-0 transition-all group-hover/hover:opacity-100"
          onClick={() => {
            if (imgIndex > 0) {
              setImgIndex((pv) => pv - 1);
            }
          }}
        >
          <ChevronLeft className="stroke-neutral-600" size={20} />
        </button>
        <button
          style={imgIndex === images.length - 1 ? { opacity: 0 } : {}}
          className="pointer-events-auto h-fit w-fit rounded-full bg-white/80 p-2 opacity-0 transition-all group-hover/hover:opacity-100"
          onClick={() => {
            if (imgIndex < images.length - 1) {
              setImgIndex((pv) => pv + 1);
            }
          }}
        >
          <ChevronRight className="stroke-neutral-600" size={20} />
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-2 z-10 flex w-full items-center justify-center">
        <div className="flex w-9 items-center justify-center rounded-md bg-black/80 p-0.5 text-xs text-white opacity-0 transition-all group-hover/hover:opacity-100">
          <div>
            {imgIndex + 1}/{images.length}
          </div>
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        dragMomentum={false}
        style={{
          x: dragX,
        }}
        animate={{
          translateX: `-${imgIndex * 100}%`,
        }}
        onDragEnd={onDragEnd}
        transition={{
          damping: 18,
          stiffness: 90,
          type: "spring",
          duration: 0.2,
        }}
        className="flex h-full cursor-grab items-center rounded-[inherit] active:cursor-grabbing"
      >
        {images.map((src, i) => {
          return (
            <motion.div
              key={i}
              className="h-full w-full shrink-0 overflow-hidden bg-neutral-800 object-cover first:rounded-l-[inherit] last:rounded-r-[inherit]"
            >
              {isVideo(src) ? (
                <video
                  autoPlay
                  loop
                  // ref={(el) => {
                  //   if (el) {
                  //     videoRefs.current[item._id] = el;
                  //   }
                  // }}
                  onClick={() => setMuted(!muted)}
                  muted={muted}
                  playsInline
                  className="h-full w-full pointer-events-none object-contain"
                >
                  <source src={src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={src}
                  className="pointer-events-none h-full w-full object-contain"
                />
              )}
              {isVideo(src) ? (
                <span className="absolute m-1 bottom-0 right-0 text-sm text-muted-foreground p-1 rounded-full bg-slate-400">
                  {muted ? (
                    <VolumeX
                      className="text-white"
                      onClick={() => setMuted(!muted)}
                    />
                  ) : (
                    <Volume2
                      className="text-white"
                      onClick={() => setMuted(!muted)}
                    />
                  )}
                </span>
              ) : null}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ImageSwiper;
