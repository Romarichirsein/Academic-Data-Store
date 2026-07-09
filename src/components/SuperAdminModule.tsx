/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolTenant, SchoolClass, Student, AuditLog } from '../types';
import ThemeCustomizer from './ThemeCustomizer';
import SchoolManagerForm from './SchoolManagerForm';
import AuditLogManager from './AuditLogManager';
import SuperAdminDashboard from './SuperAdminDashboard';

import { 
  Building2, 
  ShieldAlert, 
  CheckCircle, 
  Activity, 
  Globe, 
  Paintbrush, 
  History, 
  Plus, 
  Wrench,
  LogOut
} from 'lucide-react';

interface SuperAdminModuleProps {
  schools: SchoolTenant[];
  setSchools: React.Dispatch<React.SetStateAction<SchoolTenant[]>>;
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  setClasses?: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  classes?: SchoolClass[];
  students?: Student[];
  auditLogs?: AuditLog[];
  addAuditLog?: (action: string, schoolId: string, details: string, user?: string) => void;
  isLoggedIn?: boolean;
  currentUser?: any;
  setIsLoggedIn?: (val: boolean) => void;
  setCurrentUser?: (user: any) => void;
  sheets?: any[];
  evaluations?: any[];
}

export default function SuperAdminModule({
  schools,
  setSchools,
  activeSchoolId,
  setActiveSchoolId,
  setClasses,
  setStudents,
  classes = [],
  students = [],
  auditLogs = [],
  addAuditLog,
  isLoggedIn,
  currentUser,
  setIsLoggedIn,
  setCurrentUser,
  sheets = [],
  evaluations = []
}: SuperAdminModuleProps) {
  // Sub tab navigation
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'tenants' | 'themes' | 'audit'>('dashboard');

  // Form toggles
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);

  // Status feedback alerts
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle school edit initiation
  const handleEditSchool = (school: SchoolTenant) => {
    setEditingSchoolId(school.id);
    setIsFormOpen(true);
  };

  // Handle school deletion
  const handleDeleteSchool = (id: string, name: string) => {
    if (schools.length <= 1) {
      setErrorMsg('Impossible de supprimer le dernier établissement de la plateforme.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    
    setSchools(prev => prev.filter(s => s.id !== id));
    if (activeSchoolId === id) {
      const remaining = schools.filter(s => s.id !== id);
      setActiveSchoolId(remaining[0].id);
    }

    addAuditLog?.(
      "Suppression d'établissement",
      id,
      `Destruction définitive du compte et de l'isolation du locataire "${name}" de la plateforme.`
    );

    setFeedbackMsg(`L'établissement "${name}" a été supprimé de la plateforme.`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Handle inline updates
  const handleUpdateLicense = (schoolId: string, status: 'Active' | 'Expired' | 'Pending' | 'Suspended') => {
    const sch = schools.find(s => s.id === schoolId);
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return { ...s, licenseStatus: status };
      }
      return s;
    }));
    
    addAuditLog?.(
      "Licence modifiée",
      schoolId,
      `Changement du statut de la licence d'utilisation pour l'école "${sch?.name}" -> ${status}.`
    );

    setFeedbackMsg(`Licence de "${sch?.name}" mise à jour en statut : ${status}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleUpdateVersion = (schoolId: string, version: string) => {
    const sch = schools.find(s => s.id === schoolId);
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return { ...s, systemVersion: version };
      }
      return s;
    }));

    addAuditLog?.(
      "Mise à niveau système",
      schoolId,
      `Mise à jour de la version applicative de l'établissement "${sch?.name}" vers ${version}.`
    );

    setFeedbackMsg(`Version de "${sch?.name}" mise à niveau vers : ${version}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Action telemetry simulator
  const handleSimulateAction = (type: 'grades' | 'attendance' | 'student') => {
    const activeSchObj = schools.find(s => s.id === activeSchoolId) || schools[0];
    
    if (type === 'grades') {
      const randomClass = classes.filter(c => c.schoolId === activeSchObj.id || (!c.schoolId && activeSchObj.id === 'school-lby'))[0] || { name: 'Terminale C' };
      const randomSubjects = ['Mathématiques', 'Physique-Chimie', 'Français', 'Informatique'];
      const randomSub = randomSubjects[Math.floor(Math.random() * randomSubjects.length)];
      
      addAuditLog?.(
        "Validation de notes",
        activeSchObj.id,
        `Validation finale par le Censeur de la fiche de notes Séquence 5 en "${randomSub}" pour la classe ${randomClass.name}.`
      );
      setFeedbackMsg("Simulation : Note validée et journalisée !");
    } else if (type === 'attendance') {
      const randomClass = classes.filter(c => c.schoolId === activeSchObj.id || (!c.schoolId && activeSchObj.id === 'school-lby'))[0] || { name: '3ème Allemand' };
      const randomHour = ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00'][Math.floor(Math.random() * 3)];
      
      addAuditLog?.(
        "Saisie d'absences",
        activeSchObj.id,
        `Saisie de la fiche d'appel numérique pour la classe ${randomClass.name} à ${randomHour} (1 élève noté Absent).`
      );
      setFeedbackMsg("Simulation : Présences enregistrées et journalisées !");
    } else if (type === 'student') {
      const firstNames = ['Christian', 'Amina', 'Rodrigue', 'Grace', 'Désiré'];
      const lastNames = ['Fouda', 'Alhadji', 'Nguemo', 'Tchakounté', 'Mvogo'];
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      addAuditLog?.(
        "Mise à jour élève",
        activeSchObj.id,
        `Modification du profil de liaison pour l'élève ${ln} ${fn} (Nouveau numéro de téléphone tuteur enregistré).`
      );
      setFeedbackMsg("Simulation : Profil élève mis à jour et journalisé !");
    }
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleLogout = () => {
    if (setIsLoggedIn) setIsLoggedIn(false);
    if (setCurrentUser) setCurrentUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header Info Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-6 -translate-y-6">
          <Building2 className="h-48 w-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-blue-400/20">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Console Super Admin • Gestion Multitenant</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold leading-tight">
              Academic Data Store • Superviseur de Réseau Éducatif
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervisez les indicateurs opérationnels en temps réel de chaque établissement scolaire, reconfigurez les chartes graphiques de marque grâce à la bibliothèque de thèmes, et contrôlez la conformité via la console centrale d'audit.
            </p>
          </div>

          {/* Logout button */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 hover:text-white border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shrink-0"
              title="Se déconnecter de la console SuperAdmin"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl border shadow-xs gap-1.5 overflow-x-auto">
        <button
          onClick={() => {
            setActiveSubTab('dashboard');
            setIsFormOpen(false);
            setEditingSchoolId(null);
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dashboard' && !isFormOpen
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Tableau de bord Supervision</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('tenants');
            setEditingSchoolId(null);
            setIsFormOpen(true);
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'tenants' || (isFormOpen && editingSchoolId === null)
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Créer un Locataire</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('themes');
            setIsFormOpen(false);
            setEditingSchoolId(null);
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'themes'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Paintbrush className="h-4 w-4" />
          <span>Personnalisation des Thèmes</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('audit');
            setIsFormOpen(false);
            setEditingSchoolId(null);
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Console d'Audit Centralisée</span>
          <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Dynamic Feedback Messaging */}
      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center space-x-2 animate-fade-in shadow-xs">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Dynamic Workspace Area */}
      <div className="transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tab 1: Supervision Real-time Dashboard */}
            {activeSubTab === 'dashboard' && (
              <SuperAdminDashboard
                schools={schools}
                activeSchoolId={activeSchoolId}
                setActiveSchoolId={setActiveSchoolId}
                students={students}
                classes={classes}
                onEditSchool={handleEditSchool}
                onDeleteSchool={handleDeleteSchool}
                onUpdateLicense={handleUpdateLicense}
                onUpdateVersion={handleUpdateVersion}
                onAddNewSchool={() => {
                  setEditingSchoolId(null);
                  setIsFormOpen(true);
                }}
                sheets={sheets}
                evaluations={evaluations}
                auditLogs={auditLogs}
              />
            )}

            {/* Tab 3: Themes Library and Real-Time Customizer */}
            {activeSubTab === 'themes' && (
              <ThemeCustomizer
                schools={schools}
                setSchools={setSchools}
                addAuditLog={addAuditLog}
              />
            )}

            {/* Tab 4: Centralized Cryptographic Audit Logs */}
            {activeSubTab === 'audit' && (
              <AuditLogManager
                auditLogs={auditLogs}
                schools={schools}
                onSimulateAction={handleSimulateAction}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal Overlay for School Tenant Creation / Editing */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsFormOpen(false);
                setEditingSchoolId(null);
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body Card with Slide-In & Fade-In Transition */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              <div className="overflow-y-auto p-1">
                <SchoolManagerForm
                  schools={schools}
                  setSchools={setSchools}
                  editingSchoolId={editingSchoolId}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingSchoolId(null);
                  }}
                  activeSchoolId={activeSchoolId}
                  setActiveSchoolId={setActiveSchoolId}
                  setClasses={setClasses}
                  setStudents={setStudents}
                  addAuditLog={addAuditLog}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
