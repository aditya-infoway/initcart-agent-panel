// src/pages/UplineHierarchy.tsx
import React, { useState, useEffect } from 'react';
import { privateAxios } from '../../api/axios';
import {
  Users, Award, TrendingUp, DollarSign, Activity,
  ArrowUp, MinusCircle, PlusCircle, Search, Filter, Download, ChevronDown
} from 'lucide-react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AgentInfo {
  agent_id: number;
  agent_type: string;
  status: string;
  total_sales: number;
  is_active: boolean;
  referral_code?: string;
}

/** Display node – same shape as DownlineHierarchy's TreeNode */
interface DisplayNode {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  depth: number;       // 0 = self (You), 1..N = upline levels
  agent: AgentInfo | null;
  children: DisplayNode[];
  isDirectPath?: boolean;
  isSelf?: boolean;
}

// Raw API shapes from UplineTreeAPIView
interface RawSibling {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  agent: AgentInfo | null;
  is_active: boolean;
  is_direct_parent: boolean;
}

interface RawUplineNode {
  level: number;
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  is_active: boolean;
  agent: AgentInfo | null;
  siblings: RawSibling[];   // direct children of this upline person
}

interface RawRoot {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  depth: number;
  agent: AgentInfo | null;
  siblings: RawSibling[];   // co-referrals of root (includes self)
}

interface UplineTreeResponse {
  max_levels: number;
  upline_count: number;
  root: RawRoot;
  upline_tree: RawUplineNode[];  // [0]=direct sponsor … [N-1]=topmost
}

// ─── Tree Builder ─────────────────────────────────────────────────────────────

/**
 * Converts flat UplineTreeResponse into a top-down DisplayNode tree.
 *
 * Structure produced (example with 2 upline levels):
 *
 *   [Level-2 upline]          ← display root (isRoot=true)
 *       ├── other_sibling_A
 *       └── [Level-1 upline]  ← isDirectPath=true
 *               ├── other_sibling_B
 *               └── [YOU]     ← isSelf=true, shown with blue badge
 */
function buildDisplayTree(data: UplineTreeResponse): DisplayNode {
  const { root, upline_tree } = data;

  // Edge-case: no upline at all – just render self
  if (upline_tree.length === 0) {
    return {
      id: root.id,
      full_name: root.full_name,
      username: root.username,
      email: root.email,
      phone: root.phone || '',
      depth: 0,
      agent: root.agent,
      children: [],
      isDirectPath: true,
      isSelf: true,
    };
  }

  /** Convert a raw sibling entry to a leaf DisplayNode */
  const sibToLeaf = (sib: RawSibling, displayDepth: number): DisplayNode => ({
    id: sib.id,
    full_name: sib.full_name,
    username: sib.username,
    email: sib.email,
    phone: sib.phone || '',
    depth: displayDepth,
    // If this sibling IS the logged-in user, use root's richer agent data
    agent: sib.id === root.id ? root.agent : sib.agent,
    children: [],
    isDirectPath: sib.is_direct_parent,
    isSelf: sib.id === root.id,
  });

  /**
   * Recursively build a DisplayNode for upline_tree[levelIndex].
   * displayDepth is the depth label shown on the badge (topmost = upline_count, self = 0).
   */
  const buildNode = (levelIndex: number, displayDepth: number): DisplayNode => {
    const lvl = upline_tree[levelIndex];

    let children: DisplayNode[];

    if (levelIndex === 0) {
      // Direct sponsor's children = lvl.siblings
      // This list already contains the logged-in user (is_direct_parent: true for them)
      children = lvl.siblings.map(sib => sibToLeaf(sib, displayDepth + 1));
    } else {
      // Higher upline: siblings contains the next-lower upline marked is_direct_parent
      // Replace that entry with the fully-built subtree for levelIndex-1
      children = lvl.siblings.map(sib => {
        if (sib.is_direct_parent) {
          // This sibling IS upline_tree[levelIndex-1]; build its full subtree
          return buildNode(levelIndex - 1, displayDepth + 1);
        }
        return sibToLeaf(sib, displayDepth + 1);
      });
    }

    return {
      id: lvl.id,
      full_name: lvl.full_name,
      username: lvl.username,
      email: lvl.email,
      phone: lvl.phone || '',
      depth: lvl.level,  // L1 = direct sponsor, L2 = their sponsor, etc.
      agent: lvl.agent,
      children,
      isDirectPath: true,
    };
  };

  // Display root = topmost upline (last element of upline_tree)
  return buildNode(upline_tree.length - 1, 1);
}

