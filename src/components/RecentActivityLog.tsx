import { type FC } from "react"
import DataTable from "./common/DataTable"
import { FaClipboardList } from "react-icons/fa"

type Props = {
  className?: string
}

const RecentActivityLog: FC<Props> = ({ className = "" }) => {
  const activityLogs = [
    {
      id: 1,
      inquiryId: "INQ-1021",
      date: "09 Oct 2025",
      action: "Completed Service",
      status: "Completed",
    },
    {
      id: 2,
      inquiryId: "INQ-1018",
      date: "08 Oct 2025",
      action: "Follow-up Scheduled",
      status: "Pending",
    },
    {
      id: 3,
      inquiryId: "INQ-1009",
      date: "07 Oct 2025",
      action: "New Inquiry",
      status: "Active",
    },
    {
      id: 4,
      inquiryId: "INQ-1012",
      date: "06 Oct 2025",
      action: "Document Submitted",
      status: "Completed",
    },
    {
      id: 5,
      inquiryId: "INQ-1007",
      date: "05 Oct 2025",
      action: "Inquiry Assigned",
      status: "Active",
    },
  ]

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center mb-5">
        <FaClipboardList className="text-indigo-600 text-xl mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
          Recent Activity Log
        </h2>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <DataTable
          title=""
          data={activityLogs}
          columns={[
            {
              key: "inquiryId",
              label: "Inquiry ID",
              render: (item) => (
                <div className="font-semibold text-[15px] text-gray-900">
                  {item.inquiryId}
                </div>
              ),
            },
            {
              key: "date",
              label: "Date",
              render: (item) => (
                <div className="text-gray-700 text-[14px] font-medium">
                  {item.date}
                </div>
              ),
            },
            {
              key: "action",
              label: "Action",
              render: (item) => (
                <div className="text-gray-700 text-[14px]">{item.action}</div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item) => (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

export { RecentActivityLog }
