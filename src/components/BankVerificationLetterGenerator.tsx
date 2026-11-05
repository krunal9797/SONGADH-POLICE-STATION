import React, { useState, useMemo } from 'react';
import { CyberCrimeDocument } from '../data/sampleDocument';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Building2,
  Building,
  UserCheck,
  Phone,
  Hash,
  Shield,
  Lock,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

interface Props {
  document: CyberCrimeDocument;
  language: 'gu' | 'en';
  onBack: () => void;
}

export interface BankLetterTarget {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  transactionId: string;
  holdAmount: string;
  dateOfHold: string;
}

/**
 * Computes sequential outward number for each bank letter
 * E.g., if base is "525", outputs 525, 526, 527...
 * If base is "525/2026", outputs 525/2026, 526/2026, 527/2026...
 * If base is "SON/525/2026", outputs SON/525/2026, SON/526/2026...
 */
export function computeOutwardNo(baseOutward: string, index: number): string {
  if (!baseOutward || baseOutward.trim() === '') {
    return '_________/2026';
  }
  const trimmed = baseOutward.trim();
  // If it's a blank underscore template like "_________/2026", do not increment the year
  if (trimmed.includes('___')) {
    return trimmed;
  }

  // Find the first integer sequence in the string
  const match = trimmed.match(/^([^0-9]*)(\d+)(.*)$/);
  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const baseNum = parseInt(numStr, 10);
    const incremented = baseNum + index;
    // Preserve leading zeros if numStr had leading zero (e.g., 0525 -> 0526)
    const padded = String(incremented).padStart(numStr.length, '0');
    return `${prefix}${padded}${suffix}`;
  }

  return index === 0 ? trimmed : `${trimmed}-${index + 1}`;
}

