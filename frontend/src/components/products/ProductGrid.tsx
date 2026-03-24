import React from "react";
import ProductCard from "./ProductCard";
import { spacing } from "@/utils/spacing";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  discount?: number;
}

interface ProductGridProps {
  items: Product[];
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ items, limit }) => {
  const displayedItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6" style={{ rowGap: '10px' }}>
      {displayedItems.map((product, index) => (
        <ProductCard
          key={product.id || index}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image && product.image.trim() !== "" ? product.image : "/product.png"}
          offer={product.discount?.toString()}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
