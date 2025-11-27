import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // expected payload: { name, email, brief, budget, timeline, original_question }
    const { name, email, brief, budget, timeline, original_question } = body;

    if (!name || !email || !brief) {
      return NextResponse.json({ error: 'name, email and brief are required' }, { status: 400 });
    }

    // Try to send email if SMTP env vars are present
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const HIRE_EMAIL_RECIPIENT = process.env.HIRE_EMAIL_RECIPIENT || process.env.NEXT_PUBLIC_OWNER_EMAIL;

    // Build message
    const subject = `New hiring inquiry from ${name}`;
    const html = `
      <h2>New Hiring Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Brief:</strong><br/>${brief.replace(/\n/g, '<br/>')}</p>
      <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
      <p><strong>Timeline:</strong> ${timeline || 'N/A'}</p>
      <p><strong>Original Question:</strong> ${original_question || 'N/A'}</p>
      <hr/>
      <p>Received at ${new Date().toISOString()}</p>
    `;

    // If nodemailer env not set, just log and return success
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !HIRE_EMAIL_RECIPIENT) {
      console.log('Hire form received (email NOT sent, SMTP not configured):', {
        name,
        email,
        brief,
        budget,
        timeline,
        original_question
      });
      return NextResponse.json({ ok: true, message: 'received (email not sent - SMTP not configured)' });
    }

    // send via nodemailer
    // dynamic import to avoid bundling nodemailer on edge runtimes
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // true for 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: HIRE_EMAIL_RECIPIENT,
      subject,
      html
    });

    return NextResponse.json({ ok: true, message: 'Email sent' });
  } catch (err) {
    console.error('Hire route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
