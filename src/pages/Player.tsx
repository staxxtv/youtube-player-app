
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

const Player = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline mb-4 inline-flex items-center"
          >
            ← Back to search
          </button>
          
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Player;
