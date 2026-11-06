/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SchoolClass,
  Student,
  Subject,
  ClassSubject,
  Teacher,
  AttendanceSheet,
  AttendanceRecord,
  Evaluation,
  Mark,
  Sequence,
  Term,
  SchoolTenant,
  AdminRole,
  StaffMember,
  DEFAULT_ROLE_PERMISSIONS
} from '../types';

export const TERMS: Term[] = [
  { id: 1, name: "1er Trimestre" },
  { id: 2, name: "2e Trimestre" },
  { id: 3, name: "3e Trimestre" }
];

export const SEQUENCES: Sequence[] = [
  { id: 1, name: "Séquence 1", termId: 1 },
  { id: 2, name: "Séquence 2", termId: 1 },
  { id: 3, name: "Séquence 3", termId: 2 },
  { id: 4, name: "Séquence 4", termId: 2 },
  { id: 5, name: "Séquence 5", termId: 3 },
  { id: 6, name: "Séquence 6", termId: 3 }
];

export const CLASSES: SchoolClass[] = [
  { id: 'class-tc', name: 'Terminale C', level: 'Lycée', studentCount: 12, schoolId: 'school-lby' },
  { id: 'class-td', name: 'Terminale D', level: 'Lycée', studentCount: 10, schoolId: 'school-lby' },
  { id: 'class-3e', name: '3ème Allemand', level: 'Collège', studentCount: 10, schoolId: 'school-lby' },
  { id: 'class-fapo-6e', name: '6ème Moderne', level: 'Collège', studentCount: 28, schoolId: 'school-fapo' },
  { id: 'class-fapo-3e', name: '3ème Espagnol', level: 'Collège', studentCount: 22, schoolId: 'school-fapo' },
  { id: 'class-fapo-tlec', name: 'Terminale C', level: 'Lycée', studentCount: 18, schoolId: 'school-fapo' }
];

export const SUBJECTS: Subject[] = [
  { id: 'subj-math', name: 'Mathématiques', code: 'MATH' },
  { id: 'subj-phys', name: 'Physique-Chimie', code: 'PHYS' },
  { id: 'subj-svt', name: 'Sciences de la Vie et de la Terre', code: 'SVT' },
  { id: 'subj-fran', name: 'Français (Lettres)', code: 'FRAN' },
  { id: 'subj-angl', name: 'Anglais (English)', code: 'ANGL' },
  { id: 'subj-hist', name: 'Histoire-Géographie', code: 'HIST' },
  { id: 'subj-info', name: 'Informatique', code: 'INFO' }
];

export const TEACHERS: Teacher[] = [
  { id: 'teach-1', name: 'M. Jean-Marc Kamga', email: 'jm.kamga@academic.cm', subjects: ['subj-math', 'subj-info'] },
  { id: 'teach-2', name: 'Mme Marie-Thérèse Abena', email: 'mt.abena@academic.cm', subjects: ['subj-fran', 'subj-angl'] },
  { id: 'teach-3', name: 'M. Paul Belinga', email: 'p.belinga@academic.cm', subjects: ['subj-phys', 'subj-svt'] },
  { id: 'teach-4', name: 'Mme Chantal Ngo Mbe', email: 'c.ngombe@academic.cm', subjects: ['subj-hist'] }
];

