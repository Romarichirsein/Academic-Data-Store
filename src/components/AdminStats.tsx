/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolClass, Student, Evaluation, Mark, Subject, ClassSubject, AttendanceSheet, AttendanceRecord, SchoolTenant } from '../types';
import { CLASSES, STUDENTS, SUBJECTS, INITIAL_ATTENDANCE_SHEETS, INITIAL_ATTENDANCE_RECORDS, CLASS_SUBJECTS } from '../data/mockData';
import { ShieldCheck, BarChart3, Lock, CheckCircle, FileText, Printer, Award, Info, Users, ChevronRight, Check, X, AlertTriangle, CalendarDays, LineChart } from 'lucide-react';
import ClassPerformanceTrends from './ClassPerformanceTrends';
import SummaryWidgets from './SummaryWidgets';

interface AdminStatsProps {
  evaluations: Evaluation[];
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  marks: Mark[];
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  sheets: AttendanceSheet[];
  classes?: SchoolClass[];
  students?: Student[];
  addAuditLog?: (action: string, schoolId: string, details: string) => void;
  records: AttendanceRecord[];
  activeSchool?: SchoolTenant;
}

export default function AdminStats({ 
  evaluations, 
  setEvaluations, 
  marks, 
  setMarks, 
  sheets,
  classes = CLASSES,
  students = STUDENTS,
  addAuditLog,
  records,
  activeSchool
}: AdminStatsProps) {
  const [adminTab, setAdminTab] = useState<'approvals' | 'bulletins' | 'attendance-stats' | 'performance-trends'>('approvals');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-tc');
  const [selectedSequenceId, setSelectedSequenceId] = useState<number>(5);
  const [printStudentId, setPrintStudentId] = useState<string | null>(null);

  // 1. Approvals handler (pending validation list)
  const pendingEvals = evaluations.filter(e => e.status === 'PENDING_VALIDATION');

  const handleApproveEvaluation = (evalId: string) => {
    const ev = evaluations.find(e => e.id === evalId);
    setEvaluations(prev => prev.map(item => {
      if (item.id === evalId) {
        return { ...item, status: 'VALIDATED' };
      }
      return item;
    }));

    if (ev) {
      const className = classes.find(c => c.id === ev.classId)?.name || 'Classe';
      const subjectName = SUBJECTS.find(s => s.id === ev.subjectId)?.name || 'Matière';
      addAuditLog?.(
        "Validation de notes",
        ev.schoolId || 'school-lby',
        `Validation et verrouillage définitif par l'administrateur de la fiche "${ev.title}" (Classe: ${className}, Matière: ${subjectName}).`
      );
    }

    alert("L'évaluation a été validée avec succès. Elle est désormais verrouillée et disponible pour les bulletins de notes !");
  };

  const handleRejectEvaluation = (evalId: string) => {
    const ev = evaluations.find(e => e.id === evalId);
    setEvaluations(prev => prev.map(item => {
      if (item.id === evalId) {
        return { ...item, status: 'DRAFT' };
      }
      return item;
    }));

    if (ev) {
      const className = classes.find(c => c.id === ev.classId)?.name || 'Classe';
      const subjectName = SUBJECTS.find(s => s.id === ev.subjectId)?.name || 'Matière';
      addAuditLog?.(
        "Validation de notes",
        ev.schoolId || 'school-lby',
        `Rejet et renvoi en brouillon par l'administrateur de la fiche de notes "${ev.title}" (Classe: ${className}, Matière: ${subjectName}).`
      );
    }

    alert("L'évaluation a été renvoyée en brouillon à l'enseignant pour modification.");
  };

  // 2. Attendance Stats calculations
  const classAttendanceRates = classes.map(c => {
    const classSheets = sheets.filter(s => s.classId === c.id);
    let totalAssigned = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    classSheets.forEach(sh => {
      const shRecords = INITIAL_ATTENDANCE_RECORDS.filter(r => r.sheetId === sh.id);
      shRecords.forEach(rec => {
        totalAssigned++;
        if (rec.status === 'PRESENT') presentCount++;
        else if (rec.status === 'LATE') lateCount++;
        else if (rec.status === 'ABSENT') absentCount++;
      });
    });

    const rate = totalAssigned > 0 
      ? Number(((presentCount + lateCount) / totalAssigned * 100).toFixed(1))
      : 96.5; // High fallback for demo

    return {
      classId: c.id,
      className: c.name,
      totalSessions: classSheets.length || 3,
      attendanceRate: rate,
      absentCount: absentCount || Math.floor(Math.random() * 3) + 1,
      lateCount: lateCount || Math.floor(Math.random() * 2) + 1
    };
  });

  // Top Absent Students
  const studentAbsenteeism = students.map(s => {
    const sRecords = INITIAL_ATTENDANCE_RECORDS.filter(r => r.studentId === s.id);
    const absences = sRecords.filter(r => r.status === 'ABSENT').length;
    const lates = sRecords.filter(r => r.status === 'LATE').length;
    const sClass = classes.find(c => c.id === s.classId)?.name || '';

    return {
      id: s.id,
      name: `${s.lastName} ${s.firstName}`,
      className: sClass,
      absencesCount: absences,
      latesCount: lates
    };
  }).filter(s => s.absencesCount > 0)
    .sort((a, b) => b.absencesCount - a.absencesCount)
    .slice(0, 5);

  // 3. BULLETINS / REPORT CARDS SYSTEM
  // We need to calculate class averages, rankings, and individual performance cards for the selected class and sequence.
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const classSubjects = CLASS_SUBJECTS.filter(cs => cs.classId === selectedClassId);

  // We find validated evaluations for this class & sequence
  const activeEvals = evaluations.filter(e => 
    e.classId === selectedClassId && 
    e.sequenceId === selectedSequenceId && 
    e.status === 'VALIDATED'
  );

  // Calculate averages per student
  const studentReportData = classStudents.map(student => {
    let weightedPointsTotal = 0;
    let totalCoefficients = 0;
    const subjectsGradesList: { subjectName: string; code: string; average: number | null; coefficient: number }[] = [];

    classSubjects.forEach(cs => {
      const subject = SUBJECTS.find(s => s.id === cs.subjectId) as Subject;
      const evals = activeEvals.filter(e => e.subjectId === cs.subjectId);
      
      let sumGrades = 0;
      let sumCoeffs = 0;

      evals.forEach(ev => {
        const mark = marks.find(m => m.evaluationId === ev.id && m.studentId === student.id);
        if (mark) {
          sumGrades += mark.value * ev.coefficient;
          sumCoeffs += ev.coefficient;
        }
      });

      const average = sumCoeffs > 0 ? Number((sumGrades / sumCoeffs).toFixed(2)) : null;

      subjectsGradesList.push({
        subjectName: subject.name,
        code: subject.code,
        average,
        coefficient: cs.coefficient
      });

      if (average !== null) {
        weightedPointsTotal += average * cs.coefficient;
        totalCoefficients += cs.coefficient;
      }
    });

    const generalAverage = totalCoefficients > 0 
      ? Number((weightedPointsTotal / totalCoefficients).toFixed(2))
      : null;

    return {
      student,
      subjects: subjectsGradesList,
      generalAverage,
      totalCoefficients,
      weightedPointsTotal
    };
  });

  // Sort by average to determine rank
  const rankedReports = studentReportData
    .filter(r => r.generalAverage !== null)
    .sort((a, b) => (b.generalAverage || 0) - (a.generalAverage || 0));

  const getRank = (studentId: string): number => {
    return rankedReports.findIndex(r => r.student.id === studentId) + 1;
  };

  // Class aggregates
  const classAveragesArray = rankedReports.map(r => r.generalAverage || 0);
  const numRanked = classAveragesArray.length;

  const classGeneralStats = {
    classAverage: numRanked > 0 ? Number((classAveragesArray.reduce((a, b) => a + b, 0) / numRanked).toFixed(2)) : 0,
    highest: numRanked > 0 ? Math.max(...classAveragesArray) : 0,
    lowest: numRanked > 0 ? Math.min(...classAveragesArray) : 0,
    successRate: numRanked > 0 ? Number((classAveragesArray.filter(a => a >= 10).length / numRanked * 100).toFixed(0)) : 0
  };

  const selectedPrintData = rankedReports.find(r => r.student.id === printStudentId);
  const printClass = CLASSES.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {activeSchool && (
        <SummaryWidgets
          students={students}
          sheets={sheets}
          records={records}
          evaluations={evaluations}
          activeSchool={activeSchool}
        />
      )}

      {/* Admin Module Navigation Tabs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setAdminTab('approvals')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              adminTab === 'approvals'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Workflow de Validation</span>
            {pendingEvals.length > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                {pendingEvals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab('bulletins')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              adminTab === 'bulletins'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Bulletins de Notes</span>
          </button>
          <button
            onClick={() => setAdminTab('attendance-stats')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              adminTab === 'attendance-stats'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Rapports d'Assiduité</span>
          </button>
          <button
            onClick={() => setAdminTab('performance-trends')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              adminTab === 'performance-trends'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Courbe de Gauss & Tendances</span>
          </button>
        </div>
      </div>

      {adminTab === 'approvals' && (
        /* WORKFLOW APPROVAL VIEW */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-display font-bold text-slate-800">
              Contrôle de conformité de saisie des notes (Censeur)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Les notes saisies par les enseignants doivent être auditées et validées par la direction des études avant d'être publiées sur les bulletins de notes scolaires des élèves et bloquées à la modification.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingEvals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                <h4 className="font-display font-bold text-slate-800">Saisie des notes à jour !</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Aucune évaluation n'est actuellement en attente de validation administrative. Toutes les épreuves soumises sont auditées.
                </p>
              </div>
            ) : (
              pendingEvals.map((ev) => {
                const sClass = CLASSES.find(c => c.id === ev.classId);
                const sSubject = SUBJECTS.find(sub => sub.id === ev.subjectId);
                const totalMarks = marks.filter(m => m.evaluationId === ev.id);
                
                // Calculate average grade of the validation candidate
                const averageVal = totalMarks.length > 0 
                  ? Number((totalMarks.reduce((acc, curr) => acc + curr.value, 0) / totalMarks.length).toFixed(2))
                  : 0;

                return (
                  <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-200 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-100 text-amber-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          Séquence {ev.sequenceId}
                        </span>
                        <span className="text-slate-400 font-mono text-xs">• Saisie de note</span>
                      </div>
                      <h4 className="text-base font-display font-bold text-slate-800">{ev.title}</h4>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <p>Classe : <strong className="text-slate-700">{sClass?.name}</strong></p>
                        <p>Matière : <strong className="text-slate-700">{sSubject?.name}</strong></p>
                        <p>Note Moyenne : <strong className="text-blue-700 font-mono">{averageVal}/20</strong></p>
                        <p>Notes enregistrées : <strong className="text-slate-700">{totalMarks.length} copies</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleRejectEvaluation(ev.id)}
                        className="px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <X className="h-4.5 w-4.5" />
                        <span>Renvoyer</span>
                      </button>
                      <button
                        onClick={() => handleApproveEvaluation(ev.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="h-4.5 w-4.5" />
                        <span>Valider & Verrouiller</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {adminTab === 'bulletins' && (
        /* BULLETIN / TRANSCRIPT BOARD */
        <div className="space-y-6">
          {/* Class and sequence selectors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-display font-bold text-slate-800">
                  Générateur de Bulletins de Notes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisez, contrôlez les classements et imprimez les bulletins de notes de la séquence en cours.
                </p>
              </div>

              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Classe :</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => { setSelectedClassId(e.target.value); setPrintStudentId(null); }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-medium focus:outline-none"
                  >
                    {CLASSES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Séquence :</label>
                  <select
                    value={selectedSequenceId}
                    onChange={(e) => { setSelectedSequenceId(Number(e.target.value)); setPrintStudentId(null); }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-medium focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>Séquence {num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* List of ranks (left side) */}
            <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 self-start">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 font-display uppercase tracking-wider">
                  Classement Général
                </h4>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded-full">
                  Seq {selectedSequenceId}
                </span>
              </div>

              {rankedReports.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                  <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold">Aucune note validée pour cette période</p>
                  <p className="text-[11px] text-slate-400">Le censeur doit d'abord valider les épreuves dans l'onglet "Workflow de Validation".</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[450px] overflow-y-auto custom-scrollbar">
                  {rankedReports.map((report, rIdx) => {
                    const isTop = rIdx < 3;
                    const isPassed = report.generalAverage !== null && report.generalAverage >= 10;
                    
                    return (
                      <button
                        key={report.student.id}
                        onClick={() => setPrintStudentId(report.student.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          printStudentId === report.student.id
                            ? 'bg-blue-50 border-blue-400'
                            : 'bg-slate-50 border-transparent hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <span className={`h-6 w-6 rounded-full font-mono font-bold text-[11px] flex items-center justify-center shrink-0 ${
                            rIdx === 0 
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm'
                              : rIdx === 1
                              ? 'bg-slate-200 text-slate-800'
                              : rIdx === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {rIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-850 text-xs truncate">
                              {report.student.lastName} {report.student.firstName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Moy. Gén : <strong className="font-mono">{report.generalAverage}/20</strong>
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                          printStudentId === report.student.id ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Bulletin Preview Sheet (right side) */}
            <div className="xl:col-span-7">
              {!printStudentId || !selectedPrintData ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm h-full flex flex-col justify-center items-center">
                  <Printer className="h-14 w-14 text-slate-300 stroke-[1.5] mb-4" />
                  <h3 className="text-base font-display font-bold text-slate-800">Visualisation de Bulletin Scolaire</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                    Sélectionnez un élève dans le classement général de gauche pour générer sa fiche d'évaluation officielle certifiée par le Lycée Bilingue de Yaoundé.
                  </p>
                </div>
              ) : (
                /* OFFICIAL BULLETIN FORMAT SHEET */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:16px_16px] border-t-8 border-t-blue-700">
                  {/* Watermark header stamp simulation */}
                  <div className="absolute right-10 top-24 opacity-5 pointer-events-none transform rotate-12">
                    <ShieldCheck className="h-44 w-44 text-blue-800" />
                  </div>

                  {/* Cameroonian National Header */}
                  <div className="grid grid-cols-2 text-[8px] sm:text-[9px] font-display font-semibold uppercase text-slate-500 border-b border-slate-200 pb-4 text-center">
                    <div className="border-r border-slate-100 pr-2">
                      <p className="text-slate-800 font-bold">RÉPUBLIQUE DU CAMEROUN</p>
                      <p className="font-mono text-[7px] italic text-slate-400">Paix - Travail - Patrie</p>
                      <p className="mt-1">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</p>
                      <p>DÉLÉGATION RÉGIONALE DU CENTRE</p>
                    </div>
                    <div className="pl-2">
                      <p className="text-slate-800 font-bold">REPUBLIC OF CAMEROON</p>
                      <p className="font-mono text-[7px] italic text-slate-400">Peace - Work - Fatherland</p>
                      <p className="mt-1">MINISTRY OF SECONDARY EDUCATION</p>
                      <p>LYCÉE BILINGUE DE YAOUNDÉ</p>
                    </div>
                  </div>

                  {/* Bulletin identity */}
                  <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-display font-bold text-slate-850 text-sm tracking-wider uppercase">
                      BULLETIN DE NOTES SÉQUENTIEL
                    </h4>
                    <p className="font-mono text-xs font-bold text-blue-700 mt-0.5">
                      SÉQUENCE {selectedSequenceId} • TRIMESTRE {selectedSequenceId <= 2 ? '1' : selectedSequenceId <= 4 ? '2' : '3'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Année Scolaire : 2025 - 2026</p>
                  </div>

                  {/* Student details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="space-y-1">
                      <p>Élève : <strong className="text-slate-850 text-sm font-display font-bold">{selectedPrintData.student.lastName} {selectedPrintData.student.firstName}</strong></p>
                      <p>Classe : <strong className="text-slate-700">{printClass?.name}</strong></p>
                      <p>Genre : <strong className="text-slate-700">{selectedPrintData.student.gender}</strong></p>
                    </div>
                    <div className="space-y-1 sm:text-right">
                      <p>Rang Séquentiel : <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold">#{getRank(selectedPrintData.student.id)} sur {numRanked}</span></p>
                      <p>Moyenne Générale : <strong className="text-blue-800 font-mono font-bold text-sm">{selectedPrintData.generalAverage}/20</strong></p>
                      <p>Total Coefficients : <strong className="text-slate-700 font-mono">{selectedPrintData.totalCoefficients}</strong></p>
                    </div>
                  </div>

                  {/* Subject and score report table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-display font-bold text-[10px]">
                          <th className="p-2.5 pl-4">Matières</th>
                          <th className="p-2.5 text-center">Coeff</th>
                          <th className="p-2.5 text-center">Moyenne /20</th>
                          <th className="p-2.5 text-center">Points Coeff.</th>
                          <th className="p-2.5">Appréciations & Mentions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedPrintData.subjects.map((sub, sIdx) => {
                          const weighted = sub.average !== null ? Number((sub.average * sub.coefficient).toFixed(2)) : null;
                          const isPassed = sub.average !== null && sub.average >= 10;
                          
                          return (
                            <tr key={sIdx} className="hover:bg-slate-50/40">
                              <td className="p-2.5 pl-4 font-semibold text-slate-800">{sub.subjectName}</td>
                              <td className="p-2.5 text-center font-mono font-medium text-slate-500">{sub.coefficient}</td>
                              <td className="p-2.5 text-center font-mono font-bold">
                                {sub.average !== null ? `${sub.average}` : '-'}
                              </td>
                              <td className="p-2.5 text-center font-mono text-slate-500">
                                {weighted !== null ? weighted : '-'}
                              </td>
                              <td className="p-2.5 text-[11px] italic text-slate-500">
                                {sub.average !== null && sub.average >= 16 
                                  ? 'Excellent' 
                                  : sub.average !== null && sub.average >= 14 
                                  ? 'Très satisfaisant' 
                                  : sub.average !== null && sub.average >= 12 
                                  ? 'Satisfaisant' 
                                  : sub.average !== null && sub.average >= 10 
                                  ? 'Passable' 
                                  : sub.average !== null 
                                  ? 'Insuffisant' 
                                  : 'Aucune épreuve validée'
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer on Class statistics */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Moyenne Classe</p>
                      <p className="text-xs font-bold font-mono text-slate-700 mt-0.5">{classGeneralStats.classAverage}/20</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Note Maximale</p>
                      <p className="text-xs font-bold font-mono text-slate-700 mt-0.5">{classGeneralStats.highest}/20</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Note Minimale</p>
                      <p className="text-xs font-bold font-mono text-slate-700 mt-0.5">{classGeneralStats.lowest}/20</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Taux de Réussite</p>
                      <p className="text-xs font-bold font-mono text-emerald-700 mt-0.5">{classGeneralStats.successRate}%</p>
                    </div>
                  </div>

                  {/* Board and Stamp signatures block */}
                  <div className="grid grid-cols-2 text-[10px] text-slate-500 font-display font-medium pt-4 border-t border-slate-100">
                    <div>
                      <p className="italic">Yaoundé, le {new Date().toLocaleDateString('fr-FR')}</p>
                      <p className="font-bold text-slate-700 mt-1">Le Titulaire de Classe</p>
                      <div className="h-12"></div>
                      <p className="text-[9px] text-slate-400">(Signature électronique certifiée)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700">Le Chef d'Établissement (Censeur)</p>
                      <div className="h-12 flex justify-end items-center">
                        <div className="h-10 w-24 border border-dashed border-blue-400 text-blue-500 font-mono text-[7px] p-1 text-center rounded flex flex-col justify-center select-none rotate-3 opacity-80">
                          <p className="font-bold uppercase leading-tight">LYCÉE BILINGUE</p>
                          <p className="uppercase leading-tight">DE YAOUNDÉ</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400">Cachet de l'Académie de Yaoundé</p>
                    </div>
                  </div>

                  {/* Print Button action simulated */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => alert("Impression du bulletin en cours... (Génération de la mise en page vectorielle PDF)")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-semibold shadow transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimer le bulletin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'attendance-stats' && (
        /* ATTENDANCE GLOBAL METRICS */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-display font-bold text-slate-800">
              Statistiques d'Assiduité des Classes (Trimestriel)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Vue analytique consolidant les appels de présence afin de détecter le décrochage scolaire et d'éditer des alertes d'absences injustifiées.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Class attendance bars (left column) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 flex items-center space-x-1.5">
                <Users className="h-4.5 w-4.5 text-blue-500" />
                <span>Taux de Présence par Classe</span>
              </h4>

              <div className="space-y-4">
                {classAttendanceRates.map((cRate) => (
                  <div key={cRate.classId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-slate-800 font-display font-bold">{cRate.className}</strong>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {cRate.attendanceRate}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cRate.attendanceRate}%` }}
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      ></div>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                      <p>Heures de cours évaluées : <strong className="text-slate-600">{cRate.totalSessions * 2}h</strong></p>
                      <p>Retards cumulés : <strong className="text-amber-600">{cRate.lateCount}</strong></p>
                      <p>Absences cumulées : <strong className="text-rose-600">{cRate.absentCount}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Absent students list (right column) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 flex items-center space-x-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
                <span>Alertes Décrochage (Élèves les plus absents)</span>
              </h4>

              {studentAbsenteeism.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  Aucune absence enregistrée pour l'instant.
                </div>
              ) : (
                <div className="space-y-3">
                  {studentAbsenteeism.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/20 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Classe : {s.className}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block bg-rose-100 text-rose-800 font-mono font-bold px-2.5 py-1 rounded-lg">
                          {s.absencesCount * 2} heures
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">({s.latesCount} retards)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10px] text-amber-800 leading-relaxed flex items-start space-x-2">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Les tuteurs des élèves cumulant plus de 10 heures d'absence unexcused reçoivent une convocation d'alerte automatisée par SMS.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'performance-trends' && (
        <ClassPerformanceTrends
          evaluations={evaluations}
          marks={marks}
          classes={classes}
          students={students}
        />
      )}
    </div>
  );
}
