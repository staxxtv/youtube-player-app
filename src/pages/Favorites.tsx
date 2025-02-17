
import Layout from "@/components/Layout";

const Favorites = () => {
  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Favorites</h1>
          <div className="text-center text-gray-500 py-8">
            <p>Your favorite tracks will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Favorites;
