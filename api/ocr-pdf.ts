import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models for OCR in case of 503 spikes on a single model
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function callGeminiWithFallback(contents: any, config: any) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
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
        if (errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('demand') || errMsg.includes('UNAVAILABLE')) {
          await new Promise((r) => setTimeout(r, 1200 * attempt));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { pdfBase64 } = req.body || {};

    if (!pdfBase64) {
      return res.status(400).json({ error: 'No PDF provided.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in environment variables.',
      });
    }

    // Clean base64 if it has data URL prefix
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const systemPrompt = `You are a high-precision document OCR and structured extraction engine specialized in Indian Cyber Crime Reporting Portal (1930 / NCRP), police acknowledgments, and financial fraud dispute reports.
Analyze all pages of the attached PDF document and perform 100% complete and lossless extraction of ALL data fields, tables, transaction trails, amounts, dates, and locations.

Return ONLY a JSON object with this exact structure:
{
  "documentTitle": string,
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

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('OCR Error on Vercel:', error);
    let msg = error?.message || 'Error processing PDF OCR';
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch (_) {}
    return res.status(500).json({ error: msg });
  }
}
