
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface FavoriteVideo {
  id: string;
  video_id: string;
  title: string;
  thumbnail_url: string;
  channel_title: string;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== id));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Favorites</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Your favorite tracks will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => navigate(`/player/${favorite.video_id}`)}
                >
                  <img
                    src={favorite.thumbnail_url}
                    alt={favorite.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {favorite.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {favorite.channel_title}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Favorites;
