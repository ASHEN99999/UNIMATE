import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface ReservationPDFData {
    reservationId: string;
    studentName: string;
    studentEmail: string;
    listingTitle: string;
    listingAddress: string;
    listingCity: string;
    propertyType: string;
    roomType: string;
    amenities: string[];
    pricePerMonth: number;
    moveInDate?: Date;
    providerName: string;
    contactPhone: string;
    reservationDate: Date;
    status: string;
}

export function generateReservationPDF(data: ReservationPDFData, res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Pipe PDF directly to HTTP response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="reservation-${data.reservationId}.pdf"`
    );
    doc.pipe(res);

    // ── Header Banner ───────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill('#1e40af');
    doc.fillColor('#ffffff')
       .fontSize(26)
       .font('Helvetica-Bold')
       .text('UNIMATE', 50, 25);
    doc.fontSize(10)
       .font('Helvetica')
       .text('University Campus Services Hub', 50, 57);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('BOOKING CONFIRMATION', { align: 'right', baseline: 'top' }, )
       .moveUp(1);
    // right-align title
    doc.text('BOOKING CONFIRMATION', 0, 37, { align: 'right', width: doc.page.width - 50 });

    doc.moveDown(3);

    // ── Confirmation Banner ──────────────────────────────────────────
    const confirmY = 110;
    doc.rect(50, confirmY, doc.page.width - 100, 36).fill('#dcfce7');
    doc.fillColor('#166534')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('✓  Reservation Request Submitted Successfully', 50, confirmY + 10, {
           align: 'center',
           width: doc.page.width - 100,
       });

    doc.moveDown(1);
    let y = confirmY + 55;

    // ── Helper: Section Header ───────────────────────────────────────
    const sectionHeader = (title: string, yPos: number) => {
        doc.rect(50, yPos, doc.page.width - 100, 22).fill('#eff6ff');
        doc.fillColor('#1e40af')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(title, 58, yPos + 5);
        return yPos + 30;
    };

    // ── Helper: Row ──────────────────────────────────────────────────
    const row = (label: string, value: string, yPos: number) => {
        doc.fillColor('#6b7280').fontSize(9).font('Helvetica').text(label, 60, yPos);
        doc.fillColor('#111827').fontSize(10).font('Helvetica').text(value, 210, yPos);
        return yPos + 18;
    };

    // ── Reservation Details ──────────────────────────────────────────
    y = sectionHeader('RESERVATION DETAILS', y);
    y = row('Reservation ID', `#${data.reservationId.slice(-8).toUpperCase()}`, y);
    y = row('Status', data.status.toUpperCase(), y);
    y = row('Reservation Date', data.reservationDate.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    }), y);
    if (data.moveInDate) {
        y = row('Requested Move-in Date', data.moveInDate.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'long', year: 'numeric'
        }), y);
    }
    y += 10;

    // ── Student Details ──────────────────────────────────────────────
    y = sectionHeader('STUDENT DETAILS', y);
    y = row('Name', data.studentName, y);
    y = row('University Email', data.studentEmail, y);
    y += 10;

    // ── Property Details ─────────────────────────────────────────────
    y = sectionHeader('PROPERTY DETAILS', y);
    y = row('Property Name', data.listingTitle, y);
    y = row('Address', `${data.listingAddress}, ${data.listingCity}`, y);
    y = row('Property Type', capitalize(data.propertyType), y);
    y = row('Room Type', capitalize(data.roomType.replace('-', ' ')), y);
    if (data.amenities.length > 0) {
        y = row('Amenities', data.amenities.join(', '), y);
    }
    y += 10;

    // ── Provider Details ─────────────────────────────────────────────
    y = sectionHeader('PROVIDER DETAILS', y);
    y = row('Provider Name', data.providerName, y);
    y = row('Contact Phone', data.contactPhone, y);
    y += 10;

    // ── Pricing ──────────────────────────────────────────────────────
    y = sectionHeader('PRICING SUMMARY', y);
    y = row('Monthly Rent', `Rs. ${data.pricePerMonth.toLocaleString()}`, y);
    y += 5;

    // Highlight total
    doc.rect(50, y, doc.page.width - 100, 28).fill('#f0f9ff');
    doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold')
       .text('Monthly Rent Payable:', 60, y + 7);
    doc.text(`Rs. ${data.pricePerMonth.toLocaleString()}`, 0, y + 7, {
        align: 'right',
        width: doc.page.width - 60,
    });
    y += 40;

    // ── Footer Note ──────────────────────────────────────────────────
    doc.rect(50, y, doc.page.width - 100, 55).fill('#fefce8');
    doc.fillColor('#92400e').fontSize(9).font('Helvetica')
       .text(
           '⚠  This document confirms your reservation request. Final confirmation is subject to provider approval. ' +
           'Please contact the provider directly to confirm availability and arrange payment.',
           58, y + 8, { width: doc.page.width - 116 }
       );
    y += 68;

    // ── Footer ───────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#1e40af');
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
       .text(
           `Generated by UNIMATE  •  ${new Date().toLocaleString()}  •  unimate.campus`,
           0, doc.page.height - 25,
           { align: 'center' }
       );

    doc.end();
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
