import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUploader from "./ImageUploader";
import { Upload, Save, RotateCcw } from "lucide-react";

const LogoUpload = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [currentLogo, setCurrentLogo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLogoChange = (images: string[]) => {
    if (images.length > 0) {
      setLogoUrl(images[0]);
    } else {
      setLogoUrl("");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call to save logo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentLogo(logoUrl);
      setMessage({
        type: "success",
        text: "Logo updated successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update logo. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLogoUrl("");
    setCurrentLogo("");
    setMessage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Store Logo Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Logo Display */}
        {currentLogo && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Current Logo</h3>
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <img
                src={currentLogo}
                alt="Current store logo"
                className="max-h-20 max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Logo Upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            {currentLogo ? "Upload New Logo" : "Upload Store Logo"}
          </h3>
          <ImageUploader
            images={logoUrl ? [logoUrl] : []}
            onImagesChange={handleLogoChange}
            maxImages={1}
          />
        </div>

        {/* Logo Preview */}
        {logoUrl && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Preview</h3>
            <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-lg">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="max-h-20 max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Logo Guidelines */}
        <Alert>
          <AlertDescription>
            <strong>Logo Guidelines:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Recommended size: 200x80 pixels or similar ratio</li>
              <li>
                • Formats: PNG, JPG, SVG (PNG recommended for transparency)
              </li>
              <li>• Maximum file size: 2MB</li>
              <li>• Use high contrast colors for better visibility</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            disabled={!logoUrl || isLoading}
            className="bg-mars-600 hover:bg-mars-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Logo"}
          </Button>

          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <Alert
            className={
              message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription
              className={
                message.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
