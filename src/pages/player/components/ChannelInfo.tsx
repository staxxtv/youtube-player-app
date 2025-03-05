
import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ChannelDetails } from "../types";

interface ChannelInfoProps {
  channelDetails: ChannelDetails;
  isFavoriteChannel: boolean;
  favoriteChannel: () => Promise<void>;
  formatCount: (count: string) => string;
}

const ChannelInfo: React.FC<ChannelInfoProps> = ({ 
  channelDetails, 
  isFavoriteChannel, 
  favoriteChannel,
  formatCount
}) => {
  return (
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
  );
};

export default ChannelInfo;
