import React, { useState, useEffect, type JSX } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";
import { privateAxios } from "../../api/axios"; // ✅ Using privateAxios
import { FaSync, FaRupeeSign, FaShoppingCart, FaUsers } from "react-icons/fa";

// ==================== Type Definitions ====================

interface Order {
  order_number: string;
  customer: string;
  amount: number;
  status: string;
  payment_status: string;
  date: string;
}

interface SalesData {
  agent: string;
  total_sales: number;
  total_orders: number;
  orders: Order[];
}

interface Sale extends Order {
  id: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  agentLevel?: string;
}

// API Error Response Interface
interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
  message: string;
}

// ==================== Component ====================

const SalesReportPage: React.FC = () => {
  // ==================== State Management ====================
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [agentName, setAgentName] = useState<string>("");
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ==================== Fetch Sales Data ====================

  const fetchSalesData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Using privateAxios (automatically adds token and handles refresh)
      const response = await privateAxios.get<SalesData>("/api/mlm/agent/sales/");
      
      console.log("Sales data:", response.data);
      
      setAgentName(response.data.agent);
      setTotalSales(response.data.total_sales);
      setTotalOrders(response.data.total_orders);
      
      // Transform API orders to Sale format with proper typing
      const formattedSales: Sale[] = response.data.orders.map((order: Order, index: number) => ({
        id: index + 1,
        order_number: order.order_number,
        customer: order.customer,
        amount: order.amount,
        status: order.status,
        payment_status: order.payment_status,
        date: new Date(order.date).toLocaleDateString('en-IN'),
        // Default values for commission (can be edited later)
        commissionPercentage: 0,
        commissionAmount: 0,
        agentLevel: "Silver", // This would come from agent profile
      }));
      
      setSales(formattedSales);
      
    } catch (error: unknown) {
      console.error("Error fetching sales:", error);
      
      // Type guard for axios error
      const apiError = error as ApiError;
      
      if (apiError.response?.status === 400) {
        setError("You are not registered as an agent.");
      } else if (apiError.response?.status === 401) {
        setError("Please login to view your sales.");
      } else {
        setError(apiError.response?.data?.error || "Failed to load sales data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  // ==================== Form Validation Schema ====================

  const validationSchema = Yup.object({
    commissionPercentage: Yup.number()
      .required("Commission % is required")
      .min(0, "Must be at least 0")
      .max(100, "Cannot exceed 100"),
    commissionAmount: Yup.number()
      .required("Commission Amount is required")
      .min(0, "Cannot be negative"),
  });

  // ==================== Formik Setup ====================

  const formik = useFormik({
    initialValues: {
      commissionPercentage: editingSale?.commissionPercentage || 0,
      commissionAmount: editingSale?.commissionAmount || 0,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values: { commissionPercentage: number; commissionAmount: number }) => {
      setIsSubmitting(true);
      
      try {
        if (editingSale) {
          // Update commission in local state
          setSales((prev: Sale[]) =>
            prev.map((s: Sale) =>
              s.id === editingSale.id 
                ? { 
                    ...s, 
                    commissionPercentage: values.commissionPercentage,
                    commissionAmount: values.commissionAmount 
                  } 
                : s
            )
          );
          
          // Here you can also save to backend if you have API for commission updates
          // await privateAxios.post(`/api/mlm/agent/commission/${editingSale.order_number}/`, values);
          
          await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: `Commission for Order ${editingSale.order_number} updated successfully!`,
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        setModalOpen(false);
        setEditingSale(null);
        formik.resetForm();
        
      } catch (error: unknown) {
        const apiError = error as ApiError;
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: apiError.response?.data?.error || "Failed to update commission.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // ==================== Helper Functions ====================

  const renderError = (field: keyof typeof formik.errors): JSX.Element | null => {
    if (formik.touched[field] && formik.errors[field]) {
      return (
        <div className="text-red-500 text-sm mt-1">{formik.errors[field] as string}</div>
      );
    }
    return null;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ==================== Loading State ====================

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent 
                          rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your sales data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Error State ====================

  if (error) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==================== Main Render ====================

  return (
    <div className="space-y-6">
      {/* Header with Agent Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-2xl font-bold">Sales Report</h1>
            <p className="text-blue-100 mt-1">Welcome back, {agentName}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaRupeeSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commission Earned</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(sales.reduce((sum: number, sale: Sale) => sum + (sale.commissionAmount || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaUsers className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <DataTable
          title="Order Details"
          data={sales}
          columns={[
            { 
              key: "order_number" as keyof Sale, 
              label: "Order No.",
              render: (item: Sale) => (
                <span className="font-medium text-blue-600">{item.order_number}</span>
              )
            },
            { key: "customer" as keyof Sale, label: "Customer" },
            {
              key: "amount" as keyof Sale,
              label: "Order Amount",
              render: (item: Sale) => formatCurrency(item.amount),
            },
            {
              key: "status" as keyof Sale,
              label: "Status",
              render: (item: Sale) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              ),
            },
            {
              key: "payment_status" as keyof Sale,
              label: "Payment",
              render: (item: Sale) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                  {item.payment_status}
                </span>
              ),
            },
            { 
              key: "date" as keyof Sale, 
              label: "Order Date",
              render: (item: Sale) => formatDate(item.date)
            },
          ]}

        />
      </div>  
    </div>
  );
};

export default SalesReportPage;