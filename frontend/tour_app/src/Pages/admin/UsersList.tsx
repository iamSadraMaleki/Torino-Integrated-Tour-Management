import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { User } from "../../Types/admin";
import { adminUserApi } from "../../services/adminApi";
import UserDetailModal from "../admin/UserDetailModal";

interface UsersListProps {
  onUserCountChange?: (count: number) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onUserCountChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const roles = [
    { value: "all", label: "همه نقش‌ها" },
    { value: "ROLE_USER", label: "کاربر عادی" },
    { value: "ROLE_CEO", label: "مدیر آژانس" },
    { value: "ROLE_ADMIN", label: "ادمین" },
    { value: "ROLE_SUPERADMIN", label: "سوپرادمین" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
  setLoading(true);
  try {
    const data = await adminUserApi.getAllUsers();
    setUsers(data);
    if (onUserCountChange) onUserCountChange(data.length);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    const errorMessage = error.message || "خطا در دریافت لیست کاربران";
    setMessage({ type: "error", text: errorMessage });
    // بعد از 5 ثانیه پیام رو پاک کن
    setTimeout(() => setMessage(null), 5000);
  } finally {
    setLoading(false);
  }
};

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mobile.includes(searchTerm)
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.roles.includes(selectedRole));
    }

    setFilteredUsers(filtered);
  };

  const handleToggleEnabled = async (user: User) => {
    try {
      const updatedUser = await adminUserApi.toggleUserEnabled(user.id);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setMessage({
        type: "success",
        text: `کاربر ${updatedUser.username} ${updatedUser.enabled ? "فعال" : "غیرفعال"} شد`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error toggling user:", error);
      setMessage({ type: "error", text: "خطا در تغییر وضعیت کاربر" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`آیا از حذف کاربر "${user.username}" اطمینان دارید؟`)) {
      try {
        await adminUserApi.deleteUser(user.id);
        setUsers(users.filter(u => u.id !== user.id));
        setMessage({ type: "success", text: `کاربر ${user.username} حذف شد` });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setMessage({ type: "error", text: "خطا در حذف کاربر" });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getRolePersian = (roles: string[]) => {
    if (roles.includes("ROLE_SUPERADMIN")) return "سوپرادمین";
    if (roles.includes("ROLE_ADMIN")) return "ادمین";
    if (roles.includes("ROLE_CEO")) return "مدیر آژانس";
    return "کاربر عادی";
  };

  const getRoleBadgeClass = (roles: string[]) => {
    if (roles.includes("ROLE_SUPERADMIN")) return "badge-purple";
    if (roles.includes("ROLE_ADMIN")) return "badge-blue";
    if (roles.includes("ROLE_CEO")) return "badge-orange";
    return "badge-green";
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="users-list-container">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="users-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام کاربری، ایمیل یا موبایل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="role-filter"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>نام کاربری</th>
              <th>ایمیل</th>
              <th>موبایل</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.roles)}`}>
                    {getRolePersian(user.roles)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.enabled ? "active" : "inactive"}`}>
                    {user.enabled ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewUser(user)}
                    title="مشاهده جزئیات"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn toggle"
                    onClick={() => handleToggleEnabled(user)}
                    title={user.enabled ? "غیرفعال کردن" : "فعال کردن"}
                  >
                    {user.enabled ? <FaTimesCircle /> : <FaCheckCircle />}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user)}
                    title="حذف کاربر"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>هیچ کاربری یافت نشد</p>
          </div>
        )}
      </div>

      {showDetailModal && selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
};

export default UsersList;