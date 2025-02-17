
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

const Index = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // TODO: Implement signup logic
    navigate("/home");
  };

  const handleSignIn = () => {
    // TODO: Implement signin logic
    navigate("/home");
  };

  return (
    <Layout hideNavigation>
      <div className="min-h-screen p-6 animate-fade-in">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
            <p className="text-gray-600">
              Discover and enjoy your favorite music
            </p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleSignUp}
              className="w-full bg-primary text-white rounded-lg py-3 px-4 font-medium hover:opacity-90 transition-opacity"
            >
              Sign Up
            </button>
            <button 
              onClick={handleSignIn}
              className="w-full bg-white text-primary border border-primary rounded-lg py-3 px-4 font-medium hover:bg-primary/5 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
