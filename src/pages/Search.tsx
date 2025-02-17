
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

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
  };
}

interface SearchHistory {
  query: string;
  created_at: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [topSearches, setTopSearches] = useState<{ query: string; count: number }[]>([]);

  // Fetch search history and favorites on component mount
  useEffect(() => {
    fetchSearchHistory();
    fetchFavorites();
    fetchTopSearches();
  }, []);

  const fetchSearchHistory = async () => {
    const { data, error } = await supabase
      .from('search_history')
      .select('query, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching search history:', error);
      return;
    }

    setSearchHistory(data || []);
  };

  const fetchTopSearches = async () => {
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching top searches:', error);
      return;
    }

    // Count occurrences of each search query
    const counts = (data || []).reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.query] = (acc[curr.query] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by count
    const topSearches = Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopSearches(topSearches);
  };

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('video_id');

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    setFavorites(new Set((data || []).map(f => f.video_id)));
  };

  const searchVideos = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Save search query to history
      const { error: historyError } = await supabase
        .from('search_history')
        .insert([{ query: query.trim() }]);

      if (historyError) throw historyError;

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
      setVideos(data.items);
      
      // Refresh search history and top searches
      fetchSearchHistory();
      fetchTopSearches();
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    searchVideos();
  };

  const handleVideoSelect = (videoId: string) => {
    navigate(`/player/${videoId}`);
  };

  const toggleFavorite = async (video: VideoItem, event: React.MouseEvent) => {
    event.stopPropagation();
    const videoId = video.id.videoId;
    
    try {
      if (favorites.has(videoId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('video_id', videoId);

        if (error) throw error;
        
        favorites.delete(videoId);
        setFavorites(new Set(favorites));
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            video_id: videoId,
            title: video.snippet.title,
            thumbnail_url: video.snippet.thumbnails.medium.url,
            channel_title: video.snippet.channelTitle
          }]);

        if (error) throw error;
        
        setFavorites(new Set([...favorites, videoId]));
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
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
              className="w-full pl-12"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </form>

          {/* Recent Searches and Top Artists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.query);
                      searchVideos();
                    }}
                    className="block text-left text-sm text-gray-600 hover:text-primary truncate w-full"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Searches */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Trending Searches</h3>
              <div className="space-y-2">
                {topSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.query);
                      searchVideos();
                    }}
                    className="block text-left text-sm text-gray-600 hover:text-primary truncate w-full"
                  >
                    {item.query} ({item.count} searches)
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {video.snippet.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {video.snippet.channelTitle}
                  </p>
                </div>
                <button
                  onClick={(e) => toggleFavorite(video, e)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.has(video.id.videoId)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
