/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainDashboard from './components/MainDashboard';
import AttendanceModule from './components/AttendanceModule';
import GradesModule from './components/GradesModule';
import AdminStats from './components/AdminStats';
import StudentPortal from './components/StudentPortal';
import ApiDocs from './components/ApiDocs';
import SuperAdminModule from './components/SuperAdminModule';
import LoginModule from './components/LoginModule';
import UserGuideModal from './components/UserGuideModal';
import AcademicStructureModule from './components/AcademicStructureModule';
import StudentEnrollmentModule from './components/StudentEnrollmentModule';
import RolesManagementModule from './components/RolesManagementModule';

import {
  seedDatabaseIfEmpty,
  startFirebaseSync,
  dbSaveSchool,
  dbDeleteSchool,
  dbSaveClass,
  dbSaveStudent,
  dbSaveSheet,
  dbSaveRecord,
  dbSaveEvaluation,
  dbSaveMark,
  dbSaveAuditLog,
  dbSaveSubject,
  dbDeleteSubject,
  dbSaveTeacher,
  dbDeleteTeacher,
  dbSaveClassSubject,
  dbDeleteClassSubject,
  dbSaveRole,
  dbDeleteRole,
  dbSaveStaff,
  dbDeleteStaff,
  dbDeleteClass,
  dbDeleteStudent
} from './lib/firebaseSync';

import {
  INITIAL_ATTENDANCE_SHEETS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_EVALUATIONS,
  INITIAL_MARKS,
  STUDENTS,
  CLASSES,
  SUBJECTS,
  INITIAL_SCHOOLS,
  TEACHERS,
  CLASS_SUBJECTS,
  INITIAL_ROLES,
  INITIAL_STAFF
} from './data/mockData';

