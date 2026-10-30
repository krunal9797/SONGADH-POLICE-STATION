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

const SAMPLE_PDF_PATH = path.resolve(process.cwd(), 'public/assets/aistudio/31109260232375_a8a8e1dc.pdf');

// Sample document verified extraction for instant, reliable loading
import { SAMPLE_DOCUMENT } from './src/data/sampleDocument';

// API Endpoint to get sample PDF info
app.get('/api/sample-pdf', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(SAMPLE_PDF_PATH)) {
      const stats = fs.statSync(SAMPLE_PDF_PATH);
      res.json({
        exists: true,
        filename: '31109260232375_a8a8e1dc.pdf',
        size: stats.size,
        url: '/assets/aistudio/31109260232375_a8a8e1dc.pdf',
      });
    } else {
      res.status(404).json({ error: 'Sample PDF not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for calling Gemini with retry on 503 / 429
async function callGeminiWithRetry(contents: any, config: any, maxRetries = 3) {
  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });
    } catch (err: any) {
      lastError = err;
      attempt++;
      console.warn(`Gemini API call attempt ${attempt} failed with:`, err.message || err);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// API endpoint to process any uploaded PDF using Gemini 3.8 Flash OCR & Extraction
app.post('/api/ocr-pdf', async (req: Request, res: Response) => {
  try {
    let { pdfBase64, isSample, filename } = req.body;

    // Fast path: if requesting the sample PDF or the uploaded file is the sample file
    if (isSample || filename?.includes('31109260232375')) {
      return res.json({
        success: true,
        data: SAMPLE_DOCUMENT,
        cached: true,
      });
    }

    if (!pdfBase64) {
      return res.status(400).json({ error: 'No PDF provided.' });
    }

    // Clean base64 if it has data URL prefix
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const systemPrompt = `You are a high-precision document OCR and structured extraction engine specialized in Indian Cyber Crime Reporting Portal (1930 / NCRP), police acknowledgments, and financial fraud dispute reports.
Analyze all pages of the attached PDF document and perform 100% complete and lossless extraction of ALL data fields, tables, transaction trails, amounts, dates, and locations.

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

    const response = await callGeminiWithRetry(
      [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        },
        {
          text: 'Perform complete, thorough extraction of all pages, text, and tables from this PDF document into the requested JSON schema. Do not skip or truncate any transaction records.',
        },
      ],
      {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
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
    res.status(500).json({ error: error.message || 'Error processing PDF OCR' });
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