export const CLASS_SUBJECTS: ClassSubject[] = [
  // Terminale C (Série Scientifique - coefficients élevés en Sciences)
  { id: 'cs-tc-math', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', coefficient: 6 },
  { id: 'cs-tc-phys', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', coefficient: 5 },
  { id: 'cs-tc-svt', classId: 'class-tc', subjectId: 'subj-svt', teacherId: 'teach-3', coefficient: 2 },
  { id: 'cs-tc-fran', classId: 'class-tc', subjectId: 'subj-fran', teacherId: 'teach-2', coefficient: 2 },
  { id: 'cs-tc-angl', classId: 'class-tc', subjectId: 'subj-angl', teacherId: 'teach-2', coefficient: 2 },
  { id: 'cs-tc-hist', classId: 'class-tc', subjectId: 'subj-hist', teacherId: 'teach-4', coefficient: 2 },
  { id: 'cs-tc-info', classId: 'class-tc', subjectId: 'subj-info', teacherId: 'teach-1', coefficient: 2 },

  // Terminale D (Série Sciences Naturelles)
  { id: 'cs-td-math', classId: 'class-td', subjectId: 'subj-math', teacherId: 'teach-1', coefficient: 4 },
  { id: 'cs-td-phys', classId: 'class-td', subjectId: 'subj-phys', teacherId: 'teach-3', coefficient: 4 },
  { id: 'cs-td-svt', classId: 'class-td', subjectId: 'subj-svt', teacherId: 'teach-3', coefficient: 5 },
  { id: 'cs-td-fran', classId: 'class-td', subjectId: 'subj-fran', teacherId: 'teach-2', coefficient: 2 },
  { id: 'cs-td-angl', classId: 'class-td', subjectId: 'subj-angl', teacherId: 'teach-2', coefficient: 2 },
  { id: 'cs-td-info', classId: 'class-td', subjectId: 'subj-info', teacherId: 'teach-1', coefficient: 2 },

  // 3ème (Tronc commun, coefficient élevé en Français/Langues)
  { id: 'cs-3e-math', classId: 'class-3e', subjectId: 'subj-math', teacherId: 'teach-1', coefficient: 4 },
  { id: 'cs-3e-phys', classId: 'class-3e', subjectId: 'subj-phys', teacherId: 'teach-3', coefficient: 2 },
  { id: 'cs-3e-svt', classId: 'class-3e', subjectId: 'subj-svt', teacherId: 'teach-3', coefficient: 2 },
  { id: 'cs-3e-fran', classId: 'class-3e', subjectId: 'subj-fran', teacherId: 'teach-2', coefficient: 5 },
  { id: 'cs-3e-angl', classId: 'class-3e', subjectId: 'subj-angl', teacherId: 'teach-2', coefficient: 3 },
  { id: 'cs-3e-hist', classId: 'class-3e', subjectId: 'subj-hist', teacherId: 'teach-4', coefficient: 3 },
  { id: 'cs-3e-info', classId: 'class-3e', subjectId: 'subj-info', teacherId: 'teach-1', coefficient: 2 }
];

export const STUDENTS: Student[] = [
  // Terminale C
  { id: 'stud-tc-1', classId: 'class-tc', firstName: 'Samuel', lastName: "Eto'o Fils", gender: 'M', parentName: 'M. Samuel Eto\'o Sr.', parentPhone: '+237 677 88 99 00', parentEmail: 'etoo.parent@gmail.com' },
  { id: 'stud-tc-2', classId: 'class-tc', firstName: 'Chloé', lastName: 'Kamdem', gender: 'F', parentName: 'Mme Kamdem Florence', parentPhone: '+237 699 11 22 33', parentEmail: 'florence.kamdem@yahoo.fr' },
  { id: 'stud-tc-3', classId: 'class-tc', firstName: 'Marc-Aurèle', lastName: 'Abena', gender: 'M', parentName: 'Prof. Laurent Abena', parentPhone: '+237 655 44 33 22', parentEmail: 'l.abena@univ-yde.cm' },
  { id: 'stud-tc-4', classId: 'class-tc', firstName: 'Therese Marie', lastName: 'Belinga', gender: 'F', parentName: 'M. Belinga Joseph', parentPhone: '+237 671 00 22 44', parentEmail: 'j.belinga@outlook.com' },
  { id: 'stud-tc-5', classId: 'class-tc', firstName: 'Jean-Pierre', lastName: 'Ndoumbe', gender: 'M', parentName: 'M. Ndoumbe Simon', parentPhone: '+237 680 99 88 77', parentEmail: 'simon.ndoumbe@gmail.com' },
  { id: 'stud-tc-6', classId: 'class-tc', firstName: 'Jeanne d\'Arc', lastName: 'Ngo Mbe', gender: 'F', parentName: 'Mme Ngo Mbe Cécile', parentPhone: '+237 690 33 44 55', parentEmail: 'c.ngombe@gmail.com' },
  { id: 'stud-tc-7', classId: 'class-tc', firstName: 'Amadou', lastName: 'Ahidjo', gender: 'M', parentName: 'El Hadj Ahidjo Ousmanou', parentPhone: '+237 661 55 66 77', parentEmail: 'ahidjo.family@gmail.com' },
  { id: 'stud-tc-8', classId: 'class-tc', firstName: 'Emmanuelle', lastName: 'Fouda', gender: 'F', parentName: 'Mme Fouda Claudine', parentPhone: '+237 693 44 88 12', parentEmail: 'c.fouda@orange.cm' },
  { id: 'stud-tc-9', classId: 'class-tc', firstName: 'William', lastName: 'Tchakounté', gender: 'M', parentName: 'M. Tchakounté Guy', parentPhone: '+237 651 88 44 22', parentEmail: 'guy.tchak@hotmail.com' },
  { id: 'stud-tc-10', classId: 'class-tc', firstName: 'Fadil', lastName: 'Njoya', gender: 'M', parentName: 'Sultan Njoya Ibrahim', parentPhone: '+237 673 12 14 15', parentEmail: 'njoya.fadil@camnet.cm' },
  { id: 'stud-tc-11', classId: 'class-tc', firstName: 'Carine', lastName: 'Nsame', gender: 'F', parentName: 'M. Nsame Bernard', parentPhone: '+237 681 45 46 47', parentEmail: 'b.nsame@gmail.com' },
  { id: 'stud-tc-12', classId: 'class-tc', firstName: 'Arthur', lastName: 'Zambo', gender: 'M', parentName: 'Mme Zambo Odette', parentPhone: '+237 695 55 12 34', parentEmail: 'o.zambo@gmail.com' },

  // Terminale D
  { id: 'stud-td-1', classId: 'class-td', firstName: 'Ibrahim', lastName: 'Mbouombouo', gender: 'M', parentName: 'M. Mbouombouo Adamou', parentPhone: '+237 671 22 33 44' },
  { id: 'stud-td-2', classId: 'class-td', firstName: 'Vanessa', lastName: 'Nguemgne', gender: 'F', parentName: 'Mme Nguemgne Solange', parentPhone: '+237 699 44 55 66' },
  { id: 'stud-td-3', classId: 'class-td', firstName: 'Brice', lastName: 'Tchouta', gender: 'M', parentName: 'M. Tchouta Pierre', parentPhone: '+237 655 77 88 99' },
  { id: 'stud-td-4', classId: 'class-td', firstName: 'Clarisse', lastName: 'Onana', gender: 'F', parentName: 'M. Onana Charles', parentPhone: '+237 680 11 22 33' },
  { id: 'stud-td-5', classId: 'class-td', firstName: 'Gaston', lastName: 'Nnomo', gender: 'M', parentName: 'Mme Nnomo Angeline', parentPhone: '+237 691 23 45 67' },
  { id: 'stud-td-6', classId: 'class-td', firstName: 'Esther', lastName: 'Kono', gender: 'F', parentName: 'M. Kono François', parentPhone: '+237 677 34 56 78' },
  { id: 'stud-td-7', classId: 'class-td', firstName: 'Christian', lastName: 'Bassogog', gender: 'M', parentName: 'M. Bassogog Albert', parentPhone: '+237 651 90 91 92' },
  { id: 'stud-td-8', classId: 'class-td', firstName: 'Mireille', lastName: 'Ngono', gender: 'F', parentName: 'Mme Ngono Jeanne', parentPhone: '+237 694 56 78 90' },
  { id: 'stud-td-9', classId: 'class-td', firstName: 'Salomon', lastName: 'Olembe', gender: 'M', parentName: 'M. Olembe Félix', parentPhone: '+237 670 12 34 56' },
  { id: 'stud-td-10', classId: 'class-td', firstName: 'Arlette', lastName: 'Ekani', gender: 'F', parentName: 'M. Ekani Paul', parentPhone: '+237 692 34 56 78' },

  // 3ème Allemand
  { id: 'stud-3e-1', classId: 'class-3e', firstName: 'Junior', lastName: 'Ndzana', gender: 'M', parentName: 'M. Ndzana Marc', parentPhone: '+237 671 12 12 12' },
  { id: 'stud-3e-2', classId: 'class-3e', firstName: 'Sonia', lastName: 'Nkamgang', gender: 'F', parentName: 'Mme Nkamgang Jacqueline', parentPhone: '+237 699 23 23 23' },
  { id: 'stud-3e-3', classId: 'class-3e', firstName: 'Aboubacar', lastName: 'Siddiki', gender: 'M', parentName: 'M. Siddiki Amadou', parentPhone: '+237 655 34 34 34' },
  { id: 'stud-3e-4', classId: 'class-3e', firstName: 'Fatima', lastName: 'Zahra', gender: 'F', parentName: 'El Hadj Zahra Malik', parentPhone: '+237 680 45 45 45' },
  { id: 'stud-3e-5', classId: 'class-3e', firstName: 'Rodrigue', lastName: 'Mpondo', gender: 'M', parentName: 'M. Mpondo Jean', parentPhone: '+237 691 56 56 56' },
  { id: 'stud-3e-6', classId: 'class-3e', firstName: 'Doris', lastName: 'Fotso', gender: 'F', parentName: 'Mme Fotso Beatrice', parentPhone: '+237 677 67 67 67' },
  { id: 'stud-3e-7', classId: 'class-3e', firstName: 'Karl', lastName: 'Toko Ekambi', gender: 'M', parentName: 'M. Toko Charles', parentPhone: '+237 651 78 78 78' },
  { id: 'stud-3e-8', classId: 'class-3e', firstName: 'Rosalie', lastName: 'Atangana', gender: 'F', parentName: 'M. Atangana Pierre', parentPhone: '+237 694 89 89 89' },
  { id: 'stud-3e-9', classId: 'class-3e', firstName: 'Cédric', lastName: 'Mongoung', gender: 'M', parentName: 'Mme Mongoung Alice', parentPhone: '+237 670 90 90 90' },
  { id: 'stud-3e-10', classId: 'class-3e', firstName: 'Gabrielle', lastName: 'Biko', gender: 'F', parentName: 'M. Biko Robert', parentPhone: '+237 692 01 01 01', schoolId: 'school-lby' },
  // Collège Fapo
  { id: 'stud-fapo-1', classId: 'class-fapo-tlec', firstName: 'Paul', lastName: 'Kamto', gender: 'M', parentName: 'M. Kamto Ernest', parentPhone: '+237 671 23 45 67', parentEmail: 'kamto.parent@gmail.com', schoolId: 'school-fapo' },
  { id: 'stud-fapo-2', classId: 'class-fapo-tlec', firstName: 'Christelle', lastName: 'Fotso', gender: 'F', parentName: 'Mme Fotso Claire', parentPhone: '+237 699 87 65 43', parentEmail: 'fotso.claire@gmail.com', schoolId: 'school-fapo' },
  { id: 'stud-fapo-3', classId: 'class-fapo-3e', firstName: 'Alain', lastName: 'Nguema', gender: 'M', parentName: 'M. Nguema Paul', parentPhone: '+237 655 12 34 56', parentEmail: 'nguema.famille@gmail.com', schoolId: 'school-fapo' }
];

// Prepopulated Attendance Sheets (Last few days of June 2026)
export const INITIAL_ATTENDANCE_SHEETS: AttendanceSheet[] = [
  { id: 'ash-1', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', date: '2026-06-29', timeSlot: '08:00 - 10:00', sequenceId: 5 },
  { id: 'ash-2', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', date: '2026-06-29', timeSlot: '10:00 - 12:00', sequenceId: 5 },
  { id: 'ash-3', classId: 'class-tc', subjectId: 'subj-fran', teacherId: 'teach-2', date: '2026-06-30', timeSlot: '08:00 - 10:00', sequenceId: 5 },
  { id: 'ash-4', classId: 'class-3e', subjectId: 'subj-fran', teacherId: 'teach-2', date: '2026-06-30', timeSlot: '10:00 - 12:00', sequenceId: 5 },
  { id: 'ash-5', classId: 'class-td', subjectId: 'subj-svt', teacherId: 'teach-3', date: '2026-07-01', timeSlot: '08:00 - 10:00', sequenceId: 5 },
  { id: 'ash-6', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', date: '2026-07-02', timeSlot: '08:00 - 10:00', sequenceId: 5 }
];

// Prepopulated Attendance Records
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Sheet 1: Terminale C Math on 2026-06-29
  { id: 'ar-1-1', sheetId: 'ash-1', studentId: 'stud-tc-1', status: 'PRESENT', reason: '' },
  { id: 'ar-1-2', sheetId: 'ash-1', studentId: 'stud-tc-2', status: 'PRESENT', reason: '' },
  { id: 'ar-1-3', sheetId: 'ash-1', studentId: 'stud-tc-3', status: 'ABSENT', reason: 'MALADIE', comment: 'Certificat médical reçu' },
  { id: 'ar-1-4', sheetId: 'ash-1', studentId: 'stud-tc-4', status: 'PRESENT', reason: '' },
  { id: 'ar-1-5', sheetId: 'ash-1', studentId: 'stud-tc-5', status: 'LATE', reason: 'AUTORISE', comment: 'Retard de bus' },
  { id: 'ar-1-6', sheetId: 'ash-1', studentId: 'stud-tc-6', status: 'PRESENT', reason: '' },
  { id: 'ar-1-7', sheetId: 'ash-1', studentId: 'stud-tc-7', status: 'PRESENT', reason: '' },
  { id: 'ar-1-8', sheetId: 'ash-1', studentId: 'stud-tc-8', status: 'PRESENT', reason: '' },
  { id: 'ar-1-9', sheetId: 'ash-1', studentId: 'stud-tc-9', status: 'ABSENT', reason: 'NON_AUTORISE', comment: 'Absence non motivée' },
  { id: 'ar-1-10', sheetId: 'ash-1', studentId: 'stud-tc-10', status: 'PRESENT', reason: '' },
  { id: 'ar-1-11', sheetId: 'ash-1', studentId: 'stud-tc-11', status: 'PRESENT', reason: '' },
  { id: 'ar-1-12', sheetId: 'ash-1', studentId: 'stud-tc-12', status: 'PRESENT', reason: '' },

  // Sheet 2: Terminale C Phys on 2026-06-29
  { id: 'ar-2-1', sheetId: 'ash-2', studentId: 'stud-tc-1', status: 'PRESENT', reason: '' },
  { id: 'ar-2-2', sheetId: 'ash-2', studentId: 'stud-tc-2', status: 'PRESENT', reason: '' },
  { id: 'ar-2-3', sheetId: 'ash-2', studentId: 'stud-tc-3', status: 'ABSENT', reason: 'MALADIE' },
  { id: 'ar-2-4', sheetId: 'ash-2', studentId: 'stud-tc-4', status: 'PRESENT', reason: '' },
  { id: 'ar-2-5', sheetId: 'ash-2', studentId: 'stud-tc-5', status: 'PRESENT', reason: '' },
  { id: 'ar-2-6', sheetId: 'ash-2', studentId: 'stud-tc-6', status: 'PRESENT', reason: '' },
  { id: 'ar-2-7', sheetId: 'ash-2', studentId: 'stud-tc-7', status: 'PRESENT', reason: '' },
  { id: 'ar-2-8', sheetId: 'ash-2', studentId: 'stud-tc-8', status: 'PRESENT', reason: '' },
  { id: 'ar-2-9', sheetId: 'ash-2', studentId: 'stud-tc-9', status: 'PRESENT', reason: '' },
  { id: 'ar-2-10', sheetId: 'ash-2', studentId: 'stud-tc-10', status: 'PRESENT', reason: '' },
  { id: 'ar-2-11', sheetId: 'ash-2', studentId: 'stud-tc-11', status: 'PRESENT', reason: '' },
  { id: 'ar-2-12', sheetId: 'ash-2', studentId: 'stud-tc-12', status: 'ABSENT', reason: 'NON_AUTORISE' },

  // Sheet 3: Terminale C French on 2026-06-30
  { id: 'ar-3-1', sheetId: 'ash-3', studentId: 'stud-tc-1', status: 'PRESENT', reason: '' },
  { id: 'ar-3-2', sheetId: 'ash-3', studentId: 'stud-tc-2', status: 'PRESENT', reason: '' },
  { id: 'ar-3-3', sheetId: 'ash-3', studentId: 'stud-tc-3', status: 'PRESENT', reason: '' },
  { id: 'ar-3-4', sheetId: 'ash-3', studentId: 'stud-tc-4', status: 'PRESENT', reason: '' },
  { id: 'ar-3-5', sheetId: 'ash-3', studentId: 'stud-tc-5', status: 'PRESENT', reason: '' },
  { id: 'ar-3-6', sheetId: 'ash-3', studentId: 'stud-tc-6', status: 'ABSENT', reason: 'AUTORISE', comment: 'Rendez-vous administratif' },
  { id: 'ar-3-7', sheetId: 'ash-3', studentId: 'stud-tc-7', status: 'PRESENT', reason: '' },
  { id: 'ar-3-8', sheetId: 'ash-3', studentId: 'stud-tc-8', status: 'PRESENT', reason: '' },
  { id: 'ar-3-9', sheetId: 'ash-3', studentId: 'stud-tc-9', status: 'ABSENT', reason: 'NON_AUTORISE' },
  { id: 'ar-3-10', sheetId: 'ash-3', studentId: 'stud-tc-10', status: 'PRESENT', reason: '' },
  { id: 'ar-3-11', sheetId: 'ash-3', studentId: 'stud-tc-11', status: 'PRESENT', reason: '' },
  { id: 'ar-3-12', sheetId: 'ash-3', studentId: 'stud-tc-12', status: 'PRESENT', reason: '' },

  // Sheet 4: 3ème French on 2026-06-30
  { id: 'ar-4-1', sheetId: 'ash-4', studentId: 'stud-3e-1', status: 'PRESENT', reason: '' },
  { id: 'ar-4-2', sheetId: 'ash-4', studentId: 'stud-3e-2', status: 'PRESENT', reason: '' },
  { id: 'ar-4-3', sheetId: 'ash-4', studentId: 'stud-3e-3', status: 'ABSENT', reason: 'MALADIE' },
  { id: 'ar-4-4', sheetId: 'ash-4', studentId: 'stud-3e-4', status: 'PRESENT', reason: '' },
  { id: 'ar-4-5', sheetId: 'ash-4', studentId: 'stud-3e-5', status: 'PRESENT', reason: '' },
  { id: 'ar-4-6', sheetId: 'ash-4', studentId: 'stud-3e-6', status: 'LATE', reason: 'AUTRE' },
  { id: 'ar-4-7', sheetId: 'ash-4', studentId: 'stud-3e-7', status: 'PRESENT', reason: '' },
  { id: 'ar-4-8', sheetId: 'ash-4', studentId: 'stud-3e-8', status: 'PRESENT', reason: '' },
  { id: 'ar-4-9', sheetId: 'ash-4', studentId: 'stud-3e-9', status: 'PRESENT', reason: '' },
  { id: 'ar-4-10', sheetId: 'ash-4', studentId: 'stud-3e-10', status: 'PRESENT', reason: '' }
];

// Initial evaluations
export const INITIAL_EVALUATIONS: Evaluation[] = [
  // Séquence 1 - Terminale C
  { id: 'eval-tc-s1-math', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', sequenceId: 1, termId: 1, type: 'CONTROLE', coefficient: 1, date: '2025-10-15', status: 'VALIDATED', title: 'Devoir de rentrée - Algèbre' },
  { id: 'eval-tc-s1-phys', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', sequenceId: 1, termId: 1, type: 'DEVOIR', coefficient: 1, date: '2025-10-18', status: 'VALIDATED', title: 'Cinématique du point' },
  { id: 'eval-tc-s1-fran', classId: 'class-tc', subjectId: 'subj-fran', teacherId: 'teach-2', sequenceId: 1, termId: 1, type: 'CONTROLE', coefficient: 1, date: '2025-10-22', status: 'VALIDATED', title: 'Dissertation littéraire' },

  // Séquence 2 - Terminale C
  { id: 'eval-tc-s2-math', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', sequenceId: 2, termId: 1, type: 'EXAMEN', coefficient: 2, date: '2025-11-28', status: 'VALIDATED', title: 'Composition Mathématiques Trimestre 1' },
  { id: 'eval-tc-s2-phys', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', sequenceId: 2, termId: 1, type: 'EXAMEN', coefficient: 2, date: '2025-12-02', status: 'VALIDATED', title: 'Composition de Physique Trimestre 1' },
  
  // Séquence 3 - Terminale C
  { id: 'eval-tc-s3-math', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', sequenceId: 3, termId: 2, type: 'CONTROLE', coefficient: 1, date: '2026-02-10', status: 'VALIDATED', title: 'Nombres complexes' },
  { id: 'eval-tc-s3-phys', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', sequenceId: 3, termId: 2, type: 'DEVOIR', coefficient: 1, date: '2026-02-14', status: 'VALIDATED', title: 'Électromagnétisme' },

  // Séquence 4 - Terminale C
  { id: 'eval-tc-s4-math', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', sequenceId: 4, termId: 2, type: 'EXAMEN', coefficient: 2, date: '2026-03-24', status: 'VALIDATED', title: 'Composition Mathématiques Trimestre 2' },
  { id: 'eval-tc-s4-phys', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', sequenceId: 4, termId: 2, type: 'EXAMEN', coefficient: 2, date: '2026-03-26', status: 'VALIDATED', title: 'Composition Physique Trimestre 2' },

  // Séquence 5 (Séquence en cours de saisie/validation) - Terminale C
  { id: 'eval-tc-s5-math', classId: 'class-tc', subjectId: 'subj-math', teacherId: 'teach-1', sequenceId: 5, termId: 3, type: 'CONTROLE', coefficient: 1, date: '2026-05-18', status: 'PENDING_VALIDATION', title: 'Probabilités & Géométrie Espace' },
  { id: 'eval-tc-s5-phys', classId: 'class-tc', subjectId: 'subj-phys', teacherId: 'teach-3', sequenceId: 5, termId: 3, type: 'DEVOIR', coefficient: 1, date: '2026-05-22', status: 'DRAFT', title: 'Optique ondulatoire' },
  { id: 'eval-tc-s5-fran', classId: 'class-tc', subjectId: 'subj-fran', teacherId: 'teach-2', sequenceId: 5, termId: 3, type: 'CONTROLE', coefficient: 1, date: '2026-05-25', status: 'VALIDATED', title: 'Commentaire de texte' },
  { id: 'eval-tc-s5-info', classId: 'class-tc', subjectId: 'subj-info', teacherId: 'teach-1', sequenceId: 5, termId: 3, type: 'CONTROLE', coefficient: 1, date: '2026-05-29', status: 'DRAFT', title: 'Algorithmique & Python' },

  // Séquence 5 - 3ème Allemand
  { id: 'eval-3e-s5-math', classId: 'class-3e', subjectId: 'subj-math', teacherId: 'teach-1', sequenceId: 5, termId: 3, type: 'CONTROLE', coefficient: 1, date: '2026-05-20', status: 'VALIDATED', title: 'Équations et Inéquations' },
  { id: 'eval-3e-s5-fran', classId: 'class-3e', subjectId: 'subj-fran', teacherId: 'teach-2', sequenceId: 5, termId: 3, type: 'DEVOIR', coefficient: 1, date: '2026-05-24', status: 'PENDING_VALIDATION', title: 'Rédaction et Orthographe' }
];

// Prepopulated Marks out of 20
export const INITIAL_MARKS: Mark[] = [
  // Séquence 1 Math Terminale C
  { id: 'm-tc-s1-m1', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-1', value: 14.5, comment: 'Bon travail' },
  { id: 'm-tc-s1-m2', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-2', value: 16, comment: 'Excellent' },
  { id: 'm-tc-s1-m3', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-3', value: 9.5, comment: 'Insuffisant, doit travailler les bases' },
  { id: 'm-tc-s1-m4', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-4', value: 12, comment: 'Assez bien' },
  { id: 'm-tc-s1-m5', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-5', value: 11, comment: 'Passable' },
  { id: 'm-tc-s1-m6', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-6', value: 18, comment: 'Excellent esprit logique' },
  { id: 'm-tc-s1-m7', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-7', value: 13, comment: 'Bonne participation' },
  { id: 'm-tc-s1-m8', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-8', value: 15.5, comment: 'Très bon devoir' },
  { id: 'm-tc-s1-m9', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-9', value: 8, comment: 'Trop de lacunes' },
  { id: 'm-tc-s1-m10', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-10', value: 10.5, comment: 'Juste la moyenne' },
  { id: 'm-tc-s1-m11', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-11', value: 12.5 },
  { id: 'm-tc-s1-m12', evaluationId: 'eval-tc-s1-math', studentId: 'stud-tc-12', value: 14 },

  // Séquence 2 Math Terminale C (Exam - Weight 2)
  { id: 'm-tc-s2-m1', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-1', value: 13 },
  { id: 'm-tc-s2-m2', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-2', value: 17 },
  { id: 'm-tc-s2-m3', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-3', value: 10 },
  { id: 'm-tc-s2-m4', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-4', value: 11.5 },
  { id: 'm-tc-s2-m5', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-5', value: 12 },
  { id: 'm-tc-s2-m6', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-6', value: 19 },
  { id: 'm-tc-s2-m7', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-7', value: 14 },
  { id: 'm-tc-s2-m8', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-8', value: 15 },
  { id: 'm-tc-s2-m9', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-9', value: 7.5, comment: 'Manque cruel d\'investissement' },
  { id: 'm-tc-s2-m10', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-10', value: 11 },
  { id: 'm-tc-s2-m11', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-11', value: 13 },
  { id: 'm-tc-s2-m12', evaluationId: 'eval-tc-s2-math', studentId: 'stud-tc-12', value: 13.5 },

  // Séquence 3 Math Terminale C
  { id: 'm-tc-s3-m1', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-1', value: 15 },
  { id: 'm-tc-s3-m2', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-2', value: 16.5 },
  { id: 'm-tc-s3-m3', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-3', value: 11 },
  { id: 'm-tc-s3-m4', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-4', value: 13 },
  { id: 'm-tc-s3-m5', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-5', value: 10 },
  { id: 'm-tc-s3-m6', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-6', value: 18.5 },
  { id: 'm-tc-s3-m7', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-7', value: 12 },
  { id: 'm-tc-s3-m8', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-8', value: 16 },
  { id: 'm-tc-s3-m9', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-9', value: 9 },
  { id: 'm-tc-s3-m10', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-10', value: 11.5 },
  { id: 'm-tc-s3-m11', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-11', value: 12 },
  { id: 'm-tc-s3-m12', evaluationId: 'eval-tc-s3-math', studentId: 'stud-tc-12', value: 14.5 },

  // Séquence 4 Math Terminale C
  { id: 'm-tc-s4-m1', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-1', value: 14 },
  { id: 'm-tc-s4-m2', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-2', value: 15 },
  { id: 'm-tc-s4-m3', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-3', value: 10.5 },
  { id: 'm-tc-s4-m4', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-4', value: 12.5 },
  { id: 'm-tc-s4-m5', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-5', value: 11 },
  { id: 'm-tc-s4-m6', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-6', value: 19.5 },
  { id: 'm-tc-s4-m7', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-7', value: 13.5 },
  { id: 'm-tc-s4-m8', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-8', value: 14.5 },
  { id: 'm-tc-s4-m9', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-9', value: 8 },
  { id: 'm-tc-s4-m10', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-10', value: 12 },
  { id: 'm-tc-s4-m11', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-11', value: 11 },
  { id: 'm-tc-s4-m12', evaluationId: 'eval-tc-s4-math', studentId: 'stud-tc-12', value: 13 },

  // Séquence 5 Math Terminale C (PENDING_VALIDATION - Real values entered)
  { id: 'm-tc-s5-m1', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-1', value: 15.5 },
  { id: 'm-tc-s5-m2', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-2', value: 16 },
  { id: 'm-tc-s5-m3', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-3', value: 11.5 },
  { id: 'm-tc-s5-m4', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-4', value: 14 },
  { id: 'm-tc-s5-m5', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-5', value: 12.5 },
  { id: 'm-tc-s5-m6', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-6', value: 18 },
  { id: 'm-tc-s5-m7', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-7', value: 13 },
  { id: 'm-tc-s5-m8', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-8', value: 17 },
  { id: 'm-tc-s5-m9', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-9', value: 9 },
  { id: 'm-tc-s5-m10', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-10', value: 13.5 },
  { id: 'm-tc-s5-m11', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-11', value: 11.5 },
  { id: 'm-tc-s5-m12', evaluationId: 'eval-tc-s5-math', studentId: 'stud-tc-12', value: 14 },

  // Séquence 5 Physics Terminale C (DRAFT - partially entered)
  { id: 'm-tc-s5-p1', evaluationId: 'eval-tc-s5-phys', studentId: 'stud-tc-1', value: 13 },
  { id: 'm-tc-s5-p2', evaluationId: 'eval-tc-s5-phys', studentId: 'stud-tc-2', value: 15 },
  { id: 'm-tc-s5-p3', evaluationId: 'eval-tc-s5-phys', studentId: 'stud-tc-3', value: 8 },
  { id: 'm-tc-s5-p4', evaluationId: 'eval-tc-s5-phys', studentId: 'stud-tc-4', value: 12 },
  { id: 'm-tc-s5-p5', evaluationId: 'eval-tc-s5-phys', studentId: 'stud-tc-5', value: 11 },
  { id: 'm-tc-s5-p6', evaluationId: 'eval-tc-s5-phys', studentId: 'stud-tc-6', value: 17.5 },
  // Students 7-12 are missing grades in this draft

  // Séquence 5 French Terminale C (VALIDATED)
  { id: 'm-tc-s5-f1', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-1', value: 12 },
  { id: 'm-tc-s5-f2', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-2', value: 13.5 },
  { id: 'm-tc-s5-f3', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-3', value: 11 },
  { id: 'm-tc-s5-f4', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-4', value: 14.5 },
  { id: 'm-tc-s5-f5', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-5', value: 10 },
  { id: 'm-tc-s5-f6', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-6', value: 12.5 },
  { id: 'm-tc-s5-f7', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-7', value: 11.5 },
  { id: 'm-tc-s5-f8', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-8', value: 14 },
  { id: 'm-tc-s5-f9', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-9', value: 10.5 },
  { id: 'm-tc-s5-f10', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-10', value: 11 },
  { id: 'm-tc-s5-f11', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-11', value: 13 },
  { id: 'm-tc-s5-f12', evaluationId: 'eval-tc-s5-fran', studentId: 'stud-tc-12', value: 12 },

  // Séquence 5 Math 3ème (VALIDATED)
  { id: 'm-3e-s5-m1', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-1', value: 10.5 },
  { id: 'm-3e-s5-m2', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-2', value: 14.5 },
  { id: 'm-3e-s5-m3', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-3', value: 8 },
  { id: 'm-3e-s5-m4', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-4', value: 17 },
  { id: 'm-3e-s5-m5', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-5', value: 11.5 },
  { id: 'm-3e-s5-m6', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-6', value: 9 },
  { id: 'm-3e-s5-m7', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-7', value: 15 },
  { id: 'm-3e-s5-m8', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-8', value: 12 },
  { id: 'm-3e-s5-m9', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-9', value: 13.5 },
  { id: 'm-3e-s5-m10', evaluationId: 'eval-3e-s5-math', studentId: 'stud-3e-10', value: 11 },

  // Séquence 5 French 3ème (PENDING_VALIDATION)
  { id: 'm-3e-s5-f1', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-1', value: 13 },
  { id: 'm-3e-s5-f2', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-2', value: 11.5 },
  { id: 'm-3e-s5-f3', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-3', value: 12 },
  { id: 'm-3e-s5-f4', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-4', value: 15 },
  { id: 'm-3e-s5-f5', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-5', value: 10 },
  { id: 'm-3e-s5-f6', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-6', value: 14.5 },
  { id: 'm-3e-s5-f7', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-7', value: 11 },
  { id: 'm-3e-s5-f8', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-8', value: 12.5 },
  { id: 'm-3e-s5-f9', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-9', value: 9.5 },
  { id: 'm-3e-s5-f10', evaluationId: 'eval-3e-s5-fran', studentId: 'stud-3e-10', value: 13 }
];

export const INITIAL_SCHOOLS: SchoolTenant[] = [
  {
    id: 'school-lby',
    name: 'Lycée Bilingue de Yaoundé',
    slogan: 'Discipline - Travail - Succès',
    logoEmoji: '🏫',
    primaryColor: 'blue',
    themePrimary: '#3b82f6',
    themeSecondary: '#1e293b',
    themeAccent: '#f59e0b',
    address: 'Essos, Yaoundé, Cameroun',
    phone: '+237 222 30 45 89',
    email: 'contact@lbyaounde.cm',
    activeSchoolYear: '2025-2026',
    systemVersion: 'v2.5.0',
    licenseStatus: 'Active'
  },
  {
    id: 'school-vogt',
    name: 'Collège Jean-Tabi / Vogt',
    slogan: 'L\'excellence à la lumière de la foi',
    logoEmoji: '⛪',
    primaryColor: 'emerald',
    themePrimary: '#10b981',
    themeSecondary: '#0f172a',
    themeAccent: '#8b5cf6',
    address: 'Mvolyé, Yaoundé, Cameroun',
    phone: '+237 222 21 02 44',
    email: 'administration@collegevogt.org',
    activeSchoolYear: '2025-2026',
    systemVersion: 'v2.4.8',
    licenseStatus: 'Active'
  },
  {
    id: 'school-lcb',
    name: 'Lycée Classique de Bafoussam',
    slogan: 'La rigueur scientifique et morale',
    logoEmoji: '🔬',
    primaryColor: 'indigo',
    themePrimary: '#6366f1',
    themeSecondary: '#1e1b4b',
    themeAccent: '#f43f5e',
    address: 'Bafoussam, Ouest Cameroun',
    phone: '+237 233 44 12 77',
    email: 'bafoussam@minesec.gov.cm',
    activeSchoolYear: '2025-2026',
    systemVersion: 'v2.5.0',
    licenseStatus: 'Pending'
  },
  {
    id: 'school-lsd',
    name: 'Lycée Jost de Douala',
    slogan: 'Savoir - Devoir - Devenir',
    logoEmoji: '🚢',
    primaryColor: 'rose',
    themePrimary: '#f43f5e',
    themeSecondary: '#4c0519',
    themeAccent: '#fbbf24',
    address: 'Akwa, Douala, Cameroun',
    phone: '+237 233 42 09 11',
    email: 'douala.jost@edu.cm',
    activeSchoolYear: '2025-2026',
    systemVersion: 'v2.3.9',
    licenseStatus: 'Expired'
  },
  {
    id: 'school-fako',
    name: 'Collège Fako',
    slogan: 'Savoir - Discipline - Réussite',
    logoEmoji: '🎓',
    primaryColor: 'amber',
    themePrimary: '#f59e0b',
    themeSecondary: '#1c1917',
    themeAccent: '#d97706',
    address: 'Fako, Région du Sud-Ouest, Cameroun',
    phone: '+237 6XX XX XX XX',
    email: 'collegefako@gmail.com',
    activeSchoolYear: '2025-2026',
    systemVersion: 'v2.5.0',
    licenseStatus: 'Active'
  },
  {
    id: 'school-fapo',
    name: 'Collège Fapo',
    slogan: 'Discipline - Rigueur - Réussite',
    logoEmoji: '🏫',
    primaryColor: 'emerald',
    themePrimary: '#10b981',
    themeSecondary: '#064e3b',
    themeAccent: '#3b82f6',
    address: 'Fapo, Région du Centre, Cameroun',
    phone: '+237 650 00 11 22',
    email: 'collegefapo@gmail.com',
    activeSchoolYear: '2025-2026',
    systemVersion: 'v2.5.0',
    licenseStatus: 'Active'
  }
];

export const INITIAL_ROLES: AdminRole[] = [
  {
    id: 'role-proviseur',
    type: 'proviseur',
    label: DEFAULT_ROLE_PERMISSIONS.proviseur.label,
    description: DEFAULT_ROLE_PERMISSIONS.proviseur.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.proviseur.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-censeur',
    type: 'censeur',
    label: DEFAULT_ROLE_PERMISSIONS.censeur.label,
    description: DEFAULT_ROLE_PERMISSIONS.censeur.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.censeur.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-surveillant',
    type: 'surveillant_general',
    label: DEFAULT_ROLE_PERMISSIONS.surveillant_general.label,
    description: DEFAULT_ROLE_PERMISSIONS.surveillant_general.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.surveillant_general.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-secretaire',
    type: 'secretaire',
    label: DEFAULT_ROLE_PERMISSIONS.secretaire.label,
    description: DEFAULT_ROLE_PERMISSIONS.secretaire.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.secretaire.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-econome',
    type: 'econome',
    label: DEFAULT_ROLE_PERMISSIONS.econome.label,
    description: DEFAULT_ROLE_PERMISSIONS.econome.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.econome.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-intendant',
    type: 'intendant',
    label: DEFAULT_ROLE_PERMISSIONS.intendant.label,
    description: DEFAULT_ROLE_PERMISSIONS.intendant.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.intendant.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-enseignant',
    type: 'enseignant',
    label: DEFAULT_ROLE_PERMISSIONS.enseignant.label,
    description: DEFAULT_ROLE_PERMISSIONS.enseignant.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.enseignant.permissions,
    schoolId: 'school-lby'
  },
  {
    id: 'role-parent',
    type: 'parent',
    label: DEFAULT_ROLE_PERMISSIONS.parent.label,
    description: DEFAULT_ROLE_PERMISSIONS.parent.description,
    permissions: DEFAULT_ROLE_PERMISSIONS.parent.permissions,
    schoolId: 'school-lby'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Dr. Ahmadou Bello',
    email: 'proviseur@lbyaounde.cm',
    phone: '+237 670 11 22 33',
    roleId: 'role-proviseur',
    roleType: 'proviseur',
    schoolId: 'school-lby',
    isActive: true
  },
  {
    id: 'staff-2',
    name: 'M. Jean-Paul Mbarga',
    email: 'censeur@lbyaounde.cm',
    phone: '+237 691 44 55 66',
    roleId: 'role-censeur',
    roleType: 'censeur',
    schoolId: 'school-lby',
    isActive: true
  },
  {
    id: 'staff-3',
    name: 'Mme Christine Ngo Bassong',
    email: 'surveillant@lbyaounde.cm',
    phone: '+237 655 77 88 99',
    roleId: 'role-surveillant',
    roleType: 'surveillant_general',
    schoolId: 'school-lby',
    isActive: true
  },
  {
    id: 'staff-4',
    name: 'Mme Suzanne Ndongo',
    email: 'secretariat@lbyaounde.cm',
    phone: '+237 679 23 45 67',
    roleId: 'role-secretaire',
    roleType: 'secretaire',
    schoolId: 'school-lby',
    isActive: true
  },
  {
    id: 'staff-5',
    name: 'M. Patrick Atangana',
    email: 'economat@lbyaounde.cm',
    phone: '+237 698 12 34 56',
    roleId: 'role-econome',
    roleType: 'econome',
    schoolId: 'school-lby',
    isActive: true
  },
  {
    id: 'staff-6',
    name: 'M. Jean-Marc Kamga',
    email: 'jm.kamga@academic.cm',
    phone: '+237 677 88 99 11',
    roleId: 'role-enseignant',
    roleType: 'enseignant',
    schoolId: 'school-lby',
    teacherId: 'teach-1',
    isActive: true
  },
  {
    id: 'staff-7',
    name: 'M. Samuel Eto\'o Sr.',
    email: 'etoo.parent@gmail.com',
    phone: '+237 677 88 99 00',
    roleId: 'role-parent',
    roleType: 'parent',
    schoolId: 'school-lby',
    studentIds: ['stud-tc-1'],
    isActive: true
  }
];


