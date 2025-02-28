import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { searchVideos } from "@/lib/youtubeAPI"; // A helper function for fetching videos

const Home = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const data = await searchVideos("Trending"); // Fetch trending videos
      setVideos(data);
    };
    fetchVideos();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Trending Videos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={video.thumbnail} alt={video.title} className="w-full h-52 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{video.title}</h2>
                <p className="text-sm text-gray-600">{video.channelTitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
