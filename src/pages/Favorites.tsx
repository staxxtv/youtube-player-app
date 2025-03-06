
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

interface FavoriteVideo {
  id: string;
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
}

interface FavoriteChannel {
  id: string;
  video_id: string; // Using video_id as channel_id
  channel_title: string;
  title: string;
  thumbnail_url: string;
}

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<FavoriteVideo[]>([]);
  const [channels, setChannels] = useState<FavoriteChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      if (!user) {
        setVideos([]);
        setChannels([]);
        setLoading(false);
        return;
      }

      // Fetch saved videos (excluding channel entries) - filter by user_id
      const { data: videoData, error: videoError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .not('title', 'ilike', 'Channel:%')
        .order('created_at', { ascending: false });
      
      if (videoError) throw videoError;
      setVideos(videoData || []);

      // Fetch favorite channels (using title pattern) - filter by user_id
      const { data: channelData, error: channelError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', 'Channel:%')
        .order('created_at', { ascending: false });
      
      if (channelError) throw channelError;
      setChannels(channelData as unknown as FavoriteChannel[] || []);
    } catch (error) {
      console.error('Error fetching library:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLibrary();
    } else {
      setVideos([]);
      setChannels([]);
      setLoading(false);
    }
  }, [user]);

  const handleVideoClick = (videoId: string) => {
    navigate(`/player/${videoId}`);
  };

  const fetchChannelVideos = async (channelId: string) => {
    try {
      // Redirect to a search for this channel
      navigate(`/search?channelId=${channelId}`);
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      toast.error('Failed to fetch channel videos');
    }
  };

  const removeVideo = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) {
      toast.error('You need to be logged in to remove items from your library');
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Video removed from library');
      fetchLibrary();
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video from library');
    }
  };

  const removeChannel = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) {
      toast.error('You need to be logged in to remove items from your library');
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Channel removed from favorites');
      fetchLibrary();
    } catch (error) {
      console.error('Error removing channel:', error);
      toast.error('Failed to remove channel from favorites');
    }
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
                {loading ? (
                  <div className="text-center py-8 animate-pulse dark:text-white">Loading...</div>
                ) : videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                        onClick={() => handleVideoClick(video.video_id)}
                      >
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          <img
                            src={video.thumbnail_url.replace('default', 'mqdefault')}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => removeVideo(video.id, e)}
                            aria-label="Remove from library"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {video.channel_title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Your saved videos will appear here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="channels">
                {loading ? (
                  <div className="text-center py-8 animate-pulse dark:text-white">Loading...</div>
                ) : channels.length > 0 ? (
                  <div className="grid gap-4">
                    {channels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
                        onClick={() => fetchChannelVideos(channel.video_id)}
                      >
                        <Avatar className="h-12 w-12">
                          <img 
                            src={channel.thumbnail_url} 
                            alt={channel.channel_title}
                          />
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {channel.channel_title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tap to view videos</p>
                        </div>
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => removeChannel(channel.id, e)}
                          aria-label="Remove from favorites"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Your favorite channels will appear here</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Library;
