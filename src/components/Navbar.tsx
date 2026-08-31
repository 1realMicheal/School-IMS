import React, { useState } from "react";
import { School, UserPersona, NetworkLatencyMode, OfflineSyncItem } from "../types";
import { School as SchoolIcon, Users, Wifi, WifiOff, Zap, ChevronDown, CheckCircle2, RefreshCw, Search, X, Sun, Moon } from "lucide-react";
import { Avatar } from "./Avatar";

interface NavbarProps {
  currentSchool: School;
  schools: School[];
  onSelectSchool: (school: School) => void;
  onOpenNewSchoolModal: () => void;
  currentPersona: UserPersona;
  personas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  networkMode: NetworkLatencyMode;
  onToggleNetworkMode: (mode: NetworkLatencyMode) => void;
  offlineQueue: OfflineSyncItem[];
  onSyncOfflineQueue: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSchool,
  schools,
  onSelectSchool,
  onOpenNewSchoolModal,
  currentPersona,
  personas,
  onSelectPersona,
  networkMode,
  onToggleNetworkMode,
  offlineQueue,
  onSyncOfflineQueue,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [personaSearchQuery, setPersonaSearchQuery] = useState("");

  const filteredSchools = schools.filter((sch) => {
    const q = schoolSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sch.name.toLowerCase().includes(q) ||
      sch.code.toLowerCase().includes(q) ||
      sch.id.toLowerCase().includes(q) ||
      sch.region.toLowerCase().includes(q) ||
      sch.district.toLowerCase().includes(q)
    );
  });

  const filteredPersonas = personas.filter((p) => {
    const q = personaSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  });

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs transition-colors">
      {/* Top Banner for Ghana Context, Low-Bandwidth Mode & Dark Mode Switch */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 px-4 py-1.5 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            EduGate Ghana
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            GES Basic & Secondary Operations (SIOMS)
          </span>
          <span className="bg-slate-800 dark:bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">
            {currentSchool.academicYear} • {currentSchool.term}
          </span>
        </div>

        {/* Network & Low-Bandwidth Resilience Selector + Dark Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Switcher */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              id="net-mode-online-btn"
              onClick={() => onToggleNetworkMode("ONLINE")}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                networkMode === "ONLINE"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Broadband Online Connection"
            >
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </button>
            <button
              id="net-mode-3g-btn"
              onClick={() => onToggleNetworkMode("3G_SIMULATED")}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                networkMode === "3G_SIMULATED"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Low-Bandwidth 3G Simulation"
            >
              <Zap className="w-3 h-3" />
              <span>3G Mode</span>
            </button>
            <button
              id="net-mode-offline-btn"
              onClick={() => onToggleNetworkMode("OFFLINE")}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                networkMode === "OFFLINE"
                  ? "bg-rose-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Offline (Local Cache with Auto-sync)"
            >
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </button>
          </div>

          {offlineQueue.length > 0 && (
            <button
              id="sync-offline-queue-btn"
              onClick={onSyncOfflineQueue}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded flex items-center gap-1.5 transition text-[11px] font-medium"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{offlineQueue.length} Queued</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* School Tenant Switcher */}
        <div className="relative">
          <button
            id="tenant-dropdown-btn"
            onClick={() => {
              setShowSchoolDropdown(!showSchoolDropdown);
              setShowPersonaDropdown(false);
            }}
            className="flex items-center gap-3 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-left px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {currentSchool.crest ? (
                <img
                  src={currentSchool.crest}
                  alt={currentSchool.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <SchoolIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-semibold font-mono">
                  {currentSchool.code}
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {currentSchool.level}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[280px]">
                {currentSchool.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {currentSchool.region} • {currentSchool.district}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition shrink-0" />
          </button>

          {/* School Dropdown */}
          {showSchoolDropdown && (
            <div className="absolute left-0 mt-2 w-84 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 flex justify-between items-center">
                <span>SWITCH SCHOOL TENANT (RLS)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">Multi-Tenant</span>
              </div>

              {/* School Search by Name or School Code */}
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder="Search by school name or code..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  {schoolSearchQuery && (
                    <button
                      onClick={() => setSchoolSearchQuery("")}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                {filteredSchools.map((sch) => (
                  <button
                    key={sch.id}
                    id={`select-school-${sch.id}`}
                    onClick={() => {
                      onSelectSchool(sch);
                      setShowSchoolDropdown(false);
                      setSchoolSearchQuery("");
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition ${
                      currentSchool.id === sch.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent"
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={sch.crest}
                        alt={sch.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{sch.name}</p>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 font-mono px-1 py-0.2 rounded font-bold shrink-0">
                          {sch.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {sch.region} • {sch.gradingScale === "GES_9_STANINE" ? "GES 9-Stanine" : "WAEC WASSCE"}
                      </p>
                    </div>
                    {currentSchool.id === sch.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                ))}
                {filteredSchools.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No school found matching "{schoolSearchQuery}"
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                <button
                  id="onboard-new-school-btn"
                  onClick={() => {
                    setShowSchoolDropdown(false);
                    onOpenNewSchoolModal();
                  }}
                  className="w-full py-2 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-center transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <SchoolIcon className="w-3.5 h-3.5" />
                  <span>+ Onboard New Ghanaian School</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher (RBAC Showcase) */}
        <div className="relative">
          <button
            id="persona-dropdown-btn"
            onClick={() => {
              setShowPersonaDropdown(!showPersonaDropdown);
              setShowSchoolDropdown(false);
            }}
            className="flex items-center gap-2.5 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl transition text-left shadow-xs"
          >
            <div className="relative">
              <Avatar
                name={currentPersona.name}
                src={currentPersona.avatar}
                size="md"
                className="ring-2 ring-indigo-500/80"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                  currentPersona.role === "TEACHER"
                    ? "bg-amber-500"
                    : currentPersona.role === "ADMIN"
                    ? "bg-blue-500"
                    : currentPersona.role === "PARENT"
                    ? "bg-emerald-500"
                    : "bg-purple-500"
                }`}
              />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentPersona.name}</span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{currentPersona.badge}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-300" />
          </button>

          {/* Persona Menu */}
          {showPersonaDropdown && (
            <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-900 dark:text-slate-100">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ROLE-BASED ACCESS CONTROL (RBAC)
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Switch user journey archetype</p>
              </div>

              {/* Persona Search by Name or Role/ID */}
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={personaSearchQuery}
                    onChange={(e) => setPersonaSearchQuery(e.target.value)}
                    placeholder="Search persona by name or role..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  {personaSearchQuery && (
                    <button
                      onClick={() => setPersonaSearchQuery("")}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                {filteredPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    id={`select-persona-${persona.id}`}
                    onClick={() => {
                      onSelectPersona(persona);
                      setShowPersonaDropdown(false);
                      setPersonaSearchQuery("");
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition ${
                      currentPersona.id === persona.id
                        ? "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    <Avatar
                      name={persona.name}
                      src={persona.avatar}
                      size="sm"
                      className="shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{persona.name}</p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            persona.role === "TEACHER"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : persona.role === "ADMIN"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : persona.role === "PARENT"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          }`}
                        >
                          {persona.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{persona.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {persona.description}
                      </p>
                    </div>
                  </button>
                ))}
                {filteredPersonas.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No persona found matching "{personaSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

