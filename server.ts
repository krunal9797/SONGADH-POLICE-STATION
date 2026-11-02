import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Body parser with 50mb limit for PDF base64 payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Authorized email as requested by user
const AUTHORIZED_EMAIL = 'gamitkrunal7997@gmail.com';

// In-memory OTP storage with expiration
interface OtpEntry {
  code: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}
const otpStore = new Map<string, OtpEntry>();

// Active sessions storage
const activeSessions = new Map<string, { email: string; name: string; role: string; loginTime: number }>();

// Helper to configure Nodemailer transporter
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const portNum = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: portNum,
      secure: portNum === 465,
      auth: { user, pass },
    });
  }

  return null;
}

// ---------------- AUTH ROUTES ----------------

// Route: Send OTP to authorized email
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const rawEmail = (req.body?.email || '').trim().toLowerCase();

    if (!rawEmail) {
      return res.status(400).json({
        success: false,
        error: 'કૃપા કરીને ઈમેલ સરનામું દાખલ કરો (Please provide an email address).',
      });
    }

    if (rawEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: `અનધિકૃત ઈમેલ! ફક્ત અધિકૃત અધિકારી (${AUTHORIZED_EMAIL}) ને જ લૉગિન કરવાની મંજૂરી છે.`,
      });
    }

    // Generate secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    otpStore.set(rawEmail, {
      code: otpCode,
      email: rawEmail,
      expiresAt,
      createdAt: Date.now(),
    });

    console.log(`\n========================================`);
    console.log(`[AUTH OTP GENERATED] Email: ${rawEmail}`);
    console.log(`[AUTH OTP CODE] >>> ${otpCode} <<< (Expires in 10 mins)`);
    console.log(`========================================\n`);

    let emailSent = false;
    let emailStatusMessage = '';

    // If client supplied Google OAuth Access Token, send directly via official Gmail API
    const googleToken = req.body?.googleAccessToken;
    if (googleToken) {
      try {
        const subject = `પોલીસ પોર્ટલ OTP ચકાસણી કોડ: ${otpCode} - CYBER EXPERT TAPI (SONGADH POLICE STATION)`;
        const emailBodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">CYBER EXPERT TAPI (SONGADH POLICE STATION)</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Cyber Crime Investigation Cell • Songadh Police Station (Tapi)</p>
            </div>
            <div style="padding: 28px; background-color: #ffffff; color: #1e293b; text-align: center;">
              <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">સુરક્ષિત લૉગિન OTP ચકાસણી</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: left;">
                નમસ્તે <strong>Er. Krunal Gamit</strong>,<br>
                ગુજરાત પોલીસ 1930 NCRP સાયબર પોર્ટલમાં લૉગિન કરવા માટે તમારો વન ટાઈમ પાસવર્ડ (OTP) નીચે મુજબ છે:
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; background: #eff6ff; border: 2px dashed #3b82f6; padding: 12px 30px; border-radius: 10px; font-family: monospace;">
                  ${otpCode}
                </span>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: left;">
                ⏱️ આ OTP કોડ આગામી <strong>10 મિનિટ</strong> સુધી માન્ય રહેશે.<br>
                🔒 સુરક્ષાના કારણોસર આ કોડ કોઈની સાથે શેર કરશો નહીં.
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Designed & Developed by Er. Krunal Gamit • Helpline: +917043311587 (WhatsApp Only)
            </div>
          </div>
        `;

        const rfcMessage = [
          `To: ${rawEmail}`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          '',
          emailBodyHtml,
        ].join('\r\n');

        const rawBase64 = Buffer.from(rfcMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: rawBase64 }),
        });

        if (gmailRes.ok) {
          emailSent = true;
          console.log(`[AUTH GMAIL] Email successfully sent to ${rawEmail}`);
        } else {
          const errBody = await gmailRes.text();
          console.warn('[AUTH GMAIL API ERROR]', errBody);
        }
      } catch (gmailErr) {
        console.warn('[AUTH GMAIL CATCH]', gmailErr);
      }
    }

    // Secondary fallback: Nodemailer SMTP if configured
    if (!emailSent) {
      const transporter = getMailTransporter();
      if (transporter) {
        try {
          const mailOptions = {
            from: `"Gujarat Police Cyber Crime Portal" <${process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@gujarat.gov.in'}>`,
            to: rawEmail,
            subject: `પોલીસ પોર્ટલ OTP ચકાસણી કોડ: ${otpCode} - Gujarat Police Cyber Crime Cell`,
            text: `નમસ્તે Er. Krunal Gamit,\n\nગુજરાત પોલીસ સાયબર ક્રાઈમ પોર્ટલ (Songadh Police Station) માં લૉગિન કરવા માટે તમારો વન ટાઈમ પાસવર્ડ (OTP) નીચે મુજબ છે:\n\nOTP કોડ: ${otpCode}\n\nઆ કોડ ફક્ત 10 મિનિટ માટે માન્ય છે. સુરક્ષાના કારણોસર આ કોડ કોઈ સાથે શેર કરશો નહીં.\n\nઆભાર,\nસાયબર ક્રાઈમ સેલ, સોનગઢ પોલીસ સ્ટેશન\nજિલ્લો: તાપી - ગુજરાત`,
          };

          await transporter.sendMail(mailOptions);
          emailSent = true;
        } catch (mailErr: any) {
          console.warn('[AUTH] SMTP send failed:', mailErr?.message || mailErr);
        }
      }
    }

    return res.json({
      success: true,
      emailSent,
      otpCode, // Used for direct Gmail API dispatch from client browser
      message: `OTP સફળતાપૂર્વક તમારા ઈમેલ ${rawEmail} પર મોકલવામાં આવ્યો છે. કૃપા કરીને તમારું ઇનબોક્સ ચેક કરો.`,
    });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    return res.status(500).json({
      success: false,
      error: 'OTP મોકલવામાં સર્વર ક્ષતિ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    });
  }
});

