
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export interface FavoriteVideo {
  id: string;
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
}

export interface FavoriteChannel {
  id: string;
  video_id: string; // Using video_id as channel_id
  channel_title: string;
  title: string;
  thumbnail_url: string;
}

export const useFavorites = (user: User | null) => {
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

      // Debug the user object to ensure we have a valid ID
      console.log("Current user:", user);
      
      // Fetch videos (non-channel favorites)
      const { data: videoData, error: videoError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .not('title', 'ilike', 'Channel:%')
        .order('created_at', { ascending: false });
      
      if (videoError) {
        console.error('Video fetch error:', videoError);
        throw videoError;
      }
      
      console.log("Fetched videos:", videoData);
      setVideos(videoData || []);

      // Fetch channels
      const { data: channelData, error: channelError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', 'Channel:%')
        .order('created_at', { ascending: false });
      
      if (channelError) {
        console.error('Channel fetch error:', channelError);
        throw channelError;
      }
      
      console.log("Fetched channels:", channelData);
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
    }
  }, [user]);

  const removeVideo = async (id: string) => {
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

  const removeChannel = async (id: string) => {
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

  return {
    videos,
    channels,
    loading,
    removeVideo,
    removeChannel,
    fetchLibrary
  };
};
