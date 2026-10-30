import React from 'react';
import { CyberCrimeDocument } from '../data/sampleDocument';
import { ArrowRight, Building2, MapPin, ShieldAlert, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  document: CyberCrimeDocument;
  language: 'gu' | 'en';
}

export const MoneyTrailGraph: React.FC<Props> = ({ document: doc, language }) => {
  const isGu = language === 'gu';

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
              ? 'પીડિતના ખાતાથી લઈને સ્ટેટ બેંક, યસ બેંક અને લુધિયાણાના ATM રોકડ ઉપાડ સુધીનો સંપૂર્ણ પ્રવાહ' 
              : 'Visual breakdown from Victim Account to Layer 1 (SBI), Layer 2 (Yes Bank), Layer 3 (Paytm), and ATM Cashouts in Ludhiana'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-200">
            {isGu ? 'કુલ ફ્રોડ:' : 'Total:'} {doc.financialSummary.totalFraudulentAmountReported}
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
                A/C: 16090100017167
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'બેંક' : 'Bank'}</span>
                <span className="font-semibold text-slate-800">Bank of Baroda (Songadh, Tapi)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'કુલ વિવાદિત વ્યવહારો' : 'Transactions Disputed'}</span>
                <span className="font-bold text-rose-700">8 UPI Frauds</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'કુલ રકમ' : 'Total Amount'}</span>
                <span className="font-bold text-slate-900 text-sm">{doc.financialSummary.totalFraudulentAmountReported}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Transition */}
        <div className="flex items-center justify-center -my-3">
          <div className="bg-slate-100 text-slate-500 rounded-full p-1 border border-slate-200 shadow-xs flex items-center gap-1 text-[11px] px-3 font-semibold">
            <span>UPI Transfer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Layer 1: SBI Account */}
        <div className="relative pl-6 border-l-2 border-amber-500 pb-6">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
            1
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-600 text-white">
                {isGu ? 'લેયર ૧: પ્રથમ લાભાર્થી ખાતું (Layer 1 Beneficiary)' : 'Layer 1: Primary Suspect Beneficiary'}
              </span>
              <span className="text-xs font-mono font-bold text-amber-900">
                A/C: 00000045507539522 (IFSC: SBIN0051455)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'બેંક' : 'Bank'}</span>
                <span className="font-semibold text-slate-800">State Bank of India</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'મળેલી રકમ' : 'Inflow Recorded'}</span>
                <span className="font-bold text-blue-900">₹ 2,10,200.00 (11 Transactions)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">{isGu ? 'હોલ્ડ / લિયન' : 'Put on Hold / Lien'}</span>
                <span className="font-bold text-emerald-700">₹ 667.50 (3 holds)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Branch Split: Layer 2/3 vs ATM Cashout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch A: Next Layers (Yes Bank -> Paytm) */}
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-purple-500 pb-4">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                2
              </div>
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-600 text-white">Layer 2: Yes Bank</span>
                  <span className="font-bold text-purple-900">₹ 11,800.00</span>
                </div>
                <div className="text-slate-700 font-mono text-[11px]">A/C: 001425000000051</div>
                <div className="text-[10px] text-slate-500">IFSC: YESB0MCHUPI • UTR: 625342789639</div>
              </div>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                3
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">Layer 3: Paytm</span>
                  <span className="font-bold text-emerald-900">₹ 11,800.00</span>
                </div>
                <div className="text-slate-700 font-mono text-[11px]">Wallet / A/C: 001425000000051</div>
                <div className="text-[10px] text-slate-500">Txn: 625342789639 • Pending Dispute</div>
              </div>
            </div>
          </div>

          {/* Branch B: ATM Cashouts (Ludhiana) */}
          <div className="bg-rose-50/70 border-2 border-rose-300 rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-rose-950 text-sm">
                  {isGu ? 'ATM રોકડ ઉપાડ ટ્રેલ' : 'ATM Cashout Drain'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold">
                ₹ 1,26,500.00
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              {isGu 
                ? 'આ રકમ લુધિયાણા, પંજાબ ખાતે આવેલા એટીએમ મશીન પરથી ૧૩ વ્યવહારોમાં ઉપાડી લેવામાં આવી છે:' 
                : 'Cash drained directly through 13 separate ATM withdrawals in Ludhiana, Punjab:'}
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="bg-white p-2 rounded border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">SBI DUGRI BASANT AVENUE</div>
                  <div className="text-[10px] text-slate-500">Ludhiana, PB • ATM: S1BD051455001 (7 Txns)</div>
                </div>
                <span className="font-bold text-rose-700">₹ 70,000</span>
              </div>

              <div className="bg-white p-2 rounded border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">PIPAL CHOWK GYASPURA LDH</div>
                  <div className="text-[10px] text-slate-500">Ludhiana, PB • ATM: U1NF015297080 (3 Txns)</div>
                </div>
                <span className="font-bold text-rose-700">₹ 30,000</span>
              </div>

              <div className="bg-white p-2 rounded border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">LUDHIANA ATM E1AWLD15</div>
                  <div className="text-[10px] text-slate-500">Ludhiana, PB • ATM: E1AWLD15 (2 Txns)</div>
                </div>
                <span className="font-bold text-rose-700">₹ 20,000</span>
              </div>

              <div className="bg-white p-2 rounded border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">LUDHIANA ATM DPCN2475</div>
                  <div className="text-[10px] text-slate-500">Ludhiana, PB • ATM: DPCN2475 (1 Txn)</div>
                </div>
                <span className="font-bold text-rose-700">₹ 6,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-700">
              {isGu ? 'સ્થગિત કરાયેલ રકમ (Lien Hold):' : 'Lien Hold Recovered:'} <strong className="text-emerald-700 font-bold">₹ 667.50</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">
              {isGu ? 'બાકી ટ્રેકિંગ વિવાદ:' : 'Unrecovered / Pending:'} <strong className="text-purple-700 font-bold">₹ 93,600.00</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
