import React, { useState, useEffect } from "react";
import { Share2, Clipboard } from "lucide-react";
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

  const handleCopy = async (event) => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      // Optionally, you can show a success message here
      event.target.innetHTML = "Done";
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Share2 className="h-6 w-6 text-muted-foreground transform hover:scale-110 transition-transform duration-100 !m-2" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md w-[50vw]">
          <DialogHeader>
            <DialogTitle className="font-medium">Share post</DialogTitle>
            <DialogDescription>
              Share it with your friends and other peoples.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" defaultValue={currentUrl} readOnly />
            </div>
            <Button type="submit" size="sm" className="px-3">
              <span className="sr-only">Copy</span>
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" onClick={handleCopy} variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
