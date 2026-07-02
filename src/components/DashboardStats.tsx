import { type FC, type JSX } from "react"
import { FaUserFriends, FaUsers, FaChartPie, FaMoneyCheckAlt } from "react-icons/fa"

interface StatItem {
  label: string
  value: string | number
  icon: JSX.Element
  bgColor?: string
}

const dashboardStats: StatItem[] = [
  
]

const DashboardStats: FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {dashboardStats.map((stat) => (
        <div
          key={stat.label}
          className="relative bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-gray-500 font-medium">{stat.label}</p>
            <p className="text-gray-900 text-xl font-extrabold mt-1">{stat.value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} text-white shadow-sm`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  )
}

export { DashboardStats }
