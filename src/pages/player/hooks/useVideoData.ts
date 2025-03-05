
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoDetails, ChannelDetails, Comment } from "../types";

export const useVideoData = (videoId?: string) => {
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavoriteChannel, setIsFavoriteChannel] = useState(false);
  const [videoSaved, setVideoSaved] = useState(false);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      try {
        const { data: { YOUTUBE_API_KEY }, error } = await supabase
          .functions.invoke('get-youtube-key');
        
        if (error) throw error;

        // Fetch video details
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!videoResponse.ok) throw new Error('Failed to fetch video details');
        
        const videoData = await videoResponse.json();
        if (videoData.items && videoData.items.length > 0) {
          setVideoDetails(videoData.items[0]);
          
          // Fetch channel details
          const channelId = videoData.items[0].snippet.channelId;
          const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
          );
          
          if (!channelResponse.ok) throw new Error('Failed to fetch channel details');
          
          const channelData = await channelResponse.json();
          if (channelData.items && channelData.items.length > 0) {
            setChannelDetails(channelData.items[0]);
          }
          
          // Fetch comments
          const commentsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&key=${YOUTUBE_API_KEY}`
          );
          
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData.items || []);
          }

          // Check if channel is favorited - using title convention
          const { data: favChannelData } = await supabase
            .from('favorites')
            .select('*')
            .eq('video_id', channelId)  // Use video_id for storing channel IDs
            .ilike('title', 'Channel:%')
            .maybeSingle();
          
          setIsFavoriteChannel(!!favChannelData);

          // Check if video is saved
          const { data: favVideoData } = await supabase
            .from('favorites')
            .select('*')
            .eq('video_id', videoId)
            .not('title', 'ilike', 'Channel:%') // Exclude channel entries
            .maybeSingle();
          
          setVideoSaved(!!favVideoData);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        toast.error('Failed to load video details');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  const formatCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return {
    videoDetails,
    channelDetails,
    comments,
    loading,
    isFavoriteChannel,
    videoSaved,
    setIsFavoriteChannel,
    setVideoSaved,
    formatCount,
    formatDate
  };
};
