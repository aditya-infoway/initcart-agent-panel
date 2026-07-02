import {
  MdDashboard,
  MdRealEstateAgent,
  MdHealthAndSafety,
  MdOutlinePendingActions,
} from "react-icons/md";
import {
  FaUserTie,
  FaHotel,
  FaSchool,
  FaPlane,
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaClipboardList,
  FaUserClock,
  FaNetworkWired,
  FaChartBar,
  FaInfoCircle,
  FaBell,
} from "react-icons/fa";
import { GiWeightLiftingUp, GiScissors, GiTechnoHeart } from "react-icons/gi";
import {
  RiCoupon3Fill,
  RiFileList3Fill,
  RiBarChartBoxFill,
  RiShoppingBag3Fill,
} from "react-icons/ri";
import { HiReceiptRefund } from "react-icons/hi";
import { PiHandWithdrawFill } from "react-icons/pi";
import React from "react";

/* ===============================
   INTERFACES
=============================== */
interface SubMenu {
  name: string;
  to: string;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  to?: string;
  submenu?: SubMenu[];
}

interface MenuCategory {
  category?: string;
  items: MenuItem[];
}

/* ===============================
   COMMON MENUS (Shared by All)
=============================== */
const commonMenus: MenuCategory[] = [
  {
    category: "Main",
    items: [
      {
        title: "Dashboard",
        icon: <MdDashboard size={20} />,
        to: "/",
        submenu: [],
      },
    ],
  },
  {
    category: "Business",
    items: [
      // {
      //   title: "Network",
      //   icon: <FaNetworkWired size={20} />,
      //   to: "/mynetwork",
      //   submenu: [],
      // },
      {
        title: "Downline Agents",
        icon: <FaNetworkWired size={20} />,
        to: "/AgentHierarchyTreeView",
        submenu: [],
      },
            {
        title: "Upline Agents",
        icon: <FaNetworkWired size={20} />,
        to: "/uplineTreeView",
        submenu: [],
      },
      {
        title: "Sales Report",
        icon: <FaChartBar size={20} />,
        to: "/salesreport",
        submenu: [],
      },
      {
        title: "Commission Report",
        icon: <FaMoneyCheckAlt size={20} />,
        to: "/commissionreport",
        submenu: [],
      },
      {
        title: "Level Information",
        icon: <FaInfoCircle size={20} />,
        to: "/levelinformation",
        submenu: [],
      },
      {
        title: "Notifications",
        icon: <FaBell size={20} />,
        to: "/notifications",
        submenu: [],
      },
    ],
  },
  {
    category: "Finance",
    items: [
      {
        title: "Withdraws",
        icon: <PiHandWithdrawFill size={20} />,
        to: "/withdraws",
        submenu: [],
      },
    ],
  },
  // {
  //   category: "Reports",
  //   items: [
  //     {
  //       title: "Reports & Analytics",
  //       icon: <RiBarChartBoxFill size={20} />,
  //       to: "/reports",
  //       submenu: [],
  //     },
  //   ],
  // },
];

/* ===============================
   FUNCTION TO GET MENU BY TYPE
=============================== */
export function getMenuForVendorType(): MenuCategory[] {
  return [...commonMenus];
}
