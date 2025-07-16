import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import SEO from './SEO';

interface SEOProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const SEOProductCard: React.FC<SEOProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Generate SEO-friendly product URL
  const generateProductUrl = (product: Product) => {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `/product/${product.id}/${slug}`;
  };

  // Format price with TND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(price);
  };

  return (
    <>
      <SEO
        title={`${product.name} - Mars Shop | Premium Product in Ben Gardane, Tunisia`}
        description={`Buy ${product.name} at Mars Shop. ${product.description}. Premium quality with fast delivery in Ben Gardane, Tunisia. Price: ${formatPrice(product.price)}`}
        keywords={`${product.name}, ${product.category}, Mars Shop, Ben Gardane, Tunisia, online shopping, premium products`}
        image={product.images?.[0] || '/mars_shop logo.png'}
        url={`https://mars-shop.tn${generateProductUrl(product)}`}
        type="product"
        product={{
          name: product.name,
          price: product.price,
          currency: 'TND',
          availability: product.stock > 0 ? 'in stock' : 'out of stock',
          category: product.category || 'General',
        }}
      />
      
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
          isHovered ? 'transform scale-105' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || '/placeholder.svg'}
            alt={`${product.name} - Mars Shop`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          
          {/* Featured Badge */}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
              Featured
            </Badge>
          )}
          
          {/* Stock Badge */}
          <Badge 
            className={`absolute top-2 right-2 ${
              product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="opacity-0 hover:opacity-100 transition-opacity duration-300"
              onClick={() => onViewDetails(product)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </Button>
          </div>
        </div>

        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold line-clamp-2 h-12">
            {product.name}
          </CardTitle>
          
          {/* Category */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{product.category}</span>
            {product.views > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {product.views} views
                </span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-amber-600">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
            {product.description}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => onViewDetails(product)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SEOProductCard; 