import { useState } from "react";
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

const Settings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleAccountClick = () => {
    setIsEditing(true);
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement account update logic
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 
                className="font-medium text-gray-900 cursor-pointer hover:text-primary transition-colors"
                onClick={handleAccountClick}
              >
                Account
              </h2>
              {isEditing ? (
                <form onSubmit={handleUpdateAccount} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" placeholder="your@email.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <Input type="password" placeholder="Current password" className="mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <Input type="password" placeholder="New password" className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-primary text-white rounded-lg py-2 px-4 font-medium hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 px-4 font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium text-gray-900">Preferences</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">App Notifications</p>
                    <p className="text-sm text-gray-500">Get notified about updates</p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Dark Mode</p>
                    <p className="text-sm text-gray-500">Toggle dark theme</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium text-gray-900">About</h2>
              <p className="text-sm text-gray-500 mt-1">Version 1.0.1, created by Staxx TV</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
