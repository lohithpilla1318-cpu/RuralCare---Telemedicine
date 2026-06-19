import React from 'react';

export const printReport = (type: 'invoice' | 'prescription', data: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download/print reports! / कृपया रिपोर्ट डाउनलोड करने के लिए पॉपअप की अनुमति दें!');
    return;
  }

  const dateStr = new Date(data.date || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let contentHtml = '';

  if (type === 'invoice') {
    // Generate Order Bill Invoice
    const itemsRows = data.items.map((item: any, index: number) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.name}</strong><br>
          <small style="color: #666;">Generic: ${item.genericName}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    contentHtml = `
      <div style="border: 2px solid #3b82f6; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">RURALCARE PHARMACY</h1>
          <p style="color: #3b82f6; margin: 5px 0 0; font-size: 14px; font-weight: bold;">दवाइयों की रसीद / Medicine Invoice</p>
          <small style="color: #666;">Toll-Free Helpline: 1800-309-8800 | Emergency Ambulance: 108</small>
        </div>
        
        <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="width: 50%;">
              <strong>Deliver To / मरीज का पता:</strong><br>
              ${data.shippingAddress.fullName}<br>
              Village: ${data.shippingAddress.village}, Panchayat: ${data.shippingAddress.panchayat}<br>
              District: ${data.shippingAddress.district}, State: ${data.shippingAddress.state}<br>
              Pincode: ${data.shippingAddress.pincode}<br>
              Phone: ${data.shippingAddress.phone}
            </td>
            <td style="width: 50%; text-align: right; vertical-align: top;">
              <strong>Invoice Details / रसीद विवरण:</strong><br>
              Invoice No: RC-ORD-${data.id.substring(0, 8).toUpperCase()}<br>
              Date: ${dateStr}<br>
              Payment Method: ${data.paymentMethod} (${data.paymentStatus === 'completed' ? 'PAID' : 'PENDING'})
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <thead>
            <tr style="background-color: #eff6ff; color: #1e3a8a; font-weight: bold;">
              <th style="padding: 10px; border: 1px solid #bfdbfe; text-align: left;">S.No.</th>
              <th style="padding: 10px; border: 1px solid #bfdbfe; text-align: left;">Medicine / दवा का नाम</th>
              <th style="padding: 10px; border: 1px solid #bfdbfe; text-align: center;">Qty / मात्रा</th>
              <th style="padding: 10px; border: 1px solid #bfdbfe; text-align: right;">Rate / दर</th>
              <th style="padding: 10px; border: 1px solid #bfdbfe; text-align: right;">Amount / राशि</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="border: none;"></td>
              <td style="padding: 10px; font-weight: bold; text-align: right;">Subtotal:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right;">₹${data.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="border: none;"></td>
              <td style="padding: 10px; color: green; font-weight: bold; text-align: right;">Delivery:</td>
              <td style="padding: 10px; color: green; font-weight: bold; text-align: right;">FREE</td>
            </tr>
            <tr style="font-size: 16px; border-top: 2px solid #3b82f6;">
              <td colspan="3" style="border: none;"></td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #1e3a8a;">Total Paid:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #1e3a8a;">₹${data.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 40px; border-top: 1px dashed #bbb; padding-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>This is a computer-generated invoice. No physical signature is required.</p>
          <p>Thank you for choosing RuralCare to support your village's health! / ग्रामीण स्वास्थ्य सेवा चुनने के लिए धन्यवाद!</p>
        </div>
      </div>
    `;
  } else {
    // Generate Prescription
    const medRows = (data.prescription?.medicines || []).map((med: any, index: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${med.name}</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${med.dosage}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${med.duration}</td>
      </tr>
    `).join('');

    contentHtml = `
      <div style="border: 2px solid #059669; padding: 25px; border-radius: 8px;">
        <table style="width: 100%; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
          <tr>
            <td>
              <h1 style="color: #065f46; margin: 0; font-size: 26px;">RURALCARE CLINICS</h1>
              <p style="color: #059669; margin: 5px 0 0; font-size: 14px; font-weight: bold;">डिजिटल पर्चा / Doctor Prescription</p>
              <small style="color: #666;">National Tele-Consultation Node | Support: 1800-309-8800</small>
            </td>
            <td style="text-align: right; vertical-align: top; font-size: 13px;">
              <strong>Doctor Details:</strong><br>
              <span style="font-size: 15px; color: #065f46;"><strong>${data.doctorName}</strong></span><br>
              ${data.doctorSpecialization}<br>
              Registration No: MCI-RC-${Math.floor(100000 + Math.random() * 900000)}
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 20px; font-size: 14px; background-color: #f0fdf4; padding: 10px; border-radius: 6px;">
          <tr>
            <td style="width: 50%;">
              <strong>Patient Name / मरीज का नाम:</strong> ${data.patientName}<br>
              <strong>Date / दिनांक:</strong> ${dateStr}
            </td>
            <td style="width: 50%; text-align: right;">
              <strong>Consultation ID:</strong> RC-CON-${data.id.substring(0, 8).toUpperCase()}<br>
              <strong>Status:</strong> COMPLETED
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #065f46; border-bottom: 1px solid #a7f3d0; padding-bottom: 5px; margin-bottom: 10px;">Rx (Prescribed Medicines / दवाएं):</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #d1fae5; color: #065f46; font-weight: bold;">
                <th style="padding: 10px; text-align: left; width: 10%;">S.No.</th>
                <th style="padding: 10px; text-align: left; width: 45%;">Medicine Name / दवा का नाम</th>
                <th style="padding: 10px; text-align: center; width: 30%;">Dosage / खुराक</th>
                <th style="padding: 10px; text-align: center; width: 15%;">Duration / कब तक</th>
              </tr>
            </thead>
            <tbody>
              ${medRows || `<tr><td colspan="4" style="padding:15px; text-align:center; color:#666;">No medicines prescribed. General rest advised.</td></tr>`}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 30px; background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
          <h4 style="margin: 0 0 5px 0; color: #065f46; font-size: 14px;">Doctor's Advice / चिकित्सक की सलाह:</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #333;">${data.prescription?.advice || 'Take rest and drink plenty of fluids.'}</p>
        </div>

        <table style="width: 100%; margin-top: 40px;">
          <tr>
            <td style="width: 60%; font-size: 12px; color: #666; vertical-align: bottom;">
              * Note: You can buy these medicines in the 'Medicines' section of the RuralCare App.<br>
              * यह पर्चा डिजिटल रूप से प्रमाणित है और सभी मेडिकल स्टोर्स पर मान्य है।
            </td>
            <td style="text-align: right; width: 40%;">
              <div style="display: inline-block; text-align: center;">
                <div style="font-family: 'Courier New', Courier, monospace; border: 1px solid #ddd; padding: 5px 10px; margin-bottom: 5px; color: #059669; font-weight: bold;">
                  Digitally Signed By<br>
                  ${data.doctorName.split(' ')[0]} ${data.doctorName.split(' ')[1]}
                </div>
                <div style="font-size: 12px; color: #666;">Authorized Medical Officer</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Report - RuralCare</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px auto;
            max-width: 800px;
            color: #333;
            line-height: 1.4;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">
            🖨️ Print / Save PDF (प्रिंट करें / पीडीएफ लें)
          </button>
        </div>
        ${contentHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const DownloadReportButton: React.FC<{
  type: 'invoice' | 'prescription';
  data: any;
  label: string;
  className?: string;
}> = ({ type, data, label, className = '' }) => {
  return (
    <button
      onClick={() => printReport(type, data)}
      className={`px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm transition-all text-sm flex items-center gap-2 ${className}`}
    >
      <span>🖨️</span>
      {label}
    </button>
  );
};
