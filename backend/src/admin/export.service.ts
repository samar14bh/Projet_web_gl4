import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  /**
   * Générer un rapport PDF
   */
  async generatePDF(stats: any, period: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // En-tête
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Rapport Administrateur', { align: 'center' });

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Période: ${this.getPeriodLabel(period)}`, { align: 'center' })
        .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
        .moveDown(2);

      // Statistiques principales
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Vue d\'ensemble', { underline: true })
        .moveDown();

      doc.fontSize(12).font('Helvetica');

      const stats_data = [
        { label: 'Total Clubs', value: stats.totalClubs || 0 },
        { label: 'Clubs Actifs', value: stats.activeClubs || 0 },
        { label: 'Total Membres', value: stats.totalMembers || 0 },
        { label: 'Nouveaux Membres (ce mois)', value: stats.newMembersThisMonth || 0 },
        { label: 'Total Événements', value: stats.totalEvents || 0 },
        { label: 'Événements à venir', value: stats.upcomingEvents || 0 },
        { label: 'Revenus Totaux', value: `${(stats.totalRevenue || 0).toFixed(2)} TND` },
        { label: 'Approbations en attente', value: stats.pendingApprovals || 0 },
      ];

      stats_data.forEach((item) => {
        doc
          .font('Helvetica-Bold')
          .text(`${item.label}: `, { continued: true })
          .font('Helvetica')
          .text(`${item.value}`)
          .moveDown(0.5);
      });

      // Pied de page
      doc
        .moveDown(3)
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text('Généré automatiquement par le système de gestion des clubs', {
          align: 'center',
        });

      doc.end();
    });
  }

  /**
   * Générer un rapport Excel
   */
  async generateExcel(
    stats: any,
    topClubs: any[],
    period: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Club Management System';
    workbook.created = new Date();

    // Feuille 1 : Vue d'ensemble
    const overviewSheet = workbook.addWorksheet('Vue d\'ensemble');

    // En-tête
    overviewSheet.mergeCells('A1:B1');
    overviewSheet.getCell('A1').value = 'RAPPORT ADMINISTRATEUR';
    overviewSheet.getCell('A1').font = { size: 16, bold: true };
    overviewSheet.getCell('A1').alignment = { horizontal: 'center' };

    overviewSheet.getCell('A2').value = `Période: ${this.getPeriodLabel(period)}`;
    overviewSheet.getCell('A3').value = `Date: ${new Date().toLocaleDateString('fr-FR')}`;
    overviewSheet.addRow([]);

    // Statistiques
    overviewSheet.addRow(['Métrique', 'Valeur']);
    overviewSheet.getRow(5).font = { bold: true };
    overviewSheet.getRow(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };
    overviewSheet.getRow(5).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const data = [
      ['Total Clubs', stats.totalClubs || 0],
      ['Clubs Actifs', stats.activeClubs || 0],
      ['Total Membres', stats.totalMembers || 0],
      ['Nouveaux Membres (ce mois)', stats.newMembersThisMonth || 0],
      ['Total Événements', stats.totalEvents || 0],
      ['Événements à venir', stats.upcomingEvents || 0],
      ['Revenus Totaux (TND)', (stats.totalRevenue || 0).toFixed(2)],
      ['Approbations en attente', stats.pendingApprovals || 0],
    ];

    data.forEach((row) => {
      overviewSheet.addRow(row);
    });

    // Style des colonnes
    overviewSheet.getColumn(1).width = 30;
    overviewSheet.getColumn(2).width = 20;
    overviewSheet.getColumn(2).alignment = { horizontal: 'right' };

    // Feuille 2 : Top Clubs
    const clubsSheet = workbook.addWorksheet('Top Clubs');

    clubsSheet.addRow(['Rang', 'Nom du Club', 'Membres', 'Événements', 'Revenus (TND)']);
    clubsSheet.getRow(1).font = { bold: true };
    clubsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };
    clubsSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    topClubs.forEach((club, index) => {
      clubsSheet.addRow([
        index + 1,
        club.name || '',
        club.members || 0,
        club.events || 0,
        (club.revenue || 0).toFixed(2),
      ]);
    });

    clubsSheet.getColumn(1).width = 8;
    clubsSheet.getColumn(2).width = 30;
    clubsSheet.getColumn(3).width = 15;
    clubsSheet.getColumn(4).width = 15;
    clubsSheet.getColumn(5).width = 20;

    // Générer le buffer
    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Obtenir le label de la période
   */
  private getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      week: 'Cette semaine',
      month: 'Ce mois',
      quarter: 'Ce trimestre',
      year: 'Cette année',
    };
    return labels[period] || period;
  }
}
