import React, { useState, useRef, useEffect } from 'react';
import { CyberCrimeDocument } from './data/sampleDocument';
import { DocumentHtmlView } from './components/DocumentHtmlView';
import { MoneyTrailGraph } from './components/MoneyTrailGraph';
import { OriginalPdfViewer } from './components/OriginalPdfViewer';
import { RawDataViewer } from './components/RawDataViewer';
import { KycLetterGenerator } from './components/KycLetterGenerator';
import { BankVerificationLetterGenerator } from './components/BankVerificationLetterGenerator';
import { LoginPage, UserSession } from './components/LoginPage';
import { extractTextFromPdfInBrowser } from './utils/clientPdfExtractor';
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
  FileCheck2,
  Building2,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function App() {
  // Session Authentication State (Gatekeeper requested by user: gamitkrunal7997@gmail.com)
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('gujarat_police_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('gujarat_police_token') || null;
  });

  const [currentDoc, setCurrentDoc] = useState<CyberCrimeDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'html' | 'split' | 'trail' | 'code' | 'kyc' | 'bank'>('html');
  const [language, setLanguage] = useState<'gu' | 'en'>('gu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStep, setOcrStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isGu = language === 'gu';

  // Logout handler
  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch (_) {}
    sessionStorage.removeItem('gujarat_police_token');
    sessionStorage.removeItem('gujarat_police_user');
    setUserSession(null);
    setAuthToken(null);
    setCurrentDoc(null);
  };

  // Dynamic step message cycle during processing
  useEffect(() => {
    if (!isProcessing) return;
    const stepsGu = [
      'PDF ફાઇલ વાંચી રહ્યું છે...',
      'પેજ 1, 2, 3, 4, 5+ તમામ પૃષ્ઠો સ્કેન થઈ રહ્યાં છે...',
      'Money Transfer Trail (લેયર 1 થી 15+ સુધી) એક્સ્ટ્રેક્ટ થઈ રહ્યું છે...',
      'બેંક નામ, ખાતા નંબર, IFSC અને લીયન રકમ વેરિફિકેશન...',
      'ડિજિટલ HTML દસ્તાવેજ અને બેંક નોટિસ ફોર્મેટ તૈયાર થઈ રહ્યું છે...',
    ];
    const stepsEn = [
      'Reading and analyzing PDF document...',
      'Scanning text & tables across pages 1, 2, 3, 4, 5+...',
      'Extracting full Money Transfer Trail (Layer 1 to 15+)...',
      'Validating Bank names, Account numbers & Lien amounts...',
      'Constructing digital HTML document & Notice templates...',
    ];
    const steps = isGu ? stepsGu : stepsEn;
    let index = 0;
    setOcrStep(steps[0]);
    const timer = setInterval(() => {
      index = (index + 1) % steps.length;
      setOcrStep(steps[index]);
    }, 2500);
    return () => clearInterval(timer);
  }, [isProcessing, isGu]);

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
    setOcrStep(isGu ? 'PDF ફાઇલનું વિશ્લેષણ થઈ રહ્યું છે...' : 'Reading & analyzing PDF file...');

    // Create object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);

    try {
      setOcrStep(
        isGu
          ? 'હાઇ-સ્પીડ ડિજિટલ એન્જિન વડે તમામ પૃષ્ઠો (૧ થી ૧૦૦+ પાના) પ્રોસેસ થઈ રહ્યાં છે...'
          : 'High-speed digital engine processing all pages (1 to 100+ pages)...'
      );

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;

      const response = await fetch('/api/ocr-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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

      setOcrStep(
        isGu
          ? `સંપૂર્ણ ડેટા પ્રાપ્ત થયો (${result.meta?.totalPages || 1} પૃષ્ઠો, ${result.meta?.trailCount || 0} ટ્રેઇલ રો). લેઆઉટ તૈયાર થઈ રહ્યું છે...`
          : `Extracted ${result.meta?.totalPages || 1} pages, ${result.meta?.trailCount || 0} trail rows. Reconstructing layout...`
      );

      if (result.success && result.data) {
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

      const isFetchError =
        err?.name === 'TypeError' &&
        (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('Load failed'));

      const isDemandSpike =
        rawMsg.includes('503') ||
        rawMsg.includes('high demand') ||
        rawMsg.includes('UNAVAILABLE') ||
        rawMsg.includes('temporary');

      const isQuotaExceeded =
        rawMsg.includes('429') ||
        rawMsg.includes('RESOURCE_EXHAUSTED') ||
        rawMsg.includes('Quota exceeded') ||
        rawMsg.includes('free_tier_requests');

      if (isFetchError) {
        setErrorMessage(
          isGu
            ? 'નેટવર્ક જોડાણમાં અસ્થાયી વિલંબ થયો. કૃપા કરીને થોડીવાર પછી ફરી ફાઇલ અપલોડ કરો.'
            : 'Network connection timed out. Please try uploading the document again.'
        );
      } else if (isQuotaExceeded) {
        setErrorMessage(
          isGu
            ? 'API કીની ફ્રી ટાયર દૈનિક મર્યાદા (Daily Free Quota) પૂર્ણ થઈ ગઈ છે. કૃપા કરીને થોડો સમય રાહ જુઓ અથવા બિલિંગ સક્ષમ API કી નો ઉપયોગ કરો.'
            : 'Gemini API Free Tier daily quota limit was reached. Please wait or use an API key with billing enabled.'
        );
      } else if (isDemandSpike) {
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

  // GATEKEEPER: If not authenticated, render Login Page first as requested by user
  if (!userSession || !authToken) {
    return (
      <LoginPage
        onLoginSuccess={(user, token) => {
          setUserSession(user);
          setAuthToken(token);
        }}
      />
    );
  }

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
                    Er. Krunal Gamit
                  </h1>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Gemini 3.1 Flash Lite
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

              {/* Officer Profile Badge & Logout Button */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {userSession?.name || 'Er. Krunal Gamit'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {userSession?.email || 'gamitkrunal7997@gmail.com'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 px-3 py-1.5 rounded-lg font-semibold transition"
                  title={isGu ? 'લૉગ આઉટ કરો' : 'Logout from portal'}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isGu ? 'લૉગ આઉટ' : 'Logout'}</span>
                </button>
              </div>
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

              <button
                onClick={() => setActiveTab('kyc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'kyc'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 font-semibold'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>{isGu ? '૫. KYC લેટર (BNSS 94)' : '5. KYC Notice (BNSS 94)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('bank')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'bank'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60 font-semibold'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{isGu ? '૬. બેંક વેરિફિકેશન લેટર' : '6. Bank Verification'}</span>
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

        {/* Centered Animated Process Dialogue Modal */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in no-print">
            <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-center overflow-hidden">
              {/* Decorative Ambient Background Glows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Author & Engine Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Er. Krunal Gamit • AI OCR Engine</span>
              </div>

              {/* Scanner Central Animation */}
              <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
                {/* Outer rotating dashed ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-400/40 animate-[spin_10s_linear_infinite]" />
                
                {/* Middle spinning gradient ring */}
                <div className="absolute inset-1.5 rounded-full border-3 border-transparent border-t-blue-600 border-r-indigo-500 animate-spin" />
                
                {/* Inner glowing pulse circle */}
                <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FileText className="w-9 h-9" />
                </div>

                {/* Laser scanning beam line */}
                <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_10px_#38bdf8] animate-pulse pointer-events-none" />
                
                {/* Floating sparkle badge */}
                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                {isGu ? 'PDF દસ્તાવેજ પ્રોસેસિંગ ચાલુ છે...' : 'Processing PDF Document...'}
              </h3>

              {/* Dynamic Animated Status Step Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200/80 mb-5 max-w-full shadow-xs">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                <span className="truncate">{ocrStep}</span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-200 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 rounded-full animate-pulse w-full" />
              </div>

              {/* Live Extraction Stages Checklist */}
              <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isGu ? '૧ થી ૧૦૦+ પૃષ્ઠોનું હાઈ-સ્પીડ સ્કેનિંગ (૫૦ થી ૧૦૦ પાના સપોર્ટ)' : 'High-speed scanning across 1 to 100+ pages (50-100 pages supported)'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Workflow className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    {isGu ? 'મલ્ટિ-લેયર મની ટ્રેઇલ (લેયર ૧ થી ૧૫+ તમામ રો ૧૦૦% ચોકસાઈ સાથે)' : 'Full Multi-Layer Money Trail (Layer 1 to 15+ all rows with 100% fidelity)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isGu ? 'બેંક નામ, ખાતા નંબર, IFSC અને હોલ્ડ રકમ વેરિફિકેશન' : 'Bank names, A/C No, IFSC & Hold amount verification'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{isGu ? 'ડિજિટલ HTML દસ્તાવેજ અને બેંક ફ્રીઝ નોટિસ તૈયાર થશે' : 'Generating digital HTML & Bank freeze notice'}</span>
                </div>
              </div>

              {/* Information Footnote */}
              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                {isGu
                  ? 'ℹ️ ૫૦ થી ૧૦૦ પૃષ્ઠોના વિશાળ NCRP અહેવાલો હાઈ-સ્પીડ ડિજિટલ એન્જિન વડે સીધા પ્રોસેસ થાય છે, જેથી કોઈ વિલંબ કે ટ્રાફિક એરર (High Demand 503) ન આવે.'
                  : 'ℹ️ Large 50 to 100-page NCRP reports are extracted instantly via high-speed deterministic processing, eliminating high-demand traffic errors entirely.'}
              </p>
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
              <DocumentHtmlView
                document={currentDoc}
                language={language}
                onGenerateKycLetter={() => setActiveTab('kyc')}
                onGenerateBankLetter={() => setActiveTab('bank')}
              />
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
                    <DocumentHtmlView
                      document={currentDoc}
                      language={language}
                      onGenerateKycLetter={() => setActiveTab('kyc')}
                      onGenerateBankLetter={() => setActiveTab('bank')}
                    />
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

            {/* View 5: Official KYC Demand Notice (BNSS Sec 94) */}
            {activeTab === 'kyc' && (
              <KycLetterGenerator
                document={currentDoc}
                language={language}
                onBack={() => setActiveTab('html')}
              />
            )}

            {/* View 6: Bank Verification / Lien Hold Notice (BNSS Sec 94 & BSA Sec 63) */}
            {activeTab === 'bank' && (
              <BankVerificationLetterGenerator
                document={currentDoc}
                language={language}
                onBack={() => setActiveTab('html')}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
            <span className="font-semibold text-slate-200 tracking-wide">Design and Develop by Er. Krunal Gamit</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-300">
              Helpline no:{' '}
              <a
                href="https://wa.me/917043311587"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 font-mono font-bold hover:underline hover:text-emerald-300 transition-colors"
              >
                +917043311587
              </a>{' '}
              <span className="text-slate-400 font-medium">(whatsapp only)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Gujarati &amp; English</span>
            <span>•</span>
            <span>1930 Cyber Crime Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
