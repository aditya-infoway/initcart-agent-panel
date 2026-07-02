import React, { useState, useEffect } from "react";
import { 
  FaUser, FaEnvelope, FaPhone, FaMoneyBill, FaCopy, FaCheck, FaUserPlus,
  FaWhatsapp, FaFacebook, FaShareAlt, FaStore, FaTag, FaLock, FaChartLine
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/authStore";
import { privateAxios } from "../../api/axios";

interface Agent {
  agentId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  referralCode: string;
  parentAgentId: string;
  parentAgentName: string;
  currentLevel: string;
  totalSales: string;
  totalCommission: string;
  bankDetails: string;
  joinDate: string;
  profilePhoto: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
}

// API response interface
interface ApiAgentData {
  id: number;
  full_name: string;
  email: string;
  contact_number: string;
  address: string;
  city: string;
  state: string;
  agent_type: string;
  society_or_business_name?: string;
  status: string;
  passport_photo: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    referral_code?: string;
  };
  sponsor?: {
    id: number;
    username: string;
    full_name: string | null;
    referral_code: string;
  } | null;
  referral_link?: string;
  sale_referral_link?: string;
  can_refer_agents?: boolean;
  has_minimum_sales?: boolean;
  minimum_sale_amount?: number;
  current_total_sales?: number;
  remaining_sales_needed?: number;
}

