
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import VideoPlayer from "./components/VideoPlayer";
import VideoDetails from "./components/VideoDetails";
import ChannelInfo from "./components/ChannelInfo";
import VideoTabs from "./components/VideoTabs";
import { useVideoData } from "./hooks/useVideoData";
import { VideoDetails as VideoDetailsType, ChannelDetails, Comment } from "./types";

const Player = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { 
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
  } = useVideoData(videoId);

  const favoriteChannel = async () => {
    if (!channelDetails) return;
    
    try {
      if (isFavoriteChannel) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('video_id', channelDetails.id)
          .ilike('title', 'Channel:%');
        
        if (error) throw error;
        toast.success('Channel removed from favorites');
        setIsFavoriteChannel(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            video_id: channelDetails.id,
            title: `Channel: ${channelDetails.snippet.title}`,
            channel_title: channelDetails.snippet.title,
            thumbnail_url: channelDetails.snippet.thumbnails.default.url,
            user_id: null // This will be filled by RLS if user is logged in
          });
        
        if (error) throw error;
        toast.success('Channel added to favorites');
        setIsFavoriteChannel(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const saveVideo = async () => {
    if (!videoDetails) return;
    
    try {
      if (videoSaved) {
        // Remove from saved videos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('video_id', videoDetails.id)
          .not('title', 'ilike', 'Channel:%');
        
        if (error) throw error;
        toast.success('Video removed from library');
        setVideoSaved(false);
      } else {
        // Add to saved videos
        const { error } = await supabase
          .from('favorites')
          .insert({
            video_id: videoDetails.id,
            title: videoDetails.snippet.title,
            channel_title: videoDetails.snippet.channelTitle,
            thumbnail_url: videoDetails.snippet.thumbnails.default.url,
            user_id: null // This will be filled by RLS if user is logged in
          });
        
        if (error) throw error;
        toast.success('Video added to library');
        setVideoSaved(true);
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to update library');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen p-6 animate-fade-in">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-6 animate-fade-in pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline mb-4 inline-flex items-center"
          >
            ← Back
          </button>
          
          <VideoPlayer videoId={videoId} />

          {videoDetails && (
            <div className="space-y-4">
              <VideoDetails 
                videoDetails={videoDetails} 
                saveVideo={saveVideo} 
                videoSaved={videoSaved} 
                formatCount={formatCount}
                formatDate={formatDate}
              />

              {channelDetails && (
                <ChannelInfo 
                  channelDetails={channelDetails} 
                  isFavoriteChannel={isFavoriteChannel} 
                  favoriteChannel={favoriteChannel} 
                  formatCount={formatCount}
                />
              )}

              <VideoTabs 
                videoDetails={videoDetails} 
                comments={comments} 
                formatCount={formatCount}
                formatDate={formatDate}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Player;
