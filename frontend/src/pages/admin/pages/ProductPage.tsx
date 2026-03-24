// frontend/src/pages/admin/pages/ProductPage.tsx
import React, { useEffect, useState } from "react";
import EnhancedDataTable from "../components/table/EnhancedDataTable";
import { DataTableSkeleton } from "@/components/ui/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductModal from "../../../components/admin/product/ProductModal";
import { getProducts, createProduct, updateProduct, deleteProduct as apiDelete } from "@/api/product.api";
import { getCategories } from "@/api/category.api";
import DeleteModal from "../../../components/admin/product/DeleteModal";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";

interface Category {
  _id: string;
  name: string;
}

interface ProductAPI {
  _id: string;
  name: string;
  description: string;
  category: string | { _id: string; name: string };
  price: number;
  currency: string;
  status: "active" | "inactive";
  discount?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  category: string;
  categoryName?: string;
  price: number;
  currency: string;
  status: "active" | "inactive";
  discount?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
}

export default function ProductPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selected, setSelected] = useState<Product | null>(null);
  const [openingModal, setOpeningModal] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  const mapProduct = (p: ProductAPI, cats: Category[]): Product => {
    let categoryId = "";
    let categoryName = "Unknown";

    if (typeof p.category === "string") {
      categoryId = p.category;
      const cat = cats.find(c => c._id === p.category);
      if (cat) categoryName = cat.name;
    } else if (typeof p.category === "object" && p.category?._id) {
      categoryId = p.category._id;
      categoryName = p.category.name || "Unknown";
    }

    return {
      ...p,
      id: p._id,
      category: categoryId,
      categoryName,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        setCategories(cats);

        const productsArray = await getProducts();
const mapped = productsArray.map((p: ProductAPI) => mapProduct(p, cats));
        setProducts(mapped);
        setFiltered(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    if (!categories.length) return;
    const productsArray = await getProducts();
const mapped = productsArray.map((p: ProductAPI) => mapProduct(p, categories));
    setProducts(mapped);
    setFiltered(mapped);
  };

  const addProduct = async (product: Product) => {
    const newProduct = await createProduct(product);
    const mapped = mapProduct(newProduct, categories);
    setProducts(prev => [...prev, mapped]);
    setFiltered(prev => [...prev, mapped]);
  };

  const updateProductApi = async (id: string, product: Product) => {
    await updateProduct(id, product);
    fetchProducts();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    await apiDelete(deleteId);
    setDeleteLoading(false);
    setDeleteOpen(false);
    fetchProducts();
  };

  useEffect(() => {
    if (!search) return setFiltered(products);
    setFiltered(products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, products]);

  const openAddModal = async () => {
    if (openingModal) return;
    setOpeningModal(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSelected(null);
      setModalMode("add");
      setModalOpen(true);
    } finally {
      setOpeningModal(false);
    }
  };
  const openEditModal = (product: Product) => { setSelected(product); setModalMode("edit"); setModalOpen(true); };
  const openViewModal = (product: Product) => { setSelected(product); setModalMode("view"); setModalOpen(true); };

const getColumns = () => {
  const allColumns = [
    { 
      name: "ID", 
      cell: (_row: Product, i: number) => <span className="text-gray-600">{i + 1}</span>,
      minWidth: "60px"
    },
    {
      name: "Image",
      cell: (row: Product) => (
        <img 
          src={row.image1 || row.image2 || "/product.png"} 
          alt={row.name} 
          className="w-10 h-10 rounded-full object-cover border border-gray-200" 
        />
      ),
      minWidth: "80px"
    },
    { 
      name: "Product", 
      heading: (row: Product) => row.name,
      subInfo: (row: Product) => row.categoryName || row.category || "No category",
      minWidth: "200px"
    },
    { 
      name: "Description", 
      selector: (row: Product) => row.description?.substring(0, 50) + (row.description?.length > 50 ? "..." : "") || "No description",
      minWidth: "200px"
    },
    { 
      name: "Price", 
      heading: (row: Product) => `${row.price} ${row.currency}`,
      subInfo: (row: Product) => row.discount ? `${row.discount}% OFF` : "No discount",
      minWidth: "120px"
    },
    { 
      name: "Status", 
      cell: (row: Product) => <StatusBadge status={row.status} type="product" />,
      minWidth: "100px"
    },
  ];

  // Breakpoints: 600px, 800px, 900px, 1000px, 1200px, 2040px
  if (windowWidth < 600) {
    // Very small screens: ID, Image, Product, Status, Actions
    return allColumns.filter((_, idx) => [0, 1, 2, 5].includes(idx));
  }

  if (windowWidth < 800) {
    // Small screens: ID, Image, Product, Price, Status, Actions
    return allColumns.filter((_, idx) => [0, 1, 2, 4, 5].includes(idx));
  }

  if (windowWidth < 900) {
    // Medium-small screens: ID, Image, Product, Price, Status, Actions
    return allColumns.filter((_, idx) => [0, 1, 2, 4, 5].includes(idx));
  }

  if (windowWidth < 1000) {
    // Medium screens: ID, Image, Product, Description, Price, Status, Actions
    return allColumns.filter((_, idx) => [0, 1, 2, 3, 4, 5].includes(idx));
  }

  if (windowWidth < 1200) {
    // Large-medium screens: All columns except maybe Description
    return allColumns.filter((_, idx) => [0, 1, 2, 3, 4, 5].includes(idx));
  }

  // Extra large screens (1200px+): All columns
  return allColumns;
};



  return (
    <div className="bg-white shadow rounded-lg p-4 md:p-6 overflow-visible">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-0">
        <h2 className="text-2xl font-semibold theme-heading">Products</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 text-black" />
          <Button className="text-white w-full sm:w-auto theme-button" onClick={openAddModal} loading={openingModal}>
            + Add New
          </Button>
        </div>
      </div>

    <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-4">
          <DataTableSkeleton rows={8} />
        </div>
      ) : (
        <EnhancedDataTable<Product>
          columns={getColumns()}
          data={filtered}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={(row) => {
            setDeleteId(row.id || null);
            setDeleteOpen(true);
          }}
          pagination
        />
      )}
    </div>


      <ProductModal open={modalOpen} mode={modalMode} categories={categories} data={selected ?? undefined} onClose={() => setModalOpen(false)}
        onSubmit={async payload => {
          const productPayload: Product = { ...payload, category: typeof payload.category === "object" ? payload.category._id : payload.category };
          if (modalMode === "add") await addProduct(productPayload);
          else if (modalMode === "edit" && selected?.id) await updateProductApi(selected.id, productPayload);
          setModalOpen(false);
          fetchProducts();
        }}
      />

      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete} loading={deleteLoading} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." />
    </div>
  );
}
