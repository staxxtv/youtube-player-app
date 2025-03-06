
import React from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FavoriteChannel } from "@/hooks/useFavorites";

interface ChannelCardProps {
  channel: FavoriteChannel;
  onClick: (channelId: string) => void;
  onRemove: (id: string, event: React.MouseEvent) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick, onRemove }) => {
  return (
    <div
      className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={() => onClick(channel.video_id)}
    >
      <Avatar className="h-12 w-12">
        <img 
          src={channel.thumbnail_url} 
          alt={channel.channel_title}
        />
      </Avatar>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {channel.channel_title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Tap to view videos</p>
      </div>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => onRemove(channel.id, e)}
        aria-label="Remove from favorites"
      >
        <Trash2 className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

export default ChannelCard;