// Route: Google Direct Login
app.post('/api/auth/google-login', async (req: Request, res: Response) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();

    if (!email || email !== AUTHORIZED_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: `અનધિકૃત એકાઉન્ટ! ફક્ત અધિકૃત અધિકારી (${AUTHORIZED_EMAIL}) ને જ પ્રવેશની મંજૂરી છે.`,
      });
    }

    // Create verified session token
    const token = 'police_google_' + Buffer.from(`${email}:${Date.now()}:${Math.random()}`).toString('hex');
    const officerProfile = {
      email,
      name: 'Er. Krunal Gamit',
      role: 'Cyber Crime Investigation Officer',
      station: 'Songadh Police Station, Dist. Tapi',
      phone: '+917043311587',
      loginTime: Date.now(),
    };

    activeSessions.set(token, officerProfile);

    return res.json({
      success: true,
      message: 'Google એકાઉન્ટ વડે સફળતાપૂર્વક ચકાસણી થઈ!',
      token,
      user: officerProfile,
    });
  } catch (err: any) {
    console.error('Google login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Google વેરિફિકેશનમાં ક્ષતિ આવી.',
    });
  }
});

// Route: Officer Security Passkey / Master PIN (Guaranteed login on Vercel & unauthorized domains)
app.post('/api/auth/verify-pin', async (req: Request, res: Response) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const pin = (req.body?.pin || '').trim();

    if (!email || email !== AUTHORIZED_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: `અનધિકૃત એકાઉન્ટ! ફક્ત અધિકૃત અધિકારી (${AUTHORIZED_EMAIL}) ને જ પ્રવેશની મંજૂરી છે.`,
      });
    }

    // Accepted secure officer PINs for Er. Krunal Gamit
    const validPins = ['704331', '7997', '193000', '525525'];
    if (!validPins.includes(pin)) {
      return res.status(400).json({
        success: false,
        error: 'અમાન્ય ઓફિસર સિક્યુરિટી PIN! કૃપા કરીને સાચો સિક્યુરિટી કોડ દાખલ કરો.',
      });
    }

    const token = 'police_pin_' + Buffer.from(`${email}:${Date.now()}:${Math.random()}`).toString('hex');
    const officerProfile = {
      email,
      name: 'Er. Krunal Gamit',
      role: 'Cyber Crime Investigation Officer',
      station: 'Songadh Police Station, Dist. Tapi',
      phone: '+917043311587',
      loginTime: Date.now(),
    };

    activeSessions.set(token, officerProfile);

    return res.json({
      success: true,
      message: 'ઓફિસર સિક્યુરિટી PIN વડે સફળતાપૂર્વક લૉગિન થયું!',
      token,
      user: officerProfile,
    });
  } catch (err: any) {
    console.error('Verify PIN error:', err);
    return res.status(500).json({
      success: false,
      error: 'PIN ચકાસણીમાં સર્વર ક્ષતિ આવી.',
    });
  }
});

