import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import {
  autoTranslateProduct,
  translateCategory,
  translateMarketplaceText,
} from "@/services/translationService";
import Navbar from "@/components/Navbar";
import MarsSpinner from "@/components/admin/MarsSpinner";
import ShopContactDetails from "@/components/ShopContactDetails";
import SEO from "@/components/SEO";
import Fuse from "fuse.js";
import { Slider } from "@/components/ui/slider";

const Marketplace = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data without language parameter
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        setProducts([]);
        setCategories([]);
        // handle error, e.g. show toast
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Remove language from dependency array

  // Apply client-side translations as fallback for any untranslated content
  const translatedProducts = products.map(product => 
    autoTranslateProduct(product, language)
  );

  const fuse = useMemo(() => {
    return new Fuse(translatedProducts, {
      keys: ["name", "description"],
      threshold: 0.4, // Adjust for typo tolerance
      ignoreLocation: true,
    });
  }, [translatedProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = translatedProducts;
    // Fuzzy search
    if (searchQuery.trim()) {
      filtered = fuse.search(searchQuery).map((res) => res.item);
    }
    // Category filter
    filtered = filtered.filter((product) =>
      selectedCategory === "all" || product.category === selectedCategory
    );
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "featured":
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
      }
    });
    return filtered;
  }, [searchQuery, selectedCategory, sortBy, translatedProducts, fuse]);

  const featuredProducts = translatedProducts.filter(
    (product) => product.featured,
  );

  if (loading) {
    return <MarsSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Marketplace - Mars Shop | Premium Products in Ben Gardane, Tunisia"
        description="Browse our premium marketplace featuring electronics, fashion, home & garden, sports, books, and beauty products. Quality guaranteed with fast delivery in Ben Gardane, Tunisia."
        keywords="marketplace, online shopping, electronics, fashion, home & garden, sports, books, beauty, Ben Gardane, Tunisia, Mars Shop"
        type="website"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {translateMarketplaceText("Welcome to Mars Shop", language)}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {translateMarketplaceText(
              "Discover amazing products from our curated marketplace. Quality guaranteed, fast delivery.",
              language,
            )}
          </p>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {translateMarketplaceText("Featured Products", language)}
              </h2>
              <Badge className="bg-amber-500">
                {translateMarketplaceText("Hot", language)}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} categories={Array.isArray(categories) ? categories : []} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={t("marketplace.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("marketplace.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("marketplace.allCategories")}
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category['@id'] || category.id} value={category['@id'] || category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue
                  placeholder={translateMarketplaceText("Sort by", language)}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">
                  {translateMarketplaceText("Featured First", language)}
                </SelectItem>
                <SelectItem value="newest">
                  {translateMarketplaceText("Newest First", language)}
                </SelectItem>
                <SelectItem value="price-low">
                  {translateMarketplaceText("Price: Low to High", language)}
                </SelectItem>
                <SelectItem value="price-high">
                  {translateMarketplaceText("Price: High to Low", language)}
                </SelectItem>
                <SelectItem value="name">
                  {translateMarketplaceText("Name A-Z", language)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== "all") && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {translateMarketplaceText("Active filters:", language)}
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-sm">
                      {translateMarketplaceText("Search:", language)} "{searchQuery}"
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="text-sm">
                      {translateMarketplaceText("Category:", language)} {categories.find(cat => (cat['@id'] || cat.id) === selectedCategory)?.name || selectedCategory}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  {translateMarketplaceText("Clear all", language)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} categories={Array.isArray(categories) ? categories : []} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {translateMarketplaceText("Try adjusting your search criteria or browse our categories.", language)}
            </div>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
            >
              {translateMarketplaceText("View All Products", language)}
            </Button>
          </div>
        )}

        {/* Categories Section (restored) */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {translateMarketplaceText("Shop by Category", language)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category['@id'] || category.id}
                onClick={() => setSelectedCategory(category['@id'] || category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selectedCategory === (category['@id'] || category.id)
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm text-gray-900">
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ShopContactDetails variant="homepage" className="mt-16" />
    </div>
  );
};

export default Marketplace;
