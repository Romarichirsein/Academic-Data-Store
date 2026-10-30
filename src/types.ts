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

// ====== RBAC Role Management ======

export type AdminRoleType =
  | 'proviseur'
  | 'censeur'
  | 'surveillant_general'
  | 'secretaire'
  | 'econome'
  | 'intendant'
  | 'enseignant'
  | 'parent';

export interface AdminRole {
  id: string;
  type: AdminRoleType;
  label: string;
  description: string;
  permissions: string[];
  schoolId: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleType: AdminRoleType;
  schoolId: string;
  teacherId?: string; // link to Teacher if role is 'enseignant'
  studentIds?: string[]; // link to children if role is 'parent'
  isActive: boolean;
}

// ====== Default role permissions map ======

export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRoleType, { label: string; description: string; permissions: string[] }> = {
  proviseur: {
    label: 'Proviseur / Directeur',
    description: 'Responsable général de l\'établissement',
    permissions: ['all', 'manage_staff', 'manage_classes', 'manage_subjects', 'manage_teachers', 'manage_students', 'view_grades', 'validate_grades', 'view_attendance', 'view_audit', 'manage_roles']
  },
  censeur: {
    label: 'Censeur',
    description: 'Responsable pédagogique, valide les notes',
    permissions: ['manage_classes', 'manage_subjects', 'manage_teachers', 'view_grades', 'validate_grades', 'view_attendance', 'view_audit']
  },
  surveillant_general: {
    label: 'Surveillant Général',
    description: 'Responsable de la discipline et des absences',
    permissions: ['view_classes', 'view_students', 'manage_attendance', 'view_audit']
  },
  secretaire: {
    label: 'Secrétaire',
    description: 'Gestion administrative et inscriptions',
    permissions: ['manage_students', 'manage_classes', 'view_grades', 'view_attendance']
  },
  econome: {
    label: 'Économe / Intendant',
    description: 'Gestion financière et matérielle',
    permissions: ['view_students', 'view_classes', 'view_audit']
  },
  intendant: {
    label: 'Intendant',
    description: 'Gestion des ressources et du patrimoine',
    permissions: ['view_students', 'view_classes']
  },
  enseignant: {
    label: 'Enseignant',
    description: 'Saisie des notes et des présences pour ses classes',
    permissions: ['enter_grades', 'enter_attendance', 'view_own_classes']
  },
  parent: {
    label: 'Parent / Tuteur',
    description: 'Consultation des notes et absences de son enfant',
    permissions: ['view_child_grades', 'view_child_attendance']
  }
};

