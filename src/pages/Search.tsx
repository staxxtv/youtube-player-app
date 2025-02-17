
import Layout from "@/components/Layout";

const Search = () => {
  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Search</h1>
          <div className="relative">
            <input
              type="search"
              placeholder="Search for music..."
              className="w-full bg-white rounded-lg py-3 px-4 pl-12 border border-gray-200 focus:outline-none focus:border-primary transition-colors"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
