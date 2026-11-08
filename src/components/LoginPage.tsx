import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  UserPlus,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { CreateUserModal } from './CreateUserModal';
import { authenticateAppUser } from '../services/userService';

export interface UserSession {
  email: string;
  name: string;
  role: string;
  station: string;
  phone: string;
  loginTime: number;
  username?: string;
  plan?: string;
  paymentExpiryDate?: string;
}

interface LoginPageProps {
  onLoginSuccess: (user: UserSession, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Empty inputs by default as requested: username and password are not exposed on screen
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('કૃપા કરીને યુઝરનેમ અને પાસવર્ડ બંને દાખલ કરો.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try server endpoint authentication first
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: trimmedUser,
            password: trimmedPass,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.token) {
          sessionStorage.setItem('gujarat_police_token', data.token);
          sessionStorage.setItem('gujarat_police_user', JSON.stringify(data.user));
          onLoginSuccess(data.user, data.token);
          return;
        } else if (!res.ok && data?.error && !data.error.includes('ખોટો યુઝરનેમ')) {
          throw new Error(data.error);
        }
      } catch (srvErr: any) {
        if (srvErr.message && !srvErr.message.includes('fetch') && !srvErr.message.includes('ખોટો')) {
          throw srvErr;
        }
      }

      // 2. Client-side authentication via userService (supports krunal9797 and all created users with ₹199 plan check)
      const authResult = authenticateAppUser(trimmedUser, trimmedPass);

      if (!authResult.success) {
        throw new Error(authResult.error || 'ખોટો યુઝરનેમ અથવા પાસવર્ડ!');
      }

      const verifiedUser = authResult.user!;
      const officerProfile: UserSession = {
        username: verifiedUser.username,
        email: verifiedUser.email,
        name: verifiedUser.name,
        role: verifiedUser.role === 'admin' ? 'Cyber Crime Super Admin' : 'Cyber Crime Investigation Officer',
        station: verifiedUser.policeStation,
        phone: verifiedUser.phone,
        loginTime: Date.now(),
        plan: verifiedUser.plan,
        paymentExpiryDate: verifiedUser.paymentExpiryDate,
      };

      const token = 'police_auth_' + Date.now();
      sessionStorage.setItem('gujarat_police_token', token);
      sessionStorage.setItem('gujarat_police_user', JSON.stringify(officerProfile));

      onLoginSuccess(officerProfile, token);
    } catch (err: any) {
      setErrorMessage(err.message || 'લૉગિનમાં ક્ષતિ આવી.');
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

      {/* Top Branding Bar */}
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

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  યુઝરનેમ (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="યુઝરનેમ દાખલ કરો"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                  />
                </div>
              </div>

              {/* Password Field (masked type="password") */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  પાસવર્ડ (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="પાસવર્ડ દાખલ કરો"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'પાસવર્ડ છુપાવો' : 'પાસવર્ડ જુઓ'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ચકાસણી થઈ રહી છે...</span>
                  </>
                ) : (
                  <>
                    <span>લૉગિન કરો (Login)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Success Notice if created */}
            {successNotice && (
              <div className="bg-emerald-950/70 border border-emerald-500/80 text-emerald-200 rounded-xl p-3 text-xs flex items-center gap-2 animate-fade-in">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Create User Front Page CTA - User Requested */}
            <div className="pt-4 border-t border-slate-800">
              <div className="bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>નવા અધિકારી એકાઉન્ટ માટે સબ્સ્ક્રિપ્શન</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  જો તમારી પાસે લૉગિન એકાઉન્ટ નથી, તો ₹199/મહિનો પેમેન્ટ કરી તમારું નવું એકાઉન્ટ બનાવો:
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>નવું એકાઉન્ટ બનાવો (Create User - ₹199/Month)</span>
                </button>
              </div>
            </div>

            {/* Official Security Notice */}
            <div className="pt-2 text-[10px] text-slate-500 text-center leading-relaxed">
              🔒 <span className="text-slate-400 font-medium">સુરક્ષા નોટિસ:</span> આ એપ્લિકેશન CYBER EXPERT TAPI (SONGADH POLICE STATION) માટે અધિકૃત છે.
            </div>
          </div>
        </div>

        {/* Create User & Payment Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(createdUsername) => {
            setIsCreateModalOpen(false);
            setUsername(createdUsername);
            setSuccessNotice(
              `નવું એકાઉન્ટ "${createdUsername}" સફળતાપૂર્વક બની ગયું છે (₹199 Paid). હવે તમારો પાસવર્ડ દાખલ કરી લૉગિન કરો.`
            );
          }}
        />
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
