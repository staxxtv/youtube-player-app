
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Comment } from "../types";

interface CommentsListProps {
  comments: Comment[];
  formatDate: (dateString: string) => string;
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, formatDate }) => {
  if (comments.length === 0) {
    return <p className="text-gray-500 text-center py-8">No comments available</p>;
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <img 
              src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
              alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
            />
          </Avatar>
          <div>
            <div className="flex items-center">
              <p className="font-medium text-sm">
                {comment.snippet.topLevelComment.snippet.authorDisplayName}
              </p>
              <span className="mx-2 text-xs text-gray-500">
                {formatDate(comment.snippet.topLevelComment.snippet.publishedAt)}
              </span>
            </div>
            <div 
              className="text-sm mt-1"
              dangerouslySetInnerHTML={{ 
                __html: comment.snippet.topLevelComment.snippet.textDisplay 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
