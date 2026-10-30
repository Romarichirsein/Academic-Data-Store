/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  SchoolTenant, 
  SchoolClass, 
  Student, 
  AttendanceSheet, 
  AttendanceRecord, 
  Evaluation, 
  Mark, 
  AuditLog,
  Subject,
  Teacher,
  ClassSubject,
  AdminRole,
  StaffMember
} from '../types';
import { 
  INITIAL_SCHOOLS, 
  CLASSES, 
  STUDENTS, 
  INITIAL_ATTENDANCE_SHEETS, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_EVALUATIONS, 
  INITIAL_MARKS,
  SUBJECTS,
  TEACHERS,
  CLASS_SUBJECTS,
  INITIAL_ROLES,
  INITIAL_STAFF
} from '../data/mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to seed Firestore if empty
export async function seedDatabaseIfEmpty() {
  try {
    const schoolsCol = collection(db, 'schools');
    const q = query(schoolsCol, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Firestore is empty. Starting auto-seeding with premium academic mock data...');
      
      const batch = writeBatch(db);

      // Seed Schools
      for (const s of INITIAL_SCHOOLS) {
        const ref = doc(db, 'schools', s.id);
        batch.set(ref, s);
      }

      // Seed Classes (ensure default schoolId = school-lby)
      for (const c of CLASSES) {
        const ref = doc(db, 'classes', c.id);
        batch.set(ref, { ...c, schoolId: c.schoolId || 'school-lby' });
      }

      // Seed Students (ensure default schoolId = school-lby)
      for (const s of STUDENTS) {
        const ref = doc(db, 'students', s.id);
        batch.set(ref, { ...s, schoolId: s.schoolId || 'school-lby' });
      }

      // Seed Attendance Sheets
      for (const s of INITIAL_ATTENDANCE_SHEETS) {
        const ref = doc(db, 'sheets', s.id);
        batch.set(ref, { ...s, schoolId: s.schoolId || 'school-lby' });
      }

      // Seed Attendance Records
      for (const r of INITIAL_ATTENDANCE_RECORDS) {
        const ref = doc(db, 'records', r.id);
        batch.set(ref, r);
      }

      // Seed Evaluations
      for (const e of INITIAL_EVALUATIONS) {
        const ref = doc(db, 'evaluations', e.id);
        batch.set(ref, { ...e, schoolId: e.schoolId || 'school-lby' });
      }

      // Seed Marks
      for (const m of INITIAL_MARKS) {
        const ref = doc(db, 'marks', m.id);
        batch.set(ref, m);
      }

      // Seed Subjects
      for (const s of SUBJECTS) {
        const ref = doc(db, 'subjects', s.id);
        batch.set(ref, { ...s, schoolId: 'school-lby' });
      }

      // Seed Teachers
      for (const t of TEACHERS) {
        const ref = doc(db, 'teachers', t.id);
        batch.set(ref, { ...t, schoolId: 'school-lby' });
      }

      // Seed ClassSubjects
      for (const cs of CLASS_SUBJECTS) {
        const ref = doc(db, 'classSubjects', cs.id);
        batch.set(ref, { ...cs, schoolId: 'school-lby' });
      }

      // Seed Roles
      for (const role of INITIAL_ROLES) {
        const ref = doc(db, 'roles', role.id);
        batch.set(ref, role);
      }

      // Seed Staff Members
      for (const staff of INITIAL_STAFF) {
        const ref = doc(db, 'staff', staff.id);
        batch.set(ref, staff);
      }

      // Seed some initial Audit Logs
      const initialLogs: AuditLog[] = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          action: "Création d'établissement",
          schoolId: 'school-lby',
          schoolName: 'Lycée Bilingue de Yaoundé',
          details: "Création du locataire 'Lycée Bilingue de Yaoundé' sur la plateforme.",
          user: 'superadmin@minesec.gov.cm'
        },
        {
          id: 'log-2',
          timestamp: new Date().toISOString(),
          action: "Saisie d'absences",
          schoolId: 'school-vogt',
          schoolName: 'Collège Jean-Tabi / Vogt',
          details: "Feuille d'appel créée pour Terminale C - Mathématiques par M. Jean-Marc Kamga",
          user: 'jm.kamga@academic.cm'
        }
      ];
      for (const log of initialLogs) {
        const ref = doc(db, 'auditLogs', log.id);
        batch.set(ref, log);
      }

      await batch.commit();
      console.log('Auto-seeding completed successfully!');
    } else {
      console.log('Firestore already contains data. Skipping auto-seed.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'auto-seed');
  }
}

