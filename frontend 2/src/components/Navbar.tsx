import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { FlagIcon } from "@/components/FlagIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Globe,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { t, isRTL, language, setLanguage, languages } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("nav.marketplace") },
    { href: "/about", label: t("nav.about") },
    { href: "/cart", label: t("nav.cart"), count: itemCount },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <div
      className={`${mobile ? "flex flex-col space-y-4" : "hidden md:flex items-center space-x-6"}`}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onItemClick}
          className={`relative flex items-center space-x-2 transition-colors duration-200 ${
            location.pathname === item.href
              ? "text-amber-600 font-semibold"
              : "text-gray-700 hover:text-amber-600"
          }`}
        >
          {item.href === "/cart" && <ShoppingCart className="h-5 w-5" />}
          <span>{item.label}</span>
          {item.count && item.count > 0 && (
            <Badge className="bg-amber-500 text-white text-xs">
              {item.count}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );

  const UserMenu = ({ mobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <User className="h-5 w-5" />
          {user && <span className="hidden sm:block">{user.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
        {user ? (
          <>
            <DropdownMenuItem onClick={() => navigate("/account")}>
              <User className="mr-2 h-4 w-4" />
              {t("account.profile")}
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Settings className="mr-2 h-4 w-4" />
                {t("nav.admin")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("account.logout")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate("/login")}>
              {t("account.login")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/register")}>
              {t("account.register")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LanguageSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Globe className="h-5 w-5" />
          <FlagIcon language={language} size="sm" className="hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"}>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center space-x-3 ${language === lang.code ? "bg-amber-50" : ""}`}
          >
            <FlagIcon language={lang.code} size="md" />
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/mars_shop logo.png"
              alt="Mars Shop Logo"
              className="w-10 h-10 drop-shadow-md"
            />
            <span className="text-2xl script-logo-small">Mars Shop</span>
          </Link>
          {/* Desktop Navigation */}
          <NavLinks />

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <UserMenu />

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                <div className="space-y-6 py-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/mars_shop logo.png"
                      alt="Mars Shop Logo"
                      className="w-10 h-10 drop-shadow-md"
                    />
                    <span className="text-2xl script-logo-small">
                      Mars Shop
                    </span>
                  </div>
                  <NavLinks
                    mobile
                    onItemClick={() => setMobileMenuOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
