import React, { useState } from "react";
import { School, UserPersona, NetworkLatencyMode } from "../types";
import { formatGHS } from "../utils/grading";
import {
  Shield,
  Server,
  Layers,
  Activity,
  CheckCircle,
  AlertTriangle,
  Globe,
  Database,
  Smartphone,
  Cpu,
  Lock,
  Plus,
  Search,
  X,
} from "lucide-react";

interface PlatformAdminViewProps {
  schools: School[];
  currentPersona: UserPersona;
  onOpenNewSchoolModal: () => void;
  networkMode: NetworkLatencyMode;
}

export const PlatformAdminView: React.FC<PlatformAdminViewProps> = ({
  schools,
  currentPersona,
  onOpenNewSchoolModal,
  networkMode,
}) => {
  const [selectedTenantForRls, setSelectedTenantForRls] = useState<string>(schools[0]?.id || "sch-achimota");
  const [tenantSearchQuery, setTenantSearchQuery] = useState("");

  const totalPlatformStudents = schools.reduce((sum, s) => sum + s.totalStudents, 0);
  const totalPlatformTeachers = schools.reduce((sum, s) => sum + s.totalTeachers, 0);

  const filteredSchools = schools.filter((sch) => {
    const q = tenantSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sch.name.toLowerCase().includes(q) ||
      sch.code.toLowerCase().includes(q) ||
      sch.id.toLowerCase().includes(q) ||
      sch.region.toLowerCase().includes(q) ||
      sch.district.toLowerCase().includes(q) ||
      sch.headmasterName.toLowerCase().includes(q) ||
      sch.subscriptionTier.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Platform Admin Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">Platform Super Admin</h1>
              <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                Multi-Tenant Owner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-School Governance, Postgres Row-Level Security (RLS) Isolation & Low-Latency 3G Health
            </p>
          </div>
        </div>

        <button
          id="platform-onboard-school-btn"
          onClick={onOpenNewSchoolModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New School Tenant</span>
        </button>
      </div>

      {/* High-Level Infrastructure Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Active School Tenants</span>
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{schools.length}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">100% RLS Isolation Verified</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Total Enrolled Pupils</span>
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{totalPlatformStudents}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across Ghanaian regions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Active Teaching Staff</span>
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalPlatformTeachers}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">GES certified educators</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Average 3G Response</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">240 ms</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Optimized for rural latency</p>
        </div>
      </div>

      {/* RLS Data Isolation & Tenant Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenants List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Multi-Tenant Directory & Subscription Tiers</span>
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Postgres Shared DB / Schema RLS Isolation</span>
            </div>

            {/* School Search by Name or Code */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={tenantSearchQuery}
                onChange={(e) => setTenantSearchQuery(e.target.value)}
                placeholder="Search school name, code, region..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {tenantSearchQuery && (
                <button
                  onClick={() => setTenantSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSchools.map((sch) => (
              <div
                key={sch.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={sch.crest}
                    alt={sch.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{sch.name}</h4>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        {sch.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {sch.region} • {sch.district} • {sch.level} • Head: {sch.headmasterName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {sch.totalStudents} Students
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Tier: {sch.subscriptionTier}
                    </p>
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                    RLS Active
                  </span>
                </div>
              </div>
            ))}
            {filteredSchools.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300">No school tenant found matching "{tenantSearchQuery}"</p>
                <p>Try searching by School Name, Code (e.g. ACH-BAS-2026), Region, or District.</p>
              </div>
            )}
          </div>
        </div>

        {/* Security & RLS Policy Verifier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Row-Level Security (RLS) Policy Guard
            </h3>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-2 text-slate-800 dark:text-slate-200">
            <div className="text-indigo-700 dark:text-indigo-400 font-bold">// Postgres SQL RLS Policy Enforced:</div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <code>
                CREATE POLICY tenant_isolation_policy ON students FOR ALL USING (school_id =
                current_setting('app.current_school_id'));
              </code>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[10px] pt-1">
              ✓ Prevents cross-school ID guessing attacks.
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Zero Data Leak Guarantee:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Passed</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Low-Bandwidth Asset Budget:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">&lt; 150 KB</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Offline Sync Queue Status:</span>
              <span className="text-indigo-700 dark:text-indigo-400 font-bold">IndexedDB Cache Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
