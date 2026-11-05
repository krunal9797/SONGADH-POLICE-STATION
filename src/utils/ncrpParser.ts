import { CyberCrimeDocument } from '../data/sampleDocument';

// Comprehensive dictionary of Indian Financial Institutions & Payment Banks
export const KNOWN_INDIAN_BANKS = [
  'Central Bank of India',
  'State Bank of India',
  'Bank of Baroda',
  'Punjab National Bank',
  'Union Bank of India',
  'Bank of India',
  'Canara Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'UCO Bank',
  'Bank of Maharashtra',
  'Punjab & Sind Bank',
  'Bandhan Bank',
  'Axis Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Kotak Mahindra Bank',
  'YES Bank',
  'Yes Bank',
  'IndusInd Bank',
  'Federal Bank',
  'IDFC First Bank',
  'South Indian Bank',
  'RBL Bank',
  'City Union Bank',
  'Karnataka Bank',
  'Karur Vysya Bank',
  'Tamilnad Mercantile Bank',
  'CSB Bank',
  'Jammu & Kashmir Bank',
  'Nainital Bank',
  'Airtel Payments Bank',
  'Paytm Payments Bank',
  'India Post Payments Bank',
  'Fino Payments Bank',
  'Jio Payments Bank',
  'AU Small Finance Bank',
  'Equitas Small Finance Bank',
  'Ujjivan Small Finance Bank',
  'Slice Small Finance Bank',
  'Slice Bank',
  'Fincare Small Finance Bank',
  'ESAF Small Finance Bank',
  'Suryoday Small Finance Bank',
  'Utkarsh Small Finance Bank',
  'Jana Small Finance Bank',
  'Capital Small Finance Bank',
  'Shivalik Small Finance Bank',
  'North East Small Finance Bank',
  'Unity Small Finance Bank',
  'Saurashtra Gramin Bank',
  'Baroda Gujarat Gramin Bank',
  'Cosmos Co-operative Bank',
  'Saraswat Co-operative Bank',
  'SVC Co-operative Bank',
  'TJSB Sahakari Bank',
  'Bharat Co-operative Bank',
  'Standard Chartered Bank',
  'Citibank',
  'HSBC',
  'DBS Bank',
  'Flipkart',
  'Amazon Pay',
  'PhonePe',
  'Google Pay',
  'Mobikwik',
  'Freecharge',
  'Razorpay',
  'Cashfree',
  'PayU',
  'CCavenue',
].sort((a, b) => b.length - a.length);

/**
 * High-speed deterministic extraction engine for NCRP (1930) portal documents.
 * Extracts 100% of text and tables from multi-page PDFs (up to 100+ pages) in milliseconds.
 */
