// src/pages/CommissionReportPage.tsx
import React, { useState, useEffect } from "react";
import { privateAxios } from "../../api/axios";
import {
  FaSync, FaRupeeSign, FaHistory, FaFilter,
  FaCheckCircle, FaTimesCircle, FaChartBar, FaStore, FaBuilding,
} from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommissionTransaction {
  id: number;
  order: string | null;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  date: string;
}

interface LevelBreakdown {
  level: number;
  total: number;
  count: number;
}

interface Summary {
  total_commission: number;
  total_mlm_commission: number;
  total_pos_profit: number;
  total_society_profit: number;
  total_transactions: number;
  average_commission: number;
  agent_total_sales: number;
  is_active: boolean;
  minimum_required: number;
}

interface ApiResponse {
  user_type: string;
  agent_type: string;
  summary: Summary;
  level_breakdown: LevelBreakdown[];
  transactions: CommissionTransaction[];
  pos_transactions: CommissionTransaction[];
  society_transactions: CommissionTransaction[];
}

type TabType = "commission" | "pos" | "society";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-indigo-100 text-indigo-800",
  3: "bg-purple-100 text-purple-800",
  4: "bg-pink-100 text-pink-800",
  5: "bg-rose-100 text-rose-800",
};
const levelBadge = (l: number) => LEVEL_COLORS[l] ?? "bg-gray-100 text-gray-700";

