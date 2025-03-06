
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import VideosList from "@/components/favorites/VideosList";
import ChannelsList from "@/components/favorites/ChannelsList";
import { useFavorites } from "@/hooks/useFavorites";
import { useEffect } from "react";

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { videos, channels, loading, removeVideo, removeChannel, fetchLibrary } = useFavorites(user);

  // Refresh the library when the component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("Favorites page - User:", user.id);
      fetchLibrary();
    }
  }, [user]);

  const handleVideoClick = (videoId: string) => {
    navigate(`/player/${videoId}`);
  };

  const fetchChannelVideos = async (channelId: string) => {
    try {
      navigate(`/search?channelId=${channelId}`);
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      toast.error('Failed to fetch channel videos');
    }
  };

  const handleRemoveVideo = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeVideo(id);
  };

  const handleRemoveChannel = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeChannel(id);
  };

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Library</h1>
          
          {!user ? (
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Login to view and manage your library</p>
              <Button
                onClick={() => navigate('/settings')}
                variant="default"
              >
                Go to Settings
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="videos">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
                <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
              </TabsList>
              
              <TabsContent value="videos">
                <VideosList 
                  videos={videos}
                  loading={loading}
                  onVideoClick={handleVideoClick}
                  onRemoveVideo={handleRemoveVideo}
                />
              </TabsContent>

              <TabsContent value="channels">
                <ChannelsList 
                  channels={channels}
                  loading={loading}
                  onChannelClick={fetchChannelVideos}
                  onRemoveChannel={handleRemoveChannel}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Library;
