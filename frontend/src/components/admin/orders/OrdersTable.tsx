import React, { useEffect, useState } from "react";
import EnhancedDataTable from "../../../pages/admin/components/table/EnhancedDataTable";
import { fetchOrders } from "../../../api/order.api";
import { Input } from "@/components/ui/input";
import { OrderModal } from "../product/OrderModal";
import { DataTableSkeleton } from "@/components/ui/TableSkeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import FilterTabs from "@/components/ui/FilterTabs";
interface Address {
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  area?: string;
  postalCode: string;
  phone: string;
  line1: string;
}

interface Order {
  _id: string;
  id?: string;
  customerName: string;
  address: Address;
  phoneNumber: string;
  items: { name: string; quantity: number; price: number }[];
  type: string;
  bill: number;
  payment: string;
  status: string;
  createdAt: string;
}


export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"All" | "cancel" | "complete" | "Returned">("All");
  const [modalOpen, setModalOpen] = useState(false);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

const openView = (order: Order) => {
  setSelectedOrder(order);
  setModalOpen(true);
};

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
const loadOrders = async () => {
  setLoading(true);
  try {
    const data = await fetchOrders();
    const mapped = data.map((o: Order) => ({ ...o, id: o._id }));
    setOrders(mapped);
    setFilteredOrders(mapped);
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
  setLoading(false);
};
useEffect(() => {
  loadOrders();
}, []);

  // Fetch orders
  // useEffect(() => {
  //   const getOrders = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await fetchOrders();
  //       const mapped = data.map((o: Order) => ({ ...o, id: o._id }));
  //       setOrders(mapped);
  //       setFilteredOrders(mapped);
  //     } catch (err) {
  //       console.error("Error fetching orders:", err);
  //     }
  //     setLoading(false);
  //   };
  //   getOrders();
  // }, []);

  // Track window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter orders by tab and search
  useEffect(() => {
    let data = [...orders];

    // Filter by tab
    if (selectedTab !== "All") {
      data = data.filter(order => order.status.toLowerCase() === selectedTab.toLowerCase());
    }

    // Filter by search
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(order => 
        order.customerName.toLowerCase().includes(s) ||
        order.phoneNumber.toLowerCase().includes(s)
      );
    }

    setFilteredOrders(data);
  }, [orders, selectedTab, search]);

  const getColumns = () => {
    const allColumns = [
      {
        name: "SR",
        cell: (_row: Order, index: number) => <span className="text-gray-600">{index + 1}</span>,
        minWidth: "60px",
      },
      {
        name: "Customer",
        heading: (row: Order) => row.customerName,
        subInfo: (row: Order) => row.phoneNumber,
        minWidth: "150px",
      },
      {
        name: "Address",
        cell: (row: Order) => {
          const address = row.address
            ? `${row.address.line1}, ${row.address.area || ""}, ${row.address.city}, ${row.address.province}`
            : "N/A";
          const words = address.split(" ");
          const truncated = words.length > 4 ? words.slice(0, 4).join(" ") + "...." : address;
          return (
            <div className="py-1">
              <div className="text-sm text-gray-900 line-clamp-2" title={address}>
                {truncated}
              </div>
            </div>
          );
        },
        minWidth: "200px",
      },
      {
        name: "Items",
        heading: (row: Order) => row.items.map(i => `${i.name} x ${i.quantity}`).join(", "),
        subInfo: (row: Order) => row.type,
        minWidth: "200px",
      },
      {
        name: "Bill",
        heading: (row: Order) => `$${row.bill}`,
        subInfo: (row: Order) => row.payment,
        minWidth: "120px",
      },
      {
        name: "Status",
        cell: (row: Order) => <StatusBadge status={row.status} type="order" />,
        minWidth: "100px",
      },
      {
        name: "Created At",
        cell: (row: Order) => new Date(row.createdAt).toLocaleDateString(),
        minWidth: "120px",
      },
    ];

    if (windowWidth < 640) {
      // small screens: show only most important
      return allColumns.filter((_, idx) => [0, 1, 4, 5].includes(idx));
    }

    if (windowWidth < 786) {
      // medium screens: show a few more columns
      return allColumns.filter((_, idx) => [0, 1, 4, 5].includes(idx));
    }
    
    if (windowWidth < 800) {
      return allColumns.filter((_, idx) => [0, 1, 4, 5].includes(idx));
    }
    
    if (windowWidth < 1024) {
      // small screens: show only most important
      return allColumns.filter((_, idx) => [0, 1, 3, 4, 5].includes(idx));
    }

    if (windowWidth < 1250) {
      // medium screens: show a few more columns
      return allColumns.filter((_, idx) => [0, 1, 2, 3, 4, 5].includes(idx));
    }
    
    // large screens: show all
    return allColumns;
  };

 return (
  <div className="w-full">
    {/* Tabs + Search */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
      {/* Tabs */}
      <div className="flex gap-4 items-center flex-wrap">
        <h2 className="text-2xl font-semibold theme-heading">Orders</h2>
        <FilterTabs
          tabs={[
            { id: "All", label: "All" },
            { id: "cancel", label: "Cancel" },
            { id: "complete", label: "Complete" },
            { id: "Returned", label: "Returned" },
          ]}
          activeTab={selectedTab}
          onTabChange={(tabId) => setSelectedTab(tabId as any)}
        />
      </div>

      {/* Search */}
      <div className="w-full md:w-auto mt-2 md:mt-0">
        <Input
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-64 text-gray-900"
          style={{ borderColor: "var(--theme-primary)" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--theme-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--theme-primary)";
            e.currentTarget.style.boxShadow = "";
          }}
        />
      </div>
    </div>
<OrderModal
  order={selectedOrder}
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onUpdate={loadOrders} // refresh after status update
/>
    {/* DataTable */}
    <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-4">
          <DataTableSkeleton rows={8} />
        </div>
      ) : (
        <EnhancedDataTable<Order>
          columns={getColumns()}
          data={filteredOrders}
          onView={openView}
          pagination
        />
      )}
    </div>
  </div>
);

}
