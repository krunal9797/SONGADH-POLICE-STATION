import React, { useState } from 'react';
import { CyberCrimeDocument } from '../data/sampleDocument';
import { generateStandaloneHtml } from '../utils/htmlGenerator';
import { Code2, Copy, Check, Download, FileSpreadsheet, Braces } from 'lucide-react';

interface Props {
  document: CyberCrimeDocument;
  language: 'gu' | 'en';
}

export const RawDataViewer: React.FC<Props> = ({ document: doc, language }) => {
  const [tab, setTab] = useState<'html' | 'json' | 'csv'>('html');
  const [copied, setCopied] = useState<string | null>(null);

  const isGu = language === 'gu';
  const htmlCode = generateStandaloneHtml(doc);
  const jsonCode = JSON.stringify(doc, null, 2);

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCsv = () => {
    // CSV with transactions & ATM withdrawals
    const headers = [
      'Type,S.No,Account No,Transaction ID / UTR,Amount,Date,Bank / Destination / ATM,Status / Remarks',
    ];
    const victimRows = doc.victimAccountTransactions.map(
      (v) =>
        `"Victim Txn",${v.sNo},"${v.accountNoOrWalletId}","${v.transactionId}",${v.transactionAmount},"${v.transactionDateTime}","${v.bankMerchant}","Complaint Date: ${v.complaintDate}"`
    );
    const trailRows = doc.moneyTransferTrail.map(
      (m) =>
        `"Trail ${m.layer}",${m.sNo},"${m.senderAccountNo}","${m.transactionIdUtr}",${m.transactionAmount},"${m.transactionDateTime}","${m.destinationBank} (${m.destinationAccountNo})","${m.referenceNoRemarks}"`
    );
    const atmRows = doc.atmWithdrawals.map(
      (a) =>
        `"ATM Cashout",${a.sNo},"${a.accountNo}","${a.transactionIdUtr}",${a.withdrawalAmount},"${a.withdrawalDateTime}","${a.atmId} - ${a.atmLocation}","${a.referenceRemarks}"`
    );
    return [...headers, ...victimRows, ...trailRows, ...atmRows].join('\n');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header Tabs */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'html' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{isGu ? 'સ્વતંત્ર HTML & CSS કોડ' : 'Standalone HTML/CSS Code'}</span>
          </button>
          <button
            onClick={() => setTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'json' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Braces className="w-4 h-4" />
            <span>{isGu ? 'સ્ટ્રક્ચર્ડ JSON ડેટા' : 'Structured JSON Data'}</span>
          </button>
          <button
            onClick={() => setTab('csv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'csv' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isGu ? 'CSV / એક્સેલ નિકાસ' : 'CSV / Excel Export'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'html' && (
            <>
              <button
                onClick={() => handleCopy(htmlCode, 'html')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                {copied === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'html' ? (isGu ? 'કોપી થઈ ગયું!' : 'Copied!') : (isGu ? 'HTML કોપી કરો' : 'Copy HTML')}</span>
              </button>
              <button
                onClick={() =>
                  handleDownloadFile(htmlCode, `cybercrime_${doc.acknowledgement.acknowledgementNo}.html`, 'text/html')
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGu ? '.html ફાઇલ ડાઉનલોડ કરો' : 'Download .html'}</span>
              </button>
            </>
          )}

          {tab === 'json' && (
            <>
              <button
                onClick={() => handleCopy(jsonCode, 'json')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                {copied === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'json' ? (isGu ? 'કોપી થઈ ગયું!' : 'Copied!') : (isGu ? 'JSON કોપી કરો' : 'Copy JSON')}</span>
              </button>
              <button
                onClick={() =>
                  handleDownloadFile(jsonCode, `cybercrime_${doc.acknowledgement.acknowledgementNo}.json`, 'application/json')
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGu ? '.json ડાઉનલોડ' : 'Download .json'}</span>
              </button>
            </>
          )}

          {tab === 'csv' && (
            <button
              onClick={() =>
                handleDownloadFile(generateCsv(), `transactions_${doc.acknowledgement.acknowledgementNo}.csv`, 'text/csv')
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGu ? 'CSV ડાઉનલોડ કરો' : 'Download CSV'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[650px] text-slate-200">
        <pre className="whitespace-pre">
          {tab === 'html' ? htmlCode : tab === 'json' ? jsonCode : generateCsv()}
        </pre>
      </div>
    </div>
  );
};
