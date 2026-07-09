import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SchoolTenant, AttendanceSheet, AttendanceRecord, Student, Subject } from '../types';
import { SUBJECTS } from '../data/mockData';

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove leading hash if present
  const cleaned = hex.replace('#', '');
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper to load an image URL as a base64 or HTMLImageElement
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates an elegant brand-compliant PDF of an Attendance Sheet (Feuille de Présence)
 */
export async function generateAttendancePDF(
  school: SchoolTenant,
  sheet: AttendanceSheet,
  sheetRecords: AttendanceRecord[],
  className: string,
  students: Student[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = school.themePrimary || '#3b82f6';
  const secondaryColor = school.themeSecondary || '#1e293b';
  const accentColor = school.themeAccent || '#f59e0b';

  const rgbPrimary = hexToRgb(primaryColor);
  const rgbSecondary = hexToRgb(secondaryColor);
  const rgbAccent = hexToRgb(accentColor);

  // 1. Draw header decorative bands
  doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.rect(0, 0, 210, 4, 'F'); // Top primary color strip

  doc.setFillColor(rgbAccent.r, rgbAccent.g, rgbAccent.b);
  doc.rect(0, 4, 210, 1.5, 'F'); // Thin accent color strip

  // 2. Load and Draw Logo / Crest
  let logoDrawn = false;
  if (school.logoUrl) {
    try {
      const img = await loadImage(school.logoUrl);
      if (img) {
        doc.addImage(img, 'PNG', 15, 12, 18, 18);
        logoDrawn = true;
      }
    } catch (e) {
      console.warn('Failed to load logo image, falling back to crest drawing', e);
    }
  }

  if (!logoDrawn) {
    // Draw premium circular crest with school initials
    doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
    doc.ellipse(24, 21, 9, 9, 'F');
    
    doc.setDrawColor(rgbAccent.r, rgbAccent.g, rgbAccent.b);
    doc.setLineWidth(0.6);
    doc.ellipse(24, 21, 9, 9, 'D');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    
    const initials = school.name
      .replace(/Lycée|Collège|d'/gi, '')
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    
    doc.text(initials, 24, 22.2, { align: 'center' });
  }

  // 3. Write School Identity
  doc.setTextColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(school.name, 38, 17);

  doc.setTextColor(110, 110, 110);
  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(8.5);
  doc.text(school.slogan || 'Discipline - Travail - Succès', 38, 21.5);

  doc.setTextColor(140, 140, 140);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${school.address || 'Yaoundé, Cameroun'}  |  Tel: ${school.phone || ''}`, 38, 25.5);

  // Republic watermark/header on top right
  doc.setTextColor(100, 100, 100);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('RÉPUBLIQUE DU CAMEROUN', 195, 14, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  doc.text('Paix - Travail - Patrie', 195, 17.5, { align: 'right' });
  doc.text('MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES', 195, 21, { align: 'right' });

  // 4. Document Title & Session Info Block
  doc.setFillColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
  doc.rect(15, 33, 180, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FICHE DE PRÉSENCE JOURNALIÈRE', 20, 39.5);

  const activeSubject = SUBJECTS.find(s => s.id === sheet.subjectId)?.name || 'Matière';
  doc.setTextColor(rgbAccent.r, rgbAccent.g, rgbAccent.b);
  doc.text(`COURS : ${activeSubject.toUpperCase()}`, 190, 39.5, { align: 'right' });

  // 5. Metadata Grid
  doc.setTextColor(60, 70, 90);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);

  // Box border
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.3);
  doc.rect(15, 46, 180, 18, 'D');

  // Metadata labels & values
  doc.setFont('Helvetica', 'bold');
  doc.text('Classe d\'Enseignement :', 18, 52);
  doc.setFont('Helvetica', 'normal');
  doc.text(className, 58, 52);

  doc.setFont('Helvetica', 'bold');
  doc.text('Date de la séance :', 18, 59);
  doc.setFont('Helvetica', 'normal');
  doc.text(sheet.date, 58, 59);

  doc.setFont('Helvetica', 'bold');
  doc.text('Créneau Horaire :', 110, 52);
  doc.setFont('Helvetica', 'normal');
  doc.text(sheet.timeSlot, 145, 52);

  doc.setFont('Helvetica', 'bold');
  doc.text('Période Académique :', 110, 59);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Séquence ${sheet.sequenceId} (Année ${school.activeSchoolYear || '2025-2026'})`, 145, 59);

  // 6. Stats & Summary Bar
  const stats = {
    present: sheetRecords.filter(r => r.status === 'PRESENT').length,
    late: sheetRecords.filter(r => r.status === 'LATE').length,
    absent: sheetRecords.filter(r => r.status === 'ABSENT').length,
    total: sheetRecords.length
  };
  const rate = stats.total > 0 ? ((stats.present + stats.late) / stats.total * 100).toFixed(1) : '100';

  doc.setFillColor(245, 248, 250);
  doc.rect(15, 68, 180, 10, 'F');
  doc.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.line(15, 68, 15, 78); // Left border highlight

  doc.setTextColor(80, 90, 110);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`RÉSUMÉ D'ASSIDUITÉ  --  Total élèves: ${stats.total}`, 20, 74.5);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Présents: ${stats.present}  |  En Retard: ${stats.late}  |  Absents: ${stats.absent}`, 80, 74.5);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.text(`Taux de Présence: ${rate}%`, 190, 74.5, { align: 'right' });

  // 7. Core Nominal Roll Table
  const tableRows = sheetRecords.map((rec, index) => {
    const student = students.find(s => s.id === rec.studentId);
    const fullName = student ? `${student.lastName} ${student.firstName}` : 'Élève inconnu';
    
    let statusText = 'PRÉSENT';
    if (rec.status === 'ABSENT') statusText = 'ABSENT';
    else if (rec.status === 'LATE') statusText = 'RETARD';

    let reasonText = '-';
    if (rec.reason === 'MALADIE') reasonText = 'Justifié (Maladie)';
    else if (rec.reason === 'AUTORISE') reasonText = 'Autorisé';
    else if (rec.reason === 'NON_AUTORISE') reasonText = 'Non Autorisé';

    return [
      (index + 1).toString(),
      fullName,
      statusText,
      reasonText,
      rec.comment || '-'
    ];
  });

  (doc as any).autoTable({
    startY: 83,
    margin: { left: 15, right: 15 },
    head: [['N°', 'Nom & Prénoms de l\'Élève', 'Statut', 'Motif de l\'absence', 'Commentaire / Notes']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [rgbPrimary.r, rgbPrimary.g, rgbPrimary.b],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 2) {
        const text = data.cell.text[0];
        if (text === 'ABSENT') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose/red for absent
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'RETARD') {
          data.cell.styles.textColor = [245, 158, 11]; // Orange for late
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald for present
        }
      }
    },
    styles: {
      font: 'Helvetica',
      cellPadding: 2,
    },
  });

  // 8. Signatures Block
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  if (finalY < 250) {
    // Add signature space
    doc.setDrawColor(230, 230, 230);
    doc.line(15, finalY - 5, 195, finalY - 5);

    doc.setTextColor(110, 110, 110);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text(`Document généré électroniquement par l'établissement pour la Séquence ${sheet.sequenceId}.`, 15, finalY);

    // Left Signature
    doc.setTextColor(80, 80, 80);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Signature de l\'Enseignant', 15, finalY + 8);
    doc.setFont('Helvetica', 'normal');
    doc.text('Visé le : ________________', 15, finalY + 14);

    // Right Signature
    doc.setFont('Helvetica', 'bold');
    doc.text('Visa de la Surveillance Générale', 195, finalY + 8, { align: 'right' });
    doc.setFont('Helvetica', 'normal');
    doc.text('Censeur / Surveillant Général', 195, finalY + 14, { align: 'right' });
  }

  // Save the PDF document
  doc.save(`Feuille_Presence_${className.replace(/\s+/g, '_')}_${sheet.date}.pdf`);
}

