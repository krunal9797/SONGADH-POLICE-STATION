import React, { useState } from 'react';
import { CyberCrimeDocument } from '../data/sampleDocument';
import { 
  Building2, 
  ShieldAlert, 
  User, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Clock, 
  MapPin, 
  CreditCard,
  Search,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

interface Props {
  document: CyberCrimeDocument;
  language: 'gu' | 'en';
}

export const DocumentHtmlView: React.FC<Props> = ({ document: doc, language }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<string>('all');

  const isGu = language === 'gu';

  // Filter money trail
  const filteredMoneyTrail = doc.moneyTransferTrail.filter((item) => {
    const matchesQuery = 
      item.destinationBank.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.transactionIdUtr.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.destinationAccountNo.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.referenceNoRemarks.toLowerCase().includes(filterQuery.toLowerCase());
    
    if (selectedLayer === 'all') return matchesQuery;
    return matchesQuery && item.layer.toLowerCase().includes(selectedLayer.toLowerCase());
  });

  // Filter ATM withdrawals
  const filteredAtm = doc.atmWithdrawals.filter((item) => {
    return (
      item.atmLocation.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.atmId.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.transactionIdUtr.toLowerCase().includes(filterQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden font-sans">
      {/* Official Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 border-b border-blue-900/50 print:bg-white print:text-black">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/30 border border-blue-400/40 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isGu ? 'અધિકૃત પોર્ટલ રેકોર્ડ' : 'OFFICIAL OCR EXTRACTED'}
                </span>
                <span className="text-xs text-blue-200">
                  e-Zero FIR: <strong className="text-white">{doc.actionTaken.eZeroFirNo}</strong>
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
                {isGu ? 'રાષ્ટ્રીય સાયબર ક્રાઈમ રિપોર્ટિંગ પોર્ટલ' : 'National Cyber Crime Reporting Portal'}
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                {isGu ? 'ફરિયાદ સ્વીકૃતિ અને વ્યવહાર ટ્રેલ અહેવાલ' : 'Incident Acknowledgement Slip & Financial Trail Report'} • Helpline 1930
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-right print:text-black">
            <div className="text-xs text-blue-200 font-medium">
              {isGu ? 'સ્વીકૃતિ નંબર' : 'Acknowledgement No.'}
            </div>
            <div className="text-lg md:text-xl font-mono font-bold tracking-wider text-amber-300 print:text-black">
              {doc.acknowledgement.acknowledgementNo}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {doc.acknowledgement.complaintDate}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search & Filter Toolbar */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isGu ? 'ટ્રાન્ઝેક્શન, UTR, બેંક, ATM અથવા એકાઉન્ટ શોધો...' : 'Search UTR, Bank, ATM location, Account No...'}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">{isGu ? 'લેયર ફિલ્ટર:' : 'Layer:'}</span>
          {['all', '1', '2', '3'].map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLayer(l)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                selectedLayer === l
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {l === 'all' ? (isGu ? 'બધા' : 'All') : `Layer ${l}`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 print:p-0">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              {isGu ? 'કુલ છેતરપિંડી' : 'Total Fraud'}
            </div>
            <div className="text-base md:text-lg font-bold text-rose-900 mt-1">
              {doc.financialSummary.totalFraudulentAmountReported}
            </div>
            <div className="text-[10px] text-rose-600 font-medium">8 Transactions</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              {isGu ? 'કુલ લિયન (હોલ્ડ)' : 'Total Lien'}
            </div>
            <div className="text-base md:text-lg font-bold text-emerald-900 mt-1">
              {doc.financialSummary.totalLienAmount}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Put On Hold</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              {isGu ? 'ATM રોકડ ઉપાડ' : 'ATM Cashout'}
            </div>
            <div className="text-base md:text-lg font-bold text-blue-900 mt-1">
              {doc.financialSummary.withdrawalThroughAtmAmount}
            </div>
            <div className="text-[10px] text-blue-600 font-medium">13 Withdrawals</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              {isGu ? 'વિવાદિત રકમ' : 'Pending Disputed'}
            </div>
            <div className="text-base md:text-lg font-bold text-amber-900 mt-1">
              {doc.financialSummary.totalDisputedAmount}
            </div>
            <div className="text-[10px] text-amber-600 font-medium">SBI + Paytm</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
              {isGu ? 'અન્ય (<=500)' : 'Others [<=500]'}
            </div>
            <div className="text-base md:text-lg font-bold text-purple-900 mt-1">
              {doc.financialSummary.othersAmount}
            </div>
            <div className="text-[10px] text-purple-600 font-medium">Tracked</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {isGu ? 'વર્તમાન સ્થિતિ' : 'Status'}
            </div>
            <div className="text-sm md:text-base font-bold text-indigo-700 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 inline text-amber-600" />
              {doc.actionTaken.currentStatus}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Tapi Police</div>
          </div>
        </div>

        {/* 1. Acknowledgement Metadata */}
        <section>
          <div className="flex items-center gap-2 border-b-2 border-blue-900 pb-2 mb-4">
            <FileText className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {isGu ? '૧. ફરિયાદ અને સ્વીકૃતિ વિગતો' : '1. Complaint & Incident Acknowledgement Details'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="grid grid-cols-2 p-2.5 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70">
              <span className="font-semibold text-slate-600">{isGu ? 'સ્વીકૃતિ નંબર' : 'Acknowledgement No.'}</span>
              <span className="font-mono font-bold text-slate-900">{doc.acknowledgement.acknowledgementNo}</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 bg-white">
              <span className="font-semibold text-slate-600">{isGu ? 'ઘટના તારીખ અને સમય' : 'Incident Date/Time'}</span>
              <span className="text-slate-900 font-medium">{doc.acknowledgement.incidentDateTime}</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b md:border-b-0 md:border-r border-slate-200 bg-white">
              <span className="font-semibold text-slate-600">{isGu ? 'ફરિયાદ શ્રેણી' : 'Category of Complaint'}</span>
              <span className="text-slate-900 font-medium">{doc.acknowledgement.category}</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 bg-slate-50/70">
              <span className="font-semibold text-slate-600">{isGu ? 'ફરિયાદ તારીખ' : 'Complaint Date'}</span>
              <span className="text-slate-900 font-medium">{doc.acknowledgement.complaintDate}</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70">
              <span className="font-semibold text-slate-600">{isGu ? 'સબ કેટેગરી' : 'Sub Category'}</span>
              <span className="text-slate-900 font-medium">{doc.acknowledgement.subCategory}</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 bg-white">
              <span className="font-semibold text-slate-600">{isGu ? 'યુઝર આઈડી' : 'UserId'}</span>
              <span className="font-mono text-slate-900">{doc.acknowledgement.userId}</span>
            </div>
            <div className="grid grid-cols-2 p-2.5 md:border-r border-slate-200 bg-white">
              <span className="font-semibold text-slate-600">{isGu ? 'પૈસા ગુમાવ્યા છે?' : 'Have You Lost Money?'}</span>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 w-fit">
                {doc.acknowledgement.haveYouLostMoney}
              </span>
            </div>
            <div className="grid grid-cols-2 p-2.5 bg-slate-50/70">
              <span className="font-semibold text-slate-600">{isGu ? 'વધારાની માહિતી ઉપલબ્ધ' : 'Additional Info Present'}</span>
              <span className="text-slate-900">{doc.acknowledgement.additionalInfoPresent}</span>
            </div>
          </div>
        </section>

        {/* 2. Complainant & Suspect Details */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-blue-900 pb-2">
              <User className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? '૨. ફરિયાદી / પીડિતની વિગતો' : '2. Complainant / Victim Details'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 border border-slate-300 rounded-lg p-4 bg-slate-50/50 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'પીડિતનું નામ' : 'Full Name'}</span>
                <span className="font-bold text-slate-900 text-sm">{doc.complainant.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'મોબાઇલ નંબર' : 'Mobile Number'}</span>
                <span className="font-mono font-bold text-blue-800 text-sm">{doc.complainant.mobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'લિંગ અને ઉંમર' : 'Gender & Age'}</span>
                <span className="text-slate-800">{doc.complainant.gender} • {doc.complainant.age} ({doc.complainant.dateOfBirth})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'પિતા / માતા / પતિનું નામ' : 'Guardian / Spouse'}</span>
                <span className="text-slate-800 font-medium">{doc.complainant.fatherMotherSpouseName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'પોલીસ સ્ટેશન' : 'Police Station'}</span>
                <span className="font-semibold text-slate-900">{doc.complainant.policeStation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'જિલ્લો અને રાજ્ય' : 'District & State'}</span>
                <span className="text-slate-900">{doc.complainant.district}, {doc.complainant.state} (PIN: {doc.complainant.pincode})</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-rose-900 pb-2">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? 'શંકાસ્પદ / મોડસ ઓપરેન્ડી' : 'Suspect & Incident Modus'}
              </h2>
            </div>

            <div className="border border-rose-200 bg-rose-50/50 rounded-lg p-4 text-xs space-y-3">
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'શંકાસ્પદ રાજ્ય' : 'Suspect State'}</span>
                <span className="font-semibold text-slate-800">{doc.suspect.state}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'ફરિયાદ વધારાની માહિતી' : 'Complaint Additional Info'}</span>
                <div className="p-2.5 bg-white border border-rose-300 rounded font-bold text-rose-700 mt-1">
                  {doc.suspect.complaintAdditionalInfo}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{isGu ? 'સંબંધિત પીડિત' : 'Relation with Victim'}</span>
                <span className="text-slate-800">{doc.complainant.relationWithVictim}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Fraudulent Transaction Details (Victim Account) */}
        <section>
          <div className="flex items-center justify-between border-b-2 border-blue-900 pb-2 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? '૩. કપટપૂર્ણ વ્યવહારોની વિગત (પીડિત ખાતું)' : '3. Fraudulent Transaction Details (Victim Account)'}
              </h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md">
              {doc.victimAccountTransactions.length} {isGu ? 'વ્યવહારો' : 'Transactions'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-slate-300 w-12 text-center">S.No</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'ખાતા નંબર / વૉલેટ ID' : 'Account No./Wallet ID'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'ટ્રાન્ઝેક્શન ID' : 'Transaction ID'}</th>
                  <th className="p-2.5 border-r border-slate-300 text-right">{isGu ? 'રકમ (₹)' : 'Amount (₹)'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'વ્યવહાર તારીખ અને સમય' : 'Txn Date & Time'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'ફરિયાદ તારીખ' : 'Complaint Date'}</th>
                  <th className="p-2.5">{isGu ? 'બેંક / મર્ચન્ટ' : 'Bank / Merchant'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {doc.victimAccountTransactions.map((tx) => (
                  <tr key={tx.sNo} className="hover:bg-blue-50/40 transition">
                    <td className="p-2.5 border-r border-slate-200 text-center font-semibold text-slate-500">{tx.sNo}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-800">{tx.accountNoOrWalletId}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-slate-700">{tx.transactionId}</td>
                    <td className="p-2.5 border-r border-slate-200 text-right font-bold text-rose-700">₹ {tx.transactionAmount}</td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{tx.transactionDateTime}</td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{tx.complaintDate}</td>
                    <td className="p-2.5 text-slate-800">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        {tx.bankMerchant}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                <tr>
                  <td colSpan={3} className="p-2.5 text-right uppercase tracking-wider">{isGu ? 'કુલ કપટપૂર્ણ રકમ:' : 'Total Fraudulent Amount:'}</td>
                  <td className="p-2.5 text-right text-rose-700 text-sm">
                    {doc.financialSummary.totalFraudulentAmountReported}
                  </td>
                  <td colSpan={3} className="p-2.5 text-xs text-slate-500 font-normal">
                    Lien Amount: <span className="font-bold text-emerald-700">{doc.financialSummary.totalLienAmount}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 4. Multi-Layer Money Transfer Trail */}
        <section>
          <div className="flex items-center justify-between border-b-2 border-blue-900 pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? '૪. મની ટ્રાન્સફર ટ્રેઇલ (મલ્ટિ-લેયર ફ્લો)' : '4. Money Transfer Trail (Multi-Layer Investigation Trail)'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">Layer 1 (SBI)</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-semibold">Layer 2 (Yes Bank)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">Layer 3 (Paytm)</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-slate-300 text-center w-10">#</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'મોકલનાર ખાતું / UTR' : 'From Acc / UTR'}</th>
                  <th className="p-2.5 border-r border-slate-300 text-center">{isGu ? 'લેયર' : 'Layer'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'મેળવનાર બેંક અને એકાઉન્ટ' : 'Destination Bank & Acc / IFSC'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'ટ્રાન્ઝેક્શન ID / UTR' : 'Txn ID / UTR'}</th>
                  <th className="p-2.5 border-r border-slate-300 text-right">{isGu ? 'રકમ (₹)' : 'Amount (₹)'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'તારીખ અને સમય' : 'Txn Time'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'રિમાર્ક્સ / લિયન સ્ટેટસ' : 'Lien / Remarks'}</th>
                  <th className="p-2.5">{isGu ? 'કાર્યવાહી કરનાર બેંક' : 'Action Taken By'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMoneyTrail.map((item) => (
                  <tr key={item.sNo} className="hover:bg-blue-50/30 transition">
                    <td className="p-2.5 border-r border-slate-200 text-center font-semibold text-slate-500">{item.sNo}</td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-mono font-bold text-slate-800">{item.senderAccountNo}</div>
                      <div className="font-mono text-[10px] text-slate-500">{item.senderTxnOrUtr}</div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        item.layer.includes('1') 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : item.layer.includes('2')
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {item.layer}
                      </span>
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        {item.destinationBank}
                      </div>
                      <div className="font-mono text-slate-700 text-[11px]">{item.destinationAccountNo}</div>
                      <div className="text-[10px] text-slate-500 font-mono">IFSC: {item.destinationIfsc}</div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-slate-800">{item.transactionIdUtr}</td>
                    <td className="p-2.5 border-r border-slate-200 text-right font-bold text-blue-900">₹ {item.transactionAmount}</td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{item.transactionDateTime}</td>
                    <td className="p-2.5 border-r border-slate-200 text-[10.5px] text-slate-600 max-w-[180px] break-words">
                      {item.referenceNoRemarks !== '-' ? (
                        <span className="bg-slate-100 p-1 rounded block">{item.referenceNoRemarks}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2.5 text-slate-800 text-[11px]">
                      <div>{item.actionTakenBy}</div>
                      <div className="text-[10px] text-slate-400">{item.dateOfAction}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. ATM Withdrawals & Locations */}
        <section>
          <div className="flex items-center justify-between border-b-2 border-rose-900 pb-2 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? '૫. ATM દ્વારા રોકડ ઉપાડ (સ્થળ અને વિગતો)' : '5. Withdrawal Through ATM (Locations, ATM IDs & Cashout Trail)'}
              </h2>
            </div>
            <div className="text-xs font-semibold text-rose-800 bg-rose-100 px-3 py-1 rounded-md">
              {isGu ? 'કુલ રોકડ ઉપાડ:' : 'Total Cashout:'} {doc.financialSummary.withdrawalThroughAtmAmount} ({doc.atmWithdrawals.length} {isGu ? 'વ્યવહાર' : 'txns'})
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 border-r border-slate-300 text-center w-10">S.No</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'ખાતા નંબર અને UTR' : 'Account No. & UTR'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'તારીખ અને સમય' : 'Date & Time'}</th>
                  <th className="p-2.5 border-r border-slate-300 text-right">{isGu ? 'ઉપાડ રકમ (₹)' : 'Withdrawal (₹)'}</th>
                  <th className="p-2.5 border-r border-slate-300 text-right">{isGu ? 'વિવાદિત રકમ' : 'Disputed (₹)'}</th>
                  <th className="p-2.5 border-r border-slate-300 text-center">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                  <th className="p-2.5 border-r border-slate-300">{isGu ? 'ATM ID અને સ્થળ / સરનામું' : 'ATM ID & Location of ATM'}</th>
                  <th className="p-2.5">{isGu ? 'કાર્યવાહી કરનાર બેંક' : 'Action By'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAtm.map((atm) => (
                  <tr key={atm.sNo} className="hover:bg-rose-50/30 transition">
                    <td className="p-2.5 border-r border-slate-200 text-center font-semibold text-slate-500">{atm.sNo}</td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-mono font-bold text-slate-800">{atm.accountNo}</div>
                      <div className="font-mono text-[10px] text-slate-500">UTR: {atm.transactionIdUtr}</div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{atm.withdrawalDateTime}</td>
                    <td className="p-2.5 border-r border-slate-200 text-right font-bold text-rose-700">₹ {atm.withdrawalAmount}</td>
                    <td className="p-2.5 border-r border-slate-200 text-right text-slate-600">₹ {atm.disputedAmount}</td>
                    <td className="p-2.5 border-r border-slate-200 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {atm.referenceRemarks}
                      </span>
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-mono font-bold text-blue-900">{atm.atmId}</div>
                      <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        {atm.atmLocation}
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-800 text-[11px]">
                      <div>{atm.actionTakenBy}</div>
                      <div className="text-[10px] text-slate-400">{atm.dateOfAction}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Transactions Put on Hold & Pending Disputes */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Put on Hold */}
          <div>
            <div className="flex items-center gap-2 border-b-2 border-emerald-900 pb-2 mb-3">
              <Lock className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? '૬. હોલ્ડ પર મુકાયેલા વ્યવહારો' : '6. Transactions Put on Hold'}
              </h2>
            </div>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Account / UTR</th>
                    <th className="p-2 border-r border-slate-300 text-right">Hold Amount</th>
                    <th className="p-2">Date & Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.transactionsPutOnHold.map((h) => (
                    <tr key={h.sNo} className="hover:bg-emerald-50/40">
                      <td className="p-2 border-r border-slate-200 text-center text-slate-500">{h.sNo}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-[11px]">
                        <div className="font-bold text-slate-800">{h.accountNo}</div>
                        <div className="text-[10px] text-slate-500">{h.transactionIdUtr}</div>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right font-bold text-emerald-700">₹ {h.putOnHoldAmount}</td>
                      <td className="p-2 text-[11px] text-slate-700">
                        <div>{h.putOnHoldDate}</div>
                        <div className="text-[10px] text-slate-500">{h.actionTakenBy}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Disputed */}
          <div>
            <div className="flex items-center gap-2 border-b-2 border-purple-900 pb-2 mb-3">
              <Clock className="w-5 h-5 text-purple-700" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {isGu ? '૭. પેન્ડિંગ વ્યવહારોની યાદી' : '7. List of Pending Transactions'}
              </h2>
            </div>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Bank / FI</th>
                    <th className="p-2 border-r border-slate-300 text-center">Pending</th>
                    <th className="p-2 border-r border-slate-300 text-right">Total Amount</th>
                    <th className="p-2 text-right">Disputed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.pendingTransactions.map((p) => (
                    <tr key={p.sNo} className="hover:bg-purple-50/40">
                      <td className="p-2 border-r border-slate-200 text-center text-slate-500">{p.sNo}</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-800">{p.bankOrFi}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">{p.noOfTransactionsPending}</td>
                      <td className="p-2 border-r border-slate-200 text-right font-medium">₹ {p.totalTransactionsAmount}</td>
                      <td className="p-2 text-right font-bold text-purple-700">₹ {p.totalDisputedAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. Police Action Taken & FIR Status */}
        <section className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-blue-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 border-b border-blue-200 pb-3 mb-4">
            <Building2 className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-bold text-blue-950 uppercase tracking-wide">
              {isGu ? '૮. પોલીસ કાર્યવાહી અને FIR સ્થિતિ' : '8. Official Police Action & FIR Status'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[11px] block">{isGu ? 'ફરિયાદ સ્વીકારનાર અધિકારી' : 'Complaint Accepted By'}</span>
              <span className="font-bold text-slate-900 text-sm">{doc.actionTaken.complaintAcceptedBy}</span>
              <div className="text-[11px] text-slate-600 mt-1">
                {isGu ? 'સ્વીકૃતિ તારીખ:' : 'Accepted Date:'} <span className="font-medium text-slate-900">{doc.actionTaken.complaintAcceptedDate}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[11px] block">{isGu ? 'ઇ-ઝીરો એફઆઈઆર નંબર' : 'e-Zero FIR Number'}</span>
              <span className="font-mono font-bold text-blue-800 text-base">{doc.actionTaken.eZeroFirNo}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500">{isGu ? 'સ્થિતિ:' : 'Status:'}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {doc.actionTaken.currentStatus} ({doc.actionTaken.underProcessDate})
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200">
          <p>
            {isGu 
              ? 'આ દસ્તાવેજ PDF ફાઇલમાંથી અદ્યતન OCR અને ડેટા એક્સ્ટ્રેક્શન ટેકનોલોજી દ્વારા HTML/CSS માં રૂપાંતરિત કરવામાં આવ્યો છે.' 
              : 'Converted faithfully from Indian Cyber Crime Reporting Portal PDF into responsive, clean HTML & CSS.'}
          </p>
        </div>
      </div>
    </div>
  );
};
