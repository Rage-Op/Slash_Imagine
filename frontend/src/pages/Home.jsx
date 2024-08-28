import { PlusCircledIcon } from "@radix-ui/react-icons";
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu } from "@/components/pageComponents/Menu";
import { PodcastEmptyPlaceholder } from "@/components/pageComponents/PodcastEmptyPlaceholder";
import { Sidebar } from "@/components/pageComponents/Sidebar";
import PostFeedView from "@/components/pageComponents/PostFeedView";
import { useSelector } from "react-redux";
import axios from "axios";
export const metadata = {
  title: "Slash Imagine",
  description: "Official slash imagine website",
};

export const Context = React.createContext();

export default function Home() {
  const [posts, setPosts] = useState([]);
  // set up useEffect to fetch an api with axios
  const localUser = useSelector((state) => state.user);

  const fetchUser = async (userName) => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/user/get-user`;
      const body = {
        userName: userName,
      };
      const headers = {
        "Content-Type": "application/json",
        "x-access-token": `${localUser.token}`,
      };
      const res = await axios.post(url, body, { headers });
      // set the first letter of the first name and last name to capital letters
      const firstName =
        res.data.firstName.charAt(0).toUpperCase() +
        res.data.firstName.slice(1).toLowerCase();
      const lastName =
        res.data.lastName.charAt(0).toUpperCase() +
        res.data.lastName.slice(1).toLowerCase();
      return `${firstName} ${lastName}`;
    } catch (err) {
      console.error(
        "Error fetching user:",
        err.response ? err.response.data : err.message
      );
    }
  };

  useEffect(() => {
    const fetchHomeFeed = async () => {
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/user/get-home-feed`;
        const headers = {
          "Content-Type": "application/json",
          "x-access-token": `${localUser.token}`,
        };
        const res = await axios.get(url, { headers });

        // Map over the posts and fetch user details for each
        const postsWithFullNames = await Promise.all(
          res.data.map(async (post) => {
            const fullName = await fetchUser(post.userName);
            return { ...post, fullName };
          })
        );
        // Set posts with full names
        setPosts(postsWithFullNames);
      } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
      }
    };

    fetchHomeFeed();
  }, []);
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
                        <Button>
                          <PlusCircledIcon className="mr-2 h-4 w-4" />
                          Add Post
                        </Button>
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
                          <PostFeedView
                            // posts={posts}
                            // setPosts={setPosts}
                            className="mb-72"
                          />
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
                            New Episodes
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Your favorite podcasts. Updated daily.
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <PodcastEmptyPlaceholder />
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
