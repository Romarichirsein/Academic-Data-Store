/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type AbsenceReason = 'MALADIE' | 'AUTORISE' | 'NON_AUTORISE' | 'AUTRE' | '';

export type EvaluationType = 'CONTROLE' | 'DEVOIR' | 'EXAMEN';

export type ValidationStatus = 'DRAFT' | 'PENDING_VALIDATION' | 'VALIDATED';

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Terminale C", "6ème M1", "3ème Allemand"
  level: string; // "Lycée" or "Collège"
  studentCount: number;
  schoolId?: string; // for multi-tenancy
}

export interface Student {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  avatarUrl?: string;
  schoolId?: string; // for multi-tenancy
  status?: string; // e.g. "Active", "Actif", "Inactive"
}

export interface Subject {
  id: string;
  name: string; // e.g. "Mathématiques", "Physique", "Sciences de la Vie et de la Terre", "Français", "Anglais"
  code: string; // e.g. "MATH", "PHYS", "SVT", "FRAN", "ANGL"
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  coefficient: number; // e.g. 5 for Math in Terminale C, 2 for history
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[]; // subjectIds
}

export interface AttendanceSheet {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "08:00 - 10:00", "10:00 - 12:00"
  sequenceId: number; // 1 to 6
  schoolId?: string; // for multi-tenancy
}

export interface AttendanceRecord {
  id: string;
  sheetId: string;
  studentId: string;
  status: AttendanceStatus;
  reason: AbsenceReason;
  comment?: string;
}

export interface Evaluation {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  sequenceId: number; // 1 to 6
  termId: number; // 1 to 3
  type: EvaluationType;
  coefficient: number;
  date: string; // YYYY-MM-DD
  status: ValidationStatus;
  title: string; // e.g., "Contrôle de géométrie"
  schoolId?: string; // for multi-tenancy
}

export interface Mark {
  id: string;
  evaluationId: string;
  studentId: string;
  value: number; // 0 to 20
  comment?: string;
}

export interface Sequence {
  id: number; // 1 to 6
  name: string; // e.g., "Séquence 1"
  termId: number; // 1 to 3
}

export interface Term {
  id: number; // 1 to 3
  name: string; // e.g., "1er Trimestre"
}

export interface SchoolTenant {
  id: string;
  name: string;
  slogan: string;
  logoEmoji: string;
  logoUrl?: string; // customizable brand logo image URL / data URL
  primaryColor: 'blue' | 'emerald' | 'indigo' | 'rose' | 'amber' | 'violet';
  address: string;
  phone: string;
  email: string;
  activeSchoolYear: string; // active school year e.g., "2025-2026"
  themePrimary?: string; // custom hex primary color
  themeSecondary?: string; // custom hex secondary color
  themeAccent?: string; // custom hex accent color
  systemVersion?: string; // e.g., "v2.5.0"
  licenseStatus?: 'Active' | 'Expired' | 'Pending' | 'Suspended';
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string or format
  action: string;
  schoolId: string;
  schoolName: string;
  details: string;
  user: string;
}

