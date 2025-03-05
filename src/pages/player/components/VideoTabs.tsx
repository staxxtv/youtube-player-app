
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { VideoDetails, Comment } from "../types";
import CommentsList from "./CommentsList";

interface VideoTabsProps {
  videoDetails: VideoDetails;
  comments: Comment[];
  formatCount: (count: string) => string;
  formatDate: (dateString: string) => string;
}

const VideoTabs: React.FC<VideoTabsProps> = ({ 
  videoDetails, 
  comments,
  formatCount,
  formatDate
}) => {
  return (
    <Tabs defaultValue="about">
      <TabsList className="w-full">
        <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
        <TabsTrigger value="comments" className="flex-1">
          Comments {videoDetails.statistics?.commentCount && `(${formatCount(videoDetails.statistics.commentCount)})`}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="pt-4">
        <p className="whitespace-pre-wrap text-sm">
          {videoDetails.snippet.description || "No description available."}
        </p>
      </TabsContent>
      <TabsContent value="comments" className="pt-4">
        <CommentsList comments={comments} formatDate={formatDate} />
      </TabsContent>
    </Tabs>
  );
};

export default VideoTabs;
