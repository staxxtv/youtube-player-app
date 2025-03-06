
import React from "react";
import ChannelCard from "./ChannelCard";
import { FavoriteChannel } from "@/hooks/useFavorites";

interface ChannelsListProps {
  channels: FavoriteChannel[];
  loading: boolean;
  onChannelClick: (channelId: string) => void;
  onRemoveChannel: (id: string, event: React.MouseEvent) => void;
}

const ChannelsList: React.FC<ChannelsListProps> = ({ 
  channels, 
  loading, 
  onChannelClick, 
  onRemoveChannel 
}) => {
  if (loading) {
    return <div className="text-center py-8 animate-pulse dark:text-white">Loading...</div>;
  }

  if (channels.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <p>Your favorite channels will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onClick={onChannelClick}
          onRemove={onRemoveChannel}
        />
      ))}
    </div>
  );
};

export default ChannelsList;
