import React, { type FC, type JSX } from "react";
import { MdOutlineAttachMoney } from "react-icons/md";
import { FaUserFriends, FaNetworkWired, FaUsers, FaMoneyCheckAlt } from "react-icons/fa";
import { BsCurrencyExchange } from "react-icons/bs";
import { AiOutlineShoppingCart, AiOutlineStar } from "react-icons/ai";

interface StatsItem {
  label: string;
  value: string | number;
  icon: JSX.Element;
  bgColor?: string;
}

const analyticsStats: StatsItem[] = [
  {
    label: "Total Sales (Own + Network)",
    value: "₹ 1,20,000",
    icon: <FaNetworkWired size={24} />,
    bgColor: "from-blue-500 to-indigo-500",
  },
  {
    label: "Total Commission Earned",
    value: "₹ 12,000",
    icon: <MdOutlineAttachMoney size={24} />,
    bgColor: "from-green-500 to-emerald-600",
  },
  {
    label: "Available Balance",
    value: "₹ 8,000",
    icon: <BsCurrencyExchange size={24} />,
    bgColor: "from-purple-500 to-pink-500",
  },
  {
    label: "Monthly Commission",
    value: "₹ 2,500",
    icon: <MdOutlineAttachMoney size={24} />,
    bgColor: "from-orange-400 to-red-500",
  },
  {
    label: "Active Downline Agents",
    value: 6,
    icon: <FaUserFriends size={24} />,
    bgColor: "from-teal-500 to-cyan-500",
  },
  {
    label: "Total Orders via Referral",
    value: 45,
    icon: <AiOutlineShoppingCart size={24} />,
    bgColor: "from-pink-500 to-rose-500",
  },
  { label: "Total Agents", value: 320, icon: <FaUsers size={24} />, bgColor: "from-blue-500 to-indigo-500" },
  { label: "Active Agents", value: 280, icon: <FaUserFriends size={24} />, bgColor: "from-green-500 to-emerald-600" },
  { label: "Total Commission Paid", value: "₹ 10,000", icon: <FaMoneyCheckAlt size={24} />, bgColor: "from-orange-400 to-red-500" },
];

const BusinessAnalytics: FC = () => {
  const currentLevel = "Gold Business Associate";

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="flex items-center text-gray-900 font-semibold text-xl tracking-wide">
        <FaNetworkWired className="mr-2 text-indigo-600" /> Business Performance Overview
      </h2>

      {/* Current Level Badge */}
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full shadow-sm font-semibold text-sm sm:text-base">
          <AiOutlineStar size={18} className="text-white" />
          <span>{currentLevel}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {analyticsStats.map((stat) => (
          <div
            key={stat.label}
            className="relative bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-500 font-medium">{stat.label}</p>
              <p className="text-gray-900 text-xl font-extrabold mt-1">
                {stat.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} text-white shadow-sm`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessAnalytics;
