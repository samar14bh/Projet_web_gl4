import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Payment } from './entities/payment.entity';
import { PaymentType } from '../common/enums';

/**
 * Service for generating payment receipts in PDF format
 */
@Injectable()
export class ReceiptService {
  async generateReceipt(payment: Payment): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        this.addHeader(doc);
        this.addPaymentDetails(doc, payment);
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: typeof PDFDocument) {
    doc.fontSize(24).fillColor('#3B82F6').text('ClubHub', 50, 50);
    doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text('Plateforme de gestion de clubs', 50, 80);
    doc
        .fontSize(20)
        .fillColor('#1F2937')
        .text('RECU DE PAIEMENT', 50, 150, { align: 'center' });
    doc.moveTo(50, 180).lineTo(545, 180).strokeColor('#E5E7EB').stroke();
  }

  private addPaymentDetails(doc: typeof PDFDocument, payment: Payment) {
    const startY = 210;
    doc
        .fontSize(12)
        .fillColor('#374151')
        .text('Informations de paiement', 50, startY);

    let currentY = startY + 25;

    this.addDetailRow(doc, 'Numero:', `#${payment.id}`, currentY);
    currentY += 20;

    const paymentDate = new Date(payment.date);
    const formattedDate = paymentDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    this.addDetailRow(doc, 'Date:', formattedDate, currentY);
    currentY += 20;

    const type =
        payment.type === PaymentType.MEMBERSHIP
            ? 'Cotisation club'
            : 'Inscription event';
    this.addDetailRow(doc, 'Type:', type, currentY);
    currentY += 40;

    // Amount box - CONVERTIR EN NOMBRE JAVASCRIPT
    const amountBoxY = currentY;
    const amountNumber = this.convertDecimalToNumber(payment.amount);

    doc.rect(50, amountBoxY, 495, 60).fillAndStroke('#F3F4F6', '#E5E7EB');
    doc
        .fontSize(12)
        .fillColor('#374151')
        .text('Montant total:', 70, amountBoxY + 20);
    doc
        .fontSize(20)
        .fillColor('#3B82F6')
        .font('Helvetica-Bold')
        .text(`${amountNumber.toFixed(2)} TND`, 70, amountBoxY + 20, {
          align: 'right',
          width: 455,
        });

    // Status
    currentY = amountBoxY + 80;
    const statusText =
        payment.status === 'CONFIRMED' ? 'CONFIRME' : payment.status;
    doc
        .fontSize(10)
        .fillColor('#10B981')
        .font('Helvetica-Bold')
        .text(`Statut: ${statusText}`, 50, currentY);
    doc.font('Helvetica');
  }

  private addFooter(doc: typeof PDFDocument) {
    const bottomY = 700;
    doc
        .moveTo(50, bottomY)
        .lineTo(545, bottomY)
        .strokeColor('#E5E7EB')
        .stroke();
    doc
        .fontSize(9)
        .fillColor('#9CA3AF')
        .text('Document officiel ClubHub', 50, bottomY + 15, { align: 'center' });
    doc.text('Contact: contact@clubhub.tn', 50, bottomY + 30, {
      align: 'center',
    });
    doc.text(
        `Genere le ${new Date().toLocaleDateString('fr-FR')}`,
        50,
        bottomY + 45,
        { align: 'center' },
    );
  }

  private addDetailRow(
      doc: typeof PDFDocument,
      label: string,
      value: string,
      y: number,
  ) {
    doc.fontSize(10).fillColor('#6B7280').text(label, 50, y, { width: 150 });
    doc
        .fontSize(10)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text(value, 220, y, { width: 325 });
    doc.font('Helvetica');
  }

  /**
   * Convertir un Decimal (de TypeORM) en nombre JavaScript
   * TypeORM retourne les colonnes decimal comme des strings ou Decimal objects
   */
  private convertDecimalToNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    // Si c'est déjà un nombre
    if (typeof value === 'number') {
      return value;
    }

    // Si c'est une string
    if (typeof value === 'string') {
      return parseFloat(value);
    }

    // Si c'est un Decimal object (de la lib decimal.js)
    if (value.toNumber && typeof value.toNumber === 'function') {
      return value.toNumber();
    }

    // Si c'est un objet avec propriété _d (Decimal de TypeORM)
    if (value._d !== undefined) {
      return parseFloat(value._d);
    }

    // Dernier recours : convertir en string puis en nombre
    return parseFloat(String(value));
  }
}