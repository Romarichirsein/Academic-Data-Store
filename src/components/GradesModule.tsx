/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolClass, Student, Evaluation, Mark, EvaluationType, ValidationStatus, Subject } from '../types';
import { CLASSES, STUDENTS, SUBJECTS, INITIAL_EVALUATIONS, INITIAL_MARKS, SEQUENCES, CLASS_SUBJECTS } from '../data/mockData';
import { FileText, Plus, Search, Calendar, Save, Percent, ChevronRight, Lock, Unlock, AlertCircle, Info, CheckCircle, BarChart3, TrendingUp, Award } from 'lucide-react';

interface GradesModuleProps {
  evaluations: Evaluation[];
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  marks: Mark[];
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  selectedEvalId?: string | null;
  onSelectEval?: (id: string | null) => void;
  classes?: SchoolClass[];
  students?: Student[];
  subjects?: Subject[];
  teachers?: Teacher[];
  activeSchoolId?: string;
  addAuditLog?: (action: string, schoolId: string, details: string) => void;
}

export default function GradesModule({ 
  evaluations, 
  setEvaluations, 
  marks, 
  setMarks,
  selectedEvalId: propSelectedEvalId,
  onSelectEval,
  classes = CLASSES,
  students = STUDENTS,
  subjects = SUBJECTS,
  teachers = [],
  activeSchoolId = 'school-lby',
  addAuditLog
}: GradesModuleProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'list'>('entry');
  const [localSelectedEvalId, setLocalSelectedEvalId] = useState<string | null>('eval-tc-s5-math');
  const selectedEvalId = propSelectedEvalId !== undefined ? propSelectedEvalId : localSelectedEvalId;
  const setSelectedEvalId = onSelectEval !== undefined ? onSelectEval : setLocalSelectedEvalId;

  // Creating a new evaluation form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('class-tc');
  const [newSubject, setNewSubject] = useState('subj-math');
  const [newType, setNewType] = useState<EvaluationType>('CONTROLE');
  const [newCoeff, setNewCoeff] = useState<number>(1);
  const [newSequence, setNewSequence] = useState<number>(5);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Form input holding temporary grades
  const [tempMarks, setTempMarks] = useState<Record<string, { value: string; comment: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Error notifications for validations
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load marks when active evaluation changes
  React.useEffect(() => {
    if (selectedEvalId) {
      const activeEval = evaluations.find(e => e.id === selectedEvalId);
      if (activeEval) {
        const classStudents = students.filter(s => s.classId === activeEval.classId);
        const marksDict: Record<string, { value: string; comment: string }> = {};
        
        classStudents.forEach(s => {
          const foundMark = marks.find(m => m.evaluationId === selectedEvalId && m.studentId === s.id);
          marksDict[s.id] = {
            value: foundMark !== undefined ? foundMark.value.toString() : '',
            comment: foundMark?.comment || ''
          };
        });
        setTempMarks(marksDict);
        setValidationError(null);
      }
    } else {
      setTempMarks({});
    }
  }, [selectedEvalId, evaluations, marks]);

  // Create Evaluation handler
  const handleCreateEvaluation = () => {
    if (!newTitle.trim()) {
      alert("Veuillez saisir l'intitulé de l'évaluation.");
      return;
    }

    const newEvalId = `eval-custom-${Date.now()}`;
    const newEval: Evaluation = {
      id: newEvalId,
      classId: newClass,
      subjectId: newSubject,
      teacherId: 'teach-1', // Mock teacher
      sequenceId: newSequence,
      termId: newSequence <= 2 ? 1 : newSequence <= 4 ? 2 : 3,
      type: newType,
      coefficient: newCoeff,
      date: newDate,
      status: 'DRAFT',
      title: newTitle,
      schoolId: activeSchoolId
    };

    setEvaluations(prev => [newEval, ...prev]);
    setSelectedEvalId(newEvalId);
    setShowCreateForm(false);
    setNewTitle('');

    const className = classes.find(c => c.id === newClass)?.name || 'Classe';
    const subjectName = SUBJECTS.find(s => s.id === newSubject)?.name || 'Matière';
    addAuditLog?.(
      "Création fiche de notes",
      activeSchoolId,
      `Création d'une nouvelle fiche d'évaluation "${newTitle}" (Type: ${newType}, Coeff: ${newCoeff}) en ${subjectName} pour la classe ${className}.`
    );

    alert("Fiche d'évaluation créée avec succès. Vous pouvez maintenant saisir les notes.");
  };

  // Grade update values change handler with numerical protection
  const handleGradeChange = (studentId: string, val: string) => {
    // Basic numeric check
    if (val !== '' && isNaN(Number(val))) return;
    
    // Check constraints [0, 20]
    const num = Number(val);
    if (val !== '' && (num < 0 || num > 20)) {
      setValidationError("Alerte : Une note scolaire doit se situer obligatoirement entre 0 et 20.");
    } else {
      setValidationError(null);
    }

    setTempMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        value: val
      }
    }));
  };

  const handleCommentChange = (studentId: string, text: string) => {
    setTempMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: text
      }
    }));
  };

  // Save changes
  const handleSaveMarks = () => {
    if (!selectedEvalId) return;

    // Validate all notes are valid numbers between 0 and 20
    let hasError = false;
    Object.keys(tempMarks).forEach((studentId) => {
      const data = tempMarks[studentId];
      if (data.value !== '') {
        const num = Number(data.value);
        if (num < 0 || num > 20 || isNaN(num)) {
          hasError = true;
        }
      }
    });

    if (hasError) {
      setValidationError("Action bloquée : Certaines notes saisies possèdent des valeurs invalides (Hors de l'intervalle [0, 20]).");
      return;
    }

    // Save back to parent state
    setMarks(prev => {
      // Remove previous marks
      const filtered = prev.filter(m => m.evaluationId !== selectedEvalId);
      
      // Map dictionary back to list
      const updated: Mark[] = Object.keys(tempMarks)
        .filter(studentId => tempMarks[studentId].value !== '')
        .map(studentId => {
          const data = tempMarks[studentId];
          return {
            id: `m-${selectedEvalId}-${studentId}`,
            evaluationId: selectedEvalId,
            studentId,
            value: Number(data.value),
            comment: data.comment
          };
        });

      return [...filtered, ...updated];
    });

    const activeEvalObj = evaluations.find(e => e.id === selectedEvalId);
    if (activeEvalObj) {
      const className = classes.find(c => c.id === activeEvalObj.classId)?.name || 'Classe';
      addAuditLog?.(
        "Saisie de notes",
        activeEvalObj.schoolId || activeSchoolId,
        `Enregistrement ou modification des notes de l'évaluation "${activeEvalObj.title}" pour la classe ${className}.`
      );
    }

    setValidationError(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Trigger Validation request workflow
  const handleRequestValidation = () => {
    if (!selectedEvalId) return;
    
    // Save first
    handleSaveMarks();

    const ev = evaluations.find(e => e.id === selectedEvalId);
    setEvaluations(prev => prev.map(item => {
      if (item.id === selectedEvalId) {
        return { ...item, status: 'PENDING_VALIDATION' };
      }
      return item;
    }));

    if (ev) {
      const className = classes.find(c => c.id === ev.classId)?.name || 'Classe';
      addAuditLog?.(
        "Soumission de notes",
        ev.schoolId || activeSchoolId,
        `Soumission pour validation de la fiche d'évaluation "${ev.title}" (Classe: ${className}) au Censeur.`
      );
    }

    alert("Fiche soumise pour validation ! Le statut passe à 'En attente de validation'. Les notes sont transmises au Censeur.");
  };

  // Details for currently selected evaluation
  const activeEval = evaluations.find(e => e.id === selectedEvalId);
  const activeClass = classes.find(c => c.id === activeEval?.classId);
  const activeSubject = SUBJECTS.find(s => s.id === activeEval?.subjectId);
  const isLocked = activeEval?.status === 'VALIDATED';

  // Calculate stats on the fly based on current input values
  const currentGradesArray = Object.keys(tempMarks)
    .map(studentId => {
      const m = tempMarks[studentId];
      return m.value !== '' ? Number(m.value) : null;
    })
    .filter((v): v is number => v !== null);

  const numGradesEntered = currentGradesArray.length;
  const numStudentsInClass = activeClass?.studentCount || 0;
  
  const classStats = {
    average: numGradesEntered > 0 ? Number((currentGradesArray.reduce((a, b) => a + b, 0) / numGradesEntered).toFixed(2)) : 0,
    highest: numGradesEntered > 0 ? Math.max(...currentGradesArray) : 0,
    lowest: numGradesEntered > 0 ? Math.min(...currentGradesArray) : 0,
    passCount: currentGradesArray.filter(v => v >= 10).length
  };

  const classSuccessRate = numGradesEntered > 0 
    ? Number((classStats.passCount / numGradesEntered * 100).toFixed(0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Sub tabs header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('entry'); setShowCreateForm(false); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'entry'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Saisie d'un Devoir</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Liste des Évaluations</span>
          </button>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(true);
            setActiveTab('entry');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Créer une Évaluation</span>
        </button>
      </div>

      {activeTab === 'entry' ? (
        /* GRADE SPREADSHEET ENTRY VIEW */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Saisie Setup Form (left column) */}
          <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm self-start space-y-6">
            {showCreateForm ? (
              /* Create Eval Mini-Box */
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-800">Nouvelle Évaluation</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configurez l'épreuve à évaluer.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Intitulé de l'épreuve</label>
                    <input
                      type="text"
                      placeholder="Ex: Contrôle de Trigonométrie"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Classe</label>
                      <select
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Matière</label>
                      <select
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Type Épreuve</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as EvaluationType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="CONTROLE">Contrôle Continu</option>
                        <option value="DEVOIR">Devoir de Maison</option>
                        <option value="EXAMEN">Examen Trimestriel</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Poids / Coeff.</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newCoeff}
                        onChange={(e) => setNewCoeff(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Séquence (1 à 6)</label>
                      <select
                        value={newSequence}
                        onChange={(e) => setNewSequence(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>Séquence {num}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Date épreuve</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCreateEvaluation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Valider la création
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Retour
                  </button>
                </div>
              </div>
            ) : (
              /* Load Existing Evaluation Form Info */
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-800 flex items-center space-x-1.5">
                    <span>Fiche d'Évaluation</span>
                  </h3>
                  
                  <div className="mt-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Sélectionner l'Épreuve
                    </label>
                    <select
                      value={selectedEvalId || ''}
                      onChange={(e) => setSelectedEvalId(e.target.value || null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choisir une évaluation --</option>
                      {evaluations.map(ev => {
                        const cl = classes.find(c => c.id === ev.classId)?.name;
                        const subj = SUBJECTS.find(s => s.id === ev.subjectId)?.name;
                        return (
                          <option key={ev.id} value={ev.id}>
                            [{cl}] {subj} - {ev.title} (S{ev.sequenceId})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {activeEval && (
                  <>
                    {/* Locked Workflow Indicator Card */}
                    <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                      isLocked 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : activeEval.status === 'PENDING_VALIDATION'
                        ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                        : 'bg-emerald-50/40 border-emerald-200 text-emerald-800'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {isLocked ? (
                          <Lock className="h-5 w-5 text-slate-500" />
                        ) : (
                          <Unlock className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold">
                          Statut : {
                            isLocked 
                              ? 'Validé & Verrouillé' 
                              : activeEval.status === 'PENDING_VALIDATION'
                              ? 'En attente de validation'
                              : 'Brouillon (Modifiable)'
                          }
                        </p>
                        <p className="text-slate-500 mt-1 leading-relaxed">
                          {isLocked 
                            ? 'Cette épreuve a été auditée et validée par le censeur. Aucune modification de note n\'est permise.'
                            : activeEval.status === 'PENDING_VALIDATION'
                            ? 'En attente de contrôle de saisie par la direction. Les inputs restent disponibles avant validation.'
                            : 'Fiche modifiable en local par l\'enseignant. Soumettez pour verouillage.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Stats for currently loaded eval */}
                    <div className="border-t border-b border-slate-100 py-4 space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Statistiques de l'Épreuve
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-800">
                          <p className="text-[10px] uppercase font-mono font-bold">Moyenne de classe</p>
                          <p className="text-base font-bold font-mono mt-0.5">{classStats.average}/20</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                          <p className="text-[10px] uppercase font-mono font-bold">Taux Réussite</p>
                          <p className="text-base font-bold font-mono mt-0.5">{classSuccessRate}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                          <p className="text-[9px] uppercase font-mono font-bold">Note Maximale</p>
                          <p className="text-xs font-bold font-mono mt-0.5">{classStats.highest}/20</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                          <p className="text-[9px] uppercase font-mono font-bold">Note Minimale</p>
                          <p className="text-xs font-bold font-mono mt-0.5">{classStats.lowest}/20</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Taux de complétude :</span>
                        <span className="font-mono font-bold text-slate-700">{numGradesEntered} / {numStudentsInClass} notes</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      {!isLocked && (
                        <>
                          <button
                            onClick={handleSaveMarks}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>Enregistrer Brouillon</span>
                          </button>

                          {activeEval.status === 'DRAFT' && (
                            <button
                              onClick={handleRequestValidation}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Soumettre au Censeur
                            </button>
                          )}
                        </>
                      )}

                      {saveSuccess && (
                        <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-pulse">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          <span>Notes enregistrées avec succès en base de données.</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SPREADSHEET TABLE GRID (right column) */}
          <div className="xl:col-span-8 space-y-4">
            {!selectedEvalId ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm h-full flex flex-col justify-center items-center">
                <FileText className="h-14 w-14 text-slate-300 stroke-[1.5] mb-4" />
                <h3 className="text-lg font-display font-bold text-slate-800">Aucun dossier d'évaluation ouvert</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  Sélectionnez une évaluation existante à gauche pour saisir les notes, ou cliquez sur "Créer une Évaluation" pour en générer une nouvelle.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                {/* Spreadsheet header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-sm">
                      Saisie des Notes : {activeEval?.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Classe : <strong className="text-slate-700">{activeClass?.name}</strong> • Coefficient national de matière : <strong className="text-slate-700">x{activeEval?.coefficient}</strong>
                    </p>
                  </div>
                  
                  {isLocked && (
                    <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-mono font-bold flex items-center space-x-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Fiche Verrouillée</span>
                    </span>
                  )}
                </div>

                {/* Validation warnings */}
                {validationError && (
                  <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs flex items-center space-x-2.5">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                    <span className="font-medium">{validationError}</span>
                  </div>
                )}

                {/* Main spreadsheet rows */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-600 font-display font-semibold">
                        <th className="p-4 pl-6">N° Éléve</th>
                        <th className="p-4">Nom & Prénom de l'Élève</th>
                        <th className="p-4 text-center">Note /20</th>
                        <th className="p-4">Remarque / Commentaire de l'enseignant</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {STUDENTS.filter(s => s.classId === activeEval?.classId).map((stud, idx) => {
                        const scoreData = tempMarks[stud.id] || { value: '', comment: '' };
                        const scoreNum = scoreData.value !== '' ? Number(scoreData.value) : null;
                        const isUnderAverage = scoreNum !== null && scoreNum < 10;

                        return (
                          <tr key={stud.id} className="hover:bg-slate-50/30">
                            <td className="p-4 pl-6 font-mono text-xs text-slate-400">{idx + 1}</td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-800">{stud.lastName} {stud.firstName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Genre : {stud.gender}</p>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center space-x-2">
                                <input
                                  type="text"
                                  maxLength={5}
                                  value={scoreData.value}
                                  disabled={isLocked}
                                  onChange={(e) => handleGradeChange(stud.id, e.target.value)}
                                  className={`w-16 bg-slate-50 border ${
                                    isLocked 
                                      ? 'border-slate-100 text-slate-400 font-semibold text-center cursor-not-allowed'
                                      : isUnderAverage 
                                      ? 'border-rose-300 text-rose-700 bg-rose-50/30 font-bold focus:ring-rose-500' 
                                      : 'border-slate-200 text-slate-800 font-bold focus:ring-blue-500'
                                  } rounded-lg px-2 py-1.5 text-center font-mono text-sm focus:outline-none focus:ring-2`}
                                  placeholder="--"
                                />
                                <span className="text-xs text-slate-400 font-mono">/20</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <input
                                type="text"
                                value={scoreData.comment}
                                disabled={isLocked}
                                onChange={(e) => handleCommentChange(stud.id, e.target.value)}
                                className={`w-full bg-slate-50 border ${
                                  isLocked 
                                    ? 'border-transparent text-slate-400 italic cursor-not-allowed' 
                                    : 'border-slate-200 text-slate-700 focus:ring-blue-500'
                                } rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2`}
                                placeholder="Commentaire sur la copie..."
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EVALUATIONS LISTING VIEW (Tab 2) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-600 font-display font-semibold">
                  <th className="p-4 pl-6">Intitulé de l'Évaluation</th>
                  <th className="p-4">Classe</th>
                  <th className="p-4">Matière</th>
                  <th className="p-4 text-center">Coefficient</th>
                  <th className="p-4 text-center">Séquence</th>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-center">Statut Workflow</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {evaluations.map((ev) => {
                  const sClass = classes.find(c => c.id === ev.classId);
                  const sSubject = SUBJECTS.find(sub => sub.id === ev.subjectId);
                  
                  // Compute marks counts
                  const totalMarks = marks.filter(m => m.evaluationId === ev.id);
                  const averageVal = totalMarks.length > 0 
                    ? Number((totalMarks.reduce((acc, current) => acc + current.value, 0) / totalMarks.length).toFixed(2))
                    : null;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6">
                        <p className="font-semibold text-slate-800">{ev.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-mono">{ev.type}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{sClass?.name}</td>
                      <td className="p-4 text-slate-600">{sSubject?.name}</td>
                      <td className="p-4 text-center font-mono font-medium text-slate-600">{ev.coefficient}</td>
                      <td className="p-4 text-center font-mono text-xs font-semibold text-slate-500">Seq {ev.sequenceId}</td>
                      <td className="p-4 text-center font-mono text-xs text-slate-500">{ev.date}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold font-mono rounded-full uppercase border ${
                          ev.status === 'VALIDATED'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : ev.status === 'PENDING_VALIDATION'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {ev.status === 'VALIDATED' 
                            ? '🔒 Validé' 
                            : ev.status === 'PENDING_VALIDATION' 
                            ? '⏳ En attente' 
                            : '📝 Brouillon'
                          }
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => {
                            setSelectedEvalId(ev.id);
                            setActiveTab('entry');
                          }}
                          className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          {ev.status === 'VALIDATED' ? 'Consulter' : 'Saisir/Modifier'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
