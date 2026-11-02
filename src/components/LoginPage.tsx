import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  signInWithGoogle,
  AUTHORIZED_EMAIL,
  getCachedAccessToken,
  sendOtpEmailViaGmail,
} from '../services/authService';

export interface UserSession {
  email: string;
  name: string;
  role: string;
  station: string;
  phone: string;
  loginTime: number;
}

interface LoginPageProps {
  onLoginSuccess: (user: UserSession, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('gamitkrunal7997@gmail.com');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (isOtpSent && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timerSeconds]);

  // Focus first OTP field when OTP is sent
  useEffect(() => {
    if (isOtpSent && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [isOtpSent]);

  // Direct 1-Click Sign-In with Google (gamitkrunal7997@gmail.com)
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const { user } = await signInWithGoogle();
      const userEmail = (user.email || '').toLowerCase().trim();

      if (userEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
        throw new Error(
          `અનધિકૃત એકાઉન્ટ (${userEmail})! ફક્ત અધિકૃત અધિકારી (${AUTHORIZED_EMAIL}) ને જ પ્રવેશની મંજૂરી છે.`
        );
      }

      // Establish session with backend
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Google લૉગિન ચકાસણી નિષ્ફળ રહી.');
      }

      sessionStorage.setItem('gujarat_police_token', data.token);
      sessionStorage.setItem('gujarat_police_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      setErrorMessage(
        err.message || 'Google સાઇન-ઇન દરમિયાન ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Send REAL OTP to gamitkrunal7997@gmail.com via Gmail API
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('કૃપા કરીને અધિકૃત ઈમેલ એડ્રેસ દાખલ કરો.');
      return;
    }

    if (trimmedEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      setErrorMessage(
        `અનધિકૃત ઈમેલ! ફક્ત અધિકૃત અધિકારી (${AUTHORIZED_EMAIL}) ને જ પ્રવેશની મંજૂરી છે.`
      );
      return;
    }

    setIsLoading(true);
    try {
      // 1. Ensure we have Google OAuth token to dispatch actual Gmail message
      let accessToken = getCachedAccessToken();
      if (!accessToken) {
        const authResult = await signInWithGoogle();
        accessToken = authResult.accessToken;
      }

      // 2. Request new OTP from backend
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          googleAccessToken: accessToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'OTP મોકલવામાં નિષ્ફળ રહ્યા.');
      }

      // 3. Dispatch real email via Gmail API directly to inbox
      if (accessToken && data.otpCode) {
        try {
          await sendOtpEmailViaGmail(data.otpCode, trimmedEmail, accessToken);
        } catch (mailErr: any) {
          console.warn('Direct client Gmail dispatch warning:', mailErr);
        }
      }

      setIsOtpSent(true);
      setTimerSeconds(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      setSuccessMessage(
        `📨 સુરક્ષા OTP કોડ તમારા ઈમેલ ${trimmedEmail} પર સફળતાપૂર્વક મોકલવામાં આવ્યો છે! કૃપા કરીને તમારું Gmail ઇનબોક્સ ચેક કરો.`
      );
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      setErrorMessage(err.message || 'OTP મોકલવામાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMessage('કૃપા કરીને પૂરો 6 અંકનો OTP કોડ દાખલ કરો.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'અમાન્ય OTP કોડ.');
      }

