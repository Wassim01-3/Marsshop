import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/services/categoryService";
import { Plus, Edit, Trash2, Package } from "lucide-react";

const CategoryManager = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories('en');
        setCategories(data);
      } catch (error) {
        // handle error
      }
    };
    fetchCategories();
  }, []);

  const resetForm = () => {
    setNewCategory({ name: "", description: "", icon: "" });
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }

    const categoryExists = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.name.toLowerCase(),
    );

    if (categoryExists) {
      setMessage({
        type: "error",
        text: "Category with this name already exists",
      });
      return;
    }

    const category: Category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
      name: newCategory.name,
      description: newCategory.description || `${newCategory.name} products`,
      icon: newCategory.icon || "📦",
    };

    createCategory(category)
      .then(() => {
        setCategories([...categories, category]);
        setMessage({ type: "success", text: "Category added successfully!" });
        resetForm();
      })
      .catch((error) => {
        setMessage({ type: "error", text: "Failed to add category" });
      });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      icon: category.icon,
    });
    setIsAddingCategory(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }

    const categoryExists = categories.some(
      (cat) =>
        cat.id !== editingCategory.id &&
        cat.name.toLowerCase() === newCategory.name.toLowerCase(),
    );

    if (categoryExists) {
      setMessage({
        type: "error",
        text: "Category with this name already exists",
      });
      return;
    }

    const updatedCategory: Category = {
      ...editingCategory,
      name: newCategory.name,
      description: newCategory.description || `${newCategory.name} products`,
      icon: newCategory.icon || "📦",
    };

    updateCategory(updatedCategory)
      .then(() => {
        const updatedCategories = categories.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat,
        );
        setCategories(updatedCategories);
        setMessage({ type: "success", text: "Category updated successfully!" });
        resetForm();
      })
      .catch((error) => {
        setMessage({ type: "error", text: "Failed to update category" });
      });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone.",
      )
    ) {
      deleteCategory(categoryId)
        .then(() => {
          setCategories(categories.filter((cat) => cat.id !== categoryId));
          setMessage({ type: "success", text: "Category deleted successfully!" });
        })
        .catch((error) => {
          setMessage({ type: "error", text: "Failed to delete category" });
        });
    }
  };

  const commonIcons = [
    "📱",
    "👕",
    "🏠",
    "⚽",
    "📚",
    "💄",
    "🎮",
    "🍕",
    "🚗",
    "💼",
    "🎵",
    "📷",
  ];

  return (
    <div className="space-y-6">
      {/* Add Category Dialog */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Category Management</span>
          </CardTitle>
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button className="bg-mars-600 hover:bg-mars-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="e.g., Electronics, Fashion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of the category"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={newCategory.icon}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, icon: e.target.value })
                    }
                    placeholder="📦"
                    className="text-2xl"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonIcons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => setNewCategory({ ...newCategory, icon })}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={
                      editingCategory ? handleUpdateCategory : handleAddCategory
                    }
                    className="bg-mars-600 hover:bg-mars-700"
                  >
                    {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Categories Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-2xl">{category.icon}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {category.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {category.id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {categories.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Categories
              </h3>
              <p className="text-gray-600">
                Create your first category to start organizing products.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default CategoryManager;
