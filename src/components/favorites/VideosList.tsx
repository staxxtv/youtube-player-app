
import React from "react";
import VideoCard from "./VideoCard";
import { FavoriteVideo } from "@/hooks/useFavorites";

interface VideosListProps {
  videos: FavoriteVideo[];
  loading: boolean;
  onVideoClick: (videoId: string) => void;
  onRemoveVideo: (id: string, event: React.MouseEvent) => void;
}

const VideosList: React.FC<VideosListProps> = ({ 
  videos, 
  loading, 
  onVideoClick, 
  onRemoveVideo 
}) => {
  if (loading) {
    return <div className="text-center py-8 animate-pulse dark:text-white">Loading...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <p>Your saved videos will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={onVideoClick}
          onRemove={onRemoveVideo}
        />
      ))}
    </div>
  );
};

export default VideosList;
