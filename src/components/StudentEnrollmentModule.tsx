/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Shuffle, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Sparkles, 
  GraduationCap, 
  Phone, 
  Mail, 
  User, 
  X,
  ArrowRight
} from 'lucide-react';
import { Student, SchoolClass, SchoolTenant } from '../types';

interface StudentEnrollmentModuleProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  activeSchoolId: string;
  activeSchool: SchoolTenant;
  addAuditLog?: (action: string, schoolId: string, details: string) => void;
}

export default function StudentEnrollmentModule({
  students,
  setStudents,
  classes,
  setClasses,
  activeSchoolId,
  activeSchool,
  addAuditLog
}: StudentEnrollmentModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'enroll' | 'directory'>('enroll');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Single Student Registration Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Level & Allocation options
  const [targetLevel, setTargetLevel] = useState<'Lycée' | 'Collège'>('Lycée');
  const [isAutoAllocation, setIsAutoAllocation] = useState<boolean>(true);
  const [manualClassId, setManualClassId] = useState<string>('');

  // Edit Student Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error'; details?: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success', details?: string) => {
    setFeedback({ message, type, details });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Active School Scoped items
  const schoolClasses = classes.filter(c => (c.schoolId || 'school-lby') === activeSchoolId);
  const schoolStudents = students.filter(s => {
    if (s.schoolId) return s.schoolId === activeSchoolId;
    const cls = classes.find(c => c.id === s.classId);
    return (cls?.schoolId || 'school-lby') === activeSchoolId;
  });

  // Candidate classes for the selected level
  const levelClasses = schoolClasses.filter(c => c.level === targetLevel);

  /**
   * AUTOMATIC DISTRIBUTION ALGORITHM:
   * Finds the best class in the target level by checking:
   * 1. Smallest current student count in this class
   * 2. Best gender balancing
   */
  const computeAutoAssignedClass = (chosenGender: 'M' | 'F', chosenLevel: 'Lycée' | 'Collège'): SchoolClass | null => {
    const available = schoolClasses.filter(c => c.level === chosenLevel);
    if (available.length === 0) return schoolClasses[0] || null;

    // Sort by number of current students ascending
    const sorted = [...available].sort((a, b) => {
      const countA = schoolStudents.filter(s => s.classId === a.id).length;
      const countB = schoolStudents.filter(s => s.classId === b.id).length;
      if (countA !== countB) return countA - countB;

      // Secondary balance: check gender ratio
      const genderCountA = schoolStudents.filter(s => s.classId === a.id && s.gender === chosenGender).length;
      const genderCountB = schoolStudents.filter(s => s.classId === b.id && s.gender === chosenGender).length;
      return genderCountA - genderCountB;
    });

    return sorted[0];
  };

  // Real-time suggested class preview
  const previewAssignedClass = isAutoAllocation 
    ? computeAutoAssignedClass(gender, targetLevel) 
    : schoolClasses.find(c => c.id === manualClassId) || schoolClasses[0];

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !parentName.trim() || !parentPhone.trim()) {
      showNotification('Veuillez remplir tous les champs obligatoires (*).', 'error');
      return;
    }

    let assignedClass: SchoolClass | null = null;
    if (isAutoAllocation) {
      assignedClass = computeAutoAssignedClass(gender, targetLevel);
    } else {
      assignedClass = schoolClasses.find(c => c.id === manualClassId) || schoolClasses[0];
    }

    if (!assignedClass) {
      showNotification('Aucune classe disponible dans l\'établissement pour effectuer l\'inscription.', 'error');
      return;
    }

    const newStudentId = `stud-${Date.now()}`;
    const newStudent: Student = {
      id: newStudentId,
      classId: assignedClass.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim() || undefined,
      schoolId: activeSchoolId,
      status: 'Active'
    };

    // Update students list
    setStudents(prev => [newStudent, ...prev]);

    // Automatically update studentCount on class
    setClasses(prev => prev.map(c => {
      if (c.id === assignedClass!.id) {
        return { ...c, studentCount: c.studentCount + 1 };
      }
      return c;
    }));

    addAuditLog?.(
      'Inscription & Répartition',
      activeSchoolId,
      `Inscription de l'élève ${lastName} ${firstName} (${gender}) affecté automatiquement à la classe ${assignedClass.name}. Parent : ${parentName} (${parentPhone}).`
    );

    showNotification(
      `Élève "${firstName} ${lastName}" inscrit avec succès !`,
      'success',
      isAutoAllocation 
        ? `Répartition automatique appliquée : Affecté à [${assignedClass.name}] pour équilibrer la charge de la division.`
        : `Affectation manuelle confirmée vers [${assignedClass.name}].`
    );

    // Reset form
    setFirstName('');
    setLastName('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
  };

  // Simulate Batch Import & Auto-Distribution (Very helpful for testing!)
  const handleBatchSimulation = () => {
    const candidates = [
      { fn: 'Arsène', ln: 'Fotso', g: 'M' as const, p: 'M. Fotso Patrice', ph: '+237 671 11 22 33' },
      { fn: 'Danielle', ln: 'Njoya', g: 'F' as const, p: 'Mme Njoya Bernadette', ph: '+237 699 22 33 44' },
      { fn: 'Gaspard', ln: 'Mbida', g: 'M' as const, p: 'M. Mbida Antoine', ph: '+237 655 33 44 55' },
      { fn: 'Hélène', ln: 'Tchami', g: 'F' as const, p: 'Mme Tchami Nicole', ph: '+237 680 44 55 66' }
    ];

    const added: Student[] = [];
    const classCountUpdates: Record<string, number> = {};

    candidates.forEach((cand, idx) => {
      const assigned = computeAutoAssignedClass(cand.g, 'Lycée');
      if (assigned) {
        classCountUpdates[assigned.id] = (classCountUpdates[assigned.id] || 0) + 1;
        added.push({
          id: `stud-sim-${Date.now()}-${idx}`,
          classId: assigned.id,
          firstName: cand.fn,
          lastName: cand.ln,
          gender: cand.g,
          parentName: cand.p,
          parentPhone: cand.ph,
          schoolId: activeSchoolId,
          status: 'Active'
        });
      }
    });

    setStudents(prev => [...added, ...prev]);
    setClasses(prev => prev.map(c => {
      if (classCountUpdates[c.id]) {
        return { ...c, studentCount: c.studentCount + classCountUpdates[c.id] };
      }
      return c;
    }));

    addAuditLog?.(
      'Import & Répartition par lot',
      activeSchoolId,
      `Inscription et répartition automatique simultanée de ${added.length} élèves dans les classes du Lycée.`
    );

    showNotification(
      `${added.length} élèves inscrits et répartis automatiquement avec succès !`,
      'success',
      'Les élèves ont été distribués harmonieusement entre les classes selon l\'effectif disponible.'
    );
  };

  const handleDeleteStudent = (stud: Student) => {
    if (confirm(`Confirmez-vous le désengagement et la radiation de "${stud.firstName} ${stud.lastName}" ?`)) {
      setStudents(prev => prev.filter(s => s.id !== stud.id));
      setClasses(prev => prev.map(c => {
        if (c.id === stud.classId) {
          return { ...c, studentCount: Math.max(0, c.studentCount - 1) };
        }
        return c;
      }));
      addAuditLog?.('Radiation Élève', activeSchoolId, `Radiation de l'élève ${stud.lastName} ${stud.firstName} de la classe.`);
      showNotification(`Élève "${stud.firstName} ${stud.lastName}" retiré.`);
    }
  };

  const handleOpenEditModal = (stud: Student) => {
    setEditingStudent(stud);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
    addAuditLog?.('Modification Profil Élève', activeSchoolId, `Mise à jour des coordonnées de l'élève ${editingStudent.lastName} ${editingStudent.firstName}.`);
    showNotification(`Profil de "${editingStudent.firstName} ${editingStudent.lastName}" mis à jour.`);
    setIsEditModalOpen(false);
  };

  // Filtered students for Directory View
  const filteredStudents = schoolStudents.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const parent = (s.parentName || '').toLowerCase();
    const phone = s.parentPhone || '';
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || parent.includes(searchQuery.toLowerCase()) || phone.includes(searchQuery);
    const matchesClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
              <Shuffle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Scolarité & Admission Automatisée • {activeSchool.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold">
              Inscription & Répartition Automatique des Élèves
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Dès l'enregistrement d'un élève, le moteur d'attribution intelligente sélectionne la classe optimale selon le cycle, l'équilibre des effectifs et la parité.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchSimulation}
              className="bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Inscrire automatiquement 4 élèves tests pour vérifier la répartition"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Simulation Répartition par Lot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex flex-col space-y-1 animate-fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center space-x-2 font-bold">
            {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          {feedback.details && (
            <p className="pl-6 text-[11px] text-emerald-700 font-mono">{feedback.details}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl border shadow-xs gap-2">
        <button
          onClick={() => setActiveSubTab('enroll')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'enroll'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Formulaire d'Inscription & Répartition</span>
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Effectifs Répartis par Classe ({schoolStudents.length} élèves)</span>
        </button>
      </div>

      {/* ================= TAB 1: ENROLLMENT FORM WITH AUTO ALLOCATION ================= */}
      {activeSubTab === 'enroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                <span>Formulaire d'Enregistrement de l'Élève</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Renseignez l'identité de l'élève et les coordonnées du tuteur légal.
              </p>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Eto'o, Kamdem, Ndoumbe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Prénom(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Samuel, Chloé, Jean-Pierre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Genre *</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        gender === 'M' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Masculin (M)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('F')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        gender === 'F' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Féminin (F)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Niveau d'admission *</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as 'Lycée' | 'Collège')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="Lycée">Second Cycle (Lycée)</option>
                    <option value="Collège">Premier Cycle (Collège)</option>
                  </select>
                </div>
              </div>

              {/* Parent Info */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Liaison Parentale & Tuteur Légal
                </span>
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Nom complet du Tuteur / Parent *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Samuel Eto'o Sr., Mme Kamdem Florence"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Téléphone Mobile Tuteur *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+237 677 88 99 00"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Email Tuteur (Optionnel)</label>
                    <input
                      type="email"
                      placeholder="parent@academic.cm"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mode Selection Toggle */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <Shuffle className="h-4 w-4 text-emerald-600" />
                      <span>Répartition Automatique Intelligente</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Équilibre automatiquement les divisions de classe sans saturation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAutoAllocation}
                    onChange={(e) => setIsAutoAllocation(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {!isAutoAllocation && (
                  <div className="space-y-1.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="font-bold text-amber-900 block">Sélection manuelle de la classe :</label>
                    <select
                      value={manualClassId || schoolClasses[0]?.id}
                      onChange={(e) => setManualClassId(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    >
                      {schoolClasses.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Enregistrer l'Élève & Déclencher la Répartition</span>
                </button>
              </div>
            </form>
          </div>

          {/* Allocation Live Visualizer / Simulator (Right Column) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <h4 className="font-display font-bold text-sm">Moteur d'Attribution en Direct</h4>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                  <span>Classe Cible Recommandée :</span>
                  <span className="text-emerald-400 font-bold uppercase">● Calcul Dynamique</span>
                </div>

                {previewAssignedClass ? (
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white font-display">
                        {previewAssignedClass.name}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                        {previewAssignedClass.level}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      L'élève sera automatiquement inscrit dans cette division car elle présente la charge la plus équilibrée.
                    </p>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Effectif actuel :</span>
                      <span className="text-white font-bold">{previewAssignedClass.studentCount} élèves</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune classe configurée</p>
                )}
              </div>

              {/* Class Load Distribution Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Jauge d'occupation des classes actuelles :
                </span>

                <div className="space-y-2">
                  {schoolClasses.map(cls => {
                    const count = schoolStudents.filter(s => s.classId === cls.id).length;
                    const maxCapacity = 20; // visual max
                    const percentage = Math.min(100, Math.round((count / maxCapacity) * 100));

                    return (
                      <div key={cls.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span>{cls.name}</span>
                          <span className="font-mono text-[11px] text-slate-500">{count} élèves</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: STUDENTS DIRECTORY ================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, parent, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Toutes les classes</option>
                {schoolClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">N°</th>
                    <th className="p-4">Identité Élève</th>
                    <th className="p-4">Classe Affectée</th>
                    <th className="p-4">Tuteur / Contact Alerte</th>
                    <th className="p-4 text-center">Genre</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                        Aucun élève trouvé pour cette sélection.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stud, idx) => {
                      const cls = schoolClasses.find(c => c.id === stud.classId);
                      return (
                        <tr key={stud.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 pl-6 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                stud.gender === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {stud.firstName[0]}{stud.lastName[0]}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{stud.lastName} {stud.firstName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">Matricule: {stud.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-1 rounded-lg">
                              {cls?.name || stud.classId}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-800">{stud.parentName}</p>
                            <div className="flex items-center space-x-1 text-slate-500 text-[11px] font-mono mt-0.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{stud.parentPhone}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              stud.gender === 'F' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {stud.gender === 'F' ? 'Féminin' : 'Masculin'}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenEditModal(stud)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Modifier les coordonnées"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(stud)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Radier l'élève"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Modifier le Dossier Élève</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nom</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.lastName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.firstName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Classe Affectée</label>
                <select
                  value={editingStudent.classId}
                  onChange={(e) => setEditingStudent({ ...editingStudent, classId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-bold"
                >
                  {schoolClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nom du Tuteur Légal</label>
                <input
                  type="text"
                  required
                  value={editingStudent.parentName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Téléphone Mobile Tuteur</label>
                <input
                  type="tel"
                  required
                  value={editingStudent.parentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
