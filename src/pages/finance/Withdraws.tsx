import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";
import { MdDelete } from "react-icons/md";

interface Withdrawal {
  id: number;
  withdrawalId: string;
  agentId: string;
  // remark: string;
  transactionId: string;
  availableBalance: number;
  withdrawalAmount: number;
  paymentMode: "Bank" | "UPI" | "";
  bankAccountOrUpiId: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Denied";
  remarks?: string;
}

const validationSchema = Yup.object({
  withdrawalAmount: Yup.number()
    .required("Withdrawal Amount is required")
    .min(1, "Amount must be greater than 0")
    .test("max", "Amount cannot exceed available balance", function (value) {
      return value <= this.parent.availableBalance;
    }),
  paymentMode: Yup.string().required("Payment Mode is required"),
  bankAccountOrUpiId: Yup.string().required(
    "Bank Account / UPI ID is required"
  ),
  remarks: Yup.string(),
});

const Withdraws = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: 1,
      withdrawalId: "WD-1001",
      transactionId: "TXN-5001",
      agentId: "AGT001",
      availableBalance: 12000,
      withdrawalAmount: 5000,
      paymentMode: "UPI",
      bankAccountOrUpiId: "9876543210@paytm",
      requestDate: "2025-10-10",
      status: "Pending",
      remarks: "Payment processed",
    },
    {
      id: 2,
      withdrawalId: "WD-1002",
      transactionId: "TXN-5002",
      agentId: "AGT001",
      availableBalance: 12000,
      withdrawalAmount: 3000,
      paymentMode: "Bank",
      bankAccountOrUpiId: "1234567890",
      requestDate: "2025-10-09",
      status: "Approved",
      remarks: "Processed successfully",
    },
    {
      id: 3,
      withdrawalId: "WD-1003",
      transactionId: "TXN-5003",
      agentId: "AGT001",
      availableBalance: 12000,
      withdrawalAmount: 2000,
      paymentMode: "UPI",
      bankAccountOrUpiId: "9876543211@paytm",
      requestDate: "2025-10-08",
      status: "Denied",
      remarks: "Invalid account details",
    },
  ]);

  // useEffect(()=>{
  //   console.log("Logging withdrawals : " , withdrawals);

  // },[withdrawals])

  const [filteredWithdrawals, setFilteredWithdrawals] = useState(withdrawals);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      withdrawalAmount: editingWithdrawal?.withdrawalAmount || 0,
      paymentMode: editingWithdrawal?.paymentMode || "",
      bankAccountOrUpiId: editingWithdrawal?.bankAccountOrUpiId || "",
      availableBalance: editingWithdrawal?.availableBalance || 12000,
      remarks: editingWithdrawal?.remarks || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      const newWithdrawal: Withdrawal = {
        id: editingWithdrawal ? editingWithdrawal.id : withdrawals.length + 1,
        withdrawalId: editingWithdrawal
          ? editingWithdrawal.withdrawalId
          : `WD-${1001 + withdrawals.length}`,
        transactionId: editingWithdrawal
          ? editingWithdrawal.agentId
          : "TXN-5001",
        agentId: editingWithdrawal ? editingWithdrawal.agentId : "AGT001",
        availableBalance: values.availableBalance,
        withdrawalAmount: values.withdrawalAmount,
        paymentMode: values.paymentMode as "Bank" | "UPI",
        bankAccountOrUpiId: values.bankAccountOrUpiId,
        requestDate: editingWithdrawal
          ? editingWithdrawal.requestDate
          : new Date().toISOString().split("T")[0],
        status: editingWithdrawal ? editingWithdrawal.status : "Pending",
        remarks: values.remarks,
      };

      if (editingWithdrawal) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === editingWithdrawal.id ? newWithdrawal : w))
        );
        Swal.fire(
          "Updated!",
          `Withdrawal request "${newWithdrawal.withdrawalId}" updated successfully!`,
          "success"
        );
      } else {
        setWithdrawals([newWithdrawal, ...withdrawals]);
        Swal.fire(
          "Requested!",
          `Withdrawal request "${newWithdrawal.withdrawalId}" added successfully!`,
          "success"
        );
      }

      setFilteredWithdrawals(
        filterStatus === "All"
          ? [newWithdrawal, ...withdrawals]
          : [newWithdrawal, ...withdrawals].filter(
              (w) => w.status === filterStatus
            )
      );
      setModalOpen(false);
      setEditingWithdrawal(null);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleFilter = (status: string) => {
    setFilterStatus(status);
    if (status === "All") {
      setFilteredWithdrawals(withdrawals);
    } else {
      setFilteredWithdrawals(withdrawals.filter((w) => w.status === status));
    }
  };

  const renderError = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field]}</div>
    ) : null;

  return (
    <div className="">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Filter Withdrawal Requests</h2>
        <div className="flex flex-wrap gap-4">
          {["All", "Pending", "Approved", "Denied"].map((status) => (
            <button
              key={status}
              onClick={() => handleFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              } cursor-pointer hover:bg-blue-500 hover:text-white`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Table */}
      <DataTable
        title="Withdrawal Requests"
        data={filteredWithdrawals}
        columns={[
          { key: "withdrawalId", label: "Withdrawal ID" },
          // { key: "agentId", label: "Agent ID" },
          {
            key: "availableBalance",
            label: "Available Balance",
            render: (item) => `₹${item.availableBalance.toFixed(2)}`,
          },
          {
            key: "withdrawalAmount",
            label: "Withdrawal Amount",
            render: (item) => `₹${item.withdrawalAmount.toFixed(2)}`,
          },
          { key: "paymentMode", label: "Payment Mode" },
          { key: "transactionId", label: "Transaction ID" },
          { key: "bankAccountOrUpiId", label: "Bank Account / UPI ID" },
          { key: "requestDate", label: "Request Date" },
          { key: "remarks", label: "Remarks" },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  item.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        onAdd={() => {
          setEditingWithdrawal(null);
          setModalOpen(true);
        }}
        onEdit={(service) => {
          setEditingWithdrawal(service);
          setModalOpen(true);
        }}
        onDelete={(withdrawal) => {
          Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
          }).then((res) => {
            if (res.isConfirmed) {
              // console.log("Loghging here windraw")

              setWithdrawals((prevWithdrawals) =>
                prevWithdrawals.filter(
                  (w) => w.withdrawalId !== withdrawal.withdrawalId
                )
              );

              setFilteredWithdrawals((prevWithdrawals) =>
                prevWithdrawals.filter(
                  (w) => w.withdrawalId !== withdrawal.withdrawalId
                )
              );
              Swal.fire(
                "Deleted!",
                "Withdrawal deleted successfully.",
                "success"
              );
            }
          });
        }}
        addButtonLabel="Request Withdrawal"
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[85vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingWithdrawal
                ? "Edit Withdrawal Request"
                : "Request Withdrawal"}
            </h2>

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Withdrawal ID (Read-only) */}
                <div>
                  <label className="block mb-1 font-medium">
                    Withdrawal ID
                  </label>
                  <input
                    type="text"
                    value={
                      editingWithdrawal
                        ? editingWithdrawal.withdrawalId
                        : `WD-${1001 + withdrawals.length}`
                    }
                    disabled
                    className="customInput bg-gray-100"
                  />
                </div>

                {/* Agent ID (Read-only) */}
                <div>
                  <label className="block mb-1 font-medium">Agent ID</label>
                  <input
                    type="text"
                    value={
                      editingWithdrawal ? editingWithdrawal.agentId : "AGT001"
                    }
                    disabled
                    className="customInput bg-gray-100"
                  />
                </div>

                {/* Available Balance (Read-only) */}
                <div>
                  <label className="block mb-1 font-medium">
                    Available Balance
                  </label>
                  <input
                    type="text"
                    value={`₹${formik.values.availableBalance.toFixed(2)}`}
                    disabled
                    className="customInput bg-gray-100"
                  />
                </div>

                {/* Withdrawal Amount */}
                <div>
                  <label className="block mb-1 font-medium">
                    Withdrawal Amount
                  </label>
                  <input
                    type="number"
                    name="withdrawalAmount"
                    value={formik.values.withdrawalAmount || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput ${
                      formik.touched.withdrawalAmount &&
                      formik.errors.withdrawalAmount
                        ? "customInputError"
                        : ""
                    }`}
                    placeholder="Enter withdrawal amount"
                  />
                  {/* {renderError("withdrawalAmount")} */}
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block mb-1 font-medium">Payment Mode</label>

                  <select
                    name="paymentMode"
                    value={formik.values.paymentMode || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customSelect ${
                      formik.touched.paymentMode && formik.errors.paymentMode
                        ? "paymentSelectError"
                        : formik.values.paymentMode
                        ? "filled"
                        : ""
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="Bank">Bank</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                {/* Bank Account / UPI ID */}
                <div>
                  <label className="block mb-1 font-medium">
                    Bank Account / UPI ID
                  </label>
                  <input
                    type="text"
                    name="bankAccountOrUpiId"
                    value={formik.values.bankAccountOrUpiId || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput ${
                      formik.touched.bankAccountOrUpiId &&
                      formik.errors.bankAccountOrUpiId
                        ? "customInputError"
                        : ""
                    }`}
                    placeholder="Enter bank account or UPI ID"
                  />
                  {/* {renderError("bankAccountOrUpiId")} */}
                </div>

                {/* Request Date (Read-only) */}
                <div>
                  <label className="block mb-1 font-medium">Request Date</label>
                  <input
                    type="text"
                    value={
                      editingWithdrawal
                        ? editingWithdrawal.requestDate
                        : new Date().toISOString().split("T")[0]
                    }
                    disabled
                    className="customInput bg-gray-100"
                  />
                </div>

                {/* Remarks (Admin-only, optional) */}
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">
                    Remarks (Admin Only)
                  </label>
                  <textarea
                    name="remarks"
                    value={formik.values.remarks || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`customInput inputOptional ${
                      formik.touched.remarks && formik.errors.remarks
                        ? "customInputError"
                        : ""
                    }`}
                    placeholder="Enter remarks (optional)"
                    rows={4}
                  />
                  {/* {renderError("remarks")} */}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraws;
