import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock,
  User,
  Phone,
  Building,
  Mail,
  Loader2,
  Calendar,
} from 'lucide-react';
import { registerNewUser, PaymentRecord } from '../services/userService';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdUsername: string) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('GPay');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const upiId = '7043311587@ybl';
  const upiNumber = '7043311587';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}%26pn=Er.%20Krunal%20Gamit%26am=199.00%26cu=INR%26tn=Police%20Portal%201%20Month%20Access`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessInfo(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('કૃપા કરીને યુઝરનેમ અને પાસવર્ડ દાખલ કરો.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('કૃપા કરીને 10 આંકડાનો સાચો મોબાઈલ નંબર દાખલ કરો.');
      return;
    }

    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMsg('કૃપા કરીને ₹199 પેમેન્ટ કર્યા પછી મળેલ 12-આંકડાનો UTR / UPI Ref / Transaction ID દાખલ કરો.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = registerNewUser({
        username: username.trim(),
        password: password.trim(),
        name: name.trim() || username.trim(),
        phone: phone.trim(),
        email: email.trim(),
        policeStation: policeStation.trim() || 'Gujarat Police Station',
        paymentMethod,
        utrNumber: utrNumber.trim(),
        amount: 199,
        notes: `User Front Page Registration (₹199 / 30 Days)`,
      });

      if (!res.success) {
        throw new Error(res.error || 'એકાઉન્ટ બનાવવામાં નિષ્ફળ રહ્યા.');
      }

      setSuccessInfo(
        `અભિનંદન! એકાઉન્ટ સફળતાપૂર્વક બની ગયું છે અને ₹199 નું 1 મહિનાનું સબ્સ્ક્રિપ્શન સક્રિય થઈ ગયું છે.`
      );

      setTimeout(() => {
        onSuccess(username.trim());
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'એકાઉન્ટ બનાવવામાં ભૂલ આવી.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/60 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                નવું અધિકારી એકાઉન્ટ બનાવો (Create User)
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  ₹199 / મહિનો
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                CYBER EXPERT TAPI • સોનગઢ પોલીસ સ્ટેશન • પોર્ટલ એક્સેસ રજિસ્ટ્રેશન
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-rose-950/70 border border-rose-600/80 text-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successInfo && (
            <div className="bg-emerald-950/70 border border-emerald-600/80 text-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{successInfo}</div>
            </div>
          )}

          {/* Section 1: Account Login Details */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> ૧. લૉગિન ઓળખ વિગત (Login Credentials)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  યુઝરનેમ (Username) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="દા.ત. rajesh_psi અથવા tapi_officer"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  પાસવર્ડ (Password) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ઓછામાં ઓછો 4 અક્ષરનો પાસવર્ડ"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Officer Information */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> ૨. અધિકારી સંપર્ક વિગત (Officer Profile)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  પૂરું નામ (Officer Full Name) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="દા.ત. PSI R. K. Patel"
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  મોબાઈલ નંબર (Mobile No) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  પોલીસ સ્ટેશન / જિલ્લો (Police Station & Dist) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    placeholder="દા.ત. Songadh Police Station, Dist. Tapi"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ઈમેલ સરનામું (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@gujarat.police.gov.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: ₹199 Payment Section (QR Code & UPI Details) */}
          <div className="p-4 bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-900 border-2 border-indigo-500/40 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-indigo-500/30 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" /> ૩. પોર્ટલ ફી પેમેન્ટ (Monthly Fee: ₹199)
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  પોર્ટલ ચલાવવા માટે ₹199/મહિનો પેમેન્ટ કરી તેનો UTR / Transaction ID નીચે નોંધો.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-extrabold font-mono">
                <span>રકમ: ₹ 199.00</span>
                <span className="text-[10px] text-slate-400">/ 30 દિવસ</span>
              </div>
            </div>

            {/* UPI QR & Payment Info Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* QR Code Container */}
              <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-300 text-center mx-auto sm:mx-0">
                <img
                  src={qrUrl}
                  alt="UPI QR Code - ₹199"
                  className="w-32 h-32 object-contain rounded-lg"
                />
                <span className="text-[10px] font-bold text-slate-800 mt-1">
                  સ્કેન કરી ₹199 ચૂકવો
                </span>
                <span className="text-[9px] text-slate-500 font-mono">GPay • PhonePe • Paytm</span>
              </div>

              {/* UPI ID & Details */}
              <div className="sm:col-span-2 space-y-2 text-xs">
                <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>અધિકૃત UPI ID:</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedUpi ? 'કૉપિ થઈ ગયું!' : 'કૉપિ કરો'}</span>
                    </button>
                  </div>
                  <div className="text-white font-mono font-bold text-sm bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
                    <span>{upiId}</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Er. Krunal Gamit</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>UPI મોબાઈલ નંબર:</span>
                    <span className="font-mono text-slate-200 font-semibold">{upiNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">ચુકવણી માધ્યમ</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="GPay">Google Pay (GPay)</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Paytm">Paytm UPI</option>
                      <option value="UPI">BHIM UPI</option>
                      <option value="NetBanking">Net Banking</option>
                      <option value="Cash">Cash / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      UTR / Transaction ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="12 આંકડાનો UTR નંબર દાખલ કરો"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              વિગત 'krunal9797' એડમિન પેનલમાં તરત જ લિસ્ટ થશે.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                રદ કરો
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>એકાઉન્ટ બની રહ્યું છે...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>એકાઉન્ટ બનાવો અને ₹199 પેમેન્ટ કન્ફર્મ કરો</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