/**
 * Generates an elegant brand-compliant Student Report Card PDF (Bulletin de Notes)
 */
export async function generateBulletinPDF(
  school: SchoolTenant,
  student: Student,
  className: string,
  subjectsPerformance: any[],
  overallAverage: number | null,
  sequenceId: number,
  totalCoeffs: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = school.themePrimary || '#3b82f6';
  const secondaryColor = school.themeSecondary || '#1e293b';
  const accentColor = school.themeAccent || '#f59e0b';

  const rgbPrimary = hexToRgb(primaryColor);
  const rgbSecondary = hexToRgb(secondaryColor);
  const rgbAccent = hexToRgb(accentColor);

  // 1. Decorative borders
  doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.rect(0, 0, 210, 4.5, 'F');

  doc.setFillColor(rgbAccent.r, rgbAccent.g, rgbAccent.b);
  doc.rect(0, 4.5, 210, 1.5, 'F');

  // 2. School Logo Header
  let logoDrawn = false;
  if (school.logoUrl) {
    try {
      const img = await loadImage(school.logoUrl);
      if (img) {
        doc.addImage(img, 'PNG', 15, 12, 20, 20);
        logoDrawn = true;
      }
    } catch (e) {
      console.warn('Failed to load logo in bulletin, using vector crest', e);
    }
  }

  if (!logoDrawn) {
    doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
    doc.ellipse(25, 22, 10, 10, 'F');
    doc.setDrawColor(rgbAccent.r, rgbAccent.g, rgbAccent.b);
    doc.setLineWidth(0.6);
    doc.ellipse(25, 22, 10, 10, 'D');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    const initials = school.name
      .replace(/Lycée|Collège|d'/gi, '')
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    doc.text(initials, 25, 23.3, { align: 'center' });
  }

  // 3. School Details
  doc.setTextColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(school.name, 40, 18);

  doc.setTextColor(100, 100, 100);
  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(9);
  doc.text(school.slogan || 'Discipline - Travail - Succès', 40, 22.5);

  doc.setTextColor(130, 130, 130);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Adresse: ${school.address || 'Yaoundé'}  |  E-mail: ${school.email || ''}`, 40, 27);

  // State Banner on top right
  doc.setTextColor(110, 110, 110);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('RÉPUBLIQUE DU CAMEROUN', 195, 14, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  doc.text('Paix - Travail - Patrie', 195, 17.5, { align: 'right' });
  doc.text('MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES', 195, 21, { align: 'right' });

  // Divider Line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(15, 34, 195, 34);

  // 4. Report Card Title Block
  doc.setFillColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
  doc.rect(15, 38, 180, 11, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BULLETIN DE NOTES ACADÉMIQUES', 20, 45);

  doc.setTextColor(rgbAccent.r, rgbAccent.g, rgbAccent.b);
  doc.setFontSize(10.5);
  doc.text(`SÉQUENCE ${sequenceId}  |  AN-SCOLAIRE ${school.activeSchoolYear || '2025-2026'}`, 190, 45, { align: 'right' });

  // 5. Student Info Card Header
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(218, 225, 231);
  doc.setLineWidth(0.3);
  doc.rect(15, 53, 180, 24, 'FD');

  // Draw a small left banner marker
  doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.rect(15, 53, 2.5, 24, 'F');

  doc.setTextColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, 22, 60);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(80, 90, 100);
  doc.text(`Identifiant : ${student.id}`, 22, 65);
  doc.text(`Classe d'inscription : ${className}`, 22, 70);

  // Parents Info in right column
  doc.setFont('Helvetica', 'bold');
  doc.text('Informations Parent / tuteur :', 110, 60);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Nom : ${student.parentName}`, 110, 65);
  doc.text(`Téléphone : ${student.parentPhone}`, 110, 70);
  doc.text(`Courriel : ${student.parentEmail || '-'}`, 110, 74);

  // 6. Subject Table Headers & Content
  const tableRows = subjectsPerformance.map((sp) => {
    let noteString = '-';
    if (sp.grades.length > 0) {
      noteString = sp.grades
        .map((g: any) => `${g.value}/20${g.coeff > 1 ? ` (x${g.coeff})` : ''}`)
        .join(', ');
    }

    const averageText = sp.average !== null ? `${sp.average} / 20` : 'N/A';
    
    // Auto-appreciations based on grade
    let appreciationText = 'Travail satisfaisant';
    if (sp.average !== null) {
      if (sp.average >= 16) appreciationText = 'Excellent travail, félicitations';
      else if (sp.average >= 14) appreciationText = 'Très bon trimestre';
      else if (sp.average >= 12) appreciationText = 'Assez bon travail, poursuivez';
      else if (sp.average >= 10) appreciationText = 'Moyen, peut mieux faire';
      else if (sp.average >= 8) appreciationText = 'Insuffisant, s\'impliquer davantage';
      else appreciationText = 'Très insuffisant, redoubler d\'efforts';
    }

    return [
      sp.code,
      sp.subjectName,
      sp.coefficient.toString(),
      noteString,
      averageText,
      appreciationText
    ];
  });

  (doc as any).autoTable({
    startY: 82,
    margin: { left: 15, right: 15 },
    head: [['Code', 'Matière', 'Coeff', 'Évaluations Saisies', 'Moyenne /20', 'Appréciations Enseignant']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [rgbPrimary.r, rgbPrimary.g, rgbPrimary.b],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 40 },
      4: { cellWidth: 23, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 40, fontStyle: 'oblique' },
    },
    didParseCell: (data: any) => {
      // Highlight failed averages in rose
      if (data.section === 'body' && data.column.index === 4) {
        const text = data.cell.text[0];
        if (text && text !== 'N/A') {
          const val = parseFloat(text);
          if (val < 10) {
            data.cell.styles.textColor = [225, 29, 72]; // rose red
          } else {
            data.cell.styles.textColor = [5, 150, 105]; // green
          }
        }
      }
    },
    styles: {
      font: 'Helvetica',
      cellPadding: 2.5,
    },
  });

  // 7. General Synthesis Panel
  const finalTableY = (doc as any).lastAutoTable.finalY + 8;
  
  doc.setFillColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
  doc.rect(15, finalTableY, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SYNTHÈSE DU CONTRÔLE DES CONNAISSANCES', 20, finalTableY + 5.5);

  const statsY = finalTableY + 12;
  doc.setDrawColor(218, 225, 231);
  doc.setLineWidth(0.3);
  doc.rect(15, statsY, 180, 20, 'D');

  // Overall General Average box
  const roundedAverage = overallAverage !== null ? overallAverage : 12.5; // Mock fallback
  
  doc.setFillColor(245, 247, 249);
  doc.rect(16, statsY + 1, 55, 18, 'F');
  
  doc.setTextColor(80, 90, 100);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.text('MOYENNE GÉNÉRALE', 20, statsY + 6);
  
  doc.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.setFontSize(16);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${roundedAverage.toFixed(2)} / 20`, 20, statsY + 14);

  // Appreciations box
  doc.setTextColor(80, 90, 100);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.text('DÉCISION DU CONSEIL DE CLASSE', 78, statsY + 6);

  let decText = 'Encouragements du conseil';
  let decColor = rgbPrimary;
  if (roundedAverage >= 16) decText = 'Félicitations du conseil - Tableau d\'honneur';
  else if (roundedAverage >= 14) decText = 'Encouragements - Tableau d\'honneur';
  else if (roundedAverage >= 12) decText = 'Travail satisfaisant';
  else if (roundedAverage >= 10) decText = 'Moyen - Peut faire mieux';
  else {
    decText = 'Avertissement de travail';
    decColor = rgbAccent;
  }

  doc.setTextColor(decColor.r, decColor.g, decColor.b);
  doc.setFontSize(10.5);
  doc.setFont('Helvetica', 'bold');
  doc.text(decText.toUpperCase(), 78, statsY + 13);

  // Coeff summary on right
  doc.setTextColor(110, 110, 110);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Total Coefficients : ${totalCoeffs}`, 145, statsY + 8);
  doc.text(`Épreuves Saisies : ${subjectsPerformance.length}`, 145, statsY + 14);

  // 8. Signatures Block
  const sigY = statsY + 28;
  doc.setDrawColor(230, 230, 230);
  doc.line(15, sigY, 195, sigY);

  doc.setTextColor(130, 130, 130);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Ce bulletin est certifié conforme par la direction de l\'établissement scolaire.', 15, sigY + 5);

  // Left stamp
  doc.setTextColor(80, 80, 80);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Le Titulaire de la Classe', 15, sigY + 11);
  doc.setFont('Helvetica', 'normal');
  doc.text('Visé le : ________________', 15, sigY + 17);

  // Right stamp
  doc.setFont('Helvetica', 'bold');
  doc.text('Le Censeur Général / Principal', 195, sigY + 11, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  doc.text('Cachet et signature de l\'école', 195, sigY + 17, { align: 'right' });

  // Save the PDF
  doc.save(`Bulletin_Séquence_${sequenceId}_${student.lastName}_${student.firstName}.pdf`);
}