// Helper function to get full URL for media files
const getFullUrl = (mediaPath: string | undefined | null): string => {
  if (!mediaPath) return '';
  
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  if (mediaPath.startsWith('/media/')) {
    return `https://api.initcart.in${mediaPath}`;
  }
  
  if (!mediaPath.includes('/')) {
    return `https://api.initcart.in/media/${mediaPath}`;
  }
  
  return `https://api.initcart.in${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
};

const Profile = () => {
  const [agent, setAgent] = useState<Agent>({
    agentId: "AGT001",
    fullName: "Ravi Sharma",
    email: "ravi@example.com",
    mobileNumber: "9876543210",
    referralCode: "AGT001",
    parentAgentId: "AGT000",
    parentAgentName: "",
    currentLevel: "",
    totalSales: "₹ 0",
    totalCommission: "₹ 0",
    bankDetails: "Not provided",
    joinDate: "2025-10-02",
    profilePhoto: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    kycStatus: "Pending",
  });

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({ code: false, sale: false, agent: false });
  const [saleLink, setSaleLink] = useState("");
  const [agentLink, setAgentLink] = useState("");
  const [canReferAgents, setCanReferAgents] = useState(false);
  const [hasMinimumSales, setHasMinimumSales] = useState(false);
  const [minimumSaleAmount, setMinimumSaleAmount] = useState(0);
  const [currentTotalSales, setCurrentTotalSales] = useState(0);
  const [remainingSalesNeeded, setRemainingSalesNeeded] = useState(0);
  
  const { user: authUser } = useAuthStore();

  // Fetch profile data from API
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await privateAxios.get("/api/mlm/agent/profile/");
      const apiData: ApiAgentData = response.data;
      
      const agentReferralCode = authUser?.referral_code || apiData.user?.referral_code || "N/A";
      
      // Sale ke liye link (homepage)
      setSaleLink(`https://initcart.in/?ref=${agentReferralCode}`);
      
      // Agent registration ke liye link
      setAgentLink(`https://initcart.in/becomeAgent?ref=${agentReferralCode}`);
      
      //  Set eligibility flags
      setCanReferAgents(apiData.can_refer_agents || false);
      setHasMinimumSales(apiData.has_minimum_sales || false);
      setMinimumSaleAmount(apiData.minimum_sale_amount || 0);
      setCurrentTotalSales(apiData.current_total_sales || 0);
      setRemainingSalesNeeded(apiData.remaining_sales_needed || 0);
      
      setAgent({
        agentId: apiData.id?.toString() || "N/A",
        fullName: apiData.full_name || "",
        email: apiData.email || "",
        mobileNumber: apiData.contact_number || "",
        referralCode: agentReferralCode,
        parentAgentId: apiData.sponsor?.id?.toString() || "N/A",
        parentAgentName: apiData.sponsor?.full_name || apiData.sponsor?.username || "N/A",
        currentLevel: apiData.agent_type || "",
        totalSales: `₹ ${apiData.current_total_sales?.toLocaleString() || 0}`,
        totalCommission: "₹ 0",
        bankDetails: "Not provided",
        joinDate: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString('en-CA') : "N/A",
        profilePhoto: getFullUrl(apiData.passport_photo) || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        kycStatus: apiData.status === "approved" ? "Verified" : 
                   apiData.status === "pending" ? "Pending" : "Rejected",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'sale' | 'agent') => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
    
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const shareOnWhatsApp = (link: string, type: 'sale' | 'agent') => {
    const message = type === 'sale' 
      ? encodeURIComponent(
          `🛍️ Shop on InitCart and get amazing deals!\n\n` +
          `Use my referral code: ${agent.referralCode}\n` +
          `Click: ${link}\n\n` +
          `Get ₹100 off on your first order!`
        )
      : encodeURIComponent(
          `Become an agent on InitCart and start earning!\n\n` +
          `Use my referral code: ${agent.referralCode}\n` +
          `Register here: ${link}\n\n` +
          `💼 Start your business today!`
        );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareOnFacebook = (link: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Header */}
      <div className="w-full bg-blue-600 py-10 px-6 flex flex-col items-center text-white rounded-xl">
        <div className="relative mb-6">
          <img
            src={agent.profilePhoto}
            alt="Agent"
            className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-md object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
            }}
          />
        </div>
        <h2 className="text-4xl font-bold tracking-tight">{agent.fullName}</h2>
        <p className="text-lg font-medium text-blue-200 mt-1 capitalize">{agent.currentLevel} Agent</p>
        <p className="text-sm text-blue-100 mt-2">Joined: {agent.joinDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-5xl mx-auto -mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{agent.totalSales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Total Commission</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{agent.totalCommission}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">KYC Status</p>
          <span
            className={`inline-block px-3 py-1 mt-2 rounded-full text-sm font-medium text-white ${
              agent.kycStatus === "Verified"
                ? "bg-blue-500"
                : agent.kycStatus === "Pending"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {agent.kycStatus}
          </span>
        </div>
      </div>

      {/* Minimum Sales Progress Bar */}
      {!hasMinimumSales && agent.kycStatus === "Verified" && (
        <div className="max-w-5xl mx-auto mt-6 px-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <FaChartLine className="text-yellow-600 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">Minimum Sales Requirement</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Complete minimum sales of <strong>₹{minimumSaleAmount.toLocaleString()}</strong> to unlock referral links and start referring new agents.
            </p>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600">Current Sales: ₹{currentTotalSales.toLocaleString()}</span>
              <span className="text-gray-600">Need: ₹{remainingSalesNeeded.toLocaleString()} more</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentTotalSales / minimumSaleAmount) * 100, 100)}%` }}
              />
            </div>
            <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-center gap-1">
                <FaLock className="text-xs" />
                Referral links will be unlocked automatically after achieving ₹{minimumSaleAmount.toLocaleString()} in sales
              </p>
            </div>
          </div>
        </div>
      )}

