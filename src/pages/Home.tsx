import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Cast, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

const Home = () => {
  const [youtubeApiKey, setYoutubeApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchYoutubeApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-youtube-key");
        if (error) throw error;
        setYoutubeApiKey(data.YOUTUBE_API_KEY);
      } catch (error) {
        console.error("Error fetching YouTube API key:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYoutubeApiKey();
  }, []);

  const { data: trendingVideos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["trendingVideos", youtubeApiKey],
    queryFn: async () => {
      if (!youtubeApiKey) return [];
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=10&regionCode=US&key=${youtubeApiKey}`
      );
      const data = await response.json();
      return data.items.map((item: any) => ({
        id: { videoId: item.id },
        snippet: item.snippet,
      }));
    },
    enabled: !!youtubeApiKey,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header with search and cast icons */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex justify-between items-center max-w-screen-xl mx-auto">
            <h1 className="text-xl font-bold text-primary">YouTube Now</h1>
            <div className="flex gap-4">
              <Link to="/search">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Cast className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-screen-xl mx-auto">
          {/* Popular Categories - Moved to the top */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Popular Categories</h2>
            <div className="flex flex-wrap gap-2">
              {["Music", "Gaming", "News", "Sports", "Entertainment", "Education"].map((category) => (
                <Button key={category} variant="outline" size="sm" className="rounded-full">
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Trending Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Trending Now</h2>
            {(isLoading || isLoadingVideos) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingVideos?.map((video: Video) => (
                  <Link 
                    to={`/player/${video.id.videoId}`} 
                    key={video.id.videoId}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={video.snippet.thumbnails.high.url} 
                          alt={video.snippet.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium line-clamp-2 text-sm">{video.snippet.title}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">{video.snippet.channelTitle}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(video.snippet.publishedAt)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
