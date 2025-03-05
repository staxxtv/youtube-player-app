
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoDetails as VideoDetailsType } from "../types";

interface VideoDetailsProps {
  videoDetails: VideoDetailsType;
  saveVideo: () => Promise<void>;
  videoSaved: boolean;
  formatCount: (count: string) => string;
  formatDate: (dateString: string) => string;
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ 
  videoDetails, 
  saveVideo, 
  videoSaved,
  formatCount,
  formatDate
}) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1 pr-4">
        <h1 className="text-xl font-semibold">{videoDetails.snippet.title}</h1>
        <div className="text-sm text-gray-600 mt-1">
          {videoDetails.statistics && (
            <p>
              {formatCount(videoDetails.statistics.viewCount)} views • {formatDate(videoDetails.snippet.publishedAt)}
            </p>
          )}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={saveVideo}
        className={videoSaved ? "text-primary" : ""}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default VideoDetails;
