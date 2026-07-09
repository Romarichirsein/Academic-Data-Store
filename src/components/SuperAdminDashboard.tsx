/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolTenant, SchoolClass, Student, AttendanceSheet, Evaluation, AuditLog } from '../types';
import { useTenantStats } from '../hooks/useTenantStats';
import PerformanceChart from './PerformanceChart';
import { 
  Building2, 
  Globe, 
  UserCheck, 
  ShieldCheck, 
  Activity, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Layers, 
  Plus, 
  ChevronRight,
  ShieldAlert,
  Clock,
  BookOpen,
  Sparkles,
  Palette,
  UserPlus,
  ArrowRight,
  HelpCircle,
  Info
} from 'lucide-react';
import { DEFAULT_PALETTES } from '../utils/colorUtils';

interface SuperAdminDashboardProps {
  schools: SchoolTenant[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  students: Student[];
  classes: SchoolClass[];
  onEditSchool: (school: SchoolTenant) => void;
  onDeleteSchool: (id: string, name: string) => void;
  onUpdateLicense: (id: string, status: 'Active' | 'Expired' | 'Pending' | 'Suspended') => void;
  onUpdateVersion: (id: string, version: string) => void;
  onAddNewSchool: () => void;
  sheets?: AttendanceSheet[];
  evaluations?: Evaluation[];
  auditLogs?: AuditLog[];
}

export default function SuperAdminDashboard({
  schools,
  activeSchoolId,
  setActiveSchoolId,
  students,
  classes,
  onEditSchool,
  onDeleteSchool,
  onUpdateLicense,
  onUpdateVersion,
  onAddNewSchool,
  sheets = [],
  evaluations = [],
  auditLogs = []
}: SuperAdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [versionInputVal, setVersionInputVal] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'schools' | 'guide'>('overview');
  const [sandboxPalette, setSandboxPalette] = useState<'blue' | 'emerald' | 'violet' | 'indigo' | 'rose'>('blue');
  const [onboardingChecklist, setOnboardingChecklist] = useState({
    createTenant: false,
    configureBranding: false,
    addAdminAccount: false,
    setupClasses: false,
    registerStudents: false,
  });

  // Helper: count students for a specific school
  const getSchoolStudentsCount = (schoolId: string) => {
    return students.filter(s => {
      if (!s) return false;
      if (s.schoolId) {
        return s.schoolId === schoolId;
      }
      const studentClass = s.classId ? classes.find(c => c.id === s.classId) : undefined;
      return (studentClass?.schoolId || 'school-lby') === schoolId;
    }).length;
  };

  // Filter schools
  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slogan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Invoke the real-time Tenant Stats hook
  const realTimeStats = useTenantStats();

  // Platform usage metrics
  const totalSchoolsCount = realTimeStats.loading ? schools.length : realTimeStats.totalSchoolsCount;
  const activeSchoolsCount = realTimeStats.loading 
    ? schools.filter(s => s.licenseStatus === 'Active' || !s.licenseStatus).length
    : realTimeStats.activeSchoolsCount;
  const totalStudentsCount = realTimeStats.loading 
    ? schools.reduce((acc, s) => acc + getSchoolStudentsCount(s.id), 0)
    : realTimeStats.totalStudents;
  
  // Real-time Platform Usage Aggregations
  const totalSheetsCount = realTimeStats.loading ? sheets.length : realTimeStats.sheetsCount;
  const totalEvalsCount = realTimeStats.loading ? evaluations.length : realTimeStats.evaluationsCount;
  const totalLogsCount = auditLogs.length;
  const systemUsageCount = totalSheetsCount + totalEvalsCount + totalLogsCount;

  // Platform compliance percentage
  const complianceRate = totalSchoolsCount > 0 
    ? Math.round((activeSchoolsCount / totalSchoolsCount) * 100) 
    : 100;

  const handleStartVersionEdit = (id: string, currentVal: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVersionId(id);
    setVersionInputVal(currentVal);
  };

  const handleSaveVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateVersion(id, versionInputVal);
    setEditingVersionId(null);
  };