// Route: Verify OTP and establish session
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const rawEmail = (req.body?.email || '').trim().toLowerCase();
    const inputOtp = (req.body?.otp || '').toString().trim();

    if (!rawEmail || !inputOtp) {
      return res.status(400).json({
        success: false,
        error: 'ઈમેલ અને OTP બંને દાખલ કરવા જરૂરી છે.',
      });
    }

    if (rawEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'અનધિકૃત ઈમેલ એડ્રેસ.',
      });
    }

    const storedEntry = otpStore.get(rawEmail);

    if (!storedEntry) {
      return res.status(400).json({
        success: false,
        error: 'કોઈ સક્રિય OTP મળ્યો નથી. કૃપા કરીને નવો OTP મેળવો.',
      });
    }

    if (Date.now() > storedEntry.expiresAt) {
      otpStore.delete(rawEmail);
      return res.status(400).json({
        success: false,
        error: 'આ OTP ની સમયસીમા સમાપ્ત થઈ ગઈ છે (Expired). કૃપા કરીને નવો OTP મેળવો.',
      });
    }

    if (storedEntry.code !== inputOtp) {
      return res.status(400).json({
        success: false,
        error: 'અમાન્ય OTP! કૃપા કરીને સાચો 6-અંકનો કોડ દાખલ કરો.',
      });
    }

    // OTP verified successfully! Delete used OTP
    otpStore.delete(rawEmail);

    // Create session token
    const token = 'police_auth_' + Buffer.from(`${rawEmail}:${Date.now()}:${Math.random()}`).toString('hex');
    const officerProfile = {
      email: rawEmail,
      name: 'Er. Krunal Gamit',
      role: 'Cyber Crime Investigation Officer',
      station: 'Songadh Police Station, Dist. Tapi',
      phone: '+917043311587',
      loginTime: Date.now(),
    };

    activeSessions.set(token, officerProfile);

    return res.json({
      success: true,
      message: 'સફળતાપૂર્વક લૉગિન થયું!',
      token,
      user: officerProfile,
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({
      success: false,
      error: 'OTP ચકાસણીમાં સર્વર ક્ષતિ આવી.',
    });
  }
});

// Route: Validate active session token
app.get('/api/auth/verify-session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ success: false, authenticated: false, error: 'સત્ર સમાપ્ત થઈ ગયું છે.' });
  }

  return res.json({
    success: true,
    authenticated: true,
    user: session,
  });
});

// Route: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'સફળતાપૂર્વક લૉગ આઉટ થયા.' });
});

// ---------------- OCR ROUTES ----------------

// Server-side Gemini client as per @google/genai specifications
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models for OCR. gemini-3.1-flash-lite has separate free tier quota and fast latency
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

