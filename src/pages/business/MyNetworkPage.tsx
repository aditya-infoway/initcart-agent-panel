import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

interface AgentChild {
  id: number;
  childAgentId: string;
  childAgentName: string;
  joiningDate: string;
  currentLevel: "Bronze" | "Silver" | "Gold";
  totalSales: number;
  totalCommission: number;
  parentAgentId: string;
  status: "Active" | "Inactive";
}

const validationSchema = Yup.object({
  childAgentName: Yup.string().required("Child Agent Name is required"),
  joiningDate: Yup.date().required("Joining Date is required"),
  currentLevel: Yup.string().required("Current Level is required"),
});

const MyNetworkPage = () => {
  const [agents, setAgents] = useState<AgentChild[]>([]);
  const [editingAgent, setEditingAgent] = useState<AgentChild | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      childAgentName: editingAgent?.childAgentName || "",
      joiningDate: editingAgent?.joiningDate || "",
      currentLevel: editingAgent?.currentLevel || "Bronze",
      status: editingAgent?.status || "Active",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      if (editingAgent) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === editingAgent.id ? { ...editingAgent, ...values } : a
          )
        );
        Swal.fire("Updated!", `"${values.childAgentName}" updated successfully!`, "success");
      } else {
        const newAgent: AgentChild = {
          id: agents.length + 1,
          childAgentId: `AGT${100 + agents.length + 1}`,
          parentAgentId: "AGT001",
          totalSales: 0,
          totalCommission: 0,
          ...values,
        };
        setAgents([newAgent, ...agents]);
        Swal.fire("Added!", `"${values.childAgentName}" added successfully!`, "success");
      }
      setModalOpen(false);
      setEditingAgent(null);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const renderError = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field]}</div>
    ) : null;

  return (
    <div className="">
      <DataTable
        title="My Network / Team Hierarchy"
        data={agents}
        columns={[
          // { key: "id", label: "Sr. No." },
          { key: "childAgentId", label: "Child Agent ID" },
          { key: "childAgentName", label: "Child Agent Name" },
          { key: "joiningDate", label: "Joining Date" },
          {
            key: "currentLevel",
            label: "Current Level",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  item.currentLevel === "Bronze"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.currentLevel === "Silver"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {item.currentLevel}
              </span>
            ),
          },
          { key: "totalSales", label: "Total Sales (Child)", render: (item) => `₹ ${item.totalSales}` },
          { key: "totalCommission", label: "Total Commission (Child)", render: (item) => `₹ ${item.totalCommission}` },
          { key: "parentAgentId", label: "Parent Agent ID" },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  item.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            ),
          },
          {
            key: "viewSubtree",
            label: "View Subtree",
            render: (item) => (
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                onClick={() => Swal.fire("Subtree", `Open hierarchy for ${item.childAgentName}`, "info")}
              >
                Open Hierarchy
              </button>
            ),
          },
        ]}
      />


      
    </div>
  );
};

export default MyNetworkPage;
