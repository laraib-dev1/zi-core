import React, { useState } from "react";
import EnhancedDataTable from "../../../pages/admin/components/table/EnhancedDataTable";
import { DataTableSkeleton } from "@/components/ui/TableSkeleton";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/StatusBadge";
import FilterTabs from "@/components/ui/FilterTabs";

interface Query {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function QueriesTable() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"All" | "read" | "pending" | "replied">("All");

  // Filter queries by tab and search
  React.useEffect(() => {
    let data = [...queries];

    // Filter by tab
    if (selectedTab !== "All") {
      data = data.filter(query => query.status.toLowerCase() === selectedTab.toLowerCase());
    }

    // Filter by search
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(query => 
        query.name.toLowerCase().includes(s) ||
        query.email.toLowerCase().includes(s) ||
        query.message.toLowerCase().includes(s)
      );
    }

    setFilteredQueries(data);
  }, [queries, selectedTab, search]);

  const getColumns = () => {
    return [
      {
        name: "SR",
        cell: (_row: Query, index: number) => <span className="text-gray-600">{index + 1}</span>,
        minWidth: "60px",
      },
      {
        name: "Name",
        heading: (row: Query) => row.name,
        subInfo: (row: Query) => row.email,
        minWidth: "200px",
      },
      {
        name: "Message",
        cell: (row: Query) => (
          <div className="py-1">
            <div className="text-sm text-gray-900 line-clamp-2" title={row.message}>
              {row.message.length > 50 ? row.message.substring(0, 50) + "...." : row.message}
            </div>
          </div>
        ),
        minWidth: "300px",
      },
      {
        name: "Status",
        cell: (row: Query) => <StatusBadge status={row.status} type="query" />,
        minWidth: "100px",
      },
      {
        name: "Created At",
        cell: (row: Query) => new Date(row.createdAt).toLocaleDateString(),
        minWidth: "120px",
      },
    ];
  };

  return (
    <div className="w-full">
      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        {/* Tabs */}
        <div className="flex gap-4 items-center flex-wrap">
          <h2 className="text-2xl font-semibold theme-heading">Queries</h2>
          <FilterTabs
            tabs={[
              { id: "All", label: "All" },
              { id: "read", label: "Read" },
              { id: "pending", label: "Pending" },
              { id: "replied", label: "Replied" },
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

      {/* DataTable */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-4">
            <DataTableSkeleton rows={8} />
          </div>
        ) : (
          <EnhancedDataTable<Query>
            columns={getColumns()}
            data={filteredQueries}
            pagination
          />
        )}
      </div>
    </div>
  );
}
