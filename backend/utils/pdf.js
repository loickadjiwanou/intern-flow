import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateCertificate = async (internData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const filename = `certificate-${internData.firstName}-${internData.lastName}-${Date.now()}.pdf`;
      const filepath = path.join('uploads', filename);
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      doc.fontSize(40)
         .font('Helvetica-Bold')
         .text('Certificate of Internship', 100, 100, { align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica')
         .text('This is to certify that', 100, 180, { align: 'center' });
      
      doc.fontSize(30)
         .font('Helvetica-Bold')
         .text(`${internData.firstName} ${internData.lastName}`, 100, 220, { align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica')
         .text(`has successfully completed an internship as ${internData.position}`, 100, 280, { align: 'center' })
         .text(`in the ${internData.department} department`, 100, 310, { align: 'center' })
         .text(`from ${new Date(internData.startDate).toLocaleDateString()} to ${new Date(internData.endDate).toLocaleDateString()}`, 100, 340, { align: 'center' });
      
      doc.fontSize(14)
         .text('We wish them the best in their future endeavors.', 100, 420, { align: 'center' });
      
      doc.fontSize(12)
         .text(`Date: ${new Date().toLocaleDateString()}`, 100, 500);
      
      doc.end();
      
      stream.on('finish', () => {
        resolve({ filepath, filename });
      });
      
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateAttestation = async (internData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4' });
      const filename = `attestation-${internData.firstName}-${internData.lastName}-${Date.now()}.pdf`;
      const filepath = path.join('uploads', filename);
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('ATTESTATION DE STAGE', 100, 100, { align: 'center' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Nous soussignés, certifions que :`, 100, 180)
         .text(`${internData.firstName} ${internData.lastName}`, 100, 210, { underline: true })
         .text(`a effectué un stage au sein de notre entreprise`, 100, 240)
         .text(`Poste : ${internData.position}`, 100, 270)
         .text(`Département : ${internData.department}`, 100, 290)
         .text(`Période : du ${new Date(internData.startDate).toLocaleDateString()} au ${new Date(internData.endDate).toLocaleDateString()}`, 100, 310)
         .text(`Durée : ${internData.duration} mois`, 100, 330);
      
      doc.text(`Cette attestation est délivrée pour servir et valoir ce que de droit.`, 100, 400);
      
      doc.text(`Fait le ${new Date().toLocaleDateString()}`, 100, 500);
      
      doc.text('Signature et cachet de l\'entreprise', 100, 650);
      
      doc.end();
      
      stream.on('finish', () => {
        resolve({ filepath, filename });
      });
      
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
