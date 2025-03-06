
import React from "react";
import { Trash2 } from "lucide-react";
import { FavoriteVideo } from "@/hooks/useFavorites";

interface VideoCardProps {
  video: FavoriteVideo;
  onClick: (videoId: string) => void;
  onRemove: (id: string, event: React.MouseEvent) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, onRemove }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
      onClick={() => onClick(video.video_id)}
    >
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={video.thumbnail_url.replace('default', 'mqdefault')}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <button 
          className="absolute top-2 right-2 bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => onRemove(video.id, e)}
          aria-label="Remove from library"
        >
          <Trash2 className="h-4 w-4 text-white" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {video.channel_title}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
