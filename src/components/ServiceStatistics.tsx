import { useEffect, useRef, useState, type FC, type JSX } from 'react'
import ApexCharts from 'apexcharts'
import type { ApexOptions } from 'apexcharts'
import { FaWallet, FaUserFriends } from 'react-icons/fa'
import { MdOutlineAttachMoney, MdBarChart } from 'react-icons/md'
import { AiOutlineStar, AiOutlineShoppingCart } from 'react-icons/ai'
import { BsCurrencyExchange } from 'react-icons/bs'

type Props = {
  className?: string
  chartColor: string
  chartHeight: string
}

const tabs: { id: 'month' | 'week' | 'day'; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
]

// ==========================================
// UPDATED DATA BASED ON BUSINESS ANALYTICS
// ==========================================
const dataByTab = {
  month: {
    stats: [
      { label: 'Total Sales (Own + Network)', amount: '₹1,20,000', color: 'bg-blue-100 text-blue-600', icon: <MdBarChart /> },
      { label: 'Total Commission Earned', amount: '₹12,000', color: 'bg-green-100 text-green-600', icon: <MdOutlineAttachMoney /> },
      { label: 'Available Balance', amount: '₹8,000', color: 'bg-purple-100 text-purple-600', icon: <FaWallet /> },
      { label: 'Monthly Commission', amount: '₹2,500', color: 'bg-orange-100 text-orange-600', icon: <BsCurrencyExchange /> },
    ],
    chartData: [20, 25, 40, 35, 55, 60],
  },
  week: {
    stats: [
      { label: 'Total Sales (Own + Network)', amount: '₹32,000', color: 'bg-blue-100 text-blue-600', icon: <MdBarChart /> },
      { label: 'Total Commission Earned', amount: '₹3,200', color: 'bg-green-100 text-green-600', icon: <MdOutlineAttachMoney /> },
      { label: 'Available Balance', amount: '₹2,000', color: 'bg-purple-100 text-purple-600', icon: <FaWallet /> },
      { label: 'Monthly Commission', amount: '₹750', color: 'bg-orange-100 text-orange-600', icon: <BsCurrencyExchange /> },
    ],
    chartData: [10, 12, 18, 20, 22, 24],
  },
  day: {
    stats: [
      { label: 'Total Sales (Own + Network)', amount: '₹5,000', color: 'bg-blue-100 text-blue-600', icon: <MdBarChart /> },
      { label: 'Total Commission Earned', amount: '₹450', color: 'bg-green-100 text-green-600', icon: <MdOutlineAttachMoney /> },
      { label: 'Available Balance', amount: '₹250', color: 'bg-purple-100 text-purple-600', icon: <FaWallet /> },
      { label: 'Monthly Commission', amount: '₹120', color: 'bg-orange-100 text-orange-600', icon: <BsCurrencyExchange /> },
    ],
    chartData: [3, 5, 8, 4, 6, 9],
  },
}

const getCSSVariableValue = (variableName: string) => {
  let hex = getComputedStyle(document.documentElement).getPropertyValue(variableName)
  return hex ? hex.trim() : ''
}

const ServiceStatistics: FC<Props> = ({ className = '', chartColor, chartHeight }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const [activeTab, setActiveTab] = useState<keyof typeof dataByTab>('month')

  useEffect(() => {
    if (!chartRef.current) return
    const chart = new ApexCharts(
      chartRef.current,
      chartOptions(chartColor, chartHeight, dataByTab[activeTab].chartData)
    )
    chart.render()
    return () => {
      chart.destroy()
    }
  }, [chartRef, activeTab, chartColor, chartHeight])

  return (
    <div className={`rounded-2xl shadow-md bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Sales & Commission Overview
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Track your sales and commission performance
          </p>
        </div>

        <div className='flex mt-4 md:mt-0 bg-gray-100 dark:bg-gray-800 rounded-full p-1'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className='p-6'>
        <div className='grid grid-cols-2 gap-4 mb-6'>
          {dataByTab[activeTab].stats.map((item) => (
            <StatItem
              key={item.label}
              color={item.color}
              icon={item.icon}
              amount={item.amount}
              label={item.label}
            />
          ))}
        </div>
        <div ref={chartRef} className='w-full'></div>
      </div>
    </div>
  )
}

const StatItem: FC<{ color: string; icon: JSX.Element; amount: string; label: string }> = ({
  color,
  icon,
  amount,
  label,
}) => (
  <div className='flex items-center space-x-3'>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <div className='text-gray-900 dark:text-white font-semibold text-base'>{amount}</div>
      <div className='text-gray-500 dark:text-gray-400 text-sm'>{label}</div>
    </div>
  </div>
)

const chartOptions = (chartColor: string, chartHeight: string, seriesData: number[]): ApexOptions => {
  const baseColor = getCSSVariableValue('--tw-color-' + chartColor) || '#4f46e5'
  const lightColor = baseColor + '33'
  const labelColor = getCSSVariableValue('--tw-prose-body') || '#6b7280'

  return {
    series: [{ name: 'Sales', data: seriesData }],
    chart: {
      type: 'area',
      height: chartHeight,
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    colors: [baseColor],
    fill: { type: 'solid', opacity: 0.2, colors: [lightColor] },
    stroke: { curve: 'smooth', width: 3, colors: [baseColor] },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      labels: { show: false, style: { colors: labelColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: Math.max(...seriesData) + 10,
      labels: { show: false, style: { colors: labelColor } },
    },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `₹${val}` } },
  }
}

export { ServiceStatistics }
