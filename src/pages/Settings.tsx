
import Layout from "@/components/Layout";

const Settings = () => {
  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium text-gray-900">Account</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium text-gray-900">Preferences</h2>
              <p className="text-sm text-gray-500 mt-1">Customize your experience</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium text-gray-900">About</h2>
              <p className="text-sm text-gray-500 mt-1">Version and information</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
