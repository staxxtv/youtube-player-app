
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Player from "./pages/player";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Shorts from "./pages/Shorts";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Wrapper component to apply dark mode class
const DarkModeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { darkMode } = useAuth();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <DarkModeWrapper>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/player/:videoId" element={<Player />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/library" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </DarkModeWrapper>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
