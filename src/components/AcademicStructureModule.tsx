/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Layers, 
  Mail, 
  Phone,
  Link2,
  X,
  Building,
  Sparkles
} from 'lucide-react';
import { SchoolClass, Subject, Teacher, ClassSubject, SchoolTenant } from '../types';

interface AcademicStructureModuleProps {
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  classSubjects: ClassSubject[];
  setClassSubjects: React.Dispatch<React.SetStateAction<ClassSubject[]>>;
  activeSchoolId: string;
  activeSchool: SchoolTenant;
  addAuditLog?: (action: string, schoolId: string, details: string) => void;
}

export default function AcademicStructureModule({
  classes,
  setClasses,
  subjects,
  setSubjects,
  teachers,
  setTeachers,
  classSubjects,
  setClassSubjects,
  activeSchoolId,
  activeSchool,
  addAuditLog
}: AcademicStructureModuleProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'teachers' | 'assignments'>('classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Active School Scoped items
  const schoolClasses = classes.filter(c => (c.schoolId || 'school-lby') === activeSchoolId);
  const schoolSubjects = subjects;
  const schoolTeachers = teachers;
  const schoolClassSubjects = classSubjects;

  // ================= MODAL STATES =================
  // 1. Class Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [classLevel, setClassLevel] = useState<'Lycée' | 'Collège'>('Lycée');
  const [classStudentCount, setClassStudentCount] = useState<number>(0);

  // 2. Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  // 3. Teacher Modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherSubjectIds, setTeacherSubjectIds] = useState<string[]>([]);

  // 4. Assignment Modal (Assign teacher to class for a subject)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingAssignId, setEditingAssignId] = useState<string | null>(null);
  const [assignClassId, setAssignClassId] = useState(schoolClasses[0]?.id || '');
  const [assignSubjectId, setAssignSubjectId] = useState(schoolSubjects[0]?.id || '');
  const [assignTeacherId, setAssignTeacherId] = useState(schoolTeachers[0]?.id || '');
  const [assignCoefficient, setAssignCoefficient] = useState<number>(3);

  // ================= CRUD HANDLERS =================

  // --- 1. Classes CRUD ---
  const handleOpenClassModal = (cls?: SchoolClass) => {
    if (cls) {
      setEditingClassId(cls.id);
      setClassName(cls.name);
      setClassLevel(cls.level as 'Lycée' | 'Collège');
      setClassStudentCount(cls.studentCount);
    } else {
      setEditingClassId(null);
      setClassName('');
      setClassLevel('Lycée');
      setClassStudentCount(0);
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      showNotification('Veuillez renseigner le libellé de la classe.', 'error');
      return;
    }

    if (editingClassId) {
      setClasses(prev => prev.map(c => c.id === editingClassId ? {
        ...c,
        name: className.trim(),
        level: classLevel,
        studentCount: classStudentCount
      } : c));
      addAuditLog?.('Modification Classe', activeSchoolId, `Classe "${className}" mise à jour.`);
      showNotification(`Classe "${className}" modifiée avec succès.`);
    } else {
      const newClass: SchoolClass = {
        id: `class-${Date.now()}`,
        name: className.trim(),
        level: classLevel,
        studentCount: classStudentCount,
        schoolId: activeSchoolId
      };
      setClasses(prev => [...prev, newClass]);
      addAuditLog?.('Création Classe', activeSchoolId, `Nouvelle classe créée : "${className}" (${classLevel}).`);
      showNotification(`Nouvelle classe "${className}" créée avec succès.`);
    }
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (cls: SchoolClass) => {
    if (confirm(`Confirmez-vous la suppression de la classe "${cls.name}" ?`)) {
      setClasses(prev => prev.filter(c => c.id !== cls.id));
      setClassSubjects(prev => prev.filter(cs => cs.classId !== cls.id));
      addAuditLog?.('Suppression Classe', activeSchoolId, `Suppression définitive de la classe "${cls.name}".`);
      showNotification(`Classe "${cls.name}" supprimée.`);
    }
  };

  // --- 2. Subjects CRUD ---
  const handleOpenSubjectModal = (subj?: Subject) => {
    if (subj) {
      setEditingSubjectId(subj.id);
      setSubjectName(subj.name);
      setSubjectCode(subj.code);
    } else {
      setEditingSubjectId(null);
      setSubjectName('');
      setSubjectCode('');
    }
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim()) {
      showNotification('Le nom et le code de la matière sont obligatoires.', 'error');
      return;
    }

    if (editingSubjectId) {
      setSubjects(prev => prev.map(s => s.id === editingSubjectId ? {
        ...s,
        name: subjectName.trim(),
        code: subjectCode.trim().toUpperCase()
      } : s));
      addAuditLog?.('Modification Matière', activeSchoolId, `Matière "${subjectName}" modifiée.`);
      showNotification(`Matière "${subjectName}" mise à jour.`);
    } else {
      const newSubject: Subject = {
        id: `subj-${Date.now()}`,
        name: subjectName.trim(),
        code: subjectCode.trim().toUpperCase()
      };
      setSubjects(prev => [...prev, newSubject]);
      addAuditLog?.('Création Matière', activeSchoolId, `Nouvelle matière académique ajoutée : "${subjectName}" (${subjectCode.toUpperCase()}).`);
      showNotification(`Matière "${subjectName}" créée avec succès.`);
    }
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubject = (subj: Subject) => {
    if (confirm(`Confirmez-vous la suppression de la matière "${subj.name}" ?`)) {
      setSubjects(prev => prev.filter(s => s.id !== subj.id));
      setClassSubjects(prev => prev.filter(cs => cs.subjectId !== subj.id));
      addAuditLog?.('Suppression Matière', activeSchoolId, `Suppression de la matière "${subj.name}".`);
      showNotification(`Matière "${subj.name}" supprimée.`);
    }
  };

  // --- 3. Teachers CRUD ---
  const handleOpenTeacherModal = (teach?: Teacher) => {
    if (teach) {
      setEditingTeacherId(teach.id);
      setTeacherName(teach.name);
      setTeacherEmail(teach.email);
      setTeacherSubjectIds(teach.subjects || []);
    } else {
      setEditingTeacherId(null);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherSubjectIds([schoolSubjects[0]?.id || 'subj-math']);
    }
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim()) {
      showNotification('Veuillez spécifier le nom et l\'email de l\'enseignant.', 'error');
      return;
    }

    if (editingTeacherId) {
      setTeachers(prev => prev.map(t => t.id === editingTeacherId ? {
        ...t,
        name: teacherName.trim(),
        email: teacherEmail.trim(),
        subjects: teacherSubjectIds
      } : t));
      addAuditLog?.('Modification Enseignant', activeSchoolId, `Fiche enseignant de ${teacherName} mise à jour.`);
      showNotification(`Enseignant "${teacherName}" mis à jour.`);
    } else {
      const newTeacher: Teacher = {
        id: `teach-${Date.now()}`,
        name: teacherName.trim(),
        email: teacherEmail.trim(),
        subjects: teacherSubjectIds
      };
      setTeachers(prev => [...prev, newTeacher]);
      addAuditLog?.('Création Enseignant', activeSchoolId, `Création d'un nouvel enseignant : ${teacherName} (${teacherEmail}).`);
      showNotification(`Enseignant "${teacherName}" ajouté avec succès.`);
    }
    setIsTeacherModalOpen(false);
  };

  const handleDeleteTeacher = (teach: Teacher) => {
    if (confirm(`Supprimer l'enseignant "${teach.name}" ? Ses affectations de cours seront réinitialisées.`)) {
      setTeachers(prev => prev.filter(t => t.id !== teach.id));
      setClassSubjects(prev => prev.filter(cs => cs.teacherId !== teach.id));
      addAuditLog?.('Suppression Enseignant', activeSchoolId, `Suppression de l'enseignant ${teach.name}.`);
      showNotification(`Enseignant "${teach.name}" retiré.`);
    }
  };

  // --- 4. Assignments (Teacher to Class) CRUD ---
  const handleOpenAssignModal = (cs?: ClassSubject) => {
    if (cs) {
      setEditingAssignId(cs.id);
      setAssignClassId(cs.classId);
      setAssignSubjectId(cs.subjectId);
      setAssignTeacherId(cs.teacherId);
      setAssignCoefficient(cs.coefficient);
    } else {
      setEditingAssignId(null);
      setAssignClassId(schoolClasses[0]?.id || '');
      setAssignSubjectId(schoolSubjects[0]?.id || '');
      setAssignTeacherId(schoolTeachers[0]?.id || '');
      setAssignCoefficient(3);
    }
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignClassId || !assignSubjectId || !assignTeacherId) {
      showNotification('Veuillez sélectionner la classe, la matière et l\'enseignant.', 'error');
      return;
    }

    const targetClass = schoolClasses.find(c => c.id === assignClassId);
    const targetSubject = schoolSubjects.find(s => s.id === assignSubjectId);
    const targetTeacher = schoolTeachers.find(t => t.id === assignTeacherId);

    if (editingAssignId) {
      setClassSubjects(prev => prev.map(cs => cs.id === editingAssignId ? {
        ...cs,
        classId: assignClassId,
        subjectId: assignSubjectId,
        teacherId: assignTeacherId,
        coefficient: assignCoefficient
      } : cs));
      addAuditLog?.('Modification Affectation', activeSchoolId, `Affectation modifiée : ${targetTeacher?.name} en ${targetSubject?.name} pour ${targetClass?.name} (Coeff ${assignCoefficient}).`);
      showNotification(`Affectation mise à jour avec succès.`);
    } else {
      const newCS: ClassSubject = {
        id: `cs-${Date.now()}`,
        classId: assignClassId,
        subjectId: assignSubjectId,
        teacherId: assignTeacherId,
        coefficient: assignCoefficient
      };
      setClassSubjects(prev => [newCS, ...prev]);
      addAuditLog?.('Nouvelle Affectation', activeSchoolId, `Assignation de ${targetTeacher?.name} à la classe ${targetClass?.name} pour ${targetSubject?.name} (Coeff ${assignCoefficient}).`);
      showNotification(`Enseignant affecté à la classe avec succès.`);
    }
    setIsAssignModalOpen(false);
  };

  const handleDeleteAssignment = (cs: ClassSubject) => {
    const clsName = schoolClasses.find(c => c.id === cs.classId)?.name;
    const subName = schoolSubjects.find(s => s.id === cs.subjectId)?.name;
    if (confirm(`Retirer cette affectation (${subName} pour ${clsName}) ?`)) {
      setClassSubjects(prev => prev.filter(item => item.id !== cs.id));
      addAuditLog?.('Suppression Affectation', activeSchoolId, `Suppression de l'affectation ${subName} pour ${clsName}.`);
      showNotification(`Affectation retirée.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-blue-400/20">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span>Structure Pédagogique & Enseignement • {activeSchool.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold">
              Gestion des Classes, Matières & Enseignants
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Configurez le cursus académique complet : création des classes, définition du catalogue de matières, gestion du corps professoral et affectation des cours avec coefficients.
            </p>
          </div>

          {/* Quick Action Button according to active tab */}
          <div className="shrink-0">
            {activeTab === 'classes' && (
              <button
                onClick={() => handleOpenClassModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Créer une Classe</span>
              </button>
            )}
            {activeTab === 'subjects' && (
              <button
                onClick={() => handleOpenSubjectModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Créer une Matière</span>
              </button>
            )}
            {activeTab === 'teachers' && (
              <button
                onClick={() => handleOpenTeacherModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Créer un Enseignant</span>
              </button>
            )}
            {activeTab === 'assignments' && (
              <button
                onClick={() => handleOpenAssignModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Link2 className="h-4 w-4" />
                <span>Assigner un Professeur</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl border shadow-xs gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'classes' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Classes ({schoolClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'subjects' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Matières ({schoolSubjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'teachers' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Professeurs ({schoolTeachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'assignments' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Link2 className="h-4 w-4" />
          <span>Affectations & Coefficients ({schoolClassSubjects.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: CLASSES ================= */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolClasses.map(cls => {
              const assignedCourses = schoolClassSubjects.filter(cs => cs.classId === cls.id);
              return (
                <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {cls.level}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenClassModal(cls)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Modifier la classe"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la classe"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cls.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Identifiant : {cls.id}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Effectif</span>
                        <span className="font-bold text-slate-800 text-sm">{cls.studentCount} élèves</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Matières</span>
                        <span className="font-bold text-slate-800 text-sm">{assignedCourses.length} cours</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Statut d'activité :</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Opérationnelle
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SUBJECTS ================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {schoolSubjects.map(sub => {
              const teachersForSubject = schoolTeachers.filter(t => t.subjects?.includes(sub.id));
              return (
                <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-extrabold font-mono px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                        {sub.code}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenSubjectModal(sub)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {sub.id}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Enseignants assignés :</span>
                      <span className="font-bold text-slate-800">{teachersForSubject.length} professeur(s)</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    Programme Officiel MINESEC
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: TEACHERS ================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolTeachers.map(teach => {
              const assignedSubjectNames = (teach.subjects || []).map(sid => schoolSubjects.find(s => s.id === sid)?.name).filter(Boolean);
              const classCount = schoolClassSubjects.filter(cs => cs.teacherId === teach.id).length;
              return (
                <div key={teach.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {teach.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenTeacherModal(teach)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teach)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{teach.name}</h3>
                      <div className="flex items-center space-x-1 text-slate-500 text-xs mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-mono truncate">{teach.email}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Disciplines enseignées :</span>
                      <div className="flex flex-wrap gap-1">
                        {assignedSubjectNames.length > 0 ? (
                          assignedSubjectNames.map(name => (
                            <span key={name} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">Aucune matière</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Classes prises en charge :</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-mono">{classCount} classe(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ASSIGNMENTS ================= */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tableau des Affectations Professeurs ↔ Classes</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Distribution officielle des matières, des enseignants et des coefficients appliqués.</p>
            </div>
            <button
              onClick={() => handleOpenAssignModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition-all flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Affectation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Classe</th>
                  <th className="p-4">Matière Enseignée</th>
                  <th className="p-4">Professeur Titulaire</th>
                  <th className="p-4 text-center">Coefficient</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolClassSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      Aucune affectation configurée pour le moment.
                    </td>
                  </tr>
                ) : (
                  schoolClassSubjects.map(cs => {
                    const cls = schoolClasses.find(c => c.id === cs.classId);
                    const sub = schoolSubjects.find(s => s.id === cs.subjectId);
                    const teach = schoolTeachers.find(t => t.id === cs.teacherId);
                    return (
                      <tr key={cs.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-800">
                          {cls?.name || cs.classId}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {sub?.code || 'SUBJ'}
                            </span>
                            <span className="font-semibold text-slate-700">{sub?.name || cs.subjectId}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-blue-700">{teach?.name || 'Non attribué'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{teach?.email}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                            Coeff. {cs.coefficient}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenAssignModal(cs)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Modifier coefficient ou professeur"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(cs)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer cette affectation"
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
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingClassId ? 'Modifier la Classe' : 'Créer une Nouvelle Classe'}
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nom de la Classe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Terminale C, 6ème M1, 3ème Allemand"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Niveau Pédagogique</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as 'Lycée' | 'Collège')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="Lycée">Second Cycle (Lycée)</option>
                    <option value="Collège">Premier Cycle (Collège)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Effectif Initial</label>
                  <input
                    type="number"
                    min="0"
                    value={classStudentCount}
                    onChange={(e) => setClassStudentCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingClassId ? 'Sauvegarder' : 'Créer la Classe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingSubjectId ? 'Modifier la Matière' : 'Créer une Nouvelle Matière'}
              </h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Intitulé de la Discipline *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sciences Économiques et Sociales"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Code Officiel (Sigle) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Ex: SES, MATH, PHILO"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 uppercase font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingSubjectId ? 'Sauvegarder' : 'Créer la Matière'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingTeacherId ? 'Modifier l\'Enseignant' : 'Ajouter un Enseignant'}
              </h3>
              <button onClick={() => setIsTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nom & Prénom du Professeur *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Jean-Marc Kamga"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Email Académique *</label>
                <input
                  type="email"
                  required
                  placeholder="prof@academic.cm"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Matières Enseignées</label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  {schoolSubjects.map(sub => {
                    const isSelected = teacherSubjectIds.includes(sub.id);
                    return (
                      <label key={sub.id} className="flex items-center space-x-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherSubjectIds(prev => [...prev, sub.id]);
                            } else {
                              setTeacherSubjectIds(prev => prev.filter(id => id !== sub.id));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">[{sub.code}] {sub.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingTeacherId ? 'Sauvegarder' : 'Créer l\'Enseignant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingAssignId ? 'Modifier l\'Affectation' : 'Assigner un Enseignant à une Classe'}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Classe Concernée *</label>
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                >
                  {schoolClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Matière *</label>
                <select
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                >
                  {schoolSubjects.map(s => (
                    <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Professeur Titulaire *</label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                >
                  {schoolTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Coefficient Appliqué (1 à 8) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={assignCoefficient}
                  onChange={(e) => setAssignCoefficient(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Ex: 6 pour Math en Terminale C, 2 en Terminale A.</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingAssignId ? 'Sauvegarder' : 'Affecter le Cours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
