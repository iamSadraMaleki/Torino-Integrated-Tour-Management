import React, { useState } from "react";
import FoodsList from "./FoodsList";
import InventoryList from "./InventoryList";
import ShoppingList from "./ShoppingList";
import "./FoodsManagement.css";

const FoodsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"foods" | "inventory" | "shopping">("foods");

  return (
    <div className="foods-management-container">
      <div className="page-header-simple">
        <h1>🍽️ مدیریت غذاها</h1>
        <p>مدیریت غذاها، انبار مواد اولیه و لیست خرید آژانس خود</p>
      </div>

      <div className="foods-tabs">
        <button
          className={`tab-btn ${activeTab === "foods" ? "active" : ""}`}
          onClick={() => setActiveTab("foods")}
        >
          🍽️ غذاها
        </button>
        <button
          className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          📦 انبار
        </button>
        <button
          className={`tab-btn ${activeTab === "shopping" ? "active" : ""}`}
          onClick={() => setActiveTab("shopping")}
        >
          🛒 لیست خرید
        </button>
      </div>

      <div className="foods-tab-content">
        {activeTab === "foods" && <FoodsList />}
        {activeTab === "inventory" && <InventoryList />}
        {activeTab === "shopping" && <ShoppingList />}
      </div>
    </div>
  );
};

export default FoodsManagement;