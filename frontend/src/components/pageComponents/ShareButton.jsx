import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
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
import { useToast } from "@/components/ui/use-toast";

export const ShareButton = ({ postId }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const localUser = useSelector((state) => state.user);
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
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
      
      try {
        const headers = {
          "Content-Type": "application/json",
          "x-access-token": localUser.token,
        };
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/posts/share/${postId}`,
          {},
          { headers }
        );
      } catch {
        // Silently fail - share count increment is optional
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Share post"
        >
          <Share2 className="h-5 w-5" />
        </Button>
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
            <span className="sr-only">{copied ? "Copied" : "Copy link"}</span>
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
