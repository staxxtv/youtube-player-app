
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);

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
      setVideos(data.items);
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

          {loading && (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading...</div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
