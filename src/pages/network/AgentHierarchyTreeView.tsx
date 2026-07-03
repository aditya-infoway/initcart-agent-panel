// src/pages/DownlineHierarchy.tsx
import React, { useState, useEffect } from 'react';
import { privateAxios } from '../../api/axios';
import { ChevronDown, Users, Award, TrendingUp, DollarSign, Activity, UserPlus, MinusCircle, PlusCircle, Search, Filter } from 'lucide-react';


interface AgentInfo {
  agent_id: number;
  agent_type: string;
  status: string;
  total_sales: number;
  is_active: boolean;
  referral_code?: string;
  full_name?: string;        // ✅ Added
  contact_number?: string;   // ✅ Added
}

interface TreeNode {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  user_type: string;
  depth: number;
  agent: AgentInfo | null;
  downline_count: number;
  children: TreeNode[];
}

interface DownlineResponse {
  max_depth: number;
  total_downline: number;
  root: TreeNode;
}

// ── Helper: Get display name ──────────────────────────────────────────────────
// Agent registration se bane users ka username = phone number hota hai
// Unke liye agent.full_name use karo
const getDisplayName = (node: TreeNode): string => {
  if (node.agent?.full_name) return node.agent.full_name;
  if (node.full_name && node.full_name.trim()) return node.full_name;
  return node.username;
};

// Contact info — agent registration wale ke liye phone/contact show karo
const getContactInfo = (node: TreeNode): string => {
  if (node.agent?.contact_number) return node.agent.contact_number;
  if (node.email) return node.email;
  return node.username;
};

// Helper function to build parent map
const buildParentMap = (node: TreeNode, parentId: number | null = null): Map<number, number | null> => {
  const map = new Map<number, number | null>();
  map.set(node.id, parentId);
  node.children.forEach(child => {
    const childMap = buildParentMap(child, node.id);
    childMap.forEach((value, key) => map.set(key, value));
  });
  return map;
};

