import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "./ImageUploader";
import { ProductColor } from "@/types";
import { Plus, Trash2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorVariantManagerProps {
  colors: ProductColor[];
  onColorsChange: (colors: ProductColor[]) => void;
}

// Helper to create a CSS gradient for combined colors
function getCombinedColorStyle(values: string[]) {
  if (values.length === 1) {
    return { background: values[0] };
  }
  const stops = values.map((color, i) => {
    const start = Math.round((i / values.length) * 100);
    const end = Math.round(((i + 1) / values.length) * 100);
    return `${color} ${start}%, ${color} ${end}%`;
  });
  return { background: `linear-gradient(90deg, ${stops.join(", ")})` };
}

// Helper to get the first color for borderLeftColor
function getFirstColorValue(val: string | string[]) {
  return Array.isArray(val) ? (val[0] || "#000") : val;
}

const ColorVariantManager = ({ colors, onColorsChange }: ColorVariantManagerProps) => {
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColor, setNewColor] = useState({
    name: "",
    value: "#000000",
  });
  const [selectedPredefined, setSelectedPredefined] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<{ name: string; value: string }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customValue, setCustomValue] = useState("#000000");
  const [colorSearch, setColorSearch] = useState("");

  const predefinedColors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Red", value: "#EF4444" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Gray", value: "#6B7280" },
    { name: "Orange", value: "#F97316" },
  ];

  const handleAddColor = () => {
    if (!newColor.name.trim()) return;

    const colorExists = colors.some(
      (color) => color.name.toLowerCase() === newColor.name.toLowerCase(),
    );

    if (colorExists) return;

    const color: ProductColor = {
      id: `color-${Date.now()}`,
      name: newColor.name,
      value: newColor.value,
      images: [],
    };

    onColorsChange([...colors, color]);
    setNewColor({ name: "", value: "#000000" });
    setIsAddingColor(false);
  };

  const handleRemoveColor = (colorId: string) => {
    onColorsChange(colors.filter((color) => color.id !== colorId));
  };

  const handleColorImagesChange = (colorId: string, images: string[]) => {
    const updatedColors = colors.map((color) =>
      color.id === colorId ? { ...color, images } : color,
    );
    onColorsChange(updatedColors);
  };

  const handlePredefinedColorSelect = (predefinedColor: {
    name: string;
    value: string;
  }) => {
    setNewColor(predefinedColor);
  };

  // Add or remove from multi-select
  const togglePredefined = (color: { name: string; value: string }) => {
    setSelectedPredefined((prev) =>
      prev.includes(color.value)
        ? prev.filter((v) => v !== color.value)
        : [...prev, color.value]
    );
  };

  // Combine selected predefined and custom colors
  const handleCombineColors = () => {
    const selectedColors = predefinedColors.filter(c => selectedPredefined.includes(c.value));
    const allNames = [
      ...selectedColors.map(c => c.name),
      ...customColors.map(c => c.name)
    ];
    const allValues = [
      ...selectedColors.map(c => c.value),
      ...customColors.map(c => c.value)
    ];
    if (allNames.length < 2) return;
    const combinedName = allNames.join(" & ");
    const color: ProductColor = {
      id: `color-combined-${Date.now()}`,
      name: combinedName,
      value: allValues,
      images: [],
    };
    onColorsChange([...colors, color]);
    setSelectedPredefined([]);
    setCustomColors([]);
  };

  // Add a single custom color
  const handleAddCustomColor = () => {
    // If the name is a valid hex code, use it as the value
    if (isHex(customName)) {
      setCustomColors([...customColors, { name: customName, value: customName }]);
      setCustomName("");
      setCustomValue("#000000");
      return;
    }
    if (!customName.trim()) return;
    setCustomColors([...customColors, { name: customName, value: customValue }]);
    setCustomName("");
    setCustomValue("#000000");
  };

  // Remove a color from selectedPredefined or customColors before combining
  const removeFromCombination = (value: string, isCustom: boolean) => {
    if (isCustom) {
      setCustomColors(customColors.filter(c => c.value !== value));
    } else {
      setSelectedPredefined(selectedPredefined.filter(v => v !== value));
    }
  };

  const isHex = (str: string) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(str.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Color Variants</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Search */}
        <div className="space-y-2">
          <Label>Search Colors</Label>
          <Input
            value={colorSearch}
            onChange={e => setColorSearch(e.target.value)}
            placeholder="Type color name or hex code (e.g. Red, #EF4444)"
          />
        </div>
        {/* Add Color Section */}
        <div className="space-y-4">
          {!isAddingColor ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingColor(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Color Variant
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colorName">Color Name</Label>
                  <Input
                    id="colorName"
                    value={newColor.name}
                    onChange={(e) =>
                      setNewColor({ ...newColor, name: e.target.value })
                    }
                    placeholder="e.g., Ocean Blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorValue">Color Value</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="colorValue"
                      type="color"
                      value={newColor.value}
                      onChange={(e) =>
                        setNewColor({ ...newColor, value: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={newColor.value}
                      onChange={(e) =>
                        setNewColor({ ...newColor, value: e.target.value })
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Predefined Colors */}
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value + color.name}
                      type="button"
                      onClick={() => handlePredefinedColorSelect(color)}
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all",
                        color.value === "#FFFFFF"
                          ? "border-gray-300"
                          : "border-transparent",
                        "hover:scale-110 hover:border-gray-400",
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={handleAddColor}
                  disabled={!newColor.name.trim()}
                  size="sm"
                >
                  Add Color
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingColor(false);
                    setNewColor({ name: "", value: "#000000" });
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Multi-select Predefined Colors */}
        <div className="space-y-2">
          <Label>Predefined Colors (multi-select)</Label>
          <div className="flex flex-wrap gap-2">
            {predefinedColors
              .filter(color =>
                color.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
                color.value.toLowerCase().includes(colorSearch.toLowerCase())
              )
              .map((color) => (
                <button
                  key={color.value + color.name}
                  type="button"
                  onClick={() => togglePredefined(color)}
                  className={cn(
                    "w-8 h-8 rounded border-2 transition-all",
                    selectedPredefined.includes(color.value)
                      ? "border-mars-600 scale-110"
                      : color.value === "#FFFFFF"
                      ? "border-gray-300"
                      : "border-transparent",
                    "hover:scale-110 hover:border-gray-400",
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
          </div>
        </div>
        {/* Custom Color Input */}
        <div className="space-y-2">
          <Label>Add Custom Color</Label>
          <div className="flex gap-2">
            <Input
              value={customName}
              onChange={e => {
                const val = e.target.value;
                setCustomName(val);
                // If user types a valid hex code, update the color preview
                if (isHex(val)) setCustomValue(val);
              }}
              placeholder="Custom color name or #hexcode"
            />
            <Input
              type="text"
              value={customValue}
              onChange={e => {
                const val = e.target.value;
                setCustomValue(val);
                // If user types a valid hex code, update the preview
                if (isHex(val)) setCustomValue(val);
              }}
              placeholder="#000000"
              className="w-24"
              maxLength={7}
            />
            <Input
              type="color"
              value={customValue}
              onChange={e => setCustomValue(e.target.value)}
              className="w-16 h-10 p-1"
            />
            <Button type="button" onClick={handleAddCustomColor} disabled={!customName.trim() && !isHex(customName)} size="sm">Add</Button>
          </div>
          {/* List custom colors to combine */}
          {customColors.length > 0 && (
            <div className="flex gap-2 mt-2">
              {customColors.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full border" style={{ background: c.value }} />
                  <span className="text-xs">{c.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Combination Area: Show selected and custom colors with remove option */}
        {(selectedPredefined.length > 0 || customColors.length > 0) && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {selectedPredefined.map((val, i) => {
              const color = predefinedColors.find(c => c.value === val);
              if (!color) return null;
              return (
                <span key={val} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
                  <span className="w-4 h-4 rounded-full border" style={{ background: color.value }} />
                  <span>{color.name}</span>
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-rose-500"
                    onClick={() => removeFromCombination(val, false)}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {customColors.map((c, i) => (
              <span key={c.value} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
                <span className="w-4 h-4 rounded-full border" style={{ background: c.value }} />
                <span>{c.name}</span>
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-rose-500"
                  onClick={() => removeFromCombination(c.value, true)}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Combine Button */}
        <div>
          <Button type="button" onClick={handleCombineColors} disabled={selectedPredefined.length + customColors.length < 2} size="sm">
            Combine Selected Colors
          </Button>
        </div>
        {/* Add as single color (predefined or custom) */}
        <div className="flex gap-2 mt-2">
          {selectedPredefined.length === 1 && customColors.length === 0 && (
            <Button type="button" onClick={() => {
              const color = predefinedColors.find(c => c.value === selectedPredefined[0]);
              if (!color) return;
              onColorsChange([...colors, { id: `color-${Date.now()}`, name: color.name, value: [color.value], images: [] }]);
              setSelectedPredefined([]);
            }} size="sm">Add Selected Color</Button>
          )}
          {selectedPredefined.length === 0 && customColors.length === 1 && (
            <Button type="button" onClick={() => {
              const c = customColors[0];
              onColorsChange([...colors, { id: `color-${Date.now()}`, name: c.name, value: [c.value], images: [] }]);
              setCustomColors([]);
            }} size="sm">Add Custom Color</Button>
          )}
        </div>
        {/* Existing Colors */}
        {colors.length > 0 && (
          <div className="space-y-4" key="color-variant-list">
            <h3 className="text-sm font-medium text-gray-700">
              Color Variants ({colors.length})
            </h3>
            {colors.map((color) => (
              <Card
                key={color.id}
                className="border-l-4"
                style={{ borderLeftColor: getFirstColorValue(color.value) }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Circle preview for single or combined */}
                      <span
                        className="w-8 h-8 rounded-full border flex items-center justify-center"
                        style={Array.isArray(color.value) ? getCombinedColorStyle(color.value) : { background: color.value }}
                        title={color.name}
                      />
                      <span className="font-medium">{color.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveColor(color.id)}
                      title="Remove Color"
                    >
                      <Trash2 className="h-5 w-5 text-rose-500" />
                    </Button>
                  </div>
                  {/* Optionally, show images for this color */}
                    <ImageUploader
                    images={color.images}
                    onImagesChange={(imgs) => handleColorImagesChange(color.id, imgs)}
                    maxImages={4}
                    />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {colors.length === 0 && !isAddingColor && (
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No color variants added yet</p>
            <p className="text-sm">
              Add color variants to show different product options
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorVariantManager;
