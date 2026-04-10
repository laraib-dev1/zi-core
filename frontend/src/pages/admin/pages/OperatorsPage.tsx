import React, { useEffect, useMemo, useState } from "react";
import type { TableColumn } from "react-data-table-component";
import EnhancedDataTable from "@/pages/admin/components/table/EnhancedDataTable";
import { Input } from "@/components/ui/input";
import {
  getOperatorUsers,
  getOperatorUserById,
  updateOperatorPassword,
  updateOperatorUser,
  deleteOperatorUser,
} from "@/api/operator.api";
import { getEnabledAdminTabs } from "@/api/admintab.api";
import { useToast } from "@/components/ui/toast";
import CircularLoader from "@/components/ui/CircularLoader";
import { useAuth } from "@/hooks/useAuth";

type AdminTab = {
  _id: string;
  label: string;
  path: string;
};

type OperatorUser = {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  adminAccess: boolean;
  adminTabAccess: string[];
  lastLoginAt?: string | null;
  createdAt?: string | null;
};

export default function OperatorsPage() {
  const { success, error } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<OperatorUser[]>([]);
  const [tabs, setTabs] = useState<AdminTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<OperatorUser | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<OperatorUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, tabsData] = await Promise.all([getOperatorUsers(), getEnabledAdminTabs()]);
      setUsers(
        Array.isArray(usersData)
          ? usersData
              .filter((u: any) => String(u._id) !== String(currentUser?.id || currentUser?._id || ""))
              .map((u: any) => ({ ...u, id: u._id }))
          : []
      );
      setTabs(Array.isArray(tabsData) ? tabsData : []);
    } catch (e: any) {
      error(e?.response?.data?.message || "Failed to load operator data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id, currentUser?._id]);

  const onToggleAccess = async (row: OperatorUser) => {
    try {
      await updateOperatorUser(row._id, { adminAccess: !row.adminAccess });
      setUsers((prev) => prev.map((u) => (u._id === row._id ? { ...u, adminAccess: !row.adminAccess } : u)));
      success("Admin panel access updated");
    } catch (e: any) {
      error(e?.response?.data?.message || "Failed to update admin access");
    }
  };

  const onOpenEdit = async (row: OperatorUser) => {
    try {
      const full = await getOperatorUserById(row._id);
      setSelectedUser({ ...full, id: full._id });
      setPassword("");
      setOpenModal(true);
    } catch (e: any) {
      error(e?.response?.data?.message || "Failed to load user details");
    }
  };

  const isFullAdmin = currentUser?.role?.toLowerCase() === "admin";

  const onDeleteOperator = (row: OperatorUser) => {
    if (!isFullAdmin) {
      error("Only full administrators can delete users");
      return;
    }
    if (row.role?.toLowerCase() === "admin") {
      error("Administrator accounts cannot be deleted here");
      return;
    }
    setOpenModal(false);
    setUserToDelete(row);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteOperatorUser(userToDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      if (selectedUser?._id === userToDelete._id) {
        setSelectedUser(null);
      }
      setUserToDelete(null);
      success("User removed");
    } catch (e: any) {
      error(e?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const columns: TableColumn<OperatorUser>[] = useMemo(
    () => [
      { name: "Name", selector: (row) => row.name, sortable: true },
      { name: "Email", selector: (row) => row.email, sortable: true, grow: 1.5 },
      { name: "Role", selector: (row) => row.role, sortable: true },
      {
        name: "Last Login",
        selector: (row) => (row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "Never"),
        sortable: true,
      },
      {
        name: "Admin Panel Access",
        cell: (row) => (
          <button
            onClick={() => onToggleAccess(row)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              row.adminAccess ? "" : "bg-gray-300"
            }`}
            style={row.adminAccess ? { backgroundColor: "var(--theme-primary)" } : {}}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                row.adminAccess ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        ),
      },
    ],
    [users]
  );

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateOperatorUser(selectedUser._id, {
        name: selectedUser.name,
        email: selectedUser.email,
        adminAccess: selectedUser.adminAccess,
        adminTabAccess: selectedUser.adminTabAccess || [],
      });
      if (password.trim()) {
        await updateOperatorPassword(selectedUser._id, password.trim());
      }
      success("Operator updated successfully");
      setOpenModal(false);
      await loadData();
    } catch (e: any) {
      error(e?.response?.data?.message || "Failed to save operator");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold theme-heading">Operator Access</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage which users can access admin panel and which tabs they can open.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <h2 className="text-lg font-semibold theme-heading">All Users</h2>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 text-gray-900"
          />
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <CircularLoader size={24} />
          </div>
        ) : (
          <EnhancedDataTable
            columns={columns}
            data={filteredUsers}
            onView={onOpenEdit}
            onEdit={onOpenEdit}
            onDelete={isFullAdmin ? onDeleteOperator : undefined}
          />
        )}
      </div>

      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 theme-heading">Delete user</h2>
            <p className="text-sm text-gray-600 mb-6">
              Remove <span className="font-medium text-gray-900">{userToDelete.name}</span> (
              <span className="font-mono text-gray-800">{userToDelete.email}</span>)? Their account and all admin
              privileges will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setUserToDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white rounded-lg disabled:opacity-60 bg-red-600 hover:bg-red-700"
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Operator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600">Set New Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="Leave empty to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">Admin Sidebar Tab Access</h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const checked = selectedUser.adminTabAccess?.includes(tab.path);
                  return (
                    <div key={tab._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">{tab.label}</p>
                        <p className="text-xs text-gray-500">{tab.path}</p>
                      </div>
                      <button
                        onClick={() => {
                          const current = new Set(selectedUser.adminTabAccess || []);
                          if (current.has(tab.path)) current.delete(tab.path);
                          else current.add(tab.path);
                          setSelectedUser({ ...selectedUser, adminTabAccess: Array.from(current) });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          checked ? "" : "bg-gray-300"
                        }`}
                        style={checked ? { backgroundColor: "var(--theme-primary)" } : {}}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            checked ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="px-4 py-2 border rounded-lg" onClick={() => setOpenModal(false)}>
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg disabled:opacity-60"
                style={{ backgroundColor: "var(--theme-primary)" }}
                onClick={saveUser}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
