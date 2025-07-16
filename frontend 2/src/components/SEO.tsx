import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: {
    name: string;
    price: number;
    currency: string;
    availability: 'in stock' | 'out of stock';
    category: string;
  };
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product
}) => {
  const location = useLocation();
  const currentUrl = url || `https://mars-shop.tn${location.pathname}`;
  const defaultTitle = 'Mars Shop - متجر مارس | Premium Marketplace in Ben Gardane, Tunisia';
  const defaultDescription = 'Discover premium quality products at Mars Shop in Ben Gardane, Tunisia. Electronics, fashion, home & garden, sports, books, and beauty products with exceptional service.';
  const defaultImage = 'https://mars-shop.tn/mars_shop%20logo.png';

  useEffect(() => {
    // Update document title
    document.title = title || defaultTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update primary meta tags
    updateMetaTag('description', description || defaultDescription);
    updateMetaTag('keywords', keywords || 'Mars Shop, متجر مارس, Ben Gardane, Tunisia, e-commerce, online shopping, electronics, fashion, home & garden, sports, books, beauty, premium products, Tunisian marketplace');
    
    // Update Open Graph tags
    updatePropertyTag('og:title', title || defaultTitle);
    updatePropertyTag('og:description', description || defaultDescription);
    updatePropertyTag('og:image', image || defaultImage);
    updatePropertyTag('og:url', currentUrl);
    updatePropertyTag('og:type', type);

    // Update Twitter Card tags
    updatePropertyTag('twitter:title', title || defaultTitle);
    updatePropertyTag('twitter:description', description || defaultDescription);
    updatePropertyTag('twitter:image', image || defaultImage);
    updatePropertyTag('twitter:url', currentUrl);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Add structured data for products
    if (product && type === 'product') {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": description || defaultDescription,
        "image": image || defaultImage,
        "url": currentUrl,
        "brand": {
          "@type": "Brand",
          "name": "Mars Shop"
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": product.currency,
          "availability": `https://schema.org/${product.availability.replace(' ', '')}`,
          "seller": {
            "@type": "Organization",
            "name": "Mars Shop"
          }
        },
        "category": product.category
      };

      // Remove existing product structured data
      const existingScript = document.querySelector('script[data-seo="product"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'product');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image, url, type, product, currentUrl]);

  return null; // This component doesn't render anything
};

export default SEO; 