import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              W
            </div>
            <span className="text-2xl font-bold text-gray-800">Wisely</span>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => setLocation("/history")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Tests
              </button>
              <button
                onClick={() => setLocation("/colleges")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Colleges
              </button>
              <button
                onClick={() => setLocation("/teachers")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Teachers
              </button>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.profileImageUrl && (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-700">
                  {user?.firstName || user?.email}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
