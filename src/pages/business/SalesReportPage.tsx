// src/pages/SalesReportPage.tsx
import React, { useState, useEffect } from "react";
import { privateAxios } from "../../api/axios";
import DataTable from "../../components/common/DataTable";
import { FaSync, FaRupeeSign, FaShoppingCart, FaUndo } from "react-icons/fa";

interface OrderRow {
  order_number: string;
  product_name: string | null;
  customer: string;
  amount: number;
  status: string;
  payment_status: string;
  date: string;
  source: "website" | "pos";
  is_referral: boolean;
  is_own: boolean;
  is_refunded: boolean;
  commission_eligible: boolean;
  commission_reason: string;
  commission_processed: boolean;
}

interface SalesData {
  agent: string;
  is_active: boolean;
  total_sales: number;
  computed_running_total: number;
  delivered_sales: number;
  refunded_total: number;
  total_orders: number;
  minimum_required: number;
  remaining_for_activation: number;
  orders: OrderRow[];
}

interface Row extends OrderRow {
  id: number;
}

const formatCurrency = (amount: number): string =>
  `₹ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });

const getStatusColor = (status: string, isRefunded: boolean): string => {
  if (isRefunded) return "bg-red-100 text-red-800";
  switch (status.toLowerCase()) {
    case "delivered": return "bg-green-100 text-green-800";
    case "pending":   return "bg-yellow-100 text-yellow-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default:          return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "paid":    return "bg-green-100 text-green-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "failed":  return "bg-red-100 text-red-800";
    default:        return "bg-gray-100 text-gray-800";
  }
};

const SalesReportPage: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await privateAxios.get<SalesData>("/api/mlm/agent/sales/");
      setSalesData(response.data);

      const formatted: Row[] = response.data.orders.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      setRows(formatted);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError("You are not registered as an agent.");
      } else if (error.response?.status === 401) {
        setError("Please login to view your sales.");
      } else {
        setError(error.response?.data?.error || "Failed to load sales data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your sales data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !salesData) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button
            onClick={fetchSalesData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-2xl font-bold">Sales Report</h1>
            <p className="text-blue-100 mt-1">Welcome back, {salesData.agent}</p>
          </div>
          <button
            onClick={fetchSalesData}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Refresh"
          >
            <FaSync className="text-white" size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(salesData.total_sales)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {salesData.is_active ? " Active" : `Need ${formatCurrency(salesData.remaining_for_activation)} more`}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaRupeeSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items/Orders</p>
              <p className="text-2xl font-bold text-gray-800">{salesData.total_orders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered Sales</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(salesData.delivered_sales)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <FaRupeeSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        {/* ✅ NAYA — refunded amount alag se dikh raha, red mein, clearly total se minus */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refunded / Returned</p>
              <p className="text-2xl font-bold text-red-600">- {formatCurrency(salesData.refunded_total)}</p>
              <p className="text-xs text-gray-400 mt-1">Excluded from total sales</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaUndo className="text-red-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <DataTable
          title="Order / Item Details"
          data={rows}
          columns={[
            {
              key: "order_number" as keyof Row,
              label: "Order No.",
              render: (item: Row) => (
                <span className={`font-medium ${item.is_refunded ? "text-red-500 line-through" : "text-blue-600"}`}>
                  {item.order_number}
                </span>
              ),
            },
            {
              key: "product_name" as keyof Row,
              label: "Product",
              render: (item: Row) => (
                <span className="text-gray-700">{item.product_name || "—"}</span>
              ),
            },
            { key: "customer" as keyof Row, label: "Customer" },
            {
              key: "amount" as keyof Row,
              label: "Amount",
              render: (item: Row) => (
                <span className={item.is_refunded ? "text-red-500 line-through" : "text-gray-800 font-medium"}>
                  {formatCurrency(item.amount)}
                </span>
              ),
            },
            {
              key: "status" as keyof Row,
              label: "Status",
              render: (item: Row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status, item.is_refunded)}`}>
                  {item.is_refunded ? "Refunded" : item.status}
                </span>
              ),
            },
            {
              key: "payment_status" as keyof Row,
              label: "Payment",
              render: (item: Row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                  {item.payment_status}
                </span>
              ),
            },
            {
              key: "commission_eligible" as keyof Row,
              label: "Commission",
              render: (item: Row) =>
                item.is_refunded ? (
                  <span className="text-xs text-red-500">Reversed</span>
                ) : item.commission_eligible ? (
                  <span className="text-xs text-green-600 font-medium">Eligible</span>
                ) : (
                  <span className="text-xs text-gray-400">{item.commission_reason.replace(/_/g, " ")}</span>
                ),
            },
            {
              key: "date" as keyof Row,
              label: "Order Date",
              render: (item: Row) => formatDate(item.date),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default SalesReportPage; 