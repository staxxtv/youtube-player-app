
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, Share, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface ShortVideo {
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
    description: string;
  };
}

const Shorts = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [youtubeApiKey, setYoutubeApiKey] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchYoutubeApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-youtube-key");
        if (error) throw error;
        setYoutubeApiKey(data.YOUTUBE_API_KEY);
      } catch (error) {
        console.error("Error fetching YouTube API key:", error);
        toast.error("Failed to load YouTube API key");
      }
    };

    fetchYoutubeApiKey();
  }, []);

  const { data: shortsVideos, isLoading } = useQuery({
    queryKey: ["shortsVideos", youtubeApiKey],
    queryFn: async () => {
      if (!youtubeApiKey) return [];
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=shorts&type=video&videoDuration=short&maxResults=15&regionCode=US&key=${youtubeApiKey}`
      );
      const data = await response.json();
      return data.items || [];
    },
    enabled: !!youtubeApiKey,
  });

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/shorts/${videoId}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const nextVideo = () => {
    if (shortsVideos && currentVideoIndex < shortsVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        nextVideo();
      } else {
        prevVideo();
      }
    };

    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll);
      }
    };
  }, [currentVideoIndex, shortsVideos]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Skeleton className="h-[70vh] w-full max-w-md mx-auto rounded-xl" />
        </div>
      </Layout>
    );
  }

  const currentVideo = shortsVideos && shortsVideos.length > 0 ? shortsVideos[currentVideoIndex] : null;

  return (
    <Layout>
      <div 
        className="min-h-screen bg-background flex flex-col items-center py-4 pb-24"
        ref={videoContainerRef}
      >
        <h1 className="text-xl font-bold mb-4">YouTube Shorts</h1>

        {currentVideo ? (
          <div className="relative w-full max-w-md mx-auto">
            <Card className="overflow-hidden bg-black rounded-xl h-[70vh] relative flex items-center justify-center">
              <img 
                src={currentVideo.snippet.thumbnails.high.url}
                alt={currentVideo.snippet.title}
                className="w-full h-full object-cover"
                onClick={() => handleVideoClick(currentVideo.id.videoId)}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h3 className="font-bold text-lg mb-1">{currentVideo.snippet.title}</h3>
                <p className="text-sm mb-2">{currentVideo.snippet.channelTitle}</p>
                <p className="text-xs opacity-80 line-clamp-2">{currentVideo.snippet.description}</p>
              </div>
              
              <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <Heart className="w-6 h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <Share className="w-6 h-6" />
                </Button>
              </div>
            </Card>
            
            <div className="mt-4 flex justify-between px-2">
              <Button 
                variant="outline"
                onClick={prevVideo}
                disabled={currentVideoIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                onClick={nextVideo}
                disabled={!shortsVideos || currentVideoIndex === shortsVideos.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No short videos available</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shorts;
