import React, { useState, useMemo } from 'react';
import { CyberCrimeDocument } from '../data/sampleDocument';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Download,
  Building2,
  UserCheck,
  Phone,
  Calendar,
  Hash,
  Shield,
  FileText,
  Layers,
} from 'lucide-react';

interface Props {
  document: CyberCrimeDocument;
  language: 'gu' | 'en';
  onBack: () => void;
}

export interface OfficerConfig {
  rank: string;
  name: string;
  phone: string;
  outwardNo: string;
  date: string;
  policeStation: string;
  district: string;
  telNo: string;
  emailId: string;
}

export interface KycLetterTarget {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  transactionId: string;
  layer: string;
}

export const KycLetterGenerator: React.FC<Props> = ({ document: doc, language, onBack }) => {
  const isGu = language === 'gu';

  // Officer configuration state
  const [officerRank, setOfficerRank] = useState<string>('POLICE INSPECTOR');
  const [officerName, setOfficerName] = useState<string>('K.D.SHARMA');
  const [officerPhone, setOfficerPhone] = useState<string>('+916359626151');
  const [outwardNo, setOutwardNo] = useState<string>('_________/2026');
  const [letterDate, setLetterDate] = useState<string>(
    doc.acknowledgement.complaintDate || '24/09/2026'
  );
  const [policeStation, setPoliceStation] = useState<string>(
    (doc.complainant.policeStation || 'SONGADH').toUpperCase() + ' POLICE STATION'
  );
  const [district, setDistrict] = useState<string>(
    'DIST-' + (doc.complainant.district || 'TAPI').toUpperCase() + '-' + (doc.complainant.policeStation || 'SONGADH').toUpperCase()
  );
  const [telNo, setTelNo] = useState<string>('02624-222033');
  const [emailId, setEmailId] = useState<string>('polstn-son-tapi@gujarat.gov.in');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>('all');

  // Extract unique banks and accounts from the money transfer trail
  const letterTargets: KycLetterTarget[] = useMemo(() => {
    const list: KycLetterTarget[] = [];
    const seen = new Set<string>();

    // 1. Extract from moneyTransferTrail
    doc.moneyTransferTrail.forEach((trail, idx) => {
      const key = `${trail.destinationBank}-${trail.destinationAccountNo}`;
      if (!seen.has(key) && trail.destinationBank) {
        seen.add(key);
        list.push({
          id: `target-${idx + 1}`,
          bankName: trail.destinationBank,
          accountNumber: trail.destinationAccountNo || trail.senderAccountNo || '-',
          ifscCode: trail.destinationIfsc || '-',
          accountHolderName: '',
          transactionId: trail.transactionIdUtr || '-',
          layer: trail.layer || 'Layer : 1',
        });
      }
    });

    // 2. If NPCI isn't present, check if there's UPI / VPA in references or add NPCI as in official notice sample
    const hasNpci = list.some((item) => item.bankName.toUpperCase().includes('NPCI'));
    if (!hasNpci) {
      list.push({
        id: 'target-npci',
        bankName: 'NPCI',
        accountNumber: 'sagarmehta09415@oksbi',
        ifscCode: '',
        accountHolderName: '',
        transactionId: doc.moneyTransferTrail[0]?.transactionIdUtr || '625342789639',
        layer: 'UPI / VPA Gateway',
      });
    }

    // Fallback if empty
    if (list.length === 0) {
      list.push({
        id: 'target-default-1',
        bankName: 'State Bank of India',
        accountNumber: '00000045507539522',
        ifscCode: 'SBIN0051455',
        accountHolderName: '',
        transactionId: '960186230585',
        layer: 'Layer : 1',
      });
    }

    return list;
  }, [doc]);

  const displayedTargets =
    selectedBankId === 'all'
      ? letterTargets
      : letterTargets.filter((t) => t.id === selectedBankId);

  const handleCopyText = (target: KycLetterTarget) => {
    const text = `SONGADH POLICE STATION
${district}
Tel. no. ${telNo}
E-mail ID: ${emailId}

NOTICE UNDER SECTION 94 OF B.N.S.S 2023
Outward number ${outwardNo},
Date-${letterDate}

To,
Nodal officer/The Manager
${target.bankName}

Subject: Request for KYC and Transaction Details of Fraudulent Account

Dear Sir/Madam,

I, ${officerName}, ${officerRank}, ${policeStation}, am currently investigating a case related to Acknowledgement No. ${doc.acknowledgement.acknowledgementNo}, filed by the complainant ${doc.complainant.name} ${doc.complainant.fatherMotherSpouseName ? doc.complainant.fatherMotherSpouseName + ' ' : ''}${doc.complainant.name.split(' ').slice(-1)[0] || ''}. The complaint involves a fraudulent financial scam, where the accused are engaged in money fraud, fake transactions, and deceptive financial activities.

As per our investigation, I formally request you to provide detailed information regarding the account(s) involved in the fraudulent transactions related to this case.

Account Number: ${target.accountNumber}
IFSC Code: ${target.ifscCode || '-'}
Account Holder Name: ${target.accountHolderName || '-'}
Transaction ID: ${target.transactionId}

Hence, as powers given in BNSS 2023, Section 94 you are instructed that:
1. Account Opening Form (AOF) and complete KYC details of the above-mentioned account.
2. Complete bank statement of the account from the date of opening till date.
3. Registered contact number and email ID of the account holder.
4. IP data records and device details related to transactions of the above-mentioned account.

So,You are hereby requested to provide the requested details at the earliest. The information may kindly be shared through the official email at ${emailId}.

Thank You.

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
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  BNSS 2023 • SEC 94
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Ack No: {doc.acknowledgement.acknowledgementNo}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {isGu ? 'KYC ડિમાન્ડ નોટિસ જનરેટર (Section 94 BNSS)' : 'KYC Demand Notice Generator (Section 94 BNSS)'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isGu ? 'પ્રિન્ટ / PDF ડાઉનલોડ' : 'Print / Save PDF'}</span>
            </button>
          </div>
        </div>

        {/* Officer Selection & Configuration Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>{isGu ? 'પોલીસ અધિકારી હોદ્દો (Choose Rank):' : 'Officer Rank:'}</span>
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
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isGu ? 'સંપર્ક નંબર (Phone No):' : 'Contact Phone:'}</span>
            </label>
            <input
              type="text"
              value={officerPhone}
              onChange={(e) => setOfficerPhone(e.target.value)}
              placeholder="+916359626151"
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-purple-600" />
              <span>{isGu ? 'જાવક નંબર (Outward No):' : 'Outward Number:'}</span>
            </label>
            <input
              type="text"
              value={outwardNo}
              onChange={(e) => setOutwardNo(e.target.value)}
              placeholder="_________/2026"
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bank Tabs Selector */}
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
          {letterTargets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedBankId(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedBankId === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{t.bankName}</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({t.accountNumber.slice(-4)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Official Letters Area (A4 Paper Print Formats) */}
      <div className="space-y-8 print:space-y-0">
        {displayedTargets.map((target, index) => (
          <div
            key={target.id}
            className="bg-white mx-auto shadow-2xl rounded-none border-2 border-slate-800 text-slate-900 font-serif p-8 sm:p-12 max-w-[850px] relative print:shadow-none print:border-3 print:border-black print:m-0 print:p-8 print:max-w-none print:w-full print:page-break-after-always"
            style={{
              minHeight: '1100px',
              fontFamily: '"Times New Roman", Times, Georgia, serif',
            }}
          >
            {/* Inner Double Border Frame (Matching Official Police Notice) */}
            <div className="border border-slate-800 p-6 sm:p-8 h-full flex flex-col justify-between print:border-slate-900">
              {/* Header with Police Emblems and Police Station Name */}
              <div>
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
                  {/* Left Gujarat Police Logo */}
                  <div className="w-20 h-24 shrink-0 flex items-center justify-center">
                    <img
                      src="/police_logo.png"
                      alt="Gujarat Police"
                      className="w-20 h-24 object-contain"
                      onError={(e) => {
                        // Fallback if image fails
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Center Police Station Details */}
                  <div className="text-center flex-1 px-4">
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950">
                      {policeStation}
                    </h1>
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mt-0.5">
                      {district}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">
                      Tel. no. {telNo}
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      E-mail ID: <span className="underline">{emailId}</span>
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

                {/* Notice Box Title */}
                <div className="text-center my-4">
                  <div className="inline-block border-b-2 border-t-2 border-slate-900 py-1 px-6">
                    <h2 className="text-sm sm:text-base font-black tracking-wide uppercase text-slate-950">
                      NOTICE UNDER SECTION 94 OF B.N.S.S 2023
                    </h2>
                  </div>
                </div>

                {/* Outward Number and Date */}
                <div className="flex justify-end text-xs font-bold text-slate-900 my-3">
                  <div className="text-right space-y-0.5 font-sans">
                    <div>
                      Outward number <span className="font-mono">{outwardNo}</span>,
                    </div>
                    <div>
                      Date-<span className="font-mono">{letterDate}</span>
                    </div>
                  </div>
                </div>

                {/* Addressee */}
                <div className="text-xs leading-relaxed text-slate-950 mb-4 font-sans">
                  <div className="font-bold">To,</div>
                  <div className="font-bold">Nodal officer/The Manager</div>
                  <div className="font-bold text-sm text-slate-900">{target.bankName}</div>
                </div>

                {/* Subject Line */}
                <div className="text-center my-4 font-sans">
                  <div className="font-bold text-xs sm:text-sm text-slate-950 underline">
                    Subject: Request for KYC and Transaction Details of Fraudulent Account
                  </div>
                </div>

                {/* Salutation & Body Paragraph */}
                <div className="text-xs sm:text-[13px] leading-relaxed text-slate-900 text-justify space-y-3 font-sans">
                  <div className="font-bold">Dear Sir/Madam,</div>

                  <p className="indent-8">
                    I, <strong>{officerName}</strong>, <strong>{officerRank}</strong>,{' '}
                    <strong>{policeStation}</strong>, am currently investigating a case related to{' '}
                    <strong>Acknowledgement No. {doc.acknowledgement.acknowledgementNo}</strong>, filed
                    by the complainant{' '}
                    <strong>
                      {doc.complainant.name}{' '}
                      {doc.complainant.fatherMotherSpouseName
                        ? doc.complainant.fatherMotherSpouseName + ' '
                        : ''}
                      {doc.complainant.name.split(' ').slice(-1)[0] || ''}
                    </strong>
                    . The complaint involves a fraudulent financial scam, where the accused are engaged in
                    money fraud, fake transactions, and deceptive financial activities.
                  </p>

                  <p className="indent-8">
                    As per our investigation, I formally request you to provide detailed information
                    regarding the account(s) involved in the fraudulent transactions related to this
                    case.
                  </p>
                </div>

                {/* Fraudulent Account Details Table */}
                <div className="my-5 overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-slate-900 text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-100 text-slate-950 font-bold border-b-2 border-slate-900">
                        <th className="border border-slate-900 p-2 text-center w-1/4">
                          Account Number
                        </th>
                        <th className="border border-slate-900 p-2 text-center w-1/4">
                          IFSC Code
                        </th>
                        <th className="border border-slate-900 p-2 text-center w-1/4">
                          Account Holder Name
                        </th>
                        <th className="border border-slate-900 p-2 text-center w-1/4">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-center">
                        <td className="border border-slate-900 p-2 font-mono">
                          {target.accountNumber}
                        </td>
                        <td className="border border-slate-900 p-2 font-mono">
                          {target.ifscCode || '-'}
                        </td>
                        <td className="border border-slate-900 p-2">
                          {target.accountHolderName || '-'}
                        </td>
                        <td className="border border-slate-900 p-2 font-mono">
                          {target.transactionId}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4 Instructions Under Section 94 */}
                <div className="text-xs sm:text-[12.5px] leading-relaxed text-slate-900 space-y-2 font-sans">
                  <div className="font-bold">
                    Hence, as powers given in BNSS 2023, Section 94 you are instructed that:
                  </div>
                  <ol className="list-decimal pl-6 space-y-1 font-medium">
                    <li>Account Opening Form (AOF) and complete KYC details of the above-mentioned account.</li>
                    <li>Complete bank statement of the account from the date of opening till date.</li>
                    <li>Registered contact number and email ID of the account holder.</li>
                    <li>IP data records and device details related to transactions of the above-mentioned account.</li>
                  </ol>

                  <p className="pt-2 text-justify">
                    So,You are hereby requested to provide the requested details at the earliest. The
                    information may kindly be shared through the official email at{' '}
                    <strong className="underline">{emailId}</strong>.
                  </p>

                  <div className="pt-2 font-semibold">Thank You.</div>
                </div>
              </div>

              {/* Signature Block (Bottom Right) */}
              <div className="flex justify-end mt-12 pt-6 font-sans">
                <div className="text-center text-xs font-bold space-y-0.5 text-slate-950 min-w-[220px]">
                  <div className="mb-8 font-normal italic text-slate-400 no-print">
                    [Signature / Seal]
                  </div>
                  <div className="font-black text-sm">({officerName})</div>
                  <div className="uppercase">{officerRank}</div>
                  <div className="uppercase">{policeStation}</div>
                  <div className="uppercase">{district}</div>
                  <div className="font-mono">{officerPhone}</div>
                </div>
              </div>
            </div>

            {/* Quick Action Floating Bar for this individual letter (No-print) */}
            <div className="absolute top-3 right-3 no-print flex items-center gap-2">
              <button
                onClick={() => handleCopyText(target)}
                className="bg-white/90 hover:bg-white text-slate-700 border border-slate-300 p-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition cursor-pointer"
                title="Copy Letter Text"
              >
                {copiedId === target.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
