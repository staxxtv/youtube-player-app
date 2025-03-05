
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [videos, setVideos] = useState<FavoriteVideo[]>([]);
  const [channels, setChannels] = useState<FavoriteChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        // Fetch saved videos (excluding channel entries)
        const { data: videoData, error: videoError } = await supabase
          .from('favorites')
          .select('*')
          .not('title', 'ilike', 'Channel:%');
        
        if (videoError) throw videoError;
        setVideos(videoData || []);

        // Fetch favorite channels (using title pattern)
        const { data: channelData, error: channelError } = await supabase
          .from('favorites')
          .select('*')
          .ilike('title', 'Channel:%');
        
        if (channelError) throw channelError;
        setChannels(channelData as unknown as FavoriteChannel[] || []);
      } catch (error) {
        console.error('Error fetching library:', error);
        toast.error('Failed to load library');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

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

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Library</h1>
          
          <Tabs defaultValue="videos">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
              <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos">
              {loading ? (
                <div className="text-center py-8 animate-pulse">Loading...</div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleVideoClick(video.video_id)}
                    >
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={video.thumbnail_url.replace('default', 'mqdefault')}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {video.channel_title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Your saved videos will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="channels">
              {loading ? (
                <div className="text-center py-8 animate-pulse">Loading...</div>
              ) : channels.length > 0 ? (
                <div className="grid gap-4">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => fetchChannelVideos(channel.video_id)}
                    >
                      <Avatar className="h-12 w-12">
                        <img 
                          src={channel.thumbnail_url} 
                          alt={channel.channel_title}
                        />
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {channel.channel_title}
                        </h3>
                        <p className="text-sm text-gray-600">Tap to view videos</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Your favorite channels will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Library;