// Helper function to build parent map for list view
const buildParentMap = (node: DisplayNode, parentId: number | null = null): Map<number, number | null> => {
  const map = new Map<number, number | null>();
  map.set(node.id, parentId);
  node.children.forEach(child => {
    const childMap = buildParentMap(child, node.id);
    childMap.forEach((value, key) => {
      map.set(key, value);
    });
  });
  return map;
};

// ─── TreeNodeComponent (identical design to DownlineHierarchy) ────────────────

const TreeNodeComponent: React.FC<{
  node: DisplayNode;
  isRoot?: boolean;
}> = ({ node, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelf = !!node.isSelf;

  const getAgentTypeGradient = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'master': return 'from-purple-500 to-purple-700';
      case 'senior': return 'from-indigo-500 to-indigo-700';
      case 'junior': return 'from-teal-500 to-teal-700';
      default:       return 'from-blue-500 to-blue-700';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* ── Node Card ── */}
      <div className="relative">
        <div className={`
          relative w-72 rounded-2xl shadow-xl border-2 transition-all duration-300
          hover:shadow-2xl hover:scale-105 cursor-pointer
          ${isSelf
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-blue-300/50'
            : isRoot
            ? 'bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-400 shadow-purple-300/50'
            : node.isDirectPath
            ? 'bg-white border-indigo-300 hover:border-indigo-500'
            : node.agent?.is_active
              ? 'bg-white border-green-300 hover:border-green-500'
              : 'bg-gray-50/80 border-gray-300 hover:border-gray-400'
          }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 pb-2">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md
                bg-gradient-to-br
                ${isSelf ? 'from-blue-500 to-blue-700' : getAgentTypeGradient(node.agent?.agent_type || '')}
              `}>
                {node.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-sm leading-tight flex items-center gap-1">
                  {node.full_name}
                  {isSelf && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 truncate">@{node.full_name}</p>
              </div>
            </div>
          </div>

          {/* Status Indicator Bar */}
          <div className={`h-1 ${
            isSelf
              ? 'bg-gradient-to-r from-blue-400 to-blue-500'
              : node.agent?.is_active
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gray-300'
          }`} />

          {/* Agent Details */}
          <div className="p-3 pt-2 space-y-1.5">
            {node.agent ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Agent Type</span>
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r
                    ${getAgentTypeGradient(node.agent.agent_type)}
                  `}>
                    {node.agent.agent_type}
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
                  <span className={`
                    text-xs font-semibold px-2 py-0.5 rounded-full
                    ${node.agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                  `}>
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
                  <span className="font-bold">{node.children.length}</span>{' '}
                  {isSelf ? 'co-referrals' : 'members'}
                </span>
              </div>

              {hasChildren ? (
                <button
                  onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <MinusCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Hide</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Show</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  {isSelf ? "It's you!" : 'No members'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status dot */}
        {!isRoot && (
          <div className={`
            absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg
            ${isSelf
              ? 'bg-blue-500 animate-pulse'
              : node.agent?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }
          `} />
        )}

        {/* Direct-path indicator dot (top-right) */}
        {!isRoot && !isSelf && node.isDirectPath && (
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg bg-indigo-500" />
        )}
      </div>

      {/* ── Children connectors + recursive nodes ── */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-300" />

          <div className="relative">
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300"
                style={{
                  left:  `${100 / (node.children.length * 2)}%`,
                  right: `${100 / (node.children.length * 2)}%`,
                }}
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

// ─── List View Component ─────────────────────────────────────────────────────

const ListViewComponent: React.FC<{ data: UplineTreeResponse; displayRoot: DisplayNode }> = ({ data, displayRoot }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([displayRoot.id]));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  const parentMap = buildParentMap(displayRoot);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      // Collapse this row and all its descendants
      const collapseDescendants = (nodeId: number) => {
        newExpanded.delete(nodeId);
        parentMap.forEach((parentId, childId) => {
          if (parentId === nodeId) {
            collapseDescendants(childId);
          }
        });
      };
      collapseDescendants(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getAgentTypeColor = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'master': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'senior': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'junior': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getAgentTypeGradient = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'master': return 'from-purple-500 to-purple-700';
      case 'senior': return 'from-indigo-500 to-indigo-700';
      case 'junior': return 'from-teal-500 to-teal-700';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  const getLevelBadgeColor = (node: DisplayNode) => {
    if (node.isSelf) return 'from-blue-500 to-blue-700';
    if (node.isDirectPath) return 'from-indigo-500 to-indigo-700';
    return 'from-purple-500 to-pink-600';
  };

  // Filter function
  const shouldShowNode = (node: DisplayNode): boolean => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        node.full_name?.toLowerCase().includes(searchLower) ||
        node.username?.toLowerCase().includes(searchLower) ||
        node.email?.toLowerCase().includes(searchLower) ||
        node.agent?.referral_code?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !node.agent?.is_active) return false;
      if (filterStatus === 'inactive' && node.agent?.is_active) return false;
    }

    return true;
  };

  // Recursively render nodes
  const renderNode = (node: DisplayNode, depth: number = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const isVisible = shouldShowNode(node);

    if (!isVisible && !hasChildren) return rows;

    // Add current node row if visible
    if (isVisible) {
      rows.push(
        <tr 
          key={node.id}
          className={`
            transition-all duration-200 hover:bg-gray-50
            ${node.isSelf ? 'bg-blue-50/50 hover:bg-blue-50/80' : ''}
            ${node.isDirectPath && !node.isSelf ? 'bg-indigo-50/30' : ''}
            ${!isExpanded && hasChildren ? 'border-b-2 border-gray-200' : ''}
          `}
        >
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(node.id)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-110"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      isExpanded ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : (
                <div className="w-6" />
              )}
              <span style={{ marginLeft: `${depth * 20}px` }}>
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-sm
                  bg-gradient-to-br ${getLevelBadgeColor(node)}
                `}>
                  {node.isSelf ? 'You' : ``}
                </span>
              </span>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm
                  bg-gradient-to-br ${node.isSelf ? 'from-blue-500 to-blue-700' : getAgentTypeGradient(node.agent?.agent_type || '')}
                `}>
                  {node.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                {!node.isSelf && (
                  <div className={`
                    absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white
                    ${node.agent?.is_active ? 'bg-green-500' : 'bg-gray-400'}
                  `} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                    {node.full_name}
                  </p>
                  {node.isSelf && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium border border-blue-200">
                      You
                    </span>
                  )}
                  {node.isDirectPath && !node.isSelf && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium border border-indigo-200">
                      Direct Upline
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>@{node.full_name}</span>
                  {node.email && (
                    <>
                      <span>•</span>
                      <span className="truncate">{node.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            {node.agent ? (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getAgentTypeColor(node.agent.agent_type)}`}>
                {node.agent.agent_type}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">Not an agent</span>
            )}
          </td>
          <td className="py-3 px-4 text-right">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-green-700">
                ₹{node.agent?.total_sales?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </td>
          <td className="py-3 px-4 text-center">
            {node.isSelf ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                Self
              </span>
            ) : node.agent?.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                Inactive
              </span>
            )}
          </td>
          <td className="py-3 px-4 text-center">
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                {node.children.length}
              </span>
              {hasChildren && (
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {isExpanded ? 'Expanded' : 'Collapsed'}
                </span>
              )}
            </div>
          </td>
          <td className="py-3 px-4">
            {node.agent?.referral_code ? (
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                {node.agent.referral_code}
              </span>
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </td>
        </tr>
      );
    }

    // If expanded and has children, render them
    if (isExpanded && hasChildren) {
      node.children.forEach(child => {
        rows.push(...renderNode(child, depth + 1));
      });
    }

    return rows;
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, email or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* List Header Summary */}
      <div className="flex items-center gap-4 mb-4 px-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.upline_count}</span> Total Upline
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{data.max_levels}</span> Levels
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold text-gray-900">₹{data.root.agent?.total_sales?.toLocaleString('en-IN') || '0'}</span> Your Sales
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                Level
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Member Details
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Agent Type
              </th>
              <th className="text-right py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Sales
              </th>
              <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Members
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Referral Code
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {renderNode(displayRoot)}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.upline_count === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUp className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Upline Found</h3>
          <p className="text-gray-500 text-sm">You are at the top of the chain — no referrer is linked to your account.</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UplineHierarchy: React.FC = () => {
  const [uplineData,   setUplineData]   = useState<UplineTreeResponse | null>(null);
  const [displayRoot,  setDisplayRoot]  = useState<DisplayNode | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [viewMode,     setViewMode]     = useState<'tree' | 'list'>('tree');

  useEffect(() => { fetchUplineHierarchy(); }, []);

  const fetchUplineHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await privateAxios.get('/api/mlm/hierarchy/upline-tree/');
      console.log('Upline Tree Response:', response.data);
      setUplineData(response.data);
      setDisplayRoot(buildDisplayTree(response.data));
    } catch (err: any) {
      console.error('Error fetching upline tree:', err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message ||
        'Failed to fetch upline hierarchy',
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <ArrowUp className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
          </div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading Upline Tree...</p>
          <p className="text-gray-500 text-sm mt-1">Fetching your referral chain</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Tree</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUplineHierarchy}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!uplineData || !displayRoot) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Header Card ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ArrowUp className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">Upline Network Tree</h1>
                  <p className="text-blue-100 text-sm mt-0.5">Your complete referral chain above you</p>
                </div>
              </div>
              <button
                onClick={fetchUplineHierarchy}
                className="px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 shadow-md font-semibold text-sm"
              >
                <TrendingUp className="w-4 h-4" />
                Refresh Tree
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-gray-600">You (Self)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-full" />
              <span className="text-gray-600">Direct upline chain</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Active Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-600">Inactive Agent</span>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Upline</p>
                <p className="text-2xl font-bold text-gray-900">{uplineData.upline_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Max Levels</p>
                <p className="text-2xl font-bold text-gray-900">{uplineData.max_levels} Levels</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Your Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{uplineData.root.agent?.total_sales.toLocaleString('en-IN') || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <ArrowUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Upline Levels</p>
                <p className="text-2xl font-bold text-gray-900">{uplineData.upline_tree.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tree/List View Container ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {viewMode === 'tree' ? (
                <Award className="w-5 h-5 text-blue-600" />
              ) : (
                <Users className="w-5 h-5 text-blue-600" />
              )}
              {viewMode === 'tree' ? 'Upline Tree Structure' : 'Upline Members List'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'tree'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Tree View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                List View
              </button>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {uplineData.upline_count > 0 ? (
              viewMode === 'tree' ? (
                <div className="overflow-x-auto overflow-y-hidden pb-6">
                  <div className="flex justify-center min-w-fit">
                    <TreeNodeComponent
                      node={displayRoot}
                      isRoot={true}
                    />
                  </div>
                </div>
              ) : (
                <ListViewComponent data={uplineData} displayRoot={displayRoot} />
              )
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowUp className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Upline Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You are at the top of the chain — no referrer is linked to your account.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UplineHierarchy;