// Subscribe helper to coordinate all Firestore collections to React states
export function startFirebaseSync(setters: {
  setSchools: React.Dispatch<React.SetStateAction<SchoolTenant[]>>;
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setSheets: React.Dispatch<React.SetStateAction<AttendanceSheet[]>>;
  setRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setClassSubjects: React.Dispatch<React.SetStateAction<ClassSubject[]>>;
  setRoles: React.Dispatch<React.SetStateAction<AdminRole[]>>;
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}) {
  const unsubscribes: (() => void)[] = [];

  // 1. Schools Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'schools'),
      (snapshot) => {
        const data: SchoolTenant[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as SchoolTenant, id: doc.id });
        });
        if (data.length > 0) {
          setters.setSchools(data);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'schools');
      }
    )
  );

  // 2. Classes Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'classes'),
      (snapshot) => {
        const data: SchoolClass[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as SchoolClass, id: doc.id });
        });
        setters.setClasses(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'classes');
      }
    )
  );

  // 3. Students Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const data: Student[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as Student, id: doc.id });
        });
        setters.setStudents(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'students');
      }
    )
  );

  // 4. Sheets Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'sheets'),
      (snapshot) => {
        const data: AttendanceSheet[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as AttendanceSheet, id: doc.id });
        });
        setters.setSheets(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sheets');
      }
    )
  );

  // 5. Records Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'records'),
      (snapshot) => {
        const data: AttendanceRecord[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as AttendanceRecord, id: doc.id });
        });
        setters.setRecords(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'records');
      }
    )
  );

  // 6. Evaluations Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'evaluations'),
      (snapshot) => {
        const data: Evaluation[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as Evaluation, id: doc.id });
        });
        setters.setEvaluations(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'evaluations');
      }
    )
  );

  // 7. Marks Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'marks'),
      (snapshot) => {
        const data: Mark[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as Mark, id: doc.id });
        });
        setters.setMarks(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'marks');
      }
    )
  );

  // 8. Audit Logs Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'auditLogs'),
      (snapshot) => {
        const data: AuditLog[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as AuditLog, id: doc.id });
        });
        // Sort newest first
        data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setters.setAuditLogs(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'auditLogs');
      }
    )
  );

  // 9. Subjects Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'subjects'),
      (snapshot) => {
        const data: Subject[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as Subject, id: doc.id });
        });
        if (data.length > 0) {
          setters.setSubjects(data);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'subjects');
      }
    )
  );

  // 10. Teachers Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'teachers'),
      (snapshot) => {
        const data: Teacher[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as Teacher, id: doc.id });
        });
        if (data.length > 0) {
          setters.setTeachers(data);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'teachers');
      }
    )
  );

  // 11. ClassSubjects Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'classSubjects'),
      (snapshot) => {
        const data: ClassSubject[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as ClassSubject, id: doc.id });
        });
        if (data.length > 0) {
          setters.setClassSubjects(data);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'classSubjects');
      }
    )
  );

  // 12. Roles Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'roles'),
      (snapshot) => {
        const data: AdminRole[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as AdminRole, id: doc.id });
        });
        setters.setRoles(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'roles');
      }
    )
  );

  // 13. Staff Listener
  unsubscribes.push(
    onSnapshot(
      collection(db, 'staff'),
      (snapshot) => {
        const data: StaffMember[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data() as StaffMember, id: doc.id });
        });
        setters.setStaff(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'staff');
      }
    )
  );

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}

// Firestore Writer Helper Functions
export async function dbSaveSchool(school: SchoolTenant) {
  try {
    await setDoc(doc(db, 'schools', school.id), school);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `schools/${school.id}`);
  }
}

export async function dbDeleteSchool(schoolId: string) {
  try {
    await deleteDoc(doc(db, 'schools', schoolId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `schools/${schoolId}`);
  }
}

export async function dbSaveClass(cls: SchoolClass) {
  try {
    await setDoc(doc(db, 'classes', cls.id), cls);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `classes/${cls.id}`);
  }
}

export async function dbSaveStudent(student: Student) {
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.id}`);
  }
}

export async function dbSaveSheet(sheet: AttendanceSheet) {
  try {
    await setDoc(doc(db, 'sheets', sheet.id), sheet);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `sheets/${sheet.id}`);
  }
}

export async function dbSaveRecord(record: AttendanceRecord) {
  try {
    await setDoc(doc(db, 'records', record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `records/${record.id}`);
  }
}

export async function dbSaveEvaluation(evaluation: Evaluation) {
  try {
    await setDoc(doc(db, 'evaluations', evaluation.id), evaluation);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `evaluations/${evaluation.id}`);
  }
}

export async function dbSaveMark(mark: Mark) {
  try {
    await setDoc(doc(db, 'marks', mark.id), mark);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `marks/${mark.id}`);
  }
}

export async function dbSaveAuditLog(log: AuditLog) {
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `auditLogs/${log.id}`);
  }
}

export async function dbSaveSubject(subject: Subject) {
  try {
    await setDoc(doc(db, 'subjects', subject.id), subject);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `subjects/${subject.id}`);
  }
}

export async function dbDeleteSubject(subjectId: string) {
  try {
    await deleteDoc(doc(db, 'subjects', subjectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `subjects/${subjectId}`);
  }
}

export async function dbSaveTeacher(teacher: Teacher) {
  try {
    await setDoc(doc(db, 'teachers', teacher.id), teacher);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `teachers/${teacher.id}`);
  }
}

export async function dbDeleteTeacher(teacherId: string) {
  try {
    await deleteDoc(doc(db, 'teachers', teacherId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `teachers/${teacherId}`);
  }
}

export async function dbSaveClassSubject(cs: ClassSubject) {
  try {
    await setDoc(doc(db, 'classSubjects', cs.id), cs);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `classSubjects/${cs.id}`);
  }
}

export async function dbDeleteClassSubject(csId: string) {
  try {
    await deleteDoc(doc(db, 'classSubjects', csId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `classSubjects/${csId}`);
  }
}

export async function dbSaveRole(role: AdminRole) {
  try {
    await setDoc(doc(db, 'roles', role.id), role);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `roles/${role.id}`);
  }
}

export async function dbDeleteRole(roleId: string) {
  try {
    await deleteDoc(doc(db, 'roles', roleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `roles/${roleId}`);
  }
}

export async function dbSaveStaff(staff: StaffMember) {
  try {
    await setDoc(doc(db, 'staff', staff.id), staff);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `staff/${staff.id}`);
  }
}

export async function dbDeleteStaff(staffId: string) {
  try {
    await deleteDoc(doc(db, 'staff', staffId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `staff/${staffId}`);
  }
}

export async function dbDeleteClass(classId: string) {
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `classes/${classId}`);
  }
}

export async function dbDeleteStudent(studentId: string) {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${studentId}`);
  }
}
