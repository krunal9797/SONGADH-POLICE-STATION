import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Body parser with 50mb limit for PDF base64 payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