import { 
  AttendanceSheet, 
  AttendanceRecord, 
  Evaluation, 
  Mark, 
  SchoolTenant, 
  SchoolClass, 
  Student, 
  AuditLog,
  Subject,
  Teacher,
  ClassSubject,
  AdminRole,
  StaffMember
} from './types';
import { Calendar, Bell, Search, GraduationCap, Clock, CheckCircle, BookOpen, Users, FileText, Menu, X, HelpCircle } from 'lucide-react';
import { generateShades, DEFAULT_PALETTES } from './utils/colorUtils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    role: string;
    schoolId?: string;
    studentId?: string;
  } | null>(null);

  const userEmail = currentUser?.email || 'visiteur@minesec.gov.cm';

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  // Multi-tenant multi-school state (synchronized with Firestore)
  const [schools, rawSetSchools] = useState<SchoolTenant[]>(INITIAL_SCHOOLS);
  const [activeSchoolId, setActiveSchoolId] = useState<string>('school-lby');
  const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];

  // Dynamically managed classes and students (synchronized with Firestore)
  const [classes, rawSetClasses] = useState<SchoolClass[]>(() => {
    return CLASSES.map(c => ({ ...c, schoolId: 'school-lby' }));
  });
  const [students, rawSetStudents] = useState<Student[]>(() => {
    return STUDENTS.map(s => ({ ...s, schoolId: 'school-lby' }));
  });

  // Subjects, Teachers, and ClassSubject Assignments
  const [subjects, rawSetSubjects] = useState<Subject[]>(SUBJECTS);
  const [teachers, rawSetTeachers] = useState<Teacher[]>(TEACHERS);
  const [classSubjects, rawSetClassSubjects] = useState<ClassSubject[]>(CLASS_SUBJECTS);

  // Administrative Roles and Staff Members
  const [roles, rawSetRoles] = useState<AdminRole[]>(INITIAL_ROLES);
  const [staff, rawSetStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  // Centralized Audit Log State
  const [auditLogs, rawSetAuditLogs] = useState<AuditLog[]>([]);

  // State setters wrappers to write to Firestore
  const setSchools = (value: React.SetStateAction<SchoolTenant[]>) => {
    rawSetSchools((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((s) => {
        const prevSchool = prev.find((p) => p.id === s.id);
        if (JSON.stringify(prevSchool) !== JSON.stringify(s)) {
          dbSaveSchool(s);
        }
      });
      prev.forEach((p) => {
        if (!next.find((s) => s.id === p.id)) {
          dbDeleteSchool(p.id);
        }
      });
      return next;
    });
  };

  const setClasses = (value: React.SetStateAction<SchoolClass[]>) => {
    rawSetClasses((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((c) => {
        const prevCls = prev.find((p) => p.id === c.id);
        if (JSON.stringify(prevCls) !== JSON.stringify(c)) {
          dbSaveClass(c);
        }
      });
      prev.forEach((p) => {
        if (!next.find((c) => c.id === p.id)) {
          dbDeleteClass(p.id);
        }
      });
      return next;
    });
  };

  const setStudents = (value: React.SetStateAction<Student[]>) => {
    rawSetStudents((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((s) => {
        const prevStud = prev.find((p) => p.id === s.id);
        if (JSON.stringify(prevStud) !== JSON.stringify(s)) {
          dbSaveStudent(s);
        }
      });
      prev.forEach((p) => {
        if (!next.find((s) => s.id === p.id)) {
          dbDeleteStudent(p.id);
        }
      });
      return next;
    });
  };

  const setSubjects = (value: React.SetStateAction<Subject[]>) => {
    rawSetSubjects((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((s) => {
        const prevSub = prev.find((p) => p.id === s.id);
        if (JSON.stringify(prevSub) !== JSON.stringify(s)) {
          dbSaveSubject(s);
        }
      });
      prev.forEach((p) => {
        if (!next.find((s) => s.id === p.id)) {
          dbDeleteSubject(p.id);
        }
      });
      return next;
    });
  };

  const setTeachers = (value: React.SetStateAction<Teacher[]>) => {
    rawSetTeachers((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((t) => {
        const prevTeach = prev.find((p) => p.id === t.id);
        if (JSON.stringify(prevTeach) !== JSON.stringify(t)) {
          dbSaveTeacher(t);
        }
      });
      prev.forEach((p) => {
        if (!next.find((t) => t.id === p.id)) {
          dbDeleteTeacher(p.id);
        }
      });
      return next;
    });
  };

  const setClassSubjects = (value: React.SetStateAction<ClassSubject[]>) => {
    rawSetClassSubjects((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((cs) => {
        const prevCS = prev.find((p) => p.id === cs.id);
        if (JSON.stringify(prevCS) !== JSON.stringify(cs)) {
          dbSaveClassSubject(cs);
        }
      });
      prev.forEach((p) => {
        if (!next.find((cs) => cs.id === p.id)) {
          dbDeleteClassSubject(p.id);
        }
      });
      return next;
    });
  };

  const setRoles = (value: React.SetStateAction<AdminRole[]>) => {
    rawSetRoles((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((r) => {
        const prevR = prev.find((p) => p.id === r.id);
        if (JSON.stringify(prevR) !== JSON.stringify(r)) {
          dbSaveRole(r);
        }
      });
      prev.forEach((p) => {
        if (!next.find((r) => r.id === p.id)) {
          dbDeleteRole(p.id);
        }
      });
      return next;
    });
  };

  const setStaff = (value: React.SetStateAction<StaffMember[]>) => {
    rawSetStaff((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((st) => {
        const prevSt = prev.find((p) => p.id === st.id);
        if (JSON.stringify(prevSt) !== JSON.stringify(st)) {
          dbSaveStaff(st);
        }
      });
      prev.forEach((p) => {
        if (!next.find((st) => st.id === p.id)) {
          dbDeleteStaff(p.id);
        }
      });
      return next;
    });
  };
    rawSetStudents((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((s) => {
        const prevStud = prev.find((p) => p.id === s.id);
        if (JSON.stringify(prevStud) !== JSON.stringify(s)) {
          dbSaveStudent(s);
        }
      });
      return next;
    });
  };

  const addAuditLog = (action: string, schoolId: string, details: string, user: string = userEmail) => {
    const schoolObj = schools.find(s => s.id === schoolId);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      schoolId,
      schoolName: schoolObj ? schoolObj.name : 'Établissement inconnu',
      details,
      user
    };
    dbSaveAuditLog(newLog);
    rawSetAuditLogs(prev => [newLog, ...prev]);
  };

  // Active school tenant filtered datasets
  const activeClasses = classes.filter(c => (c.schoolId || 'school-lby') === activeSchoolId);
  const activeStudents = students.filter(s => {
    if (!s) return false;
    if (s.schoolId) {
      return s.schoolId === activeSchoolId;
    }
    const studentClass = s.classId ? classes.find(c => c.id === s.classId) : undefined;
    return (studentClass?.schoolId || 'school-lby') === activeSchoolId;
  });

  // Date range picker filtering states
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2025-09-01');
  const [endDate, setEndDate] = useState<string>('2026-06-30');

  // Lifted state to keep modules synchronized in real-time (synchronized with Firestore)
  const [sheets, rawSetSheets] = useState<AttendanceSheet[]>(INITIAL_ATTENDANCE_SHEETS);
  const [records, rawSetRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [evaluations, rawSetEvaluations] = useState<Evaluation[]>(INITIAL_EVALUATIONS);
  const [marks, rawSetMarks] = useState<Mark[]>(INITIAL_MARKS);

  const setSheets = (value: React.SetStateAction<AttendanceSheet[]>) => {
    rawSetSheets((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((s) => {
        const prevSheet = prev.find((p) => p.id === s.id);
        if (JSON.stringify(prevSheet) !== JSON.stringify(s)) {
          dbSaveSheet(s);
        }
      });
      return next;
    });
  };

  const setRecords = (value: React.SetStateAction<AttendanceRecord[]>) => {
    rawSetRecords((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((r) => {
        const prevRec = prev.find((p) => p.id === r.id);
        if (JSON.stringify(prevRec) !== JSON.stringify(r)) {
          dbSaveRecord(r);
        }
      });
      return next;
    });
  };

  const setEvaluations = (value: React.SetStateAction<Evaluation[]>) => {
    rawSetEvaluations((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((e) => {
        const prevEval = prev.find((p) => p.id === e.id);
        if (JSON.stringify(prevEval) !== JSON.stringify(e)) {
          dbSaveEvaluation(e);
        }
      });
      return next;
    });
  };

  const setMarks = (value: React.SetStateAction<Mark[]>) => {
    rawSetMarks((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach((m) => {
        const prevMark = prev.find((p) => p.id === m.id);
        if (JSON.stringify(prevMark) !== JSON.stringify(m)) {
          dbSaveMark(m);
        }
      });
      return next;
    });
  };

  // Start Firebase database sync and auto-seeding
  useEffect(() => {
    let active = true;
    const initSync = async () => {
      await seedDatabaseIfEmpty();
      if (!active) return;
      
      const unsub = startFirebaseSync({
        setSchools: rawSetSchools,
        setClasses: rawSetClasses,
        setStudents: rawSetStudents,
        setSheets: rawSetSheets,
        setRecords: rawSetRecords,
        setEvaluations: rawSetEvaluations,
        setMarks: rawSetMarks,
        setAuditLogs: rawSetAuditLogs,
        setSubjects: rawSetSubjects,
        setTeachers: rawSetTeachers,
        setClassSubjects: rawSetClassSubjects,
        setRoles: rawSetRoles,
        setStaff: rawSetStaff
      });
      
      return unsub;
    };
    
    let unsubPromise = initSync();
    
    return () => {
      active = false;
      unsubPromise.then(unsub => unsub?.());
    };
  }, []);

  const activeSheets = sheets.filter(s => (s.schoolId || 'school-lby') === activeSchoolId);
  const activeEvaluations = evaluations.filter(e => (e.schoolId || 'school-lby') === activeSchoolId);

  // States for selected entity search navigation
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stud-tc-1');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-tc');
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>('eval-tc-s5-math');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Notifications simulation
  const [notifications, setNotifications] = useState<string[]>([
    "Séquence 5 : M. Belinga Paul a soumis le devoir de Physique pour validation.",
    "Alerte : 3 élèves de Terminale C cumulent plus de 8h d'absences cette semaine.",
    "Système : La saisie des notes du 3e trimestre ferme dans 5 jours."
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global search filtering
  const query = searchQuery.trim().toLowerCase();

  const matchedStudents = query ? activeStudents.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const parentName = student.parentName.toLowerCase();
    const phone = student.parentPhone.toLowerCase();
    return fullName.includes(query) || parentName.includes(query) || phone.includes(query);
  }) : [];

  const matchedClasses = query ? activeClasses.filter(cls => {
    return cls.name.toLowerCase().includes(query) || cls.level.toLowerCase().includes(query);
  }) : [];

  const matchedEvaluations = query ? activeEvaluations.filter(ev => {
    // Check if date falls in selected range
    let start = '';
    let end = '';
    if (selectedPeriod === 'trim1') {
      start = '2025-09-01';
      end = '2025-11-30';
    } else if (selectedPeriod === 'trim2') {
      start = '2025-12-01';
      end = '2026-02-28';
    } else if (selectedPeriod === 'trim3') {
      start = '2026-03-01';
      end = '2026-06-30';
    } else if (selectedPeriod === 'custom') {
      start = startDate;
      end = endDate;
    }
    
    if (start && ev.date < start) return false;
    if (end && ev.date > end) return false;

    const titleMatches = ev.title.toLowerCase().includes(query);
    const typeMatches = ev.type.toLowerCase().includes(query);
    const subject = SUBJECTS.find(sub => sub.id === ev.subjectId);
    const subjectMatches = subject ? subject.name.toLowerCase().includes(query) || subject.code.toLowerCase().includes(query) : false;
    
    // Support sequence matching: e.g. "seq 5" or "séquence 5"
    let seqMatches = false;
    if (query.includes('seq') || query.includes('séquence') || query.includes('sequence')) {
      const numMatch = query.match(/\d+/);
      if (numMatch) {
        seqMatches = ev.sequenceId === parseInt(numMatch[0]);
      }
    }
    
    return titleMatches || typeMatches || subjectMatches || seqMatches;
  }) : [];

  const hasAnyResults = matchedStudents.length > 0 || matchedClasses.length > 0 || matchedEvaluations.length > 0;

  const handleOpenSheetFromDashboard = (sheetId: string) => {
    setCurrentTab('attendance');
    // We let the history page or default loader find it, since the lists are reactive
  };

  const handleCreateNewSheetFromDashboard = (classId: string, subjectId: string) => {
    setCurrentTab('attendance');
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <MainDashboard
            sheets={activeSheets}
            records={records}
            evaluations={activeEvaluations}
            setCurrentTab={setCurrentTab}
            onOpenSheet={handleOpenSheetFromDashboard}
            onCreateNewSheet={handleCreateNewSheetFromDashboard}
            activeSchool={activeSchool}
            classes={activeClasses}
            students={activeStudents}
          />
        );
      case 'academic':
        return (
          <AcademicStructureModule
            classes={activeClasses}
            setClasses={setClasses}
            subjects={subjects}
            setSubjects={setSubjects}
            teachers={teachers}
            setTeachers={setTeachers}
            classSubjects={classSubjects}
            setClassSubjects={setClassSubjects}
            activeSchoolId={activeSchoolId}
            activeSchool={activeSchool}
            addAuditLog={addAuditLog}
          />
        );
      case 'enrollment':
        return (
          <StudentEnrollmentModule
            students={activeStudents}
            setStudents={setStudents}
            classes={activeClasses}
            setClasses={setClasses}
            activeSchoolId={activeSchoolId}
            activeSchool={activeSchool}
            addAuditLog={addAuditLog}
          />
        );
      case 'roles':
        return (
          <RolesManagementModule
            roles={roles}
            setRoles={setRoles}
            staff={staff}
            setStaff={setStaff}
            activeSchoolId={activeSchoolId}
            activeSchool={activeSchool}
            addAuditLog={addAuditLog}
          />
        );
      case 'attendance':
        return (
          <AttendanceModule
            sheets={activeSheets}
            setSheets={setSheets}
            records={records}
            setRecords={setRecords}
            selectedClass={selectedClassId}
            onSelectClass={setSelectedClassId}
            classes={activeClasses}
            students={activeStudents}
            activeSchoolId={activeSchoolId}
            activeSchool={activeSchool}
            addAuditLog={addAuditLog}
          />
        );
      case 'grades':
        return (
          <GradesModule
            evaluations={activeEvaluations}
            setEvaluations={setEvaluations}
            marks={marks}
            setMarks={setMarks}
            selectedEvalId={selectedEvalId}
            onSelectEval={setSelectedEvalId}
            classes={activeClasses}
            students={activeStudents}
            subjects={subjects}
            teachers={teachers}
            activeSchoolId={activeSchoolId}
            addAuditLog={addAuditLog}
          />
        );
      case 'admin':
        return (
          <AdminStats
            evaluations={activeEvaluations}
            setEvaluations={setEvaluations}
            marks={marks}
            setMarks={setMarks}
            sheets={activeSheets}
            classes={activeClasses}
            students={activeStudents}
            addAuditLog={addAuditLog}
            records={records}
            activeSchool={activeSchool}
          />
        );
      case 'portal':
        return (
          <StudentPortal
            initialStudents={activeStudents}
            initialMarks={marks}
            initialEvaluations={activeEvaluations}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            classes={activeClasses}
            activeSchool={activeSchool}
            onUpdateStudent={(updatedStudent) => {
              setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
              addAuditLog(
                "Mise à jour élève",
                updatedStudent.schoolId || activeSchoolId,
                `Mise à jour du profil de l'élève ${updatedStudent.lastName} ${updatedStudent.firstName} par son tuteur/administration (Tél Alerte: ${updatedStudent.parentPhone}).`
              );
            }}
          />
        );
      case 'superadmin':
        return (
          <SuperAdminModule
            schools={schools}
            setSchools={setSchools}
            activeSchoolId={activeSchoolId}
            setActiveSchoolId={setActiveSchoolId}
            setClasses={setClasses}
            setStudents={setStudents}
            classes={classes}
            students={students}
            auditLogs={auditLogs}
            addAuditLog={addAuditLog}
            sheets={sheets}
            evaluations={evaluations}
          />
        );
      case 'architecture':
        return <ApiDocs />;
      default:
        return (
          <MainDashboard
            sheets={activeSheets}
            records={records}
            evaluations={activeEvaluations}
            setCurrentTab={setCurrentTab}
            onOpenSheet={handleOpenSheetFromDashboard}
            onCreateNewSheet={handleCreateNewSheetFromDashboard}
            activeSchool={activeSchool}
            classes={activeClasses}
            students={activeStudents}
          />
        );
    }
  };

  const schoolColor = activeSchool?.primaryColor || 'blue';
  const defaultPalette = DEFAULT_PALETTES[schoolColor as keyof typeof DEFAULT_PALETTES] || DEFAULT_PALETTES.blue;
  
  const primaryHex = activeSchool?.themePrimary || defaultPalette.primary;
  const secondaryHex = activeSchool?.themeSecondary || defaultPalette.secondary;
  const accentHex = activeSchool?.themeAccent || defaultPalette.accent;

  const primaryShades = generateShades(primaryHex);
  const secondaryShades = generateShades(secondaryHex);
  const accentShades = generateShades(accentHex);

  const dynamicStyle = {
    '--dynamic-primary-50': primaryShades[50],
    '--dynamic-primary-100': primaryShades[100],
    '--dynamic-primary-200': primaryShades[200],
    '--dynamic-primary-300': primaryShades[300],
    '--dynamic-primary-400': primaryShades[400],
    '--dynamic-primary-500': primaryShades[500],
    '--dynamic-primary-600': primaryShades[600],
    '--dynamic-primary-700': primaryShades[700],
    '--dynamic-primary-800': primaryShades[800],
    '--dynamic-primary-900': primaryShades[900],
    '--dynamic-primary-950': primaryShades[950],

    '--dynamic-secondary-50': secondaryShades[50],
    '--dynamic-secondary-100': secondaryShades[100],
    '--dynamic-secondary-200': secondaryShades[200],
    '--dynamic-secondary-300': secondaryShades[300],
    '--dynamic-secondary-400': secondaryShades[400],
    '--dynamic-secondary-500': secondaryShades[500],
    '--dynamic-secondary-600': secondaryShades[600],
    '--dynamic-secondary-700': secondaryShades[700],
    '--dynamic-secondary-800': secondaryShades[800],
    '--dynamic-secondary-900': secondaryShades[900],
    '--dynamic-secondary-950': secondaryShades[950],

    '--dynamic-accent-50': accentShades[50],
    '--dynamic-accent-100': accentShades[100],
    '--dynamic-accent-200': accentShades[200],
    '--dynamic-accent-300': accentShades[300],
    '--dynamic-accent-400': accentShades[400],
    '--dynamic-accent-500': accentShades[500],
    '--dynamic-accent-600': accentShades[600],
    '--dynamic-accent-700': accentShades[700],
    '--dynamic-accent-800': accentShades[800],
    '--dynamic-accent-900': accentShades[900],
    '--dynamic-accent-950': accentShades[950],
  } as React.CSSProperties;

  if (!isLoggedIn) {
    return (
      <LoginModule
        schools={schools}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          if (user.schoolId) {
            setActiveSchoolId(user.schoolId);
          }
          if (user.role === 'superadmin') {
            setCurrentTab('superadmin');
          } else if (user.role === 'parent') {
            if (user.studentId) {
              setSelectedStudentId(user.studentId);
            }
            setCurrentTab('portal');
          } else if (user.role === 'enseignant') {
            setCurrentTab('grades');
          } else if (user.role === 'secretaire') {
            setCurrentTab('enrollment');
          } else if (user.role === 'surveillant_general') {
            setCurrentTab('attendance');
          } else {
            setCurrentTab('dashboard');
          }
        }}
      />
    );
  }

  return (
    <div style={dynamicStyle} className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* Mobile Sidebar Drawer with Slide-in Transition */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slide-in Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-80 max-w-[85vw] h-full bg-[#0F172A] flex flex-col shadow-2xl z-50 overflow-hidden"
            >
              {/* Close Icon Button */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar component styled for mobile view */}
              <div className="flex-1 h-full overflow-hidden flex flex-col">
                <Sidebar
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  userEmail={userEmail}
                  activeSchool={activeSchool}
                  schools={schools}
                  setActiveSchoolId={setActiveSchoolId}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                  currentUserRole={currentUser?.role}
                  onLogout={handleLogout}
                  onOpenGuide={() => setIsGuideOpen(true)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userEmail={userEmail}
        activeSchool={activeSchool}
        schools={schools}
        setActiveSchoolId={setActiveSchoolId}
        currentUserRole={currentUser?.role}
        onLogout={handleLogout}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar header */}
        <header id="app-header" className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center space-x-2 shrink-0">
            {/* Mobile-only hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer mr-1"
              title="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2.5 py-1 rounded-lg font-bold border border-slate-200">
              MINESEC • {activeSchool.name.replace(/Lycée|Collège/g, '').trim()}
            </span>
            <span className="hidden xl:inline-block text-xs text-slate-400">
              Session : <strong className="text-slate-700">Censeur Général</strong>
            </span>
          </div>

          {/* Global Search & Date Range Picker Container */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4 flex flex-col justify-center">
            {/* Date Range Picker above Search Bar */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Période :</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] text-slate-600 focus:outline-none cursor-pointer font-bold font-mono"
              >
                <option value="all">Année Scolaire (01/09 - 30/06)</option>
                <option value="trim1">1er Trimestre (01/09 - 30/11)</option>
                <option value="trim2">2e Trimestre (01/12 - 28/02)</option>
                <option value="trim3">3e Trimestre (01/03 - 30/06)</option>
                <option value="custom">Plage personnalisée...</option>
              </select>

              {selectedPeriod === 'custom' && (
                <div className="flex items-center space-x-1 animate-fade-in">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 text-[9px] text-slate-600 focus:outline-none font-mono font-semibold"
                  />
                  <span className="text-[9px] text-slate-400 font-bold">à</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 text-[9px] text-slate-600 focus:outline-none font-mono font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Global Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 250)}
                placeholder="Rechercher élève, classe, évaluation..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 pl-9 pr-8 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1.5 text-slate-400 hover:text-slate-600 focus:outline-none text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results Dropdown */}
            {showResults && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                {!hasAnyResults ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {/* Students Group */}
                    {matchedStudents.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider px-3 py-1.5 flex items-center space-x-1">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                          <span>Élèves ({matchedStudents.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {matchedStudents.slice(0, 5).map(student => {
                            const cls = classes.find(c => c.id === student.classId);
                            return (
                              <button
                                key={student.id}
                                onMouseDown={() => {
                                  setSelectedStudentId(student.id);
                                  setCurrentTab('portal');
                                  setSearchQuery('');
                                  setShowResults(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md font-extrabold font-mono uppercase tracking-wide shrink-0">
                                      Élève
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate">
                                      {student.firstName} {student.lastName}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate pl-11">
                                    Parent: {student.parentName} • {student.parentPhone}
                                  </div>
                                </div>
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-2">
                                  {cls?.name || 'Classe'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Classes Group */}
                    {matchedClasses.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider px-3 py-1.5 flex items-center space-x-1">
                          <Users className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Classes ({matchedClasses.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {matchedClasses.map(cls => (
                            <button
                              key={cls.id}
                              onMouseDown={() => {
                                setSelectedClassId(cls.id);
                                setCurrentTab('attendance');
                                setSearchQuery('');
                                setShowResults(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md font-extrabold font-mono uppercase tracking-wide shrink-0">
                                    Classe
                                  </span>
                                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                                    {cls.name}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 pl-15">
                                  Niveau: {cls.level}
                                </div>
                              </div>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono shrink-0">
                                {cls.studentCount} élèves
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evaluations Group */}
                    {matchedEvaluations.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider px-3 py-1.5 flex items-center space-x-1">
                          <FileText className="h-3.5 w-3.5 text-amber-500" />
                          <span>Évaluations ({matchedEvaluations.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {matchedEvaluations.slice(0, 5).map(ev => {
                            const cls = classes.find(c => c.id === ev.classId);
                            const subj = SUBJECTS.find(s => s.id === ev.subjectId);
                            return (
                              <button
                                key={ev.id}
                                onMouseDown={() => {
                                  setSelectedEvalId(ev.id);
                                  setCurrentTab('grades');
                                  setSearchQuery('');
                                  setShowResults(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-extrabold font-mono uppercase tracking-wide shrink-0">
                                      Évaluation
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-amber-600 transition-colors truncate">
                                      {ev.title}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex flex-wrap gap-x-2 pl-20">
                                    <span>Seq {ev.sequenceId}</span>
                                    <span>•</span>
                                    <span className="truncate">{subj?.name}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1.5 shrink-0">
                                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-lg font-mono">
                                    {cls?.name}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-lg font-mono uppercase ${
                                    ev.status === 'VALIDATED' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : ev.status === 'PENDING_VALIDATION'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {ev.status === 'VALIDATED' ? 'Validé' : ev.status === 'PENDING_VALIDATION' ? 'En cours' : 'Brouillon'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            {/* Real local time indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Vendredi, 03 Juil 2026</span>
            </div>

            {/* Notification alert bells */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification drop menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                      Alertes Récentes
                    </span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Effacer tout
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 italic">Aucune alerte en attente</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-600 hover:bg-blue-50/40 transition-colors">
                          {notif}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Guide Button with Sparkly indicator */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100/60 rounded-xl transition-all font-bold text-xs cursor-pointer shadow-xs"
              title="Guide d'utilisation"
            >
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Guide d’utilisation</span>
            </button>

            {/* Quick school level tag */}
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider font-mono px-2.5 py-1 rounded-full uppercase border border-blue-100/60">
              Édition 2025-2026
            </span>
          </div>
        </header>

        {/* Dynamic Inner Workspace (tab page content) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: -16, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 16, filter: 'blur(3px)' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* User Guide Interactive Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUserRole={currentUser?.role}
      />
    </div>
  );
}
