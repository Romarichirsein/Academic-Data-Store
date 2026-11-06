import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyD9DT541sAEDGhM3a_zNvxDFbQDEdoN4fA",
  authDomain: "academic-data-store.firebaseapp.com",
  projectId: "academic-data-store",
  storageBucket: "academic-data-store.firebasestorage.app",
  messagingSenderId: "434659010881",
  appId: "1:434659010881:web:b547f4cdc60b59523319c0"
};

const databaseId = "ai-studio-academicdatastor-70e5e4dd-682c-4b6e-84e4-ebc88e3fdf52";
const app = initializeApp(config);
const db = initializeFirestore(app, {}, databaseId);

async function seed() {
  console.log("Seeding Collège Fapo into Firestore...");

  // 1. School
  const school = {
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
    licenseStatus: 'Active',
    enableHomeworkTracking: true,
    enableAttendanceTracking: true
  };
  await setDoc(doc(db, 'schools', 'school-fapo'), school);
  console.log("Seeded school: school-fapo");

  // 2. User Account
  const userAccount = {
    id: 'acc-fapo-admin',
    schoolId: 'school-fapo',
    fullName: 'Direction Collège Fapo',
    username: 'collegefapo@gmail.com',
    email: 'collegefapo@gmail.com',
    phone: '+237 650 00 11 22',
    role: 'PROVISEUR',
    status: 'ACTIF',
    initialPassword: 'fapo2026',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'userAccounts', 'acc-fapo-admin'), userAccount);
  console.log("Seeded userAccount: acc-fapo-admin");

  // 3. Classes
  const classes = [
    {
      id: 'cls-fapo-6e',
      name: 'Sixième 6ème Moderne',
      code: '6EME',
      level: 'Premier Cycle',
      section: 'Générale',
      mainRoom: 'Salle 101',
      capacity: 40,
      studentCount: 28,
      schoolId: 'school-fapo'
    },
    {
      id: 'cls-fapo-3e',
      name: 'Troisième 3ème Espagnol',
      code: '3EME',
      level: 'Premier Cycle',
      section: 'Générale',
      mainRoom: 'Salle 202',
      capacity: 35,
      studentCount: 22,
      schoolId: 'school-fapo'
    },
    {
      id: 'cls-fapo-tlec',
      name: 'Terminale C (Scientifique)',
      code: 'TLE-C',
      level: 'Second Cycle',
      section: 'Scientifique',
      mainRoom: 'Salle 305 - Labo',
      capacity: 30,
      studentCount: 18,
      schoolId: 'school-fapo'
    }
  ];
  for (const c of classes) {
    await setDoc(doc(db, 'classes', c.id), c);
  }
  console.log("Seeded classes:", classes.length);

  // 4. Students
  const students = [
    {
      id: 'stud-fapo-001',
      matricule: 'FAPO-2026-001',
      firstName: 'Paul',
      lastName: 'KAMTO',
      gender: 'M',
      classId: 'cls-fapo-tlec',
      dateOfBirth: '2008-05-14',
      parentName: 'M. Kamto Ernest',
      parentPhone: '+237 671 23 45 67',
      parentEmail: 'kamto.parent@gmail.com',
      schoolId: 'school-fapo',
      status: 'INSCRIT'
    },
    {
      id: 'stud-fapo-002',
      matricule: 'FAPO-2026-002',
      firstName: 'Christelle',
      lastName: 'FOTSO',
      gender: 'F',
      classId: 'cls-fapo-tlec',
      dateOfBirth: '2008-09-22',
      parentName: 'Mme Fotso Claire',
      parentPhone: '+237 699 87 65 43',
      parentEmail: 'fotso.claire@gmail.com',
      schoolId: 'school-fapo',
      status: 'INSCRIT'
    },
    {
      id: 'stud-fapo-003',
      matricule: 'FAPO-2026-003',
      firstName: 'Alain',
      lastName: 'NGUEMA',
      gender: 'M',
      classId: 'cls-fapo-3e',
      dateOfBirth: '2011-02-10',
      parentName: 'M. Nguema Paul',
      parentPhone: '+237 655 12 34 56',
      parentEmail: 'nguema.famille@gmail.com',
      schoolId: 'school-fapo',
      status: 'INSCRIT'
    }
  ];
  for (const s of students) {
    await setDoc(doc(db, 'students', s.id), s);
  }
  console.log("Seeded students:", students.length);

  console.log("ALL DATA FOR COLLEGE FAPO SEEDED SUCCESSFULLY!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
