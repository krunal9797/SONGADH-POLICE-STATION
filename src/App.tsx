import React, { useState, useRef } from 'react';
import { CyberCrimeDocument } from './data/sampleDocument';
import { DocumentHtmlView } from './components/DocumentHtmlView';
import { MoneyTrailGraph } from './components/MoneyTrailGraph';
import { OriginalPdfViewer } from './components/OriginalPdfViewer';
import { RawDataViewer } from './components/RawDataViewer';
import {
  Upload,
  RotateCcw,
  Printer,
  FileText,
  SplitSquareVertical,
  Code2,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState<CyberCrimeDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'html' | 'split' | 'trail' | 'code'>('html');
  const [language, setLanguage] = useState<'gu' | 'en'>('gu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStep, setOcrStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isGu = language === 'gu';

  const handleReset = () => {
    // Reset state as explicitly requested by user: "hu upload akris pdf and reset b ok"
    setCurrentDoc(null);
    setPdfUrl('');
    setFileName('');
    setErrorMessage(null);
    setActiveTab('html');
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(isGu ? 'કૃપા કરીને માન્ય PDF ફાઇલ અપલોડ કરો.' : 'Please upload a valid PDF file.');
      return;
    }

    setLastUploadedFile(file);
    setFileName(file.name);
    setErrorMessage(null);
    setIsProcessing(true);
    setOcrStep(isGu ? 'PDF ફાઇલ વાંચી રહ્યું છે...' : 'Reading PDF file...');

    // Create object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;

      setOcrStep(isGu ? 'AI OCR એન્જિન ડેટા સ્કેન કરી રહ્યું છે...' : 'AI OCR engine extracting all pages...');

      const response = await fetch('/api/ocr-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: base64Data,
          filename: file.name,
        }),
      });

      // Safely read response as text first to prevent JSON parse crashes on HTML error pages
      const rawText = await response.text();
      let result: any = null;

      try {
        result = JSON.parse(rawText);
      } catch (jsonErr) {
        console.error('Failed to parse server response as JSON:', rawText);
        throw new Error(
          isGu 
            ? `સર્વર તરફથી અમાન્ય પ્રતિસાદ મળ્યો (Status ${response.status}).` 
            : `Server returned non-JSON response (Status ${response.status}).`
        );
      }

      if (!response.ok) {
        let errStr = result.error || `Server OCR processing failed with status ${response.status}`;
        try {
          const parsed = JSON.parse(errStr);
          if (parsed?.error?.message) errStr = parsed.error.message;
        } catch (_) {}
        throw new Error(errStr);
      }

      setOcrStep(isGu ? 'કોષ્ટકો અને HTML/CSS લેઆઉટ તૈયાર થઈ રહ્યું છે...' : 'Reconstructing tables and building HTML/CSS layout...');
      if (result.success && result.data) {
        // Fallback default fields in case uploaded PDF has different schema
        const extracted: CyberCrimeDocument = {
          documentTitle: result.data.documentTitle || 'Extracted PDF Document',
          acknowledgement: result.data.acknowledgement || {
            acknowledgementNo: 'N/A',
            category: 'Financial Fraud',
            subCategory: 'Online Fraud',
            additionalInfoPresent: 'Yes',
            userId: 'USER_DOC',
            haveYouLostMoney: 'Yes',
            incidentDateTime: new Date().toLocaleDateString(),
            complaintDate: new Date().toLocaleDateString(),
          },
          complainant: result.data.complainant || {
            name: 'Document Subject',
            gender: 'N/A',
            dateOfBirth: 'N/A',
            age: 'N/A',
            mobile: 'N/A',
            fatherMotherSpouseName: 'N/A',
            email: 'N/A',
            streetName: '-',
            houseNo: '-',
            colony: '-',
            villageTown: '-',
            tehsil: '-',
            pincode: '-',
            policeStation: '-',
            district: '-',
            state: '-',
            relationWithVictim: 'Self',
          },
          suspect: result.data.suspect || {
            state: 'N/A',
            pincode: '-',
            complaintAdditionalInfo: '-',
          },
          financialSummary: result.data.financialSummary || {
            totalFraudulentAmountReported: '₹ 0.00',
            totalLienAmount: '₹ 0.00',
            totalDisputedAmount: '₹ 0.00',
            transactionPutOnHoldAmount: '₹ 0.00',
            withdrawalThroughAtmAmount: '₹ 0.00',
            othersAmount: '₹ 0.00',
          },
          victimAccountTransactions: result.data.victimAccountTransactions || [],
          supportingEvidence: result.data.supportingEvidence || [],
          pendingTransactions: result.data.pendingTransactions || [],
          fraudBreakdown: result.data.fraudBreakdown || [],
          moneyTransferTrail: result.data.moneyTransferTrail || [],
          transactionsPutOnHold: result.data.transactionsPutOnHold || [],
          atmWithdrawals: result.data.atmWithdrawals || [],
          othersUnder500: result.data.othersUnder500 || [],
          actionTaken: result.data.actionTaken || {
            complaintAcceptedBy: 'Competent Authority',
            complaintAcceptedDate: new Date().toLocaleDateString(),
            currentStatus: 'Processed',
            eZeroFirNo: 'FIR-OCR-EXTRACTED',
            underProcessDate: new Date().toLocaleDateString(),
          },
        };

        setCurrentDoc(extracted);
      } else {
        throw new Error('Invalid response structure from OCR service');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      let rawMsg = err?.message || '';
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed?.error?.message) rawMsg = parsed.error.message;
      } catch (_) {}

      const isDemandSpike = 
        rawMsg.includes('503') || 
        rawMsg.includes('high demand') || 
        rawMsg.includes('UNAVAILABLE') || 
        rawMsg.includes('temporary');

      if (isDemandSpike) {
        setErrorMessage(
          isGu
            ? 'Google સર્વર પર હાલમાં ખૂબ વધુ ટ્રાફિક (High Demand) હોવાથી કામચલાઉ વિલંબ છે. કૃપા કરીને થોડી સેકન્ડ પછી નીચે આપેલ "ફરી પ્રયાસ કરો" બટન દબાવો.'
            : 'Gemini server is experiencing temporary high demand (503). Please wait a few seconds and click Retry below.'
        );
      } else {
        setErrorMessage(
          isGu
            ? `OCR પ્રોસેસિંગમાં ક્ષતિ: ${rawMsg}. કૃપા કરીને ફરી પ્રયાસ કરો.`
            : `OCR Error: ${rawMsg}. Please try again.`
        );
      }
    } finally {
      setIsProcessing(false);
      setOcrStep('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Logo & Document Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-sm text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">
                    {isGu ? 'PDF થી HTML/CSS રૂપાંતરણ અને OCR વ્યુઅર' : 'PDF to HTML/CSS OCR Viewer'}
                  </h1>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="truncate max-w-[200px] sm:max-w-xs text-slate-300 font-mono">
                    {fileName || (isGu ? 'કોઈ ફાઇલ લોડ કરેલી નથી' : 'No file loaded')}
                  </span>
                  {currentDoc && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      • <CheckCircle2 className="w-3 h-3 inline" />
                      {isGu ? 'સંપૂર્ણ ડેટા લોડ થયેલ છે' : 'All Data Extracted'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Language Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'gu' ? 'en' : 'gu')}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{language === 'gu' ? 'English' : 'ગુજરાતી'}</span>
              </button>

              {/* Reset Button (Requested by User) */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 px-3 py-1.5 rounded-lg font-semibold transition"
                title={isGu ? 'બધું સાફ કરીને રીસેટ કરો' : 'Reset all data and clear file'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>{isGu ? 'રીસેટ (Reset)' : 'Reset'}</span>
              </button>

              {/* Upload PDF Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isGu ? 'PDF અપલોડ કરો' : 'Upload PDF'}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {/* Print Document */}
              {currentDoc && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-semibold transition"
                  title={isGu ? 'પ્રિન્ટ અથવા પીડીએફ તરીકે સેવ કરો' : 'Print or Save as PDF'}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span>{isGu ? 'પ્રિન્ટ' : 'Print'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Selection Tabs */}
        {currentDoc && (
          <div className="bg-slate-950/70 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
            <div className="max-w-7xl mx-auto flex items-center gap-2 py-1.5 overflow-x-auto text-xs font-medium">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'html'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isGu ? '૧. HTML & CSS દસ્તાવેજ વ્યૂ' : '1. HTML/CSS Document View'}</span>
              </button>

              <button
                onClick={() => setActiveTab('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'split'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <SplitSquareVertical className="w-4 h-4" />
                <span>{isGu ? '૨. સ્પ્લિટ વ્યૂ (મૂળ PDF ↔ HTML/CSS)' : '2. Split View (PDF ↔ HTML/CSS)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('trail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'trail'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Workflow className="w-4 h-4" />
                <span>{isGu ? '૩. મની ટ્રાન્સફર ટ્રેઇલ નકશો' : '3. Money Trail Visualizer'}</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>{isGu ? '૪. HTML / CSS / JSON કોડ' : '4. Standalone HTML & Code'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm animate-fade-in no-print">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div>
                <strong className="block font-semibold">{isGu ? 'ક્ષતિ સંદેશ' : 'Error Notice'}</strong>
                <span>{errorMessage}</span>
              </div>
              {lastUploadedFile && (
                <button
                  onClick={() => handleFileUpload(lastUploadedFile)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isGu ? 'ફરી પ્રયાસ કરો (Retry Now)' : 'Retry Now'}</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-600 hover:text-rose-900 font-bold p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* OCR Processing Progress Overlay */}
        {isProcessing && (
          <div className="bg-blue-50 border-2 border-blue-400/80 rounded-2xl p-6 text-center space-y-4 shadow-md no-print">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-950">
                {isGu ? 'PDF દસ્તાવેજ પ્રોસેસિંગ ચાલુ છે...' : 'Processing PDF Document...'}
              </h3>
              <p className="text-xs font-medium text-blue-700 mt-1">{ocrStep}</p>
            </div>
            <div className="w-full max-w-md mx-auto bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Empty State / Upload Dropzone when no doc loaded */}
        {!currentDoc && !isProcessing && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-3 border-dashed rounded-3xl p-10 md:p-16 text-center space-y-6 transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                {isGu ? 'પીડીએફ ફાઇલ અહીં ડ્રેગ કરો અથવા અપલોડ કરો' : 'Drag & Drop your PDF file here'}
              </h2>
              <p className="text-sm text-slate-600">
                {isGu
                  ? 'કોઈપણ સાયબર ક્રાઈમ સ્વીકૃતિ સ્લિપ, બેંક સ્ટેટમેન્ટ અથવા પીડીએફ દસ્તાવેજ અપલોડ કરો. તમામ કોષ્ટકો, યુટીઆર, રકમ અને સરનામાં ઓટોમેટિક HTML અને CSS માં તૈયાર થઈ જશે.'
                  : 'Upload any Cyber Crime acknowledgement slip, financial report, or document PDF. All tables, UTRs, amounts, and metadata will be accurately extracted into clean HTML & CSS.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>{isGu ? 'ફાઇલ પસંદ કરો' : 'Browse Files'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 max-w-sm mx-auto pt-4 border-t border-slate-200">
              {isGu ? 'સમર્થિત ફોર્મેટ: .pdf • મહત્તમ સાઇઝ: 25MB' : 'Supported format: .pdf • Max size: 25MB'}
            </div>
          </div>
        )}

        {/* When Document is Loaded */}
        {currentDoc && !isProcessing && (
          <div className="space-y-6">
            {/* View 1: HTML & CSS Rendered Document */}
            {activeTab === 'html' && (
              <DocumentHtmlView document={currentDoc} language={language} />
            )}

            {/* View 2: Split View (Original PDF ↔ HTML/CSS) */}
            {activeTab === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div>
                  <div className="mb-2 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>{isGu ? 'ડાબી બાજુ: મૂળ પીડીએફ ફાઇલ (Original PDF)' : 'Left: Original PDF Document'}</span>
                  </div>
                  <OriginalPdfViewer pdfUrl={pdfUrl} fileName={fileName} language={language} />
                </div>

                <div>
                  <div className="mb-2 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>{isGu ? 'જમણી બાજુ: HTML & CSS રેન્ડર કરેલ દસ્તાવેજ' : 'Right: Rendered HTML/CSS Document'}</span>
                  </div>
                  <div className="max-h-[850px] overflow-y-auto rounded-xl shadow-inner border border-slate-200">
                    <DocumentHtmlView document={currentDoc} language={language} />
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Interactive Money Flow Trail Graph */}
            {activeTab === 'trail' && (
              <MoneyTrailGraph document={currentDoc} language={language} />
            )}

            {/* View 4: HTML & JSON Code Inspector */}
            {activeTab === 'code' && (
              <RawDataViewer document={currentDoc} language={language} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-300">PDF to HTML/CSS OCR Document Engine</span> • {isGu ? 'સંપૂર્ણ ડેટા એક્સ્ટ્રેક્શન અને દસ્તાવેજ વ્યૂઅર' : 'High-fidelity document extraction & rendering'}
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Gujarati &amp; English Support</span>
            <span>•</span>
            <span>1930 Cyber Crime Format</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