async function callGeminiWithFallback(contents: any, config: any) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Calling Gemini model: ${model} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Model ${model} attempt ${attempt} failed:`, errMsg);

        // If quota exhausted (429 RESOURCE_EXHAUSTED), do not retry this model - immediately jump to next model
        if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || errMsg.includes('limit: 20')) {
          console.warn(`Model ${model} quota exhausted, skipping further attempts on this model.`);
          break;
        }

        // If it is temporary 503 (high demand) or transient 429, pause briefly and retry once
        if (errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('UNAVAILABLE')) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

// API endpoint to process any uploaded PDF using Gemini 3.8 Flash OCR & Extraction
app.post('/api/ocr-pdf', async (req: Request, res: Response) => {
  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'No PDF provided.' });
    }

    // Clean base64 if it has data URL prefix
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const systemPrompt = `You are an ultra-high precision document OCR and structured data extraction engine specialized in Indian Cyber Crime Reporting Portal (1930 / NCRP), police acknowledgments, and financial fraud dispute reports.

CRITICAL MULTI-PAGE & MULTI-LAYER TRAIL RULES (PAGES 1, 2, 3, 4, 5+ / LAYERS 1 TO 15+):
1. SCAN ALL PAGES: This document often spans 3 to 5 pages or more. You MUST exhaustively extract every table across all pages. Do NOT stop after page 1 or page 2.
2. EXTREME MULTI-LAYER MONEY TRAIL (10 TO 15+ LAYERS): The "Money Transfer Trail (Multi-Layer Flow)" table can extend across 10 to 15 layers or more (e.g., Layer 1, Layer 2, Layer 3, Layer 4, Layer 5, Layer 6, Layer 7, Layer 8, Layer 9, Layer 10, Layer 11, Layer 12, Layer 13, Layer 14, Layer 15, and beyond) spanning multiple pages. You MUST extract EVERY SINGLE ROW in sequential order from Layer 1 all the way through Layer 15+. Never skip any intermediate layers, never truncate, and never stop early.
3. ZERO-HALLUCINATION BANK NAMES & ACCOUNTS: Never guess, invent, or substitute bank names. If the table says "State Bank of India", write exactly "State Bank of India". If it says "YES Bank", write "YES Bank". If it says "Paytm Payments Bank", "Bank of Baroda", "HDFC Bank", "ICICI Bank", "Union Bank of India", "Punjab National Bank", "Canara Bank", "Axis Bank", "Kotak Mahindra Bank", "Fincare Small Finance Bank", "Airtel Payments Bank", "India Post Payments Bank", etc., transcribe the exact printed name. If it contains a UPI handle/VPA (e.g. name@oksbi, user@paytm) or "Other", preserve that exact string.
4. EXACT NUMBERS & CODES: Copy account numbers, IFSC codes, UTR numbers, transaction dates, and rupee amounts character-by-character. Preserve leading zeros in account numbers (e.g., "00000045507539522").
5. TRANSACTIONS PUT ON HOLD: Extract every single hold entry with its exact Hold Amount, Account Number, IFSC Code, and Action Taken By Bank.
6. WITHDRAWAL THROUGH ATM: Extract all ATM withdrawal entries with exact ATM ID, location address, and amount.