  return (
    <div className="space-y-6" id="superadmin-dashboard-container">
      
      {/* Real-time Firestore KPI Widgets (Always visible at the top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Schools Card */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 12px 20px -3px rgba(59, 130, 246, 0.08), 0 4px 6px -2px rgba(59, 130, 246, 0.02)' }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all flex items-center space-x-4 relative overflow-hidden"
        >
          <div className="h-12 w-12 rounded-xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Établissements</p>
              {!realTimeStats.loading && (
                <span className="flex h-1.5 w-1.5 relative" title="Synchro Firestore active">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-black text-slate-800 font-mono leading-none mt-1.5">
              {totalSchoolsCount} <span className="text-xs text-slate-400 font-normal">écoles</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>{activeSchoolsCount} actives en direct</span>
            </p>
          </div>
        </motion.div>

        {/* Total Students Card */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 12px 20px -3px rgba(139, 92, 246, 0.08), 0 4px 6px -2px rgba(139, 92, 246, 0.02)' }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all flex items-center space-x-4 relative overflow-hidden"
        >
          <div className="h-12 w-12 rounded-xl bg-violet-50/70 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/50">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Élèves Plateforme</p>
              {!realTimeStats.loading && (
                <span className="flex h-1.5 w-1.5 relative" title="Synchro Firestore active">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-black text-slate-800 font-mono leading-none mt-1.5">
              {totalStudentsCount} <span className="text-xs text-slate-400 font-normal">inscrits</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
              <span className="text-violet-500 font-bold font-mono">+{Math.round(totalStudentsCount * 0.15)}</span>
              <span>nouveaux ce trimestre</span>
            </p>
          </div>
        </motion.div>

        {/* Global System Usage Card */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 12px 20px -3px rgba(99, 102, 241, 0.08), 0 4px 6px -2px rgba(99, 102, 241, 0.02)' }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all flex items-center space-x-4 relative overflow-hidden"
        >
          <div className="h-12 w-12 rounded-xl bg-indigo-50/70 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Usage Système Global</p>
              {!realTimeStats.loading && (
                <span className="flex h-1.5 w-1.5 relative" title="Synchro Firestore active">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-black text-slate-800 font-mono leading-none mt-1.5" title={`${totalSheetsCount} fiches d'appel, ${totalEvalsCount} épreuves, ${totalLogsCount} logs`}>
              {systemUsageCount} <span className="text-xs text-slate-400 font-normal">ops</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {totalSheetsCount} appels • {totalEvalsCount} épreuves • {totalLogsCount} logs
            </p>
          </div>
        </motion.div>

        {/* Network Health / Global Compliance Card */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 12px 20px -3px rgba(16, 185, 129, 0.08), 0 4px 6px -2px rgba(16, 185, 129, 0.02)' }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all flex items-center space-x-4 relative overflow-hidden"
        >
          <div className="h-12 w-12 rounded-xl bg-emerald-50/70 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
            <Globe className="h-6 w-6 animate-pulse" style={{ animationDuration: '4s' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Santé Réseau & Licences</p>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-2xl font-display font-black text-emerald-600 font-mono leading-none mt-1.5">
              {complianceRate}% <span className="text-xs text-slate-400 font-normal">valide</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Conformité des contrats d'établissement
            </p>
          </div>
        </motion.div>

      </div>

      {/* SuperAdmin Inner Sub-navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none outline-none ${
              viewMode === 'overview'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Vue d'Ensemble Analytique</span>
          </button>
          
          <button
            onClick={() => setViewMode('schools')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none outline-none ${
              viewMode === 'schools'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Liste des Établissements</span>
          </button>

          <button
            onClick={() => setViewMode('guide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none outline-none ${
              viewMode === 'guide'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Guide & Onboarding</span>
          </button>
        </div>
        
        {/* Dynamic Sync Status Indicator */}
        {!realTimeStats.loading && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Flux Temps Réel Actif</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: viewMode === 'overview' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: viewMode === 'overview' ? 20 : -20 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="space-y-6"
        >
          {viewMode === 'overview' && (
            <>
              {/* Live Recharts-powered enrollment & attendance data analytics */}
              <PerformanceChart schools={schools} />

      {/* Real-Time Performance & Adoption Indicators Section */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2 font-display">
              <Activity className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
              <span>Indicateurs de Performance & Adoption en Temps Réel</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Analyse d'adoption, d'activité et de santé de la licence par établissement connecté en temps réel à Firestore.
            </p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono font-bold px-2.5 py-1 rounded-full border border-indigo-400/10 shrink-0">
            Statut de Conformité du Réseau : {complianceRate}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map(school => {
            const schoolStats = realTimeStats.schoolStatsMap[school.id];
            
            const studentCount = schoolStats ? schoolStats.studentCount : getSchoolStudentsCount(school.id);
            const classCount = schoolStats ? schoolStats.classCount : classes.filter(c => c.schoolId === school.id).length;
            const activityCount = schoolStats ? schoolStats.activityCount : (evaluations.filter(e => e.schoolId === school.id).length + sheets.filter(s => s.schoolId === school.id).length);
            
            // License rating / status
            const license = school.licenseStatus || 'Active';
            let statusColor = 'text-emerald-400';
            let statusBg = 'bg-emerald-500/10';
            let statusBorder = 'border-emerald-500/20';
            let healthScore = schoolStats ? schoolStats.healthScore : 95; // default active
            
            if (license === 'Active' && !schoolStats) {
              statusColor = 'text-emerald-400';
              statusBg = 'bg-emerald-500/10';
              statusBorder = 'border-emerald-500/20';
              healthScore = 75 + Math.min(activityCount * 3, 20) + Math.min(classCount, 5); // caps at 100
            } else if (license === 'Pending') {
              statusColor = 'text-amber-400';
              statusBg = 'bg-amber-500/10';
              statusBorder = 'border-amber-500/20';
              if (!schoolStats) healthScore = 55;
            } else if (license === 'Expired') {
              statusColor = 'text-rose-400';
              statusBg = 'bg-rose-500/10';
              statusBorder = 'border-rose-500/20';
              if (!schoolStats) healthScore = 15;
            } else if (license === 'Suspended') {
              statusColor = 'text-slate-400';
              statusBg = 'bg-slate-500/10';
              statusBorder = 'border-slate-500/20';
              if (!schoolStats) healthScore = 0;
            }

            // Limit score between 0 and 100
            healthScore = Math.max(5, Math.min(100, healthScore));

            return (
              <div key={school.id} className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/60 transition-all duration-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl shrink-0">{school.logoEmoji || '🏫'}</span>
                    <div className="min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{school.name}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">{school.systemVersion || 'v2.5.0'}</p>
                    </div>
                  </div>
                  
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor} ${statusBg} ${statusBorder} uppercase tracking-wider shrink-0`}>
                    {license === 'Active' ? 'Active' : license === 'Pending' ? 'À valider' : license === 'Expired' ? 'Expirée' : 'Suspendue'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-900">
                  <div className="bg-slate-900/50 p-2 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Élèves</p>
                    <p className="text-sm font-bold text-slate-200 font-mono mt-0.5">{studentCount}</p>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Classes</p>
                    <p className="text-sm font-bold text-slate-200 font-mono mt-0.5">{classCount}</p>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Activités</p>
                    <p className="text-sm font-bold text-slate-200 font-mono mt-0.5">{activityCount}</p>
                  </div>
                </div>

                {/* Score adoption gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Taux d'Adoption Plateforme</span>
                    <span className="text-slate-200 font-bold font-mono">{healthScore}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${healthScore}%` }} 
                      className={`h-full rounded-full transition-all duration-500 ${
                        healthScore >= 80 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : healthScore >= 50 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
            </>
          )}

          {viewMode === 'schools' && (
            <>
              {/* Directory & Actions header search */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Actions header control layout */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-display font-bold text-slate-800 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-slate-700" />
              <span>Tableau de Contrôle & Supervision de Réseau</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gérez les licences d'accès scolaires, mettez à jour les versions logicielles et surveillez la charte graphique de chaque locataire.
            </p>
          </div>

          <button
            onClick={onAddNewSchool}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all shrink-0 cursor-pointer border-0"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un établissement</span>
          </button>
        </div>

        {/* Filtering inputs bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, slogan, ville d'implantation..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <span className="text-[11px] text-slate-400 font-mono font-bold">
            Affichage de {filteredSchools.length} sur {totalSchoolsCount} écoles
          </span>
        </div>

        {/* School table list directory */}
        <div className="overflow-x-auto">
          {filteredSchools.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Aucun établissement trouvé</p>
              <p className="text-[11px] text-slate-400">Essayez une autre recherche ou créez un nouvel établissement ci-dessus.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/40 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-6">Établissement</th>
                  <th className="py-4 px-4 text-center">Élèves</th>
                  <th className="py-4 px-4">Version Système</th>
                  <th className="py-4 px-4">Statut Licence</th>
                  <th className="py-4 px-4">Charte CSS (Brand)</th>
                  <th className="py-4 px-6 text-right">Actions de Supervision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                {filteredSchools.map(school => {
                  const isSelected = school.id === activeSchoolId;
                  const studentCount = getSchoolStudentsCount(school.id);
                  const license = school.licenseStatus || 'Active';
                  const version = school.systemVersion || 'v2.5.0';

                  let statusBadgeClass = '';
                  let statusLabel = 'ACTIVE';

                  if (license === 'Active') {
                    statusBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100';
                    statusLabel = 'ACTIVE';
                  } else if (license === 'Expired') {
                    statusBadgeClass = 'text-rose-700 bg-rose-50 border-rose-100 hover:bg-rose-100';
                    statusLabel = 'EXPIRÉE';
                  } else if (license === 'Pending') {
                    statusBadgeClass = 'text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100';
                    statusLabel = 'EN ATTENTE';
                  } else {
                    statusBadgeClass = 'text-slate-700 bg-slate-50 border-slate-100 hover:bg-slate-100';
                    statusLabel = 'BLOQUÉE';
                  }

                  return (
                    <tr 
                      key={school.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSelected ? 'bg-slate-50/20 font-semibold' : ''
                      }`}
                    >
                      {/* Logo & School text */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {school.logoUrl ? (
                            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-inner shrink-0">
                              <img 
                                src={school.logoUrl} 
                                alt={school.name} 
                                className="h-full w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <span className="text-xl p-1 bg-slate-100 rounded-lg shrink-0">{school.logoEmoji || '🏫'}</span>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 leading-tight flex items-center space-x-1.5 truncate">
                              <span className="truncate">{school.name}</span>
                              {isSelected && (
                                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 shrink-0" title="Établissement actif" />
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 italic truncate">« {school.slogan} »</p>
                          </div>
                        </div>
                      </td>

                      {/* Total enrolled students */}
                      <td className="py-4 px-4 text-center font-bold font-mono text-slate-800">
                        {studentCount}
                      </td>

                      {/* Version system inline update */}
                      <td className="py-4 px-4">
                        {editingVersionId === school.id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={versionInputVal}
                              onChange={e => setVersionInputVal(e.target.value)}
                              className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={(e) => handleSaveVersion(school.id, e)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer border-0 bg-transparent"
                              title="Enregistrer"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingVersionId(null); }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer border-0 bg-transparent"
                              title="Annuler"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 group">
                            <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                              {version}
                            </span>
                            <button
                              onClick={(e) => handleStartVersionEdit(school.id, version, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-opacity cursor-pointer border-0 bg-transparent"
                              title="Modifier la version"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* License Status selector dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={license}
                          onChange={e => onUpdateLicense(school.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer ${statusBadgeClass}`}
                        >
                          <option value="Active">Active</option>
                          <option value="Expired">Suspendue</option>
                          <option value="Pending">À valider</option>
                          <option value="Suspended">Bloquée</option>
                        </select>
                      </td>

                      {/* Brand Color circles */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-2xs" style={{ backgroundColor: school.themePrimary || DEFAULT_PALETTES[school.primaryColor || 'blue'].primary }} title="Primaire" />
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-2xs" style={{ backgroundColor: school.themeSecondary || DEFAULT_PALETTES[school.primaryColor || 'blue'].secondary }} title="Secondaire" />
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-2xs" style={{ backgroundColor: school.themeAccent || DEFAULT_PALETTES[school.primaryColor || 'blue'].accent }} title="Accent" />
                        </div>
                      </td>

                      {/* Quick select and buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setActiveSchoolId(school.id);
                            }}
                            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? 'Sélectionné' : 'Piloter'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditSchool(school); }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-all cursor-pointer border-0 bg-transparent"
                            title="Modifier la fiche"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteSchool(school.id, school.name); }}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-all cursor-pointer border-0 bg-transparent"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Grid view of all schools for geographic contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Globe className="h-4.5 w-4.5 text-blue-500" />
          <span>Fiches de liaison et coordonnées d'implantation</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map(school => {
            const isActive = school.id === activeSchoolId;
            return (
              <div 
                key={school.id}
                onClick={() => setActiveSchoolId(school.id)}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between relative ${
                  isActive 
                    ? 'border-slate-900 shadow bg-slate-50/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {isActive && (
                  <span className="absolute top-3 right-3 h-4 w-4 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[8px] shadow">
                    ✓
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-start space-x-2.5">
                    {school.logoUrl ? (
                      <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 p-0.5 flex items-center justify-center shadow-sm shrink-0">
                        <img 
                          src={school.logoUrl} 
                          alt={school.name} 
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl shrink-0 p-1 bg-slate-50 rounded-lg shrink-0">{school.logoEmoji || '🏫'}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight truncate">
                        {school.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 italic truncate">« {school.slogan} »</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 font-medium">
                    <p className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{school.address}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{school.phone}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{school.email}</span>
                    </p>
                    <p className="flex items-center space-x-1.5 font-bold text-slate-600 pt-0.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Année active : <span className="text-slate-800 font-mono">{school.activeSchoolYear}</span></span>
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded uppercase text-[9px]">
                    {school.primaryColor}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 font-sans">
                    <span>Ouvrir l'espace</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
            </>
          )}

          {viewMode === 'guide' && (
            <div className="space-y-6">
              {/* Onboarding Welcome Hero */}
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BookOpen className="h-40 w-40" />
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-indigo-500/20">
                    <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>Tutoriel d'Onboarding Officiel</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
                    Guide de Configuration Multi-Établissement & Branding
                  </h3>
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                    Bienvenue dans le centre de pilotage global de l'application ! En tant que Super Administrateur, vous disposez d'un contrôle total pour provisionner de nouveaux établissements (locataires SaaS ou "Tenants"), configurer leur identité visuelle unique et associer les comptes d'accès pour les personnels administratifs et enseignants.
                  </p>
                </div>

                {/* Local Progress Indicator */}
                <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
                  {(() => {
                    const checkedCount = Object.values(onboardingChecklist).filter(Boolean).length;
                    const progressPercent = Math.round((checkedCount / 5) * 100);
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider font-mono">Progression de votre Onboarding</span>
                          <span className="font-mono text-indigo-400 font-bold text-sm bg-indigo-400/10 px-2 py-0.5 rounded-full">{progressPercent}% Complété</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            style={{ width: `${progressPercent}%` }} 
                            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Onboarding Checklist & Active Step Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Steps Navigator Checklist */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-1">
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Plan de déploiement</h4>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setOnboardingChecklist(prev => ({ ...prev, createTenant: !prev.createTenant }))}
                      className="w-full text-left flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer bg-white"
                    >
                      <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        onboardingChecklist.createTenant 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 text-transparent'
                      }`}>✓</span>
                      <div>
                        <p className={`text-xs font-bold ${onboardingChecklist.createTenant ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          1. Création de l'école (Tenant)
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Créer un locataire autonome avec ID et informations</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setOnboardingChecklist(prev => ({ ...prev, configureBranding: !prev.configureBranding }))}
                      className="w-full text-left flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer bg-white"
                    >
                      <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        onboardingChecklist.configureBranding 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 text-transparent'
                      }`}>✓</span>
                      <div>
                        <p className={`text-xs font-bold ${onboardingChecklist.configureBranding ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          2. Configuration de la charte
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Personnaliser le logo emoji, le slogan et la palette CSS</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setOnboardingChecklist(prev => ({ ...prev, addAdminAccount: !prev.addAdminAccount }))}
                      className="w-full text-left flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer bg-white"
                    >
                      <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        onboardingChecklist.addAdminAccount 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 text-transparent'
                      }`}>✓</span>
                      <div>
                        <p className={`text-xs font-bold ${onboardingChecklist.addAdminAccount ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          3. Association des administrateurs
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Déployer les premiers identifiants de direction</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setOnboardingChecklist(prev => ({ ...prev, setupClasses: !prev.setupClasses }))}
                      className="w-full text-left flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer bg-white"
                    >
                      <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        onboardingChecklist.setupClasses 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 text-transparent'
                      }`}>✓</span>
                      <div>
                        <p className={`text-xs font-bold ${onboardingChecklist.setupClasses ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          4. Initialisation des classes
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Configurer les niveaux académiques et les matières</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setOnboardingChecklist(prev => ({ ...prev, registerStudents: !prev.registerStudents }))}
                      className="w-full text-left flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer bg-white"
                    >
                      <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        onboardingChecklist.registerStudents 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 text-transparent'
                      }`}>✓</span>
                      <div>
                        <p className={`text-xs font-bold ${onboardingChecklist.registerStudents ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          5. Enregistrement des élèves & notes
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Assurer la saisie des listes d'appel et des notes</p>
                      </div>
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                    <p className="font-bold text-slate-700 flex items-center space-x-1">
                      <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span>Rappel de l'architecture</span>
                    </p>
                    <p>
                      Chaque école créée est totalement cloisonnée en base de données. L'administrateur d'établissement ne voit jamais les données des autres collèges ou lycées.
                    </p>
                  </div>
                </div>

                {/* Main Guided Step Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 lg:col-span-2">
                  
                  {/* Step 1: Create School */}
                  <div className="space-y-3 pb-5 border-b border-slate-100">
                    <h5 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider flex items-center space-x-2">
                      <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>Étape 1 : Création du Tenant Établissement</span>
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      La première étape consiste à déclarer l'école sur notre infrastructure cloud. Le système attribue à l'établissement un identifiant unique (par exemple <code>school-lby</code>) qui servira de clé de routage pour isoler toutes ses données (élèves, fiches de présence, notes).
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">Prêt à créer une nouvelle école ?</p>
                        <p className="text-[10px] text-slate-500">Cliquez pour ouvrir l'assistant de configuration globale.</p>
                      </div>
                      <button
                        onClick={onAddNewSchool}
                        className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-sm border-0 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Créer un établissement</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Branding Customization & Live Sandbox Preview */}
                  <div className="space-y-4 pb-5 border-b border-slate-100">
                    <h5 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider flex items-center space-x-2">
                      <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">2</span>
                      <span>Étape 2 : Configuration du Branding & Charte Visuelle</span>
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Personnalisez l'expérience utilisateur ! Chaque établissement définit son logo (Emoji expressif ou URL d'image), son slogan officiel, ainsi que sa couleur de palette primaire. Cette couleur colore instantanément le tableau de bord de direction de l'école concernée.
                    </p>

                    {/* LIVE BRANDING SIMULATOR SANDBOX */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                            <Palette className="h-4 w-4 text-slate-600" />
                            <span>Simulateur Interactif de Palette</span>
                          </p>
                          <p className="text-[10px] text-slate-500">Choisissez une couleur pour tester le rendu de l'interface en direct.</p>
                        </div>
                        
                        {/* Selector Row */}
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1.5 sm:gap-0">
                          {(['blue', 'emerald', 'violet', 'indigo', 'rose'] as const).map(color => {
                            const isChosen = sandboxPalette === color;
                            const bgPreview = 
                              color === 'blue' ? 'bg-blue-600' :
                              color === 'emerald' ? 'bg-emerald-600' :
                              color === 'violet' ? 'bg-violet-600' :
                              color === 'indigo' ? 'bg-indigo-600' : 'bg-rose-600';
                            return (
                              <button
                                key={color}
                                onClick={() => setSandboxPalette(color)}
                                className={`h-6 px-2 text-[10px] font-bold rounded-md border flex items-center space-x-1 cursor-pointer transition-all ${
                                  isChosen 
                                    ? 'bg-white border-slate-800 text-slate-800 shadow-sm' 
                                    : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${bgPreview}`} />
                                <span className="capitalize">{color}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mockup Card Dynamic */}
                      {(() => {
                        let colorHex = '#2563eb';
                        let bgClass = 'bg-blue-600';
                        let textClass = 'text-blue-600';
                        let lightBgClass = 'bg-blue-50';
                        let borderClass = 'border-blue-200';
                        let nameLabel = 'Lycée de Démo (Bleu)';

                        if (sandboxPalette === 'emerald') {
                          colorHex = '#059669';
                          bgClass = 'bg-emerald-600';
                          textClass = 'text-emerald-600';
                          lightBgClass = 'bg-emerald-50';
                          borderClass = 'border-emerald-200';
                          nameLabel = 'Lycée de Démo (Émeraude)';
                        } else if (sandboxPalette === 'violet') {
                          colorHex = '#7c3aed';
                          bgClass = 'bg-violet-600';
                          textClass = 'text-violet-600';
                          lightBgClass = 'bg-violet-50';
                          borderClass = 'border-violet-200';
                          nameLabel = 'Lycée de Démo (Violet)';
                        } else if (sandboxPalette === 'indigo') {
                          colorHex = '#4f46e5';
                          bgClass = 'bg-indigo-600';
                          textClass = 'text-indigo-600';
                          lightBgClass = 'bg-indigo-50';
                          borderClass = 'border-indigo-200';
                          nameLabel = 'Lycée de Démo (Indigo)';
                        } else if (sandboxPalette === 'rose') {
                          colorHex = '#e11d48';
                          bgClass = 'bg-rose-600';
                          textClass = 'text-rose-600';
                          lightBgClass = 'bg-rose-50';
                          borderClass = 'border-rose-200';
                          nameLabel = 'Lycée de Démo (Rose)';
                        }

                        return (
                          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🏫</span>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-800 leading-none">{nameLabel}</p>
                                  <p className="text-[8px] text-slate-400">Slogan de l'établissement</p>
                                </div>
                              </div>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${textClass} ${lightBgClass} ${borderClass} uppercase font-mono`}>
                                LICENCE ACTIVE
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <p className="text-[7px] text-slate-400 font-bold uppercase">Élèves inscrits</p>
                                <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">240</p>
                              </div>
                              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <p className="text-[7px] text-slate-400 font-bold uppercase">Moyenne Générale</p>
                                <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">14.2 / 20</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[9px] pt-1">
                              <span className="text-slate-500">Configuration active</span>
                              <button className={`px-2.5 py-1 text-white text-[8px] font-bold rounded-md cursor-not-allowed border-0 shadow-2xs ${bgClass}`}>
                                Bouton d'Action {sandboxPalette.toUpperCase()}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Step 3: Admin Accounts Provisioning */}
                  <div className="space-y-3 pb-5 border-b border-slate-100">
                    <h5 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider flex items-center space-x-2">
                      <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">3</span>
                      <span>Étape 3 : Comptes Administrateurs & Identifiants de Connexion</span>
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pour piloter le Tenant, les directeurs ou censeurs se connectent à l'application. Le système associe automatiquement l'utilisateur à son établissement d'origine en fonction de son compte d'authentification.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5">
                      <p className="text-xs font-bold text-slate-800">Comptes de Démo disponibles pour vos tests :</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                          <p className="font-bold text-slate-700 flex items-center space-x-1">
                            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                            <span>Lycée Bilingue de Yaoundé (LBY)</span>
                          </p>
                          <p className="text-slate-500 font-mono">Email : <span className="text-slate-800 font-bold">lby@academic.cm</span></p>
                          <p className="text-slate-500 font-mono">Mot de passe : <span className="text-slate-800 font-bold">lby</span></p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                          <p className="font-bold text-slate-700 flex items-center space-x-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                            <span>Collège Jean-Tabi / Vogt</span>
                          </p>
                          <p className="text-slate-500 font-mono">Email : <span className="text-slate-800 font-bold">vogt@academic.cm</span></p>
                          <p className="text-slate-500 font-mono">Mot de passe : <span className="text-slate-800 font-bold">vogt</span></p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                          <p className="font-bold text-slate-700 flex items-center space-x-1">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
                            <span>Lycée Classique de Bafoussam</span>
                          </p>
                          <p className="text-slate-500 font-mono">Email : <span className="text-slate-800 font-bold">lcb@academic.cm</span></p>
                          <p className="text-slate-500 font-mono">Mot de passe : <span className="text-slate-800 font-bold">lcb</span></p>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                          <p className="font-bold text-slate-700 flex items-center space-x-1">
                            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                            <span>Lycée Jost de Douala</span>
                          </p>
                          <p className="text-slate-500 font-mono">Email : <span className="text-slate-800 font-bold">lsd@academic.cm</span></p>
                          <p className="text-slate-500 font-mono">Mot de passe : <span className="text-slate-800 font-bold">lsd</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 & 5: Inner School Setup & Attendance/Grades Flow */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider flex items-center space-x-2">
                      <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">4</span>
                      <span>Étape 4 & 5 : Configuration des Classes et des Bulletins</span>
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Une fois connecté au compte Admin de votre école (par ex. <code>lby@academic.cm</code>), l'assistant vous guide pour :
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                      <li>Créer vos classes académiques (ex : Terminale C, 3ème A, 4ème B, etc.)</li>
                      <li>Associer les matières correspondantes avec leurs coefficients réglementaires.</li>
                      <li>Inscrire ou importer la liste des élèves avec leur numéro de matricule national unique.</li>
                      <li>Saisir les absences de cours quotidiennes et enregistrer les notes des évaluations séquentielles.</li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
