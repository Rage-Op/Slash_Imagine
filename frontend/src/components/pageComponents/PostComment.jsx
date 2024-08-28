import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikeButton } from "./LikeButton";
import { CommentInputForm } from "../form/CommentInputForm";

export const PostComment = ({ item }) => {
  return (
    <>
      <ScrollArea className=" h-56 grow w-full">
        {item.comments.map((comment) => (
          <div key={item.userName + comment._id}>
            <Separator className="my-2" />
            <div className="text-sm p-2 flex flex-row justify-between items-center">
              <div className="left flex flex-row items-start gap-4">
                <div className="p-1">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col justify-between items-start">
                  <div className="font-medium">{item.userName}</div>
                  <div className="text-wrap">{comment.content}</div>
                </div>
              </div>
              <div className="right flex justify-center items-center">
                <div className="flex flex-col justify-center items-center">
                  <LikeButton />
                  <span className="mt-[-7px] text-muted-foreground">
                    {comment.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* </div> */}
      </ScrollArea>
      <CommentInputForm postId={item._id} />
    </>
  );
};
