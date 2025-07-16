import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "./ImageUploader";
import ColorVariantManager from "./ColorVariantManager";
import { Product, ProductColor, ProductSize, Category } from "@/types";
import { getCategories } from "@/services/categoryService";
import { Package, Save, X, Plus } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EnhancedProductFormProps {
  onSubmit: (product: Omit<Product, "id" | "createdAt">) => void;
  onCancel: () => void;
  initialProduct?: Product;
}

const EnhancedProductForm = ({
  onSubmit,
  onCancel,
  initialProduct,
}: EnhancedProductFormProps) => {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        // handle error
      }
    };
    fetchCategories();
  }, []);

  // Form state
  const extractCategoryId = (category: string) => {
    if (!category) return '';
    // If already just an ID, return as is
    if (/^\d+$/.test(category)) return category;
    // If IRI, extract the last segment
    const match = category.match(/\/(\d+)$/);
    return match ? match[1] : category;
  };

  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price || 0,
    category: extractCategoryId(initialProduct?.category || ""),
    stock: initialProduct?.stock || 0,
    featured: initialProduct?.featured || false,
    images: initialProduct?.images || [],
    colors: initialProduct?.colors || [],
    sizes: initialProduct?.sizes || [],
  });

  // Size management
  const [newSize, setNewSize] = useState({ name: "", stock: 0 });
  const [isAddingSize, setIsAddingSize] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      // Build payload with category as IRI
      const toCategoryIri = (id: string) => id ? `/api/categories/${id}` : '';
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: toCategoryIri(formData.category),
        stock: formData.stock,
        featured: formData.featured,
        images: Array.isArray(formData.images) ? formData.images : [],
        colors: Array.isArray(formData.colors)
          ? formData.colors.map(c => ({
              id: c.id,
              name: c.name,
              value: c.value,
              images: Array.isArray(c.images) ? c.images : []
            }))
          : [],
        sizes: Array.isArray(formData.sizes)
          ? formData.sizes.map(s => ({
              id: s.id,
              name: s.name,
              stock: s.stock
            }))
          : [],
      };
      onSubmit(payload);
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSize = () => {
    if (!newSize.name.trim()) return;

    const sizeExists = formData.sizes.some(
      (size) => size.name.toLowerCase() === newSize.name.toLowerCase(),
    );

    if (sizeExists) return;

    const size: ProductSize = {
      id: `size-${Date.now()}`,
      name: newSize.name,
      stock: newSize.stock,
    };

    setFormData({
      ...formData,
      sizes: [...formData.sizes, size],
    });

    setNewSize({ name: "", stock: 0 });
    setIsAddingSize(false);
  };

  const handleRemoveSize = (sizeId: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((size) => size.id !== sizeId),
    });
  };

  const commonSizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

  const canProceedToNext = (tab: string) => {
    switch (tab) {
      case "basic":
        return (
          formData.name.trim() &&
          formData.description.trim() &&
          formData.price > 0 &&
          formData.category
        );
      case "images":
        return formData.images.length > 0;
      default:
        return true;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>{initialProduct ? "Edit Product" : "Add New Product"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images" disabled={!canProceedToNext("basic")}>
              Images
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              disabled={!canProceedToNext("images")}
            >
              Variants
            </TabsTrigger>
            <TabsTrigger
              value="review"
              disabled={!canProceedToNext("variants")}
            >
              Review
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (TND) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.000"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description *</Label>
              <ReactQuill
                id="description"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Describe your product in detail..."
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "bullet" }, { list: "ordered" }],
                    ["clean"],
                  ],
                }}
                formats={["bold", "italic", "underline", "list", "bullet"]}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-6">
            <div className="space-y-2">
              <Label>Product Images *</Label>
              <ImageUploader
                images={formData.images}
                onImagesChange={(images) =>
                  setFormData({ ...formData, images })
                }
                maxImages={8}
              />
              {errors.images && (
                <p className="text-sm text-red-600">{errors.images}</p>
              )}
            </div>
          </TabsContent>

          {/* Variants */}
          <TabsContent value="variants" className="space-y-6">
            {/* Colors */}
            <ColorVariantManager
              colors={Array.isArray(formData.colors) ? formData.colors : []}
              onColorsChange={(colors) => setFormData({ ...formData, colors })}
            />

            {/* Sizes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Size Variants</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAddingSize ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingSize(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size Variant
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sizeName">Size Name</Label>
                        <Input
                          id="sizeName"
                          value={newSize.name}
                          onChange={(e) =>
                            setNewSize({ ...newSize, name: e.target.value })
                          }
                          placeholder="e.g., Medium, L, 42"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sizeStock">Stock for this size</Label>
                        <Input
                          id="sizeStock"
                          type="number"
                          min="0"
                          value={newSize.stock}
                          onChange={(e) =>
                            setNewSize({
                              ...newSize,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Common Sizes</Label>
                      <div className="flex flex-wrap gap-2">
                        {commonSizes.map((size) => (
                          <Button
                            key={size}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setNewSize({ ...newSize, name: size })
                            }
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        onClick={handleAddSize}
                        disabled={!newSize.name.trim()}
                        size="sm"
                      >
                        Add Size
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingSize(false);
                          setNewSize({ name: "", stock: 0 });
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {formData.sizes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Available Sizes ({formData.sizes.length})</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.sizes.map((size) => (
                        <div
                          key={size.id || size.name}
                          className="flex items-center justify-between p-3 border rounded-lg bg-white"
                        >
                          <div>
                            <span className="font-medium">{size.name}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {size.stock} in stock
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSize(size.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Product Name
                    </Label>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Category</Label>
                    <p className="font-medium capitalize">
                      {formData.category}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Price</Label>
                    <p className="font-medium">
                      {formData.price.toFixed(3)} TND
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Stock</Label>
                    <p className="font-medium">{formData.stock} units</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Description</Label>
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: formData.description }} />
                </div>

                <div>
                  <Label className="text-sm text-gray-600">
                    Images ({formData.images.length})
                  </Label>
                  <div className="flex space-x-2 mt-2">
                    {formData.images.slice(0, 4).map((image, index) => (
                      <img
                        key={image + index}
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                    {formData.images.length > 4 && (
                      <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-600">
                        +{formData.images.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {formData.colors.length > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600">
                      Color Variants ({formData.colors.length})
                    </Label>
                    <div className="flex space-x-2 mt-2">
                      {formData.colors.map((color) => (
                        <div
                          key={color.id || color.name}
                          className="flex items-center space-x-1"
                        >
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-sm">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.sizes.length > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600">
                      Size Variants ({formData.sizes.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.sizes.map((size) => (
                        <span
                          key={size.id || size.name}
                          className="px-2 py-1 text-sm bg-gray-100 rounded"
                        >
                          {size.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <div className="flex space-x-3">
              {currentTab !== "basic" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabs = ["basic", "images", "variants", "review"];
                    const currentIndex = tabs.indexOf(currentTab);
                    if (currentIndex > 0) {
                      setCurrentTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  Previous
                </Button>
              )}

              {currentTab !== "review" ? (
                <Button
                  onClick={() => {
                    const tabs = ["basic", "images", "variants", "review"];
                    const currentIndex = tabs.indexOf(currentTab);
                    if (
                      currentIndex < tabs.length - 1 &&
                      canProceedToNext(currentTab)
                    ) {
                      setCurrentTab(tabs[currentIndex + 1]);
                    }
                  }}
                  disabled={!canProceedToNext(currentTab)}
                  className="bg-mars-600 hover:bg-mars-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-mars-600 hover:bg-mars-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Saving..."
                    : initialProduct
                      ? "Update Product"
                      : "Create Product"}
                </Button>
              )}
            </div>
          </div>
        </Tabs>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert className="border-red-200 bg-red-50 mt-6">
            <AlertDescription className="text-red-800">
              Please fix the following errors:
              <ul className="mt-2 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedProductForm;
