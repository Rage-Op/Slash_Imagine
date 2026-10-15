import { PlusCircledIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu } from "@/components/pageComponents/Menu";
import { Sidebar } from "@/components/pageComponents/Sidebar";
import PostFeedView from "@/components/pageComponents/PostFeedView";
import { AddPostDialog } from "@/components/pageComponents/AddPostDialog";
import { useSelector } from "react-redux";
import axios from "axios";

export const metadata = {
  title: "Slash Imagine",
  description: "Official slash imagine website",
};

export const Context = React.createContext();

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [addPostOpen, setAddPostOpen] = useState(false);
  const localUser = useSelector((state) => state.user);

  const fetchHomeFeed = async () => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/user/get-home-feed`;
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": localUser.token,
      };
      const res = await axios.get(url, { headers });

      // Backend now returns posts with author info attached
      const postsWithFullNames = (res.data.posts || res.data).map((post) => ({
        ...post,
        fullName: post.author?.fullName || 
          `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() ||
          post.userName,
      }));
      setPosts(postsWithFullNames);
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    if (localUser?.token) {
      fetchHomeFeed();
    }
  }, [localUser?.token]);

  const handlePostCreated = () => {
    fetchHomeFeed();
    setAddPostOpen(false);
  };
  return (
    <Context.Provider value={[posts, setPosts]}>
      <div className="wrapper h-screen overflow-hidden">
        <Menu user={localUser} />
        <div className="border-t">
          <div className="bg-background">
            <div className="grid lg:grid-cols-5">
              <Sidebar className="hidden lg:block" />
              <div className="col-span-3 lg:col-span-4 lg:border-l">
                <div className="h-full px-4 py-6 lg:px-8">
                  <Tabs defaultValue="forYou" className="h-full space-y-4">
                    <div className="space-between flex items-center">
                      <TabsList>
                        <TabsTrigger value="forYou" className="relative">
                          For you
                        </TabsTrigger>
                        <TabsTrigger value="trending">Trending</TabsTrigger>
                        <TabsTrigger value="live" disabled>
                          Live
                        </TabsTrigger>
                      </TabsList>
                      <div className="ml-auto mr-0">
                        <AddPostDialog 
                          open={addPostOpen} 
                          onOpenChange={setAddPostOpen}
                          onPostCreated={handlePostCreated}
                        />
                      </div>
                    </div>
                    <Separator className="my-4" />

                    <TabsContent
                      value="forYou"
                      className="border-none p-0 outline-none"
                    >
                      <div className="wrapper">
                        <ScrollArea className="h-screen">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0">
                              <h2 className="text-2xl font-semibold tracking-tight">
                                For You
                              </h2>
                              <p className="text-sm text-muted-foreground">
                                Top picks for you. From your friends and public.
                              </p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <PostFeedView className="mb-72" />
                        </ScrollArea>
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="trending"
                      className="h-full flex-col border-none p-0 data-[state=active]:flex"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight">
                            Trending
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Popular posts across the platform.
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}
