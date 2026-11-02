import React, { useMemo } from 'react';
import { CyberCrimeDocument } from '../data/sampleDocument';
import { ArrowRight, Building2, MapPin, ShieldAlert, CreditCard, Lock, CheckCircle2, Layers } from 'lucide-react';

interface Props {
  document: CyberCrimeDocument;
  language: 'gu' | 'en';
}

export const MoneyTrailGraph: React.FC<Props> = ({ document: doc, language }) => {
  const isGu = language === 'gu';

  // Group money trail dynamically by layer
  const layerGroups = useMemo(() => {
    const groups: { [key: string]: typeof doc.moneyTransferTrail } = {};
    doc.moneyTransferTrail.forEach((item) => {
      const layerKey = item.layer || 'Layer : 1';
      if (!groups[layerKey]) {
        groups[layerKey] = [];
      }
      groups[layerKey].push(item);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      })
      .map(([layerName, items]) => {
        // Calculate total amount in this layer
        const totalAmount = items.reduce((acc, curr) => {
          const cleaned = parseFloat((curr.transactionAmount || '0').replace(/,/g, ''));
          return isNaN(cleaned) ? acc : acc + cleaned;
        }, 0);

        // Distinct banks in this layer
        const banks = Array.from(
          new Set(
            items.map((i) => {
              const isOther =
                i.destinationBank?.toLowerCase().includes('other') ||
                i.destinationBank?.toLowerCase().includes('npci') ||
                i.destinationBank?.toLowerCase().includes('upi') ||
                i.destinationAccountNo?.includes('@');
              return isOther ? 'NPCI' : i.destinationBank;
            })
          )
        );

        return {
          layerName,
          items,
          totalAmount,
          banks,
        };
      });
  }, [doc.moneyTransferTrail]);

  // Victim Account info
  const victimAccountNo = doc.victimAccountTransactions[0]?.accountNoOrWalletId || '-';
  const victimBank = doc.victimAccountTransactions[0]?.bankMerchant || 'Source Bank';
  const victimTxnCount = doc.victimAccountTransactions.length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            {isGu ? 'ઇન્ટરેક્ટિવ મની ટ્રાન્સફર ટ્રેઇલ નકશો (Layer Visualizer)' : 'Interactive Money Trail Flow & Layer Visualizer'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu 
              ? 'પીડિતના ખાતાથી લઈને લાભાર્થી બેંકો, NPCI/UPI અને ઉપાડ સુધીનો ડાયનેમિક પ્રવાહ' 
              : 'Dynamic visual breakdown from Victim Account through Beneficiary Banks, NPCI/UPI, and Cashout Points'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-200">
            {isGu ? 'કુલ ફ્રોડ:' : 'Total Fraud:'} {doc.financialSummary.totalFraudulentAmountReported}
          </span>
        </div>
      </div>

      {/* Layer Flow Architecture */}
      <div className="space-y-6">
        {/* Layer 0: Victim Source */}
        <div className="relative pl-6 border-l-2 border-blue-500 pb-6">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
            0
          </div>
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-600 text-white">
                {isGu ? 'પીડિત સ્ત્રોત ખાતું (Victim Account)' : 'Victim Account (Source)'}
              </span>
              <span className="text-xs font-mono font-bold text-blue-900">
                A/C: {victimAccountNo}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'બેંક' : 'Bank'}</span>
                <span className="font-semibold text-slate-800">{victimBank}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'કુલ વિવાદિત વ્યવહારો' : 'Transactions Disputed'}</span>
                <span className="font-bold text-rose-700">{victimTxnCount} {isGu ? 'વ્યવહારો' : 'Transactions'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'કુલ રકમ' : 'Total Amount'}</span>
                <span className="font-bold text-slate-900 text-sm">{doc.financialSummary.totalFraudulentAmountReported}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Trail Layers */}
        {layerGroups.map((group, gIdx) => {
          const colors = [
            { border: 'border-amber-500', badge: 'bg-amber-600', bg: 'bg-amber-50/70', borderBox: 'border-amber-200', text: 'text-amber-900' },
            { border: 'border-purple-500', badge: 'bg-purple-600', bg: 'bg-purple-50/70', borderBox: 'border-purple-200', text: 'text-purple-900' },
            { border: 'border-emerald-500', badge: 'bg-emerald-600', bg: 'bg-emerald-50/70', borderBox: 'border-emerald-200', text: 'text-emerald-900' },
            { border: 'border-cyan-500', badge: 'bg-cyan-600', bg: 'bg-cyan-50/70', borderBox: 'border-cyan-200', text: 'text-cyan-900' },
          ];
          const color = colors[gIdx % colors.length];

          return (
            <React.Fragment key={group.layerName}>
              {/* Arrow Transition */}
              <div className="flex items-center justify-center -my-3">
                <div className="bg-slate-100 text-slate-500 rounded-full p-1 border border-slate-200 shadow-xs flex items-center gap-1 text-[11px] px-3 font-semibold">
                  <span>Transfer Flow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Layer Card */}
              <div className={`relative pl-6 border-l-2 ${color.border} pb-4`}>
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${color.badge} border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold`}>
                  {gIdx + 1}
                </div>
                <div className={`${color.bg} border ${color.borderBox} rounded-xl p-4 text-xs space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${color.badge} text-white`}>
                        {group.layerName}
                      </span>
                      <span className="text-slate-700 font-semibold">
                        ({group.banks.join(', ')})
                      </span>
                    </div>
                    <span className={`font-bold text-sm ${color.text}`}>
                      ₹ {group.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* List accounts in this layer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {group.items.map((item, itemIdx) => {
                      const isOther =
                        item.destinationBank?.toLowerCase().includes('other') ||
                        item.destinationBank?.toLowerCase().includes('npci') ||
                        item.destinationBank?.toLowerCase().includes('upi') ||
                        item.destinationAccountNo?.includes('@');
                      const bankDisplay = isOther ? 'NPCI' : item.destinationBank;

                      return (
                        <div key={itemIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              {bankDisplay}
                            </span>
                            <span className="font-bold text-blue-900">₹ {item.transactionAmount}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-600">
                            A/C: {item.destinationAccountNo || '-'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                            <span>IFSC: {item.destinationIfsc || '-'}</span>
                            <span>UTR: {item.transactionIdUtr}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* ATM Withdrawals Section (Render only if present in document) */}
        {doc.atmWithdrawals && doc.atmWithdrawals.length > 0 && (
          <div className="bg-rose-50/70 border-2 border-rose-300 rounded-xl p-4 text-xs space-y-3 mt-4">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-rose-950 text-sm">
                  {isGu ? 'ATM રોકડ ઉપાડ ટ્રેલ' : 'ATM Cashout Drain'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold">
                {doc.financialSummary.withdrawalThroughAtmAmount}
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              {isGu 
                ? `આ રકમ નીચે દર્શાવેલ એટીએમ મશીન પરથી ${doc.atmWithdrawals.length} વ્યવહારોમાં ઉપાડી લેવામાં આવી છે:` 
                : `Cash drained directly through ${doc.atmWithdrawals.length} ATM withdrawals:`}
            </p>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {doc.atmWithdrawals.map((atm, aIdx) => (
                <div key={aIdx} className="bg-white p-2.5 rounded border border-rose-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{atm.atmLocation}</div>
                    <div className="text-[10px] text-slate-500">
                      ATM ID: {atm.atmId} • A/C: {atm.accountNo} • {atm.actionTakenBy}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-700 block">₹ {atm.withdrawalAmount}</span>
                    <span className="text-[10px] text-slate-400">{atm.withdrawalDateTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-700">
              {isGu ? 'સ્થગિત કરાયેલ રકમ (Lien Hold):' : 'Lien Hold Recovered:'}{' '}
              <strong className="text-emerald-700 font-bold">{doc.financialSummary.transactionPutOnHoldAmount || doc.financialSummary.totalLienAmount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">
              {isGu ? 'વિવાદિત રકમ:' : 'Disputed Amount:'}{' '}
              <strong className="text-purple-700 font-bold">{doc.financialSummary.totalDisputedAmount}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
