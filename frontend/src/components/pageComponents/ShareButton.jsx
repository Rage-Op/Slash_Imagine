import React, { useState, useEffect } from "react";
import { Share2, Clipboard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ShareButton = ({ postId }) => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${postId}`
      : ""
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(`${window.location.origin}/posts/${postId}`);
    }
  }, [postId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Share2 className="h-6 w-6 text-muted-foreground transform hover:scale-110 transition-transform duration-100 !m-2 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium">Share post</DialogTitle>
          <DialogDescription>
            Share this post with your friends and others.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={currentUrl} readOnly />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