export const BankVerificationLetterGenerator: React.FC<Props> = ({
  document: doc,
  language,
  onBack,
}) => {
  const isGu = language === 'gu';

  // Officer configuration state
  const [officerRank, setOfficerRank] = useState<string>('POLICE INSPECTOR');
  const [officerName, setOfficerName] = useState<string>('K.D.SHARMA');
  const [officerPhone, setOfficerPhone] = useState<string>('+916359626151');
  const [outwardNo, setOutwardNo] = useState<string>('525/2026');
  const [autoIncrement, setAutoIncrement] = useState<boolean>(true);
  const [letterDate, setLetterDate] = useState<string>(
    doc.acknowledgement.complaintDate || '23/09/2026'
  );
  const [policeStation, setPoliceStation] = useState<string>(
    (doc.complainant.policeStation || 'SONGADH').toUpperCase() + ' POLICE STATION'
  );
  const [district, setDistrict] = useState<string>(
    'DIST-' +
      (doc.complainant.district || 'TAPI').toUpperCase() +
      '-' +
      (doc.complainant.policeStation || 'SONGADH').toUpperCase()
  );
  const [telNo, setTelNo] = useState<string>('02624-222033');
  const [emailId, setEmailId] = useState<string>('polstn-son-tapi@gujarat.gov.in');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>('all');

  // Build target list from transactionsPutOnHold & moneyTransferTrail
  const letterTargets: BankLetterTarget[] = useMemo(() => {
    const list: BankLetterTarget[] = [];
    const seen = new Set<string>();

    // 1. First priority: transactionsPutOnHold
    if (doc.transactionsPutOnHold && doc.transactionsPutOnHold.length > 0) {
      doc.transactionsPutOnHold.forEach((hold, idx) => {
        // Find matching IFSC or Bank name in moneyTransferTrail
        const matchingTrail = doc.moneyTransferTrail.find(
          (t) =>
            t.destinationAccountNo === hold.accountNo ||
            t.transactionIdUtr === hold.transactionIdUtr
        );

        let bank = (hold.actionTakenBy || matchingTrail?.destinationBank || '').trim();
        const accountNo = (hold.accountNo || matchingTrail?.destinationAccountNo || '-').trim();
        const ifsc = (matchingTrail?.destinationIfsc || '').trim();
        const utr = (hold.transactionIdUtr || matchingTrail?.transactionIdUtr || '-').trim();

        const isOther =
          bank.toLowerCase() === 'other' ||
          bank.toLowerCase().includes('other') ||
          bank.toLowerCase().includes('npci') ||
          bank.toLowerCase().includes('upi') ||
          accountNo.includes('@');

        const resolvedBank = isOther ? 'NPCI' : bank || 'Beneficiary Bank';
        const key = `${resolvedBank}-${accountNo}-${utr}`;

        if (!seen.has(key)) {
          seen.add(key);
          let rawAmt = (hold.putOnHoldAmount || '0.00').replace(/^(?:Rs\.?|₹)\s*/i, '').trim();
          let amt = `₹ ${rawAmt}/-`;

          list.push({
            id: `hold-${idx + 1}`,
            bankName: resolvedBank,
            accountNumber: accountNo,
            ifscCode: ifsc,
            accountHolderName: '',
            transactionId: utr,
            holdAmount: amt,
            dateOfHold: hold.putOnHoldDate || hold.dateOfAction || letterDate,
          });
        }
      });
    }

    // 2. If no transactionsPutOnHold records found, check trail records with lien/hold remarks
    if (list.length === 0 && doc.moneyTransferTrail && doc.moneyTransferTrail.length > 0) {
      doc.moneyTransferTrail.forEach((trail, idx) => {
        const remarks = (trail.referenceNoRemarks || '').toLowerCase();
        const isHoldOrLien = remarks.includes('hold') || remarks.includes('lien');

        if (isHoldOrLien) {
          const bank = (trail.destinationBank || '').trim();
          const accountNo = (trail.destinationAccountNo || trail.senderAccountNo || '-').trim();
          const isOther =
            bank.toLowerCase().includes('other') ||
            bank.toLowerCase().includes('npci') ||
            accountNo.includes('@');
          const resolvedBank = isOther ? 'NPCI' : bank || 'Beneficiary Bank';
          const key = `${resolvedBank}-${accountNo}`;

          if (!seen.has(key)) {
            seen.add(key);
            let amt = trail.disputedAmount || trail.transactionAmount || '0.00';
            if (!amt.startsWith('₹')) amt = `₹${amt}`;
            if (!amt.endsWith('/-')) amt = `${amt}/-`;

            list.push({
              id: `trail-hold-${idx + 1}`,
              bankName: resolvedBank,
              accountNumber: accountNo,
              ifscCode: trail.destinationIfsc || '',
              accountHolderName: '',
              transactionId: trail.transactionIdUtr || '-',
              holdAmount: amt,
              dateOfHold: trail.dateOfAction || letterDate,
            });
          }
        }
      });
    }

    return list;
  }, [doc, letterDate]);

  const displayedTargets =
    selectedBankId === 'all'
      ? letterTargets
      : letterTargets.filter((t) => t.id === selectedBankId);

  const getTargetOutwardNo = (targetId: string, fallbackIdx: number = 0) => {
    const targetIdx = letterTargets.findIndex((t) => t.id === targetId);
    const effectiveIdx = targetIdx >= 0 ? targetIdx : fallbackIdx;
    return autoIncrement ? computeOutwardNo(outwardNo, effectiveIdx) : outwardNo;
  };

  const handleCopyText = (target: BankLetterTarget) => {
    const targetOutwardNo = getTargetOutwardNo(target.id);
    const text = `${policeStation}
${district}
Mobile No : ${officerPhone || '+916359626151'}
E-mail ID: ${emailId}
NOTICE UNDER SECTION 94 OF B.N.S.S 2023
UNDER SECTION 63 OF BSA ACT 2023
Outward number ${targetOutwardNo},
Date-${letterDate}

To,
Nodal officer/The Manager
${target.bankName}

Subject: Provide Information related to Accounts to prepare a court order.
Reference: Acknowledgement No. ${doc.acknowledgement.acknowledgementNo}

Dear Sir/Madam,

I,Undersigned ${officerName}, ${officerRank}, ${policeStation}, brings to your notice that I am going to initiate the refund process regarding Acknowledgement No. ${doc.acknowledgement.acknowledgementNo}, and below mentioned accounts is registered in your bank. You are requested to inform the Account holder that if he/she has any issues or objections, they can raise concerns with us within 3 (three) days. We request you to provide the Suspect bank account Statement, containing details, and confirmation of freeze/lien/put on hold amount as soon as possible (in the below format).

Put on hold Amount: ${target.holdAmount}
Account Number: ${target.accountNumber}
IFSC Code: ${target.ifscCode || '-'}
Transaction ID /UTR Number: ${target.transactionId}

Hence, as per the powers conferred under BNSS 2023, Section 94, you are hereby instructed to:
1. Provide a soft copy of the customer's KYC documents.
2. Submit a complete transaction statement from the account opening date to Till Date.
3. Share the registered contact number of the account holder and the email address of the home branch.

Additionally, we request you to share information on whether any other agencies or law enforcement authorities (LEAs) have issued a freeze or lien on the aforementioned account. Kindly ensure the above information is submitted at the earliest. Please forward this request to the concerned branch.
Thank you.

(${officerName})
${officerRank}
${policeStation}
${district}
${officerPhone}`;

    navigator.clipboard.writeText(text);
    setCopiedId(target.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (No-print) */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-5 no-print space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isGu ? 'પાછા જાઓ (Back)' : 'Back'}</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  BNSS SEC 94 • BSA SEC 63
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Ack No: {doc.acknowledgement.acknowledgementNo}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {isGu
                  ? 'બેંક વેરિફિકેશન / લિયન હોલ્ડ નોટિસ જનરેટર'
                  : 'Bank Verification / Lien Hold Notice Generator'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isGu ? 'પ્રિન્ટ / PDF ડાઉનલોડ' : 'Print / Save PDF'}</span>
            </button>
          </div>
        </div>

        {/* Police Station Header & Officer Dynamic Configuration Form */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          {/* Row 1: Header Banner Settings (Dynamic Police Station, District, Mobile, Email) */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>{isGu ? '૧. લેટર હેડર વિગતો (Header Banner Details):' : '1. Letter Header Details:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isGu ? 'પોલીસ સ્ટેશન (Police Station):' : 'Police Station:'}</span>
                </label>
                <input
                  type="text"
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value.toUpperCase())}
                  placeholder="SONGADH POLICE STATION"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isGu ? 'જિલ્લો / ડિવિઝન (District line):' : 'District line:'}</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value.toUpperCase())}
                  placeholder="DIST-TAPI-SONGADH"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isGu ? 'મોબાઈલ નંબર (Mobile No):' : 'Mobile No:'}</span>
                </label>
                <input
                  type="text"
                  value={officerPhone}
                  onChange={(e) => setOfficerPhone(e.target.value)}
                  placeholder="+916359626151"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isGu ? 'ઈ-મેઈલ આઈડી (E-mail ID):' : 'E-mail ID:'}</span>
                </label>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="polstn-son-tapi@gujarat.gov.in"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Officer & Dispatch Details */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isGu ? '૨. તપાસ કરનાર અધિકારી & જાવક વિગતો (Officer & Dispatch):' : '2. Officer & Dispatch Details:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isGu ? 'અધિકારી હોદ્દો (Choose Rank):' : 'Officer Rank:'}</span>
                </label>
                <select
                  value={officerRank}
                  onChange={(e) => setOfficerRank(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="POLICE INSPECTOR">POLICE INSPECTOR (PI)</option>
                  <option value="POLICE SUB INSPECTOR">POLICE SUB INSPECTOR (PSI)</option>
                  <option value="ASSISTANT SUB INSPECTOR">ASSISTANT SUB INSPECTOR (ASI)</option>
                  <option value="HEAD CONSTABLE">HEAD CONSTABLE (HC)</option>
                  <option value="POLICE CONSTABLE">POLICE CONSTABLE (PC)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isGu ? 'અધિકારીનું નામ (Officer Name):' : 'Officer Name:'}</span>
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value.toUpperCase())}
                  placeholder="e.g. K.D.SHARMA"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isGu ? 'પ્રારંભિક જાવક નંબર (Starting Outward No):' : 'Starting Outward No:'}</span>
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoIncrement}
                      onChange={(e) => setAutoIncrement(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3 cursor-pointer"
                    />
                    <span>{isGu ? 'ઓટો-ઇન્ક્રીમેન્ટ (+1)' : 'Auto-increment (+1)'}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={outwardNo}
                  onChange={(e) => setOutwardNo(e.target.value)}
                  placeholder="525/2026"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
                />
                {autoIncrement && letterTargets.length > 1 && (
                  <div className="mt-1 text-[10px] text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center justify-between">
                    <span>
                      ક્રમ: {computeOutwardNo(outwardNo, 0)} → {computeOutwardNo(outwardNo, letterTargets.length - 1)}
                    </span>
                    <span className="font-sans font-semibold text-slate-500">
                      ({letterTargets.length} બેંકો માટે ક્રમિક)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{isGu ? 'લેટર તારીખ (Date):' : 'Letter Date:'}</span>
                </label>
                <input
                  type="text"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  placeholder="23/09/2026"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Selection Tabs */}
        {letterTargets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isGu ? 'બેંક પસંદ કરો:' : 'Select Bank:'}</span>
            </span>
            <button
              onClick={() => setSelectedBankId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedBankId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isGu ? `તમામ લેટર્સ (${letterTargets.length})` : `All Letters (${letterTargets.length})`}
            </button>
            {letterTargets.map((t, idx) => {
              const tOutward = getTargetOutwardNo(t.id, idx);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedBankId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedBankId === t.id
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.bankName}</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/10">
                    #{tOutward}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono">
                    ({t.holdAmount})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Letters Area (A4 Paper Print Format Matching Demo PDF) */}
      <div className="space-y-8 print:space-y-0">
        {displayedTargets.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-600 space-y-2">
            <Lock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">
              {isGu ? 'કોઈ હોલ્ડ અથવા લિયન વ્યવહારો મળ્યા નથી' : 'No Hold or Lien Transactions Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isGu
                ? 'આ દસ્તાવેજમાં હોલ્ડ પર મુકાયેલા વ્યવહારો (Transactions Put on Hold) ની કોઈ એન્ટ્રી નથી.'
                : 'There are no transactions put on hold or lien recorded in this document.'}
            </p>
          </div>
        ) : (
          displayedTargets.map((target, idx) => {
            const targetOutwardNo = getTargetOutwardNo(target.id, idx);
            return (
              <div
                key={target.id}
                className="a4-print-sheet bg-white mx-auto shadow-xl rounded-none text-slate-900 font-serif p-4 sm:p-6 max-w-[850px] relative print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none print:w-full"
                style={{
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                }}
              >
                {/* Inner Content Frame (Borderless as requested) */}
                <div className="a4-inner-frame p-2 sm:p-4 flex flex-col">
                  {/* Header Enclosed Box (Matching user design image_7b14bf25.png) */}
                  <div className="border-[2.5px] border-black p-3.5 sm:p-4 mb-4 flex items-center justify-between bg-white">
                    {/* Left Gujarat Police Logo */}
                    <div className="w-20 h-24 shrink-0 flex items-center justify-center">
                      <img
                        src="/police_logo.png"
                        alt="Gujarat Police"
                        className="w-20 h-24 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Center Police Station Details */}
                    <div className="text-center flex-1 px-4 font-sans space-y-0.5">
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
                        {policeStation}
                      </h1>
                      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black mt-0.5">
                        {district}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-black mt-0.5">
                        Mobile No : {officerPhone || '+916359626151'}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-black">
                        E-mail ID: {emailId}
                      </div>
                    </div>

                    {/* Right Gujarat Police Logo */}
                    <div className="w-20 h-24 shrink-0 flex items-center justify-center">
                      <img
                        src="/police_logo.png"
                        alt="Gujarat Police"
                        className="w-20 h-24 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                    {/* Legal Act Reference Headings */}
                    <div className="text-center space-y-0">
                      <div className="font-bold text-xs sm:text-sm tracking-wide text-slate-950 underline">
                        NOTICE UNDER SECTION 94 OF B.N.S.S 2023
                      </div>
                      <div className="font-bold text-xs sm:text-sm tracking-wide text-slate-950 underline">
                        UNDER SECTION 63 OF BSA ACT 2023
                      </div>
                    </div>

                    {/* Outward Number and Date */}
                    <div className="flex justify-end text-xs font-bold text-slate-900 my-3">
                      <div className="text-right space-y-0.5 font-sans">
                        <div>
                          Outward number <span className="font-mono font-bold">{targetOutwardNo}</span>,
                        </div>
                        <div>
                          Date-<span className="font-mono">{letterDate}</span>
                        </div>
                      </div>
                    </div>

                  {/* Addressee */}
                  <div className="text-xs leading-relaxed text-slate-950 mb-3 font-sans">
                    <div className="font-bold">To,</div>
                    <div className="font-bold">Nodal officer/The Manager</div>
                    <div className="font-bold text-sm text-slate-900">{target.bankName}</div>
                  </div>

                  {/* Subject and Reference Lines (Centered with Reference directly below Subject) */}
                  <div className="text-center my-3.5 font-sans space-y-1 text-xs sm:text-[13px]">
                    <div className="font-bold text-slate-950">
                      Subject: Provide Information related to Accounts to prepare a court order.
                    </div>
                    <div className="font-bold text-slate-950">
                      Reference: Acknowledgement No. {doc.acknowledgement.acknowledgementNo || '31109260232375'}
                    </div>
                  </div>

                  {/* Salutation & Body Paragraph */}
                  <div className="text-xs sm:text-[12.5px] leading-relaxed text-slate-900 text-justify space-y-3 font-sans mt-3">
                    <div className="font-bold">Dear Sir/Madam,</div>

                    <p className="indent-8">
                      I,Undersigned <strong>{officerName}</strong>, <strong>{officerRank}</strong>,{' '}
                      <strong>{policeStation}</strong>, brings to your notice that I am going to initiate
                      the refund process regarding Acknowledgement No.{' '}
                      <strong>{doc.acknowledgement.acknowledgementNo}</strong>, and below mentioned
                      accounts is registered in your bank. You are requested to inform the Account holder
                      that if he/she has any issues or objections, they can raise concerns with us within 3
                      (three) days. We request you to provide the Suspect bank account Statement, containing
                      details, and confirmation of freeze/lien/put on hold amount as soon as possible (in the
                      below format).
                    </p>
                  </div>

                  {/* Hold Details Table (Matching Demo PDF Layout) */}
                  <div className="my-3 print:my-2 overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-slate-900 text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50 text-slate-950 font-bold border-b border-slate-900">
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Put on hold Amount
                          </th>
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Account Number
                          </th>
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            IFSC Code
                          </th>
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Transaction ID /UTR Number
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-900 text-center font-mono">
                          <td className="border border-slate-900 p-1.5 print:p-1 font-bold text-slate-950">
                            {target.holdAmount}
                          </td>
                          <td className="border border-slate-900 p-1.5 print:p-1">{target.accountNumber}</td>
                          <td className="border border-slate-900 p-1.5 print:p-1">{target.ifscCode || '-'}</td>
                          <td className="border border-slate-900 p-1.5 print:p-1 text-[11px] break-all">
                            {target.transactionId}
                          </td>
                        </tr>
                        <tr className="bg-slate-50 text-slate-950 font-bold border-b border-slate-900">
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Account Holder Name
                          </th>
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Lien/Hold Amount
                          </th>
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Current Available Balance
                          </th>
                          <th className="border border-slate-900 p-1.5 print:p-1 text-center w-1/4">
                            Status Freeze or not
                          </th>
                        </tr>
                        <tr className="border-b border-slate-900 text-center h-7 print:h-6">
                          <td className="border border-slate-900 p-1.5 print:p-1 font-semibold">
                            {target.accountHolderName || '-'}
                          </td>
                          <td className="border border-slate-900 p-1.5 print:p-1 font-bold font-mono">
                           
                          </td>
                          <td className="border border-slate-900 p-1.5 print:p-1"></td>
                          <td className="border border-slate-900 p-1.5 print:p-1 font-semibold">Freeze / Lien</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Legal Instructions */}
                  <div className="text-xs sm:text-[12px] leading-relaxed text-slate-900 font-sans space-y-1.5 print:space-y-1">
                    <p className="font-semibold">
                      Hence, as per the powers conferred under BNSS 2023, Section 94, you are hereby
                      instructed to:
                    </p>
                    <ol className="list-decimal pl-6 space-y-0.5 font-semibold text-slate-950">
                      <li>Provide a soft copy of the customer’s KYC documents.</li>
                      <li>
                        Submit a complete transaction statement from the account opening date to Till
                        Date.
                      </li>
                      <li>
                        Share the registered contact number of the account holder and the email address of
                        the home branch.
                      </li>
                    </ol>

                    <p className="pt-1 text-justify">
                      Additionally, we request you to share information on whether any other agencies or
                      law enforcement authorities (LEAs) have issued a freeze or lien on the
                      aforementioned account. Kindly ensure the above information is submitted at the
                      earliest. Please forward this request to the concerned branch.
                    </p>

                    <p className="font-bold pt-0.5">Thank you.</p>
                  </div>

                {/* Officer Signature & Authority Stamp Block (Bottom Right - shifted up to avoid page-break cutoff) */}
                <div className="pt-1 mt-2 print:mt-1 print:pt-0">
                  <div className="flex justify-end text-xs font-sans">
                    <div className="text-center w-64 space-y-0.5">
                      <div className="font-bold text-sm text-slate-950">({officerName})</div>
                      <div className="font-bold text-slate-900">{officerRank}</div>
                      <div className="font-semibold text-slate-800">{policeStation}</div>
                      <div className="font-semibold text-slate-800">{district}</div>
                      <div className="font-mono text-slate-700 font-semibold">{officerPhone}</div>
                    </div>
                  </div>

                  {/* Copy Text Action Bar for this specific letter (No-print) */}
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between no-print">
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                      <span>Target Bank: <strong className="text-slate-800">{target.bankName}</strong></span>
                      <span>• Hold: <strong className="text-emerald-700">{target.holdAmount}</strong></span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        જાવક નં: {targetOutwardNo}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(target)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {copiedId === target.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copy Letter Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};