const LEVEL_BAR_COLORS = [
  "bg-blue-500", "bg-indigo-500", "bg-purple-500",
  "bg-pink-500", "bg-rose-500", "bg-amber-500",
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─── Transaction Table ────────────────────────────────────────────────────────

interface TxTableProps {
  transactions: CommissionTransaction[];
  showLevel?: boolean;
  showPercentage?: boolean;
  emptyMsg?: string;
}

const TxTable: React.FC<TxTableProps> = ({
  transactions,
  showLevel = true,
  showPercentage = true,
  emptyMsg = "No records yet",
}) => {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const totalPages = Math.ceil(transactions.length / PER_PAGE);
  const paginated  = transactions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600 font-medium">{emptyMsg}</p>
        <p className="text-gray-400 text-sm mt-1">
          Records appear when eligible orders are delivered.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Order</th>
              {showLevel     && <th className="px-5 py-3 text-left">Level</th>}
              {showPercentage && <th className="px-5 py-3 text-left">%</th>}
              <th className="px-5 py-3 text-left">Amount</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((tx, i) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {(page - 1) * PER_PAGE + i + 1}
                </td>
                <td className="px-5 py-3 font-medium text-indigo-600">
                  {tx.order ?? "—"}
                </td>
                {showLevel && (
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelBadge(tx.level)}`}>
                      L{tx.level}
                    </span>
                  </td>
                )}
                {showPercentage && (
                  <td className="px-5 py-3 text-gray-700 font-medium">
                    {tx.percentage > 0 ? `${tx.percentage}%` : "—"}
                  </td>
                )}
                <td className="px-5 py-3 font-bold text-green-600">
                  {fmt(tx.amount)}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium capitalize bg-emerald-50 text-emerald-700">
                    {tx.type === "pos_profit"
                      ? "POS Profit"
                      : tx.type === "service_profit"
                      ? "Society Profit"
                      : "Commission"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {formatDate(tx.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginated.map(tx => (
          <div key={tx.id} className="px-4 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-indigo-600 text-sm">{tx.order ?? "—"}</span>
              <span className="font-bold text-green-600">{fmt(tx.amount)}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {showLevel && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge(tx.level)}`}>
                  L{tx.level}
                </span>
              )}
              {showPercentage && tx.percentage > 0 && (
                <span className="text-xs text-gray-500">{tx.percentage}%</span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 capitalize">
                {tx.type === "pos_profit"
                  ? "POS Profit"
                  : tx.type === "service_profit"
                  ? "Society Profit"
                  : "Commission"}
              </span>
            </div>
            <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm font-semibold text-gray-700">
          Total:{" "}
          <span className="text-green-600">
            {fmt(transactions.reduce((s, t) => s + t.amount, 0))}
          </span>
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm disabled:opacity-40 hover:bg-gray-200"
            >‹</button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-sm disabled:opacity-40 hover:bg-gray-200"
            >›</button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CommissionReportPage: React.FC = () => {
  const [data, setData]       = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("commission");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await privateAxios.get<ApiResponse>("/api/mlm/commission-report/");
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Failed to load commission data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading)
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading commission data…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchData}
          className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium">
          Retry
        </button>
      </div>
    );

  if (!data) return null;

  const { summary, level_breakdown, transactions, pos_transactions,
          society_transactions, agent_type } = data;

  const isPOS     = agent_type === "pos";
  const isSociety = agent_type === "society";
  const hasExtraProfit = isPOS || isSociety;

  // Filtered MLM transactions
  const filteredMlm = filterLevel === "all"
    ? transactions
    : transactions.filter(tx => tx.level === filterLevel);

  const levels = [...new Set(transactions.map(tx => tx.level))].sort();
  const maxBreakdown = Math.max(...(level_breakdown.map(l => l.total) ?? [1]), 1);

  // Tab config
  const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: "commission",
      label: "MLM Commission",
      icon: <FaRupeeSign />,
      count: transactions.length,
    },
    ...(isPOS ? [{
      key: "pos" as TabType,
      label: "POS Profit",
      icon: <FaStore />,
      count: pos_transactions.length,
    }] : []),
    ...(isSociety ? [{
      key: "society" as TabType,
      label: "Society Profit",
      icon: <FaBuilding />,
      count: society_transactions.length,
    }] : []),
  ];

  return (
    <div className="space-y-6">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Earnings"
          value={fmt(summary.total_commission)}
          icon={<FaRupeeSign />}
          color="green"
        />
        <StatCard
          label="MLM Commission"
          value={fmt(summary.total_mlm_commission)}
          icon={<FaChartBar />}
          color="blue"
        />
        {isPOS && (
          <StatCard
            label="POS Profit"
            value={fmt(summary.total_pos_profit)}
            icon={<FaStore />}
            color="purple"
          />
        )}
        {isSociety && (
          <StatCard
            label="Society Profit"
            value={fmt(summary.total_society_profit)}
            icon={<FaBuilding />}
            color="purple"
          />
        )}
        <StatCard
          label="Your Total Sales"
          value={fmt(summary.agent_total_sales)}
          icon={<FaRupeeSign />}
          color="indigo"
          sub={
            summary.is_active
              ? <span className="flex items-center gap-1 text-green-600 text-xs"><FaCheckCircle /> Active</span>
              : <span className="flex items-center gap-1 text-gray-500 text-xs"><FaTimesCircle /> Inactive — Need {fmt(summary.minimum_required)}</span>
          }
        />
      </div>

      {/* ── Level Breakdown (only for MLM) ── */}
      {level_breakdown.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">MLM Commission by Level</h3>
          <div className="space-y-3">
            {level_breakdown.map((lb, i) => (
              <div key={lb.level}>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${levelBadge(lb.level)}`}>
                    Level {lb.level}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {fmt(lb.total)}
                    <span className="text-gray-400 font-normal ml-1">({lb.count} txns)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${LEVEL_BAR_COLORS[i % LEVEL_BAR_COLORS.length]} rounded-full transition-all duration-700`}
                    style={{ width: `${(lb.total / maxBreakdown) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs (only for POS/Society agents) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {hasExtraProfit && (
          <div className="flex border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all
                  ${activeTab === tab.key
                    ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs
                  ${activeTab === tab.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            {activeTab === "commission" && "MLM Commission History"}
            {activeTab === "pos"        && "POS Profit History"}
            {activeTab === "society"    && "Society Profit History"}
          </h3>
          <div className="flex items-center gap-3">
            {/* Level filter — only for commission tab */}
            {activeTab === "commission" && levels.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <FaFilter className="text-gray-400 text-xs" />
                {(["all", ...levels] as (number | "all")[]).map(l => (
                  <button key={l}
                    onClick={() => setFilterLevel(l)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                      ${filterLevel === l
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {l === "all" ? "All" : `L${l}`}
                  </button>
                ))}
              </div>
            )}
            <button onClick={fetchData}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
              <FaSync size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "commission" && (
          <TxTable
            transactions={filteredMlm}
            showLevel={true}
            showPercentage={true}
            emptyMsg="No MLM commission records yet"
          />
        )}

        {activeTab === "pos" && (
          <TxTable
            transactions={pos_transactions}
            showLevel={false}
            showPercentage={false}
            emptyMsg="No POS profit records yet"
          />
        )}

        {activeTab === "society" && (
          <TxTable
            transactions={society_transactions}
            showLevel={false}
            showPercentage={false}
            emptyMsg="No Society profit records yet"
          />
        )}
      </div>
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  green:  "bg-green-100 text-green-600 border-green-400",
  blue:   "bg-blue-100 text-blue-600 border-blue-400",
  purple: "bg-purple-100 text-purple-600 border-purple-400",
  indigo: "bg-indigo-100 text-indigo-600 border-indigo-400",
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: React.ReactNode;
}> = ({ label, value, icon, color, sub }) => (
  <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${COLOR_MAP[color]}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
      <div className={`p-2.5 rounded-xl ${COLOR_MAP[color].split(" ")[0]}`}>
        <span className={COLOR_MAP[color].split(" ")[1]}>{icon}</span>
      </div>
    </div>
  </div>
);

export default CommissionReportPage;