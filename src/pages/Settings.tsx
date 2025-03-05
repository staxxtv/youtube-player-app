
import { useState } from "react";
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccountClick = () => {
    if (user) {
      setIsEditing(true);
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement account update logic
    setIsEditing(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authTab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Logged in successfully");
          setIsAuthDialogOpen(false);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Please check your email to confirm your account");
          setIsAuthDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h2 
                  className="font-medium text-gray-900 cursor-pointer hover:text-primary transition-colors"
                  onClick={handleAccountClick}
                >
                  Account
                </h2>
                {!user ? (
                  <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Login / Sign Up</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{authTab === "login" ? "Login" : "Sign Up"}</DialogTitle>
                      </DialogHeader>
                      <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "signup")} className="w-full">
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="login">Login</TabsTrigger>
                          <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <form onSubmit={handleAuthSubmit} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input 
                              type="password" 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              required 
                              minLength={6}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Loading..." : authTab === "login" ? "Login" : "Sign Up"}
                          </Button>
                        </form>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" onClick={handleSignOut}>Logout</Button>
                )}
              </div>
              {isEditing && user ? (
                <form onSubmit={handleUpdateAccount} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" value={user.email || ''} readOnly className="mt-1 bg-gray-100" />
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
                <p className="text-sm text-gray-500 mt-1">
                  {user ? "Manage your account settings" : "Login to manage your account"}
                </p>
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