      sessionStorage.setItem('gujarat_police_token', data.token);
      sessionStorage.setItem('gujarat_police_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP ચકાસણી નિષ્ફળ રહી.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Rings */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-600 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
      </div>

      {/* Top Police Branding Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/police_logo.png"
              alt="Police Emblem"
              className="h-10 w-auto object-contain drop-shadow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-wider text-white">
                  CYBER EXPERT TAPI (SONGADH POLICE STATION)
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  CYBER CELL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Songadh Police Station, Dist. Tapi • રાષ્ટ્રીય સાયબર ક્રાઈમ પોર્ટલ 1930
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-amber-400/90 font-medium bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>અધિકૃત પોર્ટલ (Restricted Access)</span>
          </div>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Card Header with Police Crest */}
          <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 p-6 sm:p-8 text-center border-b border-slate-800 relative">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-blue-400/30 p-2">
              <img
                src="/police_logo.png"
                alt="Police Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              CYBER EXPERT TAPI (SONGADH POLICE STATION)
            </h2>
            <p className="text-xs text-blue-200/90 font-medium mt-1">
              સાયબર એક્સપર્ટ તાપી • સોનગઢ પોલીસ સ્ટેશન
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              અધિકારી લૉગિન • NCRP 1930 ઇન્વેસ્ટિગેશન પોર્ટલ
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-600/60 text-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="bg-emerald-950/60 border border-emerald-600/60 text-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* STEP 1: Email Verification or Google Login */}
            {!isOtpSent ? (
              <div className="space-y-4">
                {/* Official Google Sign-In Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-3 border border-slate-200 disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                    )}
                    <span>Google એકાઉન્ટ વડે સત્તાવાર લૉગિન કરો</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-1.5">
                    સત્તાવાર ID: <strong className="text-slate-200">gamitkrunal7997@gmail.com</strong>
                  </p>
                </div>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase font-semibold">અથવા ઈમેલ OTP વડે</span>
                  <div className="flex-grow border-t border-slate-700"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      અધિકૃત ઈ-મેલ (Authorized Officer Email)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="gamitkrunal7997@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ઈમેલ પર OTP મોકલાઈ રહ્યો છે...</span>
                      </>
                    ) : (
                      <>
                        <span>ઈમેલ પર OTP મોકલો (Send OTP to Mail)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* STEP 2: Enter 6-Digit OTP from Mail */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Gmail પર આવેલ ૬-અંકનો OTP કોડ દાખલ કરો:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSent(false);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      પાછા જાઓ
                    </button>
                  </div>

                  {/* 6-box OTP Input */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5 my-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-full h-12 text-center text-lg sm:text-xl font-bold bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono shadow-inner"
                      />
                    ))}
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                      <Mail className="w-3.5 h-3.5" />
                      <span>તમારું Gmail ખોલો અને OTP ચેક કરો:</span>
                    </div>
                    <p className="text-slate-400">
                      OTP કોડ તમારા ઈમેલ <span className="text-slate-200 font-mono font-medium">{email}</span> પર મોકલવામાં આવ્યો છે. કૃપા કરીને તમારું Gmail ઇનબોક્સ તથા સ્પામ ફોલ્ડર ચકાસો.
                    </p>
                  </div>
                </div>

                {/* Verify Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ચકાસણી થઈ રહી છે...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>OTP વેરિફાય કરી લૉગિન કરો</span>
                    </>
                  )}
                </button>

                {/* Resend OTP Section */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">
                    {canResend ? (
                      'OTP મળ્યો નથી?'
                    ) : (
                      <>ફરીથી મોકલવા બાકી: <span className="font-mono text-amber-400 font-bold">{timerSeconds}s</span></>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={!canResend || isLoading}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ફરીથી મોકલો (Resend)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Official Security Notice */}
            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center leading-relaxed">
              🔒 <span className="text-slate-400 font-medium">સુરક્ષા નોટિસ:</span> આ એપ્લિકેશન CYBER EXPERT TAPI (SONGADH POLICE STATION) માટે અધિકૃત છે.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Design and Develop by Er. Krunal Gamit</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Helpline no:{' '}
              <a
                href="https://wa.me/917043311587"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 font-mono font-bold hover:underline"
              >
                +917043311587
              </a>{' '}
              <span className="text-slate-500">(whatsapp only)</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Songadh Police Station • Dist-Tapi • E-mail: polstn-son-tapi@gujarat.gov.in
          </div>
        </div>
      </footer>
    </div>
  );
};
