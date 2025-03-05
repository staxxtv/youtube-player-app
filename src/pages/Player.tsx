import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
    };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface ChannelDetails {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string };
    };
  };
  statistics: {
    subscriberCount: string;
  };
}

interface Comment {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        textDisplay: string;
        publishedAt: string;
        likeCount: number;
      };
    };
  };
}

const Player = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
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
            thumbnail_url: channelDetails.snippet.thumbnails.default.url
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
            thumbnail_url: videoDetails.snippet.thumbnails.default.url
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
          
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>

          {videoDetails && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-xl font-semibold">{videoDetails.snippet.title}</h1>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={saveVideo}
                  className={videoSaved ? "text-primary" : ""}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                {videoDetails.statistics && (
                  <p>
                    {formatCount(videoDetails.statistics.viewCount)} views • {formatDate(videoDetails.snippet.publishedAt)}
                  </p>
                )}
              </div>

              {channelDetails && (
                <div className="flex justify-between items-center py-4 border-t border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <img 
                        src={channelDetails.snippet.thumbnails.default.url} 
                        alt={channelDetails.snippet.title}
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium">{channelDetails.snippet.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatCount(channelDetails.statistics.subscriberCount)} subscribers
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant={isFavoriteChannel ? "default" : "outline"}
                    onClick={favoriteChannel}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isFavoriteChannel ? "fill-current" : ""}`} />
                    {isFavoriteChannel ? "Favorited" : "Favorite Channel"}
                  </Button>
                </div>
              )}

              <Tabs defaultValue="about">
                <TabsList className="w-full">
                  <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">
                    Comments {videoDetails.statistics?.commentCount && `(${formatCount(videoDetails.statistics.commentCount)})`}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="pt-4">
                  <p className="whitespace-pre-wrap text-sm">
                    {videoDetails.snippet.description || "No description available."}
                  </p>
                </TabsContent>
                <TabsContent value="comments" className="pt-4">
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <img 
                              src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
                              alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                            />
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium text-sm">
                                {comment.snippet.topLevelComment.snippet.authorDisplayName}
                              </p>
                              <span className="mx-2 text-xs text-gray-500">
                                {formatDate(comment.snippet.topLevelComment.snippet.publishedAt)}
                              </span>
                            </div>
                            <div 
                              className="text-sm mt-1"
                              dangerouslySetInnerHTML={{ 
                                __html: comment.snippet.topLevelComment.snippet.textDisplay 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No comments available</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Player;