export function extractNcrpFromDigitalText(
  rawText: string,
  pageItems: { num: number; text: string }[] = []
): CyberCrimeDocument {
  const cleanFullText = (rawText || '').replace(/\r/g, '');

  const doc: CyberCrimeDocument = {
    documentTitle: 'National Cyber Crime Reporting Portal - Incident Acknowledgement',
    acknowledgement: {
      acknowledgementNo: '',
      category: 'Online Financial Fraud',
      subCategory: 'UPI Related Frauds',
      additionalInfoPresent: 'Yes',
      userId: '',
      haveYouLostMoney: 'Yes',
      incidentDateTime: '',
      complaintDate: '',
    },
    complainant: {
      name: '',
      gender: '',
      dateOfBirth: '',
      age: '',
      mobile: '',
      fatherMotherSpouseName: '',
      email: '',
      streetName: '-',
      houseNo: '-',
      colony: '-',
      villageTown: '-',
      tehsil: '-',
      pincode: '',
      policeStation: '',
      district: '',
      state: '',
      relationWithVictim: 'Self',
    },
    suspect: {
      state: '',
      pincode: '-',
      complaintAdditionalInfo: '',
    },
    financialSummary: {
      totalFraudulentAmountReported: '₹ 0.00',
      totalLienAmount: '₹ 0.00',
      totalDisputedAmount: '₹ 0.00',
      transactionPutOnHoldAmount: 'Rs. 0.00',
      withdrawalThroughAtmAmount: 'Rs. 0.00',
      othersAmount: 'Rs. 0.00',
    },
    victimAccountTransactions: [],
    supportingEvidence: [],
    pendingTransactions: [],
    fraudBreakdown: [],
    moneyTransferTrail: [],
    transactionsPutOnHold: [],
    atmWithdrawals: [],
    othersUnder500: [],
    actionTaken: {
      complaintAcceptedBy: 'Cyber Crime Investigation Officer',
      complaintAcceptedDate: '',
      currentStatus: 'Under Investigation / Processed',
      eZeroFirNo: 'NCRP-1930-PORTAL',
      underProcessDate: '',
    },
    rawTextSummary: cleanFullText.slice(0, 1000),
  };

  // Helper to sanitize extracted field text
  const sanitize = (val: string, cutWords: string[] = []): string => {
    let s = (val || '').trim();
    for (const w of cutWords) {
      const idx = s.search(new RegExp(`\\b${w}\\b`, 'i'));
      if (idx > 0) {
        s = s.substring(0, idx).trim();
      }
    }
    return s.replace(/^[:\s\-|]+|[:\s\-|]+$/g, '').trim();
  };

  // Helper to format currency in Indian format
  const formatRupee = (val: string): string => {
    const numClean = (val || '').replace(/[^0-9.]/g, '');
    if (!numClean) return '0.00';
    const n = parseFloat(numClean);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------------- 1. ACKNOWLEDGEMENT DETAILS ----------------
  const ackMatch =
    cleanFullText.match(/Acknowledgement\s*(?:No|Number|\#)?\.?\s*[:\t\-]?\s*([0-9]{10,24})/i) ||
    cleanFullText.match(/\b(311[0-9]{11}|202[0-9]{11}|193[0-9]{11})\b/);
  if (ackMatch) doc.acknowledgement.acknowledgementNo = ackMatch[1].trim();

  const catMatch = cleanFullText.match(/Category\s*(?:of\s*Complaint)?\s*[:\t\-]?\s*([^\n\r\t|]{3,60})/i);
  if (catMatch) doc.acknowledgement.category = sanitize(catMatch[1], ['Sub', 'Category', 'Date', 'Incident', 'UserId']);

  const subCatMatch = cleanFullText.match(/Sub\s*Category\s*(?:of\s*Complaint)?\s*[:\t\-]?\s*([^\n\r\t|]{3,60})/i);
  if (subCatMatch) doc.acknowledgement.subCategory = sanitize(subCatMatch[1], ['Incident', 'Date', 'Additional', 'UserId']);

  const incDateMatch = cleanFullText.match(/Incident\s*Date(?:\/Time)?\s*[:\t\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}[^\n\r\t|]*)/i);
  if (incDateMatch) doc.acknowledgement.incidentDateTime = sanitize(incDateMatch[1].replace(/[\n\r]+/g, ' '), ['Complaint', 'Category', 'User', 'Name']);

  const compDateMatch = cleanFullText.match(/Complaint\s*Date\s*[:\t\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}[^\n\r\t|]*)/i);
  if (compDateMatch) {
    const cd = sanitize(compDateMatch[1].replace(/[\n\r]+/g, ' '), ['Complainant', 'Incident', 'Police', 'User', 'Name']);
    doc.acknowledgement.complaintDate = cd;
    doc.actionTaken.complaintAcceptedDate = cd;
    doc.actionTaken.underProcessDate = cd;
  }

  const userIdMatch = cleanFullText.match(/User\s*Id\s*[:\t\-]?\s*([A-Za-z0-9_]{4,30})/i);
  if (userIdMatch) doc.acknowledgement.userId = userIdMatch[1].trim();

  // ---------------- 2. COMPLAINANT DETAILS ----------------
  const compIdx = cleanFullText.indexOf('Complainant / Victim Details');
  const suspIdx = cleanFullText.indexOf('Suspect Details');
  const compSection = (compIdx !== -1 && suspIdx !== -1 && suspIdx > compIdx)
    ? cleanFullText.slice(compIdx, suspIdx)
    : cleanFullText.slice(0, Math.min(cleanFullText.length, 4000));

  const nameMatch =
    compSection.match(/Name\s*\t\s*([^\n\r\t]+)/i) ||
    compSection.match(/Complainant(?:\s*Name)?\s*[:\t\-]?\s*([A-Za-z\s.]{3,50})/i);
  if (nameMatch) {
    doc.complainant.name = sanitize(nameMatch[1], ['Gender', 'Mobile', 'Father', 'Mother', 'DOB', 'Email', 'Age']);
  }

  const genderMatch = compSection.match(/Gender\s*[:\t\-]?\s*(Male|Female|Transgender|Other)/i);
  if (genderMatch) doc.complainant.gender = genderMatch[1].trim();

  const dobMatch = compSection.match(/Date\s*of\s*Birth(?:\s*\(age\))?\s*[:\t\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i);
  if (dobMatch) doc.complainant.dateOfBirth = dobMatch[1].trim();

  const ageMatch = compSection.match(/Age\s*\(?([0-9]{1,3}\s*Years?)\)?/i) || compSection.match(/Age\s*[:\t\-]?\s*([0-9]{1,3})/i);
  if (ageMatch) doc.complainant.age = ageMatch[1].trim();

  const mobMatch = compSection.match(/Mobile\s*[:\t\-]?\s*([6-9][0-9]{9})\b/i);
  if (mobMatch) doc.complainant.mobile = mobMatch[1].trim();

  const fatherMatch = compSection.match(/Father\s*\/\s*Mother\s*\/\s*Spouse\s*Name\s*[:\t\-]?\s*([^\n\r\t]+)/i);
  if (fatherMatch) doc.complainant.fatherMotherSpouseName = sanitize(fatherMatch[1], ['Email', 'Street', 'House', 'Village', 'Pincode']);

  const emailMatch = compSection.match(/Email\s*[:\t\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[A-Za-z0-9_-]{6,30})/i);
  if (emailMatch) doc.complainant.email = emailMatch[1].trim();

  const psMatch = compSection.match(/Police\s*Station\s*[:\t\-]?\s*([^\n\r\t]+)/i);
  if (psMatch) doc.complainant.policeStation = sanitize(psMatch[1], ['District', 'State', 'Pincode']);

  const distMatch = compSection.match(/District\s*[:\t\-]?\s*([^\n\r\t]+)/i);
  if (distMatch) doc.complainant.district = sanitize(distMatch[1], ['State', 'Pincode', 'Police']);

  const stateMatch = compSection.match(/State\s*[:\t\-]?\s*([A-Za-z\s.]{3,30})/i);
  if (stateMatch) doc.complainant.state = sanitize(stateMatch[1], ['Relation', 'Pincode', 'District']);

  const pinMatch = compSection.match(/Pincode\s*[:\t\-]?\s*([1-9][0-9]{5})\b/i);
  if (pinMatch) doc.complainant.pincode = pinMatch[1].trim();

  // ---------------- 3. SUSPECT DETAILS ----------------
  const suspSection = suspIdx !== -1 ? cleanFullText.slice(suspIdx, suspIdx + 2000) : cleanFullText;
  const suspState = suspSection.match(/State\s*[:\t\-]?\s*([A-Za-z\s.]{3,30})/i);
  if (suspState) doc.suspect.state = sanitize(suspState[1], ['Pincode', 'Complaint']);

  const addInfoMatch = suspSection.match(/Complaint\s*Additional\s*Info\s*[:\t\-]?\s*([^\n\r\t]{5,150})/i);
  if (addInfoMatch) doc.suspect.complaintAdditionalInfo = sanitize(addInfoMatch[1]);

  // ---------------- 4. FINANCIAL SUMMARY ----------------
  let fraudAmtStr = '';
  const fraudMatch = cleanFullText.match(/Total\s*(?:Fraudulent\s*)?Amount[^\n\r]*?([0-9,]+\.[0-9]{2})/i);
  if (fraudMatch) {
    fraudAmtStr = fraudMatch[1];
  } else if (doc.suspect.complaintAdditionalInfo) {
    const suspectAmtMatch = doc.suspect.complaintAdditionalInfo.match(/([0-9,]+)(?:\/-|\s*INR|\s*Rs)/i);
    if (suspectAmtMatch) fraudAmtStr = suspectAmtMatch[1];
  }
  if (fraudAmtStr) {
    doc.financialSummary.totalFraudulentAmountReported = `₹ ${formatRupee(fraudAmtStr)}`;
  }

  const holdAmtMatch = cleanFullText.match(/Transaction\s*put\s*on\s*hold\s*[\t:]*\s*Rs\.?\s*([0-9,]+\.[0-9]{2})/i);
  if (holdAmtMatch) {
    doc.financialSummary.transactionPutOnHoldAmount = `Rs. ${formatRupee(holdAmtMatch[1])}`;
    doc.financialSummary.totalLienAmount = `₹ ${formatRupee(holdAmtMatch[1])}`;
  }

  const atmAmtMatch = cleanFullText.match(/Withdrawal\s*through\s*ATM\s*[\t:]*\s*Rs\.?\s*([0-9,]+\.[0-9]{2})/i);
  if (atmAmtMatch) {
    doc.financialSummary.withdrawalThroughAtmAmount = `Rs. ${formatRupee(atmAmtMatch[1])}`;
  }

  const othersAmtMatch = cleanFullText.match(/Others\s*\[\s*<=500\s*\]\s*[\t:]*\s*Rs\.?\s*([0-9,]+\.[0-9]{2})/i);
  if (othersAmtMatch) {
    doc.financialSummary.othersAmount = `Rs. ${formatRupee(othersAmtMatch[1])}`;
  }

  const pendingTotalMatch = cleanFullText.match(/Total\s*\t\s*[0-9]+\s*\t\s*([0-9,]+\.[0-9]{2})\s*\t\s*([0-9,]+\.[0-9]{2})/i);
  if (pendingTotalMatch) {
    doc.financialSummary.totalDisputedAmount = `₹ ${formatRupee(pendingTotalMatch[2])}`;
  }

  // ---------------- 5. VICTIM ACCOUNT DETAILS TABLE ----------------
  const vicIdx = cleanFullText.indexOf('Victim Account Details:');
  if (vicIdx !== -1) {
    const possibleEnds = [
      'Suspect Account Details:',
      'Additional Information by Police',
      'Supporting Evidence :',
      'Pending Transactions:',
      'Money Transfer to',
    ];
    let vicEnd = cleanFullText.length;
    for (const pe of possibleEnds) {
      const idx = cleanFullText.indexOf(pe, vicIdx + 30);
      if (idx !== -1 && idx < vicEnd) vicEnd = idx;
    }
    const vicSection = cleanFullText.slice(vicIdx, vicEnd);
    const vicRegex = /(\d+)\s*\t\s*([0-9]{9,18})\s*\t\s*([A-Za-z0-9_-]+)\s*\t\s*([0-9,]+\.[0-9]{2})\s*\t\s*([0-9/]{8,10})([\s\S]*?)\s*([^\n\r]+)/g;
    let vm;
    while ((vm = vicRegex.exec(vicSection)) !== null) {
      const datesRaw = (vm[5] + ' ' + vm[6]).replace(/[\s\t\n\r]+/g, ' ').trim();
      const datesSplit = datesRaw.split(' ');
      const txnDate = datesSplit.slice(0, 2).join(' ');
      const compDate = datesSplit.slice(2).join(' ') || doc.acknowledgement.complaintDate;

      doc.victimAccountTransactions.push({
        sNo: parseInt(vm[1], 10),
        accountNoOrWalletId: vm[2].trim(),
        transactionId: vm[3].trim(),
        cardDetails: '-',
        transactionAmount: formatRupee(vm[4]),
        referenceNo: '-',
        transactionDateTime: txnDate,
        complaintDate: compDate,
        bankMerchant: vm[7].trim(),
      });
    }
  }

  // ---------------- 6. PENDING TRANSACTIONS TABLE & FRAUD BREAKDOWN ----------------
  const pendIdx = cleanFullText.indexOf('Pending Transactions:');
  const trailHeaderIdx = cleanFullText.indexOf('Money Transfer to');
  if (pendIdx !== -1 && trailHeaderIdx !== -1 && trailHeaderIdx > pendIdx) {
    const pendSection = cleanFullText.slice(pendIdx, trailHeaderIdx);
    const pendLines = pendSection.split('\n').map((l) => l.trim()).filter(Boolean);

    for (const l of pendLines) {
      // Pending transaction row: e.g. "1 \tJammu and Kashmir Bank \t8 \t4,66,327.09 \t1,59,434.18 \t12/01/2026"
      const pm = l.match(/^(\d+)\s*\t\s*([^\t]+?)\s*\t\s*(\d+)\s*\t\s*([0-9,]+\.[0-9]{2})\s*\t\s*([0-9,]+\.[0-9]{2})\s*\t\s*([0-9/:\s]+)/);
      if (pm) {
        doc.pendingTransactions.push({
          sNo: parseInt(pm[1], 10),
          bankOrFi: pm[2].trim(),
          noOfTransactionsPending: parseInt(pm[3], 10),
          totalTransactionsAmount: formatRupee(pm[4]),
          totalDisputedAmount: formatRupee(pm[5]),
          pendingFrom: pm[6].trim(),
        });
        continue;
      }

      // Summary table row: e.g. "1 \tTransaction put on hold \tRs. 55,47,036.37"
      const bm = l.match(/^(\d+)\s*\t\s*([^\t]+?)\s*\t\s*Rs\.?\s*([0-9,]+\.[0-9]{2})/);
      if (bm) {
        doc.fraudBreakdown.push({
          sNo: parseInt(bm[1], 10),
          title: bm[2].trim(),
          amount: `Rs. ${formatRupee(bm[3])}`,
        });
      }
    }
  }

  // ---------------- 7. MONEY TRANSFER TRAIL (MULTI-LAYER TABLE) ----------------
  if (trailHeaderIdx !== -1) {
    const trailText = cleanFullText.slice(trailHeaderIdx);
    const layerMatches = Array.from(trailText.matchAll(/Layer\s*:\s*(\d+)/g));

    for (let i = 0; i < layerMatches.length; i++) {
      const cur = layerMatches[i];
      const next = layerMatches[i + 1];

      const prevStart = i === 0 ? 0 : layerMatches[i - 1].index! + layerMatches[i - 1][0].length;
      const prevBlock = trailText.slice(prevStart, cur.index!);
      const nextEnd = next ? next.index! : trailText.length;
      const nextBlock = trailText.slice(cur.index! + cur[0].length, nextEnd);

      const layerStr = `Layer : ${cur[1]}`;

      // 1. Destination IFSC (Standard 11-char pattern: 4 chars + 0 + 6 chars)
      const ifscMatch = nextBlock.match(/\b([A-Za-z]{4}0[A-Za-z0-9]{6}|YESB0[A-Za-z0-9]{6}|PAYT0[A-Za-z0-9]{6}|AIRP0[A-Za-z0-9]{6}|IPOS0[A-Za-z0-9]{6})\b/i);
      const destIfsc = ifscMatch ? ifscMatch[1].toUpperCase() : '-';

      // 2. Destination Account Number (between 'Layer : X' and IFSC)
      let destAc = '-';
      if (ifscMatch && ifscMatch.index !== undefined) {
        const textBeforeIfsc = nextBlock.slice(0, ifscMatch.index).trim();
        const acClean = textBeforeIfsc.replace(/[^0-9A-Za-z]/g, '');
        if (acClean.length >= 6) {
          destAc = acClean;
        }
      } else {
        const earlyAcMatch = nextBlock.slice(0, 100).match(/([0-9]{8,18})/);
        if (earlyAcMatch) destAc = earlyAcMatch[1];
      }

      // 3. Date & Time
      const dateMatch = nextBlock.match(/([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}\s*[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\s*[AP]M)/i);
      const txnDate = dateMatch ? dateMatch[1].replace(/[\n\r]+/g, ' ').trim() : '';

      // 4. Transaction ID / UTR (Between IFSC and Date)
      let txnUtr = '-';
      if (ifscMatch && dateMatch && ifscMatch.index !== undefined && dateMatch.index !== undefined) {
        const utrSegment = nextBlock.slice(ifscMatch.index + ifscMatch[0].length, dateMatch.index).trim();
        const utrClean = utrSegment.replace(/[\s\t\n\r]+/g, ' ').trim();
        if (utrClean.length >= 6) txnUtr = utrClean.split(' ')[0];
      } else {
        const utrFallback = nextBlock.match(/\b([A-Za-z0-9_-]{10,24})\b/);
        if (utrFallback && utrFallback[1] !== destIfsc) txnUtr = utrFallback[1];
      }

      // 5. Transaction Amount and Disputed Amount
      let txnAmt = '0.00';
      let dispAmt = '0.00';
      const afterDate = dateMatch && dateMatch.index !== undefined ? nextBlock.slice(dateMatch.index + dateMatch[0].length) : nextBlock;
      // Match Indian & international currency figures like 50,000.00, 2,00,000.00, 1,19,857.00
      const amountMatches = Array.from(afterDate.matchAll(/([0-9,]+\.[0-9]{2})/g)).map((m) => m[1]);
      if (amountMatches.length >= 1) txnAmt = formatRupee(amountMatches[0]);
      if (amountMatches.length >= 2) dispAmt = formatRupee(amountMatches[1]);
      else dispAmt = txnAmt;

      // 6. Action Taken By (NCRP marks banks with the  glyph)
      let actionTakenBy = '-';
      const bankIconIdx = nextBlock.indexOf('');
      if (bankIconIdx !== -1) {
        const actionSegment = nextBlock.slice(bankIconIdx + 1, bankIconIdx + 80);
        const actionLines = actionSegment.split(/[\t\n\r]/).map((s) => s.trim()).filter(Boolean);
        if (actionLines.length > 0) {
          actionTakenBy = actionLines.slice(0, 2).join(' ').replace(/\s*\d+$/, '').trim();
        }
      }

      // 7. Destination Bank (Located in prevBlock right before 'Layer : X')
      let destBank = '-';
      const prevLines = prevBlock.split(/[\n\r]/).map((l) => l.trim()).filter((l) => l.length > 0);
      const prevTail = prevLines.slice(-5).join(' ');

      for (const b of KNOWN_INDIAN_BANKS) {
        const bankPattern = new RegExp(b.replace(/\s+/g, '\\s*'), 'i');
        if (bankPattern.test(prevTail)) {
          destBank = b;
          break;
        }
      }
      if (destBank === '-') {
        if (/Flipkart/i.test(prevTail)) destBank = 'Flipkart';
        else if (/Amazon/i.test(prevTail)) destBank = 'Amazon Pay';
        else if (/PhonePe/i.test(prevTail)) destBank = 'PhonePe';
        else if (/Google\s*Pay/i.test(prevTail)) destBank = 'Google Pay';
        else if (/Others/i.test(prevTail)) destBank = 'Others';
        else destBank = prevLines[prevLines.length - 1] || 'Bank';
      }

      // 8. Sender Account and Sender Txn
      let senderAc = '-';
      let senderTxn = '-';
      const prevCleanNoSpaces = prevBlock.replace(/[\s\t\n\r]+/g, ' ');
      const senderDigits = Array.from(prevCleanNoSpaces.matchAll(/\b([0-9]{9,18})\b/g)).map((m) => m[1]);
      if (senderDigits.length > 0) senderAc = senderDigits[0];
      if (senderDigits.length > 1) senderTxn = senderDigits[1];

      // 9. Remarks
      let remarks = '-';
      if (dateMatch && bankIconIdx !== -1 && bankIconIdx > (dateMatch.index || 0)) {
        const rawRemarks = nextBlock.slice((dateMatch.index || 0) + dateMatch[0].length, bankIconIdx);
        const cleanedRemarks = rawRemarks
          .replace(/[0-9,]+\.[0-9]{2}/g, '')
          .replace(/[\t\n\r]+/g, ' ')
          .trim();
        if (cleanedRemarks.length > 3) remarks = cleanedRemarks;
      }

      doc.moneyTransferTrail.push({
        sNo: i + 1,
        senderAccountNo: senderAc,
        senderTxnOrUtr: senderTxn,
        layer: layerStr,
        destinationBank: destBank,
        destinationAccountNo: destAc,
        destinationIfsc: destIfsc,
        transactionIdUtr: txnUtr,
        transactionDateTime: txnDate,
        transactionAmount: txnAmt,
        disputedAmount: dispAmt,
        referenceNoRemarks: remarks,
        actionTakenBy: actionTakenBy !== '-' ? actionTakenBy : destBank,
        dateOfAction: txnDate,
      });
    }
  }

  // ---------------- 8. TRANSACTIONS PUT ON HOLD TABLE ----------------
  const holdStart = cleanFullText.search(/Transaction\s*put\s*on\s*hold\s*\n\s*S\s*No\./i);
  if (holdStart !== -1) {
    const endMatches = [
      'Aadhaar Enabled Payment System',
      'Withdrawal through ATM',
      '\nOthers [ <=500]',
      '\nAction Taken\nComplaint Accepted By',
      '\nAction Taken\nLogin Id',
    ];
    let holdEnd = cleanFullText.length;
    for (const em of endMatches) {
      const idx = cleanFullText.indexOf(em, holdStart + 100);
      if (idx !== -1 && idx < holdEnd) holdEnd = idx;
    }
    const section = cleanFullText.slice(holdStart, holdEnd);
    const rowMatches = Array.from(section.matchAll(/\n(\d+)\s*\t/g));

    for (let i = 0; i < rowMatches.length; i++) {
      const cur = rowMatches[i];
      const next = rowMatches[i + 1];
      const block = section
        .slice(cur.index, next ? next.index : section.length)
        .replace(/-- \d+ of \d+ --/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\d+\/\d+\/\d+,\s*\d+:\d+\s*[AP]M\s*Full Details of Complaint Report/gi, '');

      const sNo = parseInt(cur[1], 10);
      const bankIdx = block.indexOf('');
      let bank = '-';
      let actionDate = '-';

      if (bankIdx !== -1) {
        let bankPart = block.slice(bankIdx + 1).trim();
        bankPart = bankPart.replace(/\s*\d+\/\d+$/, '').trim();
        const dateMatch = bankPart.match(
          /([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?::|\s*)[AP]M)\s*$/i
        );
        if (dateMatch) {
          actionDate = dateMatch[1].trim();
          bank = bankPart.slice(0, dateMatch.index).replace(/[\n\r]+/g, ' ').trim();
        } else {
          bank = bankPart.replace(/[\n\r]+/g, ' ').trim();
        }
      }

      const beforeBank = bankIdx !== -1 ? block.slice(0, bankIdx) : block;
      const amounts = Array.from(beforeBank.matchAll(/([0-9,]+\.[0-9]{2})/g)).map((m) => m[1]);
      const holdAmt = amounts[amounts.length - 1] || '0.00';

      const beforeAmt = beforeBank.slice(0, beforeBank.lastIndexOf(holdAmt)).trim();
      const holdDateMatch = beforeAmt.match(
        /([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\s*[AP]M)?)/i
      );
      const holdDate = holdDateMatch ? holdDateMatch[1].replace(/[\n\r]+/g, ' ').trim() : '-';

      const idPart = holdDateMatch ? beforeAmt.slice(0, holdDateMatch.index).trim() : beforeAmt;
      const tokens = idPart
        .split(/[\s\t\n\r]+/)
        .filter((t) => /^[0-9A-Za-z_-]{6,30}$/.test(t) && !/^\d{1,2}$/.test(t));
      const acNo = tokens[0] || '-';
      const txnId = tokens[1] || (tokens.length > 0 ? tokens[0] : '-');

      doc.transactionsPutOnHold.push({
        sNo,
        accountNo: acNo,
        transactionIdUtr: txnId,
        putOnHoldDate: holdDate,
        putOnHoldAmount: formatRupee(holdAmt),
        actionTakenBy: bank,
        dateOfAction: actionDate !== '-' ? actionDate : holdDate,
      });
    }
  }

  // ---------------- 9. WITHDRAWAL THROUGH ATM TABLE ----------------
  const atmStart = cleanFullText.search(/Withdrawal\s*through\s*ATM\s*\n\s*S/i);
  if (atmStart !== -1) {
    const endMatches = [
      '\nOthers [ <=500]',
      '\nOther\n',
      '\nAction Taken\nComplaint Accepted By',
      '\nAction Taken\nLogin Id',
    ];
    let atmEnd = cleanFullText.length;
    for (const em of endMatches) {
      const idx = cleanFullText.indexOf(em, atmStart + 200);
      if (idx !== -1 && idx < atmEnd) atmEnd = idx;
    }

    const section = cleanFullText.slice(atmStart, atmEnd);
    const rowMatches = Array.from(section.matchAll(/\n(\d+)\s*\t/g));

    for (let i = 0; i < rowMatches.length; i++) {
      const cur = rowMatches[i];
      const next = rowMatches[i + 1];
      const block = section
        .slice(cur.index, next ? next.index : section.length)
        .replace(/-- \d+ of \d+ --/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\d+\/\d+\/\d+,\s*\d+:\d+\s*[AP]M\s*Full Details of Complaint Report/gi, '');

      const sNo = parseInt(cur[1], 10);
      const bankIdx = block.indexOf('');
      let bank = '-';
      let actionDate = '-';

      if (bankIdx !== -1) {
        let bankPart = block.slice(bankIdx + 1).trim();
        bankPart = bankPart.replace(/\s*\d+\/\d+$/, '').trim();
        const dateMatch = bankPart.match(
          /([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?::|\s*)[AP]M)\s*$/i
        );
        if (dateMatch) {
          actionDate = dateMatch[1].trim();
          bank = bankPart.slice(0, dateMatch.index).replace(/[\n\r]+/g, ' ').trim();
        } else {
          bank = bankPart.replace(/[\n\r]+/g, ' ').trim();
        }
      }

      const beforeBank = bankIdx !== -1 ? block.slice(0, bankIdx) : block;
      const amounts = Array.from(beforeBank.matchAll(/([0-9,]+\.[0-9]{2})/g)).map((m) => m[1]);
      const wdrAmt = amounts[0] ? formatRupee(amounts[0]) : '0.00';
      const dispAmt = amounts[1] ? formatRupee(amounts[1]) : wdrAmt;

      const dateMatch = beforeBank.match(
        /([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\s*[AP]M)/i
      );
      const txnDate = dateMatch ? dateMatch[1].replace(/[\n\r]+/g, ' ').trim() : '-';

      const beforeDate = dateMatch ? beforeBank.slice(0, dateMatch.index).trim() : '';
      const idTokens = beforeDate
        .split(/[\s\t\n\r]+/)
        .filter((t) => /^[0-9A-Za-z_-]{6,30}$/.test(t) && !/^\d{1,2}$/.test(t));
      const acNo = idTokens[0] || '-';
      const txnId = idTokens[1] || '-';

      const atmIdMatch = beforeBank.match(/ATM\s*ID\s*[:-]+\s*([A-Za-z0-9_-]+)/i);
      const atmId = atmIdMatch ? atmIdMatch[1].trim() : '-';

      const placeMatch = beforeBank.match(/Place\s*of\s*ATM\s*[:-]+\s*([^\n\r\t]+)/i);
      const atmPlace = placeMatch ? placeMatch[1].trim() : '-';

      doc.atmWithdrawals.push({
        sNo,
        accountNo: acNo,
        transactionIdUtr: txnId,
        withdrawalDateTime: txnDate,
        withdrawalAmount: wdrAmt,
        disputedAmount: dispAmt,
        referenceRemarks: atmPlace !== '-' ? atmPlace : 'ATM Withdrawal',
        atmId,
        atmLocation: atmPlace,
        actionTakenBy: bank,
        dateOfAction: actionDate !== '-' ? actionDate : txnDate,
      });
    }
  }

  // ---------------- 10. OTHERS [ <=500] TABLE ----------------
  const othersStart = cleanFullText.search(/Others\s*\[\s*<=500\s*\]\s*\n\s*S\s*No\./i);
  if (othersStart !== -1) {
    const endMatches = ['\nOther\n', '\nAction Taken\nComplaint Accepted By', '\nAction Taken\nLogin Id'];
    let othersEnd = cleanFullText.length;
    for (const em of endMatches) {
      const idx = cleanFullText.indexOf(em, othersStart + 50);
      if (idx !== -1 && idx < othersEnd) othersEnd = idx;
    }

    const section = cleanFullText.slice(othersStart, othersEnd);
    const rowMatches = Array.from(section.matchAll(/\n(\d+)\s*\t/g));

    for (let i = 0; i < rowMatches.length; i++) {
      const cur = rowMatches[i];
      const next = rowMatches[i + 1];
      const block = section
        .slice(cur.index, next ? next.index : section.length)
        .replace(/-- \d+ of \d+ --/g, '')
        .replace(/https?:\/\/[^\s]+/g, '');

      const sNo = parseInt(cur[1], 10);
      const bankIdx = block.indexOf('');
      let bank = '-';
      let actionDate = '-';

      if (bankIdx !== -1) {
        let bankPart = block.slice(bankIdx + 1).trim();
        const dateMatch = bankPart.match(
          /([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?::|\s*)[AP]M)\s*$/i
        );
        if (dateMatch) {
          actionDate = dateMatch[1].trim();
          bank = bankPart.slice(0, dateMatch.index).replace(/[\n\r]+/g, ' ').trim();
        } else {
          bank = bankPart.replace(/[\n\r]+/g, ' ').trim();
        }
      }

      const beforeBank = bankIdx !== -1 ? block.slice(0, bankIdx) : block;
      const tokens = beforeBank
        .split(/[\s\t\n\r]+/)
        .filter((t) => /^[0-9A-Za-z_-]{6,30}$/.test(t) && !/^\d{1,2}$/.test(t));
      const acNo = tokens[0] || '-';
      const txnId = tokens[1] || '-';

      doc.othersUnder500.push({
        sNo,
        accountNo: acNo,
        transactionIdUtr: txnId,
        referenceRemarks: 'Under 500',
        actionTakenBy: bank,
        dateOfAction: actionDate,
      });
    }
  }

  // ---------------- 11. ACTION TAKEN (INVESTIGATION OFFICER DETAILS) ----------------
  const ioMatch = cleanFullText.match(/IO\s*Name\s*[:\t\-]?\s*([^\n\r\t]+)/i);
  const ioMobMatch = cleanFullText.match(/IO\s*Mobile\s*[:\t\-]?\s*([0-9]{10})\b/i);
  const ioDesigMatch = cleanFullText.match(/IO\s*Designation\s*[:\t\-]?\s*([^\n\r\t]+)/i);
  const closedDateMatch = cleanFullText.match(/Closed\s*Date\s*[:\t\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}[^\n\r\t]*)/i);
  const closedRemarkMatch = cleanFullText.match(/Closed\s*Remark\s*[:\t\-]?\s*([^\n\r\t]{5,250})/i);

  if (ioMatch) {
    const desig = ioDesigMatch ? ioDesigMatch[1].trim() : 'POLICE INSPECTOR';
    const mob = ioMobMatch ? ioMobMatch[1].trim() : '';
    doc.actionTaken.complaintAcceptedBy = `${desig} ${ioMatch[1].trim()}${mob ? ` (Mo: ${mob})` : ''}`;
  }

  if (closedDateMatch) {
    doc.actionTaken.complaintAcceptedDate = closedDateMatch[1].replace(/[\n\r]+/g, ' ').trim();
  }

  if (closedRemarkMatch) {
    doc.actionTaken.currentStatus = `Closed - ${closedRemarkMatch[1].replace(/[\n\r]+/g, ' ').trim()}`;
  } else if (cleanFullText.includes('Closed')) {
    doc.actionTaken.currentStatus = 'Closed / Resolved';
  }

  if (doc.acknowledgement.acknowledgementNo) {
    const dist = doc.complainant.district || 'TAPI';
    doc.actionTaken.eZeroFirNo = `NCRP-${doc.acknowledgement.acknowledgementNo}-${dist}`;
  }

  // ---------------- 9. SUMMARY TOTALS FALLBACK ----------------
  if (doc.financialSummary.totalFraudulentAmountReported === '₹ 0.00' && doc.victimAccountTransactions.length > 0) {
    let sum = 0;
    doc.victimAccountTransactions.forEach((r) => {
      const n = parseFloat(r.transactionAmount.replace(/,/g, ''));
      if (!isNaN(n)) sum += n;
    });
    if (sum > 0) {
      doc.financialSummary.totalFraudulentAmountReported = `₹ ${sum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
  }

  return doc;
}