{/*       ========== Referral Code Section - Shown but can't be used until minimum sales ========== 
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaUserPlus className="text-blue-600" /> Your Referral Code
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={agent.referralCode}
              readOnly
              className="flex-1 bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-gray-700 font-mono text-lg focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(agent.referralCode, 'code')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
            >
              {copied.code ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
      </div> */}

      {/* Profile Details */}
      <div className="max-w-5xl mx-auto mt-6 px-4 pb-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Profile Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent ID */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Agent ID</label>
              <input
                type="text"
                value={agent.agentId}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-md text-gray-600 cursor-not-allowed focus:outline-none customInput"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                <FaUser className="text-blue-600" /> Full Name
              </label>
              <input
                type="text"
                value={agent.fullName}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-md text-gray-600 cursor-not-allowed focus:outline-none customInput"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                <FaEnvelope className="text-blue-600" /> Email
              </label>
              <input
                type="email"
                value={agent.email}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-md text-gray-600 cursor-not-allowed focus:outline-none customInput"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                <FaPhone className="text-blue-600" /> Mobile Number
              </label>
              <input
                type="text"
                value={agent.mobileNumber}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-md text-gray-600 cursor-not-allowed focus:outline-none customInput"
              />
            </div>

            {/* Parent/Sponsor Information */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Referred By (Sponsor)</label>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-gray-700">
                {agent.parentAgentId !== "N/A" ? (
                  <div>
                    <div className="font-medium">{agent.parentAgentName}</div>
                    {/* <div className="text-xs text-gray-500">ID: {agent.parentAgentId}</div> */}
                  </div>
                ) : (
                  <span className="text-gray-500">No Sponsor (Direct)</span>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                <FaMoneyBill className="text-blue-600" /> Bank Details
              </label>
              <input
                type="text"
                value={agent.bankDetails}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-md text-gray-600 cursor-not-allowed focus:outline-none customInput"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== SECTION 1: Sale Referral Link (HIDE if not eligible) ========== */}
      {hasMinimumSales && agent.kycStatus === "Verified" ? (
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaTag className="text-green-600" /> Sale Referral Link
            </h3>
            <p className="text-sm text-gray-600 mb-3">Share this for customer purchases</p>
            
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <input
                type="text"
                value={saleLink}
                readOnly
                className="flex-1 bg-green-50 border border-green-200 rounded-md px-4 py-3 text-gray-700 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(saleLink, 'sale')}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {copied.sale ? <FaCheck /> : <FaCopy />} Copy
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => shareOnWhatsApp(saleLink, 'sale')}
                className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> WhatsApp
              </button>
              <button
                onClick={() => shareOnFacebook(saleLink)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaFacebook /> Facebook
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto mt-8 px-4">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md border-l-4 border-gray-400 opacity-60">
            <h3 className="text-lg font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <FaLock className="text-gray-500" /> Sale Referral Link (Locked)
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Complete minimum sales of ₹{minimumSaleAmount.toLocaleString()} to unlock this feature
            </p>
            <div className="bg-gray-200 rounded-md px-4 py-3 text-gray-400 text-center">
               Locked - Need ₹{remainingSalesNeeded.toLocaleString()} more in sales
            </div>
          </div>
        </div>
      )}

      {/* ========== SECTION 2: Agent Referral Link (HIDE if not eligible) ========== */}
      {canReferAgents && agent.kycStatus === "Verified" ? (
        <div className="max-w-5xl mx-auto mt-6 px-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaStore className="text-purple-600" /> Agent Referral Link
            </h3>
            <p className="text-sm text-gray-600 mb-3">Share this for agent registration</p>
            
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <input
                type="text"
                value={agentLink}
                readOnly
                className="flex-1 bg-purple-50 border border-purple-200 rounded-md px-4 py-3 text-gray-700 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(agentLink, 'agent')}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {copied.agent ? <FaCheck /> : <FaCopy />} Copy
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => shareOnWhatsApp(agentLink, 'agent')}
                className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> WhatsApp
              </button>
              <button
                onClick={() => shareOnFacebook(agentLink)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaFacebook /> Facebook
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto mt-6 px-4 pb-8">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md border-l-4 border-gray-400 opacity-60">
            <h3 className="text-lg font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <FaLock className="text-gray-500" /> Agent Referral Link (Locked)
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Complete minimum sales of ₹{minimumSaleAmount.toLocaleString()} to unlock agent referral feature 
            </p>
            <div className="bg-gray-200 rounded-md px-4 py-3 text-gray-400 text-center">
              Locked - Need ₹{remainingSalesNeeded.toLocaleString()} more in sales
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;