import { useState, useEffect, useCallback, createContext } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu } from "@/components/pageComponents/Menu";
import { Sidebar } from "@/components/pageComponents/Sidebar";
import PostFeedView from "@/components/pageComponents/PostFeedView";
import { AddPostDialog } from "@/components/pageComponents/AddPostDialog";
import api from "@/lib/axios";

export const Context = createContext();

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [addPostOpen, setAddPostOpen] = useState(false);

  const processPostsResponse = (data) => {
    return (data.posts || data).map((post) => ({
      ...post,
      fullName: post.author?.fullName || 
        `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() ||
        post.userName,
    }));
  };

  const fetchHomeFeed = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/user/get-home-feed?page=${pageNum}&limit=20`);
      const newPosts = processPostsResponse(res.data);
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      if (res.data.pagination) {
        setHasMore(pageNum < res.data.pagination.pages);
      } else {
        setHasMore(newPosts.length === 20);
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    await fetchHomeFeed(nextPage, true);
    setPage(nextPage);
  }, [page, fetchHomeFeed]);

  useEffect(() => {
    fetchHomeFeed(1, false);
  }, [fetchHomeFeed]);

  const handlePostCreated = () => {
    setPage(1);
    fetchHomeFeed(1, false);
    setAddPostOpen(false);
  };

  return (
    <Context.Provider value={[posts, setPosts, { loadMore, hasMore }]}>
      <div className="wrapper h-screen overflow-hidden">
        <Menu />
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
                          <PostFeedView />
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
