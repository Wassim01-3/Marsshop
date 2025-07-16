import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3">
          <img
            src="/mars_shop logo.png"
            alt="Mars Shop Logo"
            className="w-12 h-12 drop-shadow-lg"
          />
          <span className="text-3xl script-logo">Mars Shop</span>
        </div>
        {/* 404 Error */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-amber-600">404</div>
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-lg text-gray-600">
            Oops! The page you're looking for doesn't exist. It might have been
            moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/">
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Return to Home
            </Button>
          </Link>

          <Link to="/">
            <Button variant="outline" className="w-full" size="lg">
              <Search className="h-5 w-5 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