// ── TreeNode Card ─────────────────────────────────────────────────────────────
const TreeNodeComponent: React.FC<{ node: TreeNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const displayName   = getDisplayName(node);
  const contactInfo   = getContactInfo(node);
  const avatarLetter  = displayName.charAt(0).toUpperCase();

  const getGradient = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pos':     return 'from-purple-500 to-purple-700';
      case 'society': return 'from-teal-500 to-teal-700';
      default:        return 'from-blue-500 to-blue-700';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`
          relative w-72 rounded-2xl shadow-xl border-2 transition-all duration-300
          hover:shadow-2xl hover:scale-105 cursor-pointer
          ${isRoot
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400'
            : node.agent?.is_active
            ? 'bg-white border-green-300 hover:border-green-500'
            : 'bg-gray-50/80 border-gray-300 hover:border-gray-400'
          }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md bg-gradient-to-br ${getGradient(node.agent?.agent_type || '')}`}>
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">
                  {displayName}
                </h3>
                {/* ✅ Show contact info — NOT raw username if it's a phone number */}
                <p className="text-xs text-gray-500 truncate">{contactInfo}</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r ${isRoot ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-pink-600'}`}>
              L{node.depth}
            </div>
          </div>

          {/* Status bar */}
          <div className={`h-1 ${node.agent?.is_active ? 'bg-gradient-to-r from-green-400 to-green-500' : isRoot ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-300'}`} />

          {/* Details */}
          <div className="p-3 pt-2 space-y-1.5">
            {node.agent ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Agent Type</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getGradient(node.agent.agent_type)}`}>
                    {node.agent.agent_type === 'pos' ? 'POS' : node.agent.agent_type === 'society' ? 'Society' : 'Normal'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Sales</span>
                  <span className="text-xs font-bold text-green-700">
                    ₹{node.agent.total_sales.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${node.agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {node.agent.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                {node.agent.referral_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Referral Code</span>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {node.agent.referral_code}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-2">
                <span className="text-xs text-gray-400 italic">Not an agent yet</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-600">
                  <span className="font-bold">{node.downline_count}</span> downline
                </span>
              </div>
              {hasChildren ? (
                <button
                  onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isExpanded
                    ? <><MinusCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-blue-600">Hide</span></>
                    : <><PlusCircle className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-blue-600">Show</span></>
                  }
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">No children</span>
              )}
            </div>
          </div>
        </div>

        {!isRoot && (
          <div className={`absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${node.agent?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-300" />
          <div className="relative">
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300"
                style={{ left: `${100 / (node.children.length * 2)}%`, right: `${100 / (node.children.length * 2)}%` }}
              />
            )}
            <div className="flex gap-6 pt-8 justify-center">
              {node.children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-blue-400 -mt-8" />
                  <TreeNodeComponent node={child} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── List View ─────────────────────────────────────────────────────────────────
const ListViewComponent: React.FC<{ data: DownlineResponse }> = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([data.root.id]));
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const parentMap = buildParentMap(data.root);

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      const collapse = (nodeId: number) => {
        next.delete(nodeId);
        parentMap.forEach((pId, cId) => { if (pId === nodeId) collapse(cId); });
      };
      collapse(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const shouldShow = (node: TreeNode): boolean => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const name    = getDisplayName(node).toLowerCase();
      const contact = getContactInfo(node).toLowerCase();
      if (!name.includes(q) && !contact.includes(q) && !(node.agent?.referral_code?.toLowerCase().includes(q))) return false;
    }
    if (filterStatus === 'active'   && !node.agent?.is_active) return false;
    if (filterStatus === 'inactive' &&  node.agent?.is_active) return false;
    return true;
  };

  const getGradient = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pos':     return 'from-purple-500 to-purple-700';
      case 'society': return 'from-teal-500 to-teal-700';
      default:        return 'from-blue-500 to-blue-700';
    }
  };

  const renderNode = (node: TreeNode, depth = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded  = expandedRows.has(node.id);
    const visible     = shouldShow(node);

    if (!visible && !hasChildren) return rows;

    const displayName  = getDisplayName(node);
    const contactInfo  = getContactInfo(node);

    if (visible) {
      rows.push(
        <tr key={node.id} className={`transition-all duration-200 hover:bg-gray-50 ${depth === 0 ? 'bg-blue-50/50' : ''}`}>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button onClick={() => toggleRow(node.id)} className="p-1 hover:bg-gray-200 rounded-lg">
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                </button>
              ) : <div className="w-6" />}
              <span style={{ marginLeft: `${depth * 20}px` }}>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-sm bg-gradient-to-br ${depth === 0 ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-pink-600'}`}>
                  {depth}
                </span>
              </span>
            </div>
          </td>

          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${getGradient(node.agent?.agent_type || '')}`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {depth > 0 && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${node.agent?.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  {depth === 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium border border-blue-200">You</span>}
                </div>
                {/* ✅ Show meaningful contact info */}
                <p className="text-xs text-gray-500 truncate">{contactInfo}</p>
              </div>
            </div>
          </td>

          <td className="py-3 px-4">
            {node.agent ? (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getGradient(node.agent.agent_type)}`}>
                {node.agent.agent_type === 'pos' ? 'POS' : node.agent.agent_type === 'society' ? 'Society' : 'Normal'}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">Not an agent</span>
            )}
          </td>

          <td className="py-3 px-4 text-right">
            <span className="text-sm font-bold text-green-700">
              ₹{node.agent?.total_sales?.toLocaleString('en-IN') || '0'}
            </span>
          </td>

          <td className="py-3 px-4 text-center">
            {depth === 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Root
              </span>
            ) : node.agent?.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Inactive
              </span>
            )}
          </td>

          <td className="py-3 px-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              {node.downline_count}
            </span>
          </td>
        </tr>
      );
    }

    if (isExpanded && hasChildren) {
      node.children.forEach(child => rows.push(...renderNode(child, depth + 1)));
    }
    return rows;
  };

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, contact or referral code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-4 px-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.total_downline}</span> Total Members
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full" />
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.max_depth}</span> Levels Deep
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              {['Level', 'Member', 'Type', 'Sales', 'Status', 'Downline'].map(h => (
                <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {renderNode(data.root)}
          </tbody>
        </table>
      </div>

      {data.total_downline === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Downline Members</h3>
          <p className="text-gray-500 text-sm">Start building your team to see members here</p>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const DownlineHierarchy: React.FC = () => {
  const [downlineData, setDownlineData] = useState<DownlineResponse | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [viewMode, setViewMode]         = useState<'tree' | 'list'>('tree');

  useEffect(() => { fetchDownlineHierarchy(); }, []);

  const fetchDownlineHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await privateAxios.get('/api/mlm/hierarchy/downline/');
      setDownlineData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch downline hierarchy');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
        <p className="mt-6 text-gray-700 font-semibold text-lg">Loading Team Tree...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
        <Activity className="w-10 h-10 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={fetchDownlineHierarchy} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Try Again</button>
      </div>
    </div>
  );

  if (!downlineData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">Team Network Tree</h1>
                  <p className="text-blue-100 text-sm mt-0.5">Your complete downline structure</p>
                </div>
              </div>
              <button onClick={fetchDownlineHierarchy} className="px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-md font-semibold text-sm">
                <TrendingUp className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /><span className="text-gray-600">Active</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-400 rounded-full" /><span className="text-gray-600">Inactive</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full" /><span className="text-gray-600">You (Root)</span></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, bg: 'bg-blue-100', color: 'text-blue-600', label: 'Total Team', val: downlineData.total_downline },
            { icon: Award, bg: 'bg-purple-100', color: 'text-purple-600', label: 'Max Depth', val: `${downlineData.max_depth} Levels` },
            { icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600', label: 'Your Sales', val: `₹${downlineData.root.agent?.total_sales.toLocaleString('en-IN') || '0'}` },
            { icon: UserPlus, bg: 'bg-orange-100', color: 'text-orange-600', label: 'Direct Refs', val: downlineData.root.children?.length || 0 },
          ].map(({ icon: Icon, bg, color, label, val }) => (
            <div key={label} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${bg} rounded-xl`}><Icon className={`w-6 h-6 ${color}`} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{val}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tree/List Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">
              {viewMode === 'tree' ? 'Network Tree Structure' : 'Team Members List'}
            </h2>
            <div className="flex items-center gap-2">
              {(['tree', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {mode === 'tree' ? 'Tree View' : 'List View'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {downlineData.total_downline > 0 ? (
              viewMode === 'tree' ? (
                <div className="overflow-x-auto pb-6">
                  <div className="flex justify-center min-w-fit">
                    <TreeNodeComponent node={downlineData.root} isRoot={true} />
                  </div>
                </div>
              ) : (
                <ListViewComponent data={downlineData} />
              )
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Team Members Yet</h3>
                <p className="text-gray-600">Start building your network by inviting new members!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownlineHierarchy;