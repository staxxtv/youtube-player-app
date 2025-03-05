import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface VideoItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    channelId: string;
  };
}

interface SearchHistory {
  id: string;
  query: string;
  created_at: string;
}

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const channelId = searchParams.get('channelId');

  useEffect(() => {
    if (channelId) {
      searchChannelVideos(channelId);
    } else {
      fetchRecentSearches();
      fetchTrendingSearches();
    }
  }, [channelId]);

  const fetchRecentSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setRecentSearches(data || []);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    }
  };

  const fetchTrendingSearches = async () => {
    setTrendingSearches([
      "music", "pop songs", "latest hits", "dance music", "rock classics"
    ]);
  };

  const searchVideos = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data: { YOUTUBE_API_KEY }, error } = await supabase
        .functions.invoke('get-youtube-key');
      
      if (error) throw error;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
          query
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) throw new Error('Failed to fetch videos');

      const data = await response.json();
      setVideos(data.items || []);
      setShowRecent(false);

      const { error: insertError } = await supabase
        .from('search_history')
        .insert({ query: query.trim() });
      
      if (insertError) throw insertError;
      
      fetchRecentSearches();
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchChannelVideos = async (channelId: string) => {
    setLoading(true);
    try {
      const { data: { YOUTUBE_API_KEY }, error } = await supabase
        .functions.invoke('get-youtube-key');
      
      if (error) throw error;

      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!channelResponse.ok) throw new Error('Failed to fetch channel');
      
      const channelData = await channelResponse.json();
      if (channelData.items && channelData.items.length > 0) {
        const channelTitle = channelData.items[0].snippet.title;
        setQuery(`Channel: ${channelTitle}`);
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&type=video&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) throw new Error('Failed to fetch videos');

      const data = await response.json();
      setVideos(data.items || []);
      setShowRecent(false);
    } catch (error) {
      console.error('Channel search error:', error);
      toast.error('Failed to fetch channel videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    searchVideos();
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowRecent(false);
    
    setTimeout(() => {
      searchVideos();
    }, 100);
  };

  const handleVideoSelect = (videoId: string) => {
    navigate(`/player/${videoId}`);
  };

  const saveVideo = async (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save videos to your library');
      return;
    }
    
    try {
      const { data, error: checkError } = await supabase
        .from('favorites')
        .select('*')
        .eq('video_id', video.id.videoId)
        .not('title', 'ilike', 'Channel:%')
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (data) {
        toast.info('Video is already in your library');
        return;
      }
      
      const { error } = await supabase
        .from('favorites')
        .insert({
          video_id: video.id.videoId,
          title: video.snippet.title,
          channel_title: video.snippet.channelTitle,
          thumbnail_url: video.snippet.thumbnails.medium.url,
          user_id: null
        });
      
      if (error) throw error;
      toast.success('Added to your library');
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to save video');
    }
  };

  const handleInputFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecent(true);
    }
  };

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search for music..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              className="w-full pl-12"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="h-5 w-5" />
            </span>
          </form>

          {showRecent && recentSearches.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent searches</h3>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <div 
                    key={search.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleRecentSearch(search.query)}
                  >
                    <SearchIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{search.query}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!videos.length && !loading && !showRecent && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Trending searches</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((trend, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setQuery(trend);
                        setTimeout(() => searchVideos(), 100);
                      }}
                    >
                      {trend}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading...</div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleVideoSelect(video.id.videoId)}
              >
                <div className="relative">
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={(e) => saveVideo(e, video)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {video.snippet.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {video.snippet.channelTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
