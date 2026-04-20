import nodemailer from 'nodemailer';

// Create transporter from environment variables
function createTransporter() {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

const STATUS_LABELS: Record<string, string> = {
    accepted:   'Accepted – Helper Found',
    purchased:  'Purchased – Items Bought',
    delivering: 'Out for Delivery',
    delivered:  'Delivered',
    completed:  'Completed',
    cancelled:  'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
    accepted:   '#2563eb',
    purchased:  '#7c3aed',
    delivering: '#d97706',
    delivered:  '#059669',
    completed:  '#16a34a',
    cancelled:  '#dc2626',
};

export async function sendFoodStatusEmail(params: {
    toEmail: string;
    studentName: string;
    requestNumber: string;
    newStatus: string;
    mealType: string;
    helperName?: string;
    helperContact?: string;
    totalCost?: number;
}): Promise<void> {
    // Silently skip if email not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('[Email] Skipped: EMAIL_USER/EMAIL_PASS not configured');
        return;
    }

    const label = STATUS_LABELS[params.newStatus] ?? params.newStatus.toUpperCase();
    const color = STATUS_COLORS[params.newStatus] ?? '#1e40af';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 0;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1e40af;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">UNIMATE</h1>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Food Assistance Service</p>
            </td>
          </tr>
          <!-- Status Banner -->
          <tr>
            <td style="background:${color};padding:16px 32px;">
              <p style="margin:0;color:#ffffff;font-size:15px;font-weight:bold;">
                Order Status Update: ${label}
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="color:#374151;font-size:15px;">Hi <strong>${params.studentName}</strong>,</p>
              <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                Your food assistance request <strong>#${params.requestNumber}</strong> (${params.mealType}) 
                has been updated to <strong style="color:${color};">${label}</strong>.
              </p>
              <table width="100%" style="margin-top:20px;background:#f9fafb;border-radius:8px;padding:16px;" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;width:45%;">Request Number</td>
                  <td style="color:#111827;font-size:13px;font-weight:600;">#${params.requestNumber}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Meal Type</td>
                  <td style="color:#111827;font-size:13px;">${params.mealType}</td>
                </tr>
                ${params.helperName ? `
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Helper</td>
                  <td style="color:#111827;font-size:13px;">${params.helperName}</td>
                </tr>` : ''}
                ${params.helperContact ? `
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Helper Contact</td>
                  <td style="color:#111827;font-size:13px;">${params.helperContact}</td>
                </tr>` : ''}
                ${params.totalCost ? `
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Total Cost</td>
                  <td style="color:#111827;font-size:13px;font-weight:600;">Rs. ${params.totalCost.toLocaleString()}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                This is an automated message from UNIMATE – University Campus Services Hub
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"UNIMATE" <${process.env.EMAIL_USER}>`,
        to: params.toEmail,
        subject: `[UNIMATE Food] Order #${params.requestNumber} – ${label}`,
        html,
    });

    console.log(`[Email] Sent status "${params.newStatus}" to ${params.toEmail}`);
}
