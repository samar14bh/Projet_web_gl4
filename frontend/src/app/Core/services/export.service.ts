import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Service pour gérer les exports PDF et Excel
 */
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /**
   * Exporter des données en PDF
   */
  exportToPDF(
    title: string,
    headers: string[],
    data: any[][],
    filename: string = 'export.pdf',
  ): void {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Couleur primaire
    doc.text(title, 14, 20);

    // Date de génération
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      14,
      28,
    );

    // Tableau
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 35,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Couleur primaire
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 35, left: 14, right: 14 },
    });

    // Télécharger
    doc.save(filename);
  }

  /**
   * Exporter des données en Excel
   */
  exportToExcel(
    data: any[],
    filename: string = 'export.xlsx',
    sheetName: string = 'Données',
  ): void {
    // Créer le workbook
    const wb = XLSX.utils.book_new();

    // Créer la feuille
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajuster la largeur des colonnes
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Télécharger
    XLSX.writeFile(wb, filename);
  }

  /**
   * Exporter un rapport financier complet en PDF
   */
  exportFinancialReportPDF(
    stats: any,
    transactions: any[],
    period: string,
    filename: string = 'rapport-financier.pdf',
  ): void {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('RAPPORT FINANCIER', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Période : ${this.getPeriodLabel(period)}`, 105, 28, { align: 'center' });
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      105,
      34,
      { align: 'center' },
    );

    // Ligne de séparation
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // Statistiques
    let yPos = 48;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Résumé financier', 14, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(50);

    // Revenus
    doc.setTextColor(34, 197, 94);
    doc.text('Revenus totaux :', 20, yPos);
    doc.text(`${stats.totalRevenue.toFixed(2)} TND`, 140, yPos, { align: 'right' });

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`- Cotisations : ${stats.membershipRevenue.toFixed(2)} TND`, 25, yPos);
    yPos += 6;
    doc.text(`- Événements : ${stats.eventRevenue.toFixed(2)} TND`, 25, yPos);

    yPos += 12;
    doc.setFontSize(11);

    // Dépenses
    doc.setTextColor(239, 68, 68);
    doc.text('Dépenses totales :', 20, yPos);
    doc.text(`${stats.totalExpenses.toFixed(2)} TND`, 140, yPos, { align: 'right' });

    yPos += 12;

    // Solde
    const balanceColor: [number, number, number] = stats.balance >= 0 ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.setFontSize(12);
    doc.text('Solde actuel :', 20, yPos);
    doc.text(`${stats.balance.toFixed(2)} TND`, 140, yPos, { align: 'right' });

    // Tableau des transactions
    const headers = ['Date', 'Description', 'Catégorie', 'Type', 'Montant'];
    const data = transactions.map((t) => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.description,
      this.getCategoryLabel(t.category),
      t.type === 'REVENUE' ? 'Revenu' : 'Dépense',
      `${t.type === 'EXPENSE' ? '-' : '+'}${Number(t.amount).toFixed(2)} TND`,
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: yPos + 15,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Télécharger
    doc.save(filename);
  }

  /**
   * Obtenir le label d'une période
   */
  private getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      month: 'Ce mois',
      quarter: 'Ce trimestre',
      year: 'Cette année',
      all: 'Toutes les périodes',
    };
    return labels[period] || period;
  }

  /**
   * Obtenir le label d'une catégorie
   */
  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      MEMBERSHIP: 'Cotisation',
      EVENT: 'Événement',
      DONATION: 'Don',
      EXPENSE: 'Dépense',
    };
    return labels[category] || category;
  }
}
