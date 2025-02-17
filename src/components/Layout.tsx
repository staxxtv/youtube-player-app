
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

const Layout = ({ children, hideNavigation = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className={!hideNavigation ? "pb-20" : ""}>
        {children}
      </main>
      {!hideNavigation && <Navigation />}
    </div>
  );
};

export default Layout;
