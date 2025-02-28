
import { Home, Search, Heart, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-2 px-4 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center p-2 transition-all duration-200 ${
                isActive(path)
                  ? "text-primary scale-110"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