Return ONLY a JSON object with this exact structure:
{
  "documentTitle": string (e.g. "Cyber Crime Incident Acknowledgement Slip"),
  "acknowledgement": {
    "acknowledgementNo": string,
    "category": string,
    "subCategory": string,
    "additionalInfoPresent": string,
    "userId": string,
    "haveYouLostMoney": string,
    "incidentDateTime": string,
    "complaintDate": string
  },
  "complainant": {
    "name": string,
    "gender": string,
    "dateOfBirth": string,
    "age": string,
    "mobile": string,
    "fatherMotherSpouseName": string,
    "email": string,
    "streetName": string,
    "houseNo": string,
    "colony": string,
    "villageTown": string,
    "tehsil": string,
    "pincode": string,
    "policeStation": string,
    "district": string,
    "state": string,
    "relationWithVictim": string
  },
  "suspect": {
    "state": string,
    "pincode": string,
    "complaintAdditionalInfo": string
  },
  "financialSummary": {
    "totalFraudulentAmountReported": string,
    "totalLienAmount": string,
    "totalDisputedAmount": string,
    "transactionPutOnHoldAmount": string,
    "withdrawalThroughAtmAmount": string,
    "othersAmount": string
  },
  "victimAccountTransactions": [
    {
      "sNo": string or number,
      "accountNoOrWalletId": string,
      "transactionId": string,
      "cardDetails": string,
      "transactionAmount": string,
      "referenceNo": string,
      "transactionDateTime": string,
      "complaintDate": string,
      "bankMerchant": string
    }
  ],
  "supportingEvidence": [
    {
      "sNo": string or number,
      "description": string,
      "textInformation": string,
      "fileName": string,
      "md5": string,
      "sha256": string
    }
  ],
  "pendingTransactions": [
    {
      "sNo": string or number,
      "bankOrFi": string,
      "noOfTransactionsPending": string or number,
      "totalTransactionsAmount": string,
      "totalDisputedAmount": string,
      "pendingFrom": string
    }
  ],
  "fraudBreakdown": [
    {
      "sNo": string or number,
      "title": string,
      "amount": string
    }
  ],
  "moneyTransferTrail": [
    {
      "sNo": string or number,
      "senderAccountNo": string,
      "senderTxnOrUtr": string,
      "layer": string,
      "destinationBank": string,
      "destinationAccountNo": string,
      "destinationIfsc": string,
      "transactionIdUtr": string,
      "transactionDateTime": string,
      "transactionAmount": string,
      "disputedAmount": string,
      "referenceNoRemarks": string,
      "actionTakenBy": string,
      "dateOfAction": string
    }
  ],
  "transactionsPutOnHold": [
    {
      "sNo": string or number,
      "accountNo": string,
      "transactionIdUtr": string,
      "putOnHoldDate": string,
      "putOnHoldAmount": string,
      "actionTakenBy": string,
      "dateOfAction": string
    }
  ],
  "atmWithdrawals": [
    {
      "sNo": string or number,
      "accountNo": string,
      "transactionIdUtr": string,
      "withdrawalDateTime": string,
      "withdrawalAmount": string,
      "disputedAmount": string,
      "referenceRemarks": string,
      "atmId": string,
      "atmLocation": string,
      "actionTakenBy": string,
      "dateOfAction": string
    }
  ],
  "othersUnder500": [
    {
      "sNo": string or number,
      "accountNo": string,
      "transactionIdUtr": string,
      "referenceRemarks": string,
      "actionTakenBy": string,
      "dateOfAction": string
    }
  ],
  "actionTaken": {
    "complaintAcceptedBy": string,
    "complaintAcceptedDate": string,
    "currentStatus": string,
    "eZeroFirNo": string,
    "underProcessDate": string
  },
  "rawTextSummary": string
}`;

    const response = await callGeminiWithFallback(
      [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        },
        {
          text: 'Perform complete, exhaustive multi-page extraction of all pages (Pages 1, 2, 3, 4, 5+), text, and tables from this PDF document into the requested JSON schema. The Money Transfer Trail may have 10 to 15+ layers (Layer 1 through Layer 15+) across multiple pages — extract every single layer and row without skipping or truncating.',
        },
      ],
      {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0,
        maxOutputTokens: 32768,
      }
    );

    const jsonText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini output as JSON:', jsonText.slice(0, 500));
      return res.status(500).json({ error: 'Failed to parse extracted JSON', raw: jsonText });
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    let msg = error?.message || 'Error processing PDF OCR';
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch (_) {}

    res.status(500).json({ error: msg });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
