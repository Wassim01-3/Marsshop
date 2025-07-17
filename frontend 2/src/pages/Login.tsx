import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import MarsSpinner from "@/components/admin/MarsSpinner";

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);

      if (success) {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { email: "admin@marsshop.com", password: "admin", role: "Admin" },
    { email: "john@example.com", password: "password", role: "Customer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <Link
            to="/marketplace"
            className="inline-flex items-center space-x-3 mb-6"
          >
            <img
              src="/logo-ms.svg"
              alt="Mars Shop Logo"
              className="w-12 h-12 drop-shadow-lg"
            />
            <span className="text-3xl script-logo">Mars Shop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("account.login")}
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("account.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <MarsSpinner /> : t("account.login")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t("account.register")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-3">Demo Credentials</h3>
            <div className="space-y-2 text-sm">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-blue-700">{cred.role}:</span>
                  <button
                    onClick={() =>
                      setFormData({
                        email: cred.email,
                        password: cred.password,
                      })
                    }
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {cred.email} / {cred.password}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            to="/marketplace"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
