import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Shield,
  Phone,
  Building,
  Key,
  Trash2,
  Calendar,
  IndianRupee,
  Lock,
} from 'lucide-react';
import {
  AppUser,
  PaymentRecord,
  getRegisteredUsers,
  getPaymentRecords,
  saveRegisteredUsers,
  savePaymentRecords,
  calculateExpiryDate,
} from '../services/userService';

interface UserManagementPanelProps {
  onOpenCreateUser: () => void;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  onOpenCreateUser,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'payments'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'expired'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = () => {
    setUsers(getRegisteredUsers());
    setPayments(getPaymentRecords());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Renew or Extend User subscription by 30 days
  const handleExtendSubscription = (userId: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const newExpiry = calculateExpiryDate(30);
        const updated: AppUser = {
          ...u,
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
          paymentExpiryDate: newExpiry,
          isActive: true,
        };

        // Also add a renewal payment record
        const newPayment: PaymentRecord = {
          id: 'pay_' + Date.now(),
          userId: u.id,
          username: u.username,
          name: u.name,
          phone: u.phone,
          amount: 199,
          date: new Date().toISOString(),
          expiryDate: newExpiry,
          utrNumber: 'RENEWAL_199_' + Math.floor(100000 + Math.random() * 900000),
          paymentMethod: 'UPI',
          status: 'approved',
          approvedBy: 'krunal9797',
          notes: 'Extended for 30 Days (₹199 Paid)',
        };

        const currentPayments = getPaymentRecords();
        savePaymentRecords([newPayment, ...currentPayments]);
        return updated;
      }
      return u;
    });

    saveRegisteredUsers(updatedUsers);
    setUsers(updatedUsers);
    setPayments(getPaymentRecords());
    setFeedbackMessage('સબ્સ્ક્રિપ્શન સફળતાપૂર્વક 30 દિવસ માટે રીન્યુ (₹199) થઈ ગયું!');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Toggle user active status
  const handleToggleActive = (userId: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId && u.username.toLowerCase() !== 'krunal9797') {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    saveRegisteredUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  // Delete user
  const handleDeleteUser = (userId: string, username: string) => {
    if (username.toLowerCase() === 'krunal9797') {
      alert('એડમિન એકાઉન્ટ ડિલીટ કરી શકાય નહીં!');
      return;
    }
    if (confirm(`શું તમે ખરેખર યુઝર "${username}" ને ડિલીટ કરવા માંગો છો?`)) {
      const filtered = users.filter((u) => u.id !== userId);
      saveRegisteredUsers(filtered);
      setUsers(filtered);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.policeStation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'paid') return u.paymentStatus === 'paid';
    if (statusFilter === 'expired') {
      const isExpired = u.paymentExpiryDate && new Date(u.paymentExpiryDate).getTime() < Date.now();
      return isExpired || u.paymentStatus === 'expired';
    }
    return true;
  });

  const filteredPayments = payments.filter((p) => {
    return (
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
  });

  // Calculate totals
  const totalRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const activePaidUsersCount = users.filter((u) => {
    if (u.role === 'admin') return true;
    const isNotExpired = u.paymentExpiryDate && new Date(u.paymentExpiryDate).getTime() > Date.now();
    return u.paymentStatus === 'paid' && isNotExpired;
  }).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
      {/* Top Banner with Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <Shield className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  અધિકારી એકાઉન્ટ અને પેમેન્ટ મેનેજમેન્ટ
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    Admin: krunal9797
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  નવા યુઝર્સની યાદી, પાસવર્ડ મેનેજમેન્ટ અને ₹199/મહિનો પેમેન્ટ હિસાબ
                </p>
              </div>
            </div>
          </div>

          {/* Quick Create User Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="રીફ્રેશ કરો"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenCreateUser}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>નવો યુઝર ઉમેરો (Create User)</span>
            </button>
          </div>
        </div>

        {/* Financial and User Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>કુલ નોંધાયેલા યુઝર</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{users.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">કુલ અધિકારી એકાઉન્ટ્સ</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>સક્રિય પેઇડ યુઝર્સ</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{activePaidUsersCount}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">₹199 માન્ય સબ્સ્ક્રિપ્શન</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>કુલ પેમેન્ટ વ્યવહારો</span>
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{payments.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">UTR વેલિડેશન રેકોર્ડ્સ</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>કુલ પ્રાપ્ત ફી (₹199/m)</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5">Google Pay / PhonePe / UPI</div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Tabs & Search Filter Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>યુઝર્સ લિસ્ટ ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payments')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'payments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>₹199 પેમેન્ટ એન્ટ્રીઓ ({payments.length})</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="શોધો (યુઝર, નામ, UTR, મોબાઈલ)..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
            />
          </div>

          {activeSubTab === 'users' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">તમામ સ્ટેટસ</option>
              <option value="paid">ચૂકવેલ (Paid ₹199)</option>
              <option value="expired">સમાપ્ત (Expired)</option>
            </select>
          )}
        </div>
      </div>

      {/* Tab 1: Users Table */}
      {activeSubTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">ક્રમ</th>
                <th className="py-3 px-4">યુઝરનેમ (Username)</th>
                <th className="py-3 px-4">પાસવર્ડ (Password)</th>
                <th className="py-3 px-4">અધિકારી નામ & પોલીસ સ્ટેશન</th>
                <th className="py-3 px-4">મોબાઈલ નંબર</th>
                <th className="py-3 px-4">પેમેન્ટ સ્ટેટસ (₹199/m)</th>
                <th className="py-3 px-4">સમાપ્તિ તારીખ (Expiry)</th>
                <th className="py-3 px-4 text-right">ક્રિયા (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    કોઈ યુઝર મળ્યા નથી.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const isExpired =
                    u.role !== 'admin' &&
                    u.paymentExpiryDate &&
                    new Date(u.paymentExpiryDate).getTime() < Date.now();
                  const isAdmin = u.username.toLowerCase() === 'krunal9797';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isAdmin ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {u.username}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              Master Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 tracking-wider">
                        {u.password || '••••••'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{u.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{u.policeStation}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <a
                          href={`tel:${u.phone}`}
                          className="hover:text-blue-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> લાઈફટાઈમ ફ્રી
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                            <XCircle className="w-3 h-3" /> સમાપ્ત (Expired)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> ₹199 ચૂકવેલ (Active)
                          </span>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          UTR: {u.transactionUtr || 'ONLINE'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isAdmin ? (
                          <span className="text-slate-500 font-medium">અનલિમિટેડ</span>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span
                              className={`font-semibold ${
                                isExpired ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {u.paymentExpiryDate
                                ? new Date(u.paymentExpiryDate).toLocaleDateString('gu-IN')
                                : '-'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isAdmin && (
                            <button
                              onClick={() => handleExtendSubscription(u.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="₹199 પેમેન્ટ મળ્યું - 30 દિવસ વધારો"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+30 દિવસ</span>
                            </button>
                          )}

                          {!isAdmin && (
                            <button
                              onClick={() => handleToggleActive(u.id)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                u.isActive
                                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  : 'bg-rose-600 text-white hover:bg-rose-500'
                              }`}
                              title={u.isActive ? 'નિષ્ક્રિય કરો' : 'સક્રિય કરો'}
                            >
                              {u.isActive ? 'બ્લોક' : 'અનબ્લોક'}
                            </button>
                          )}

                          {!isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="ડિલીટ કરો"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Payments Audit Trail */}
      {activeSubTab === 'payments' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">પેમેન્ટ ID</th>
                <th className="py-3 px-4">યુઝરનેમ (Username)</th>
                <th className="py-3 px-4">અધિકારી નામ</th>
                <th className="py-3 px-4">ચૂકવેલ રકમ</th>
                <th className="py-3 px-4">પેમેન્ટ માધ્યમ</th>
                <th className="py-3 px-4">UTR / Transaction ID</th>
                <th className="py-3 px-4">પેમેન્ટ તારીખ</th>
                <th className="py-3 px-4">સમાપ્તિ તારીખ</th>
                <th className="py-3 px-4 text-center">સ્ટેટસ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    કોઈ પેમેન્ટ રેકોર્ડ મળ્યા નથી.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition font-mono">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{p.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.username}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹ {p.amount}.00</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">{p.utrNumber}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans text-[11px]">
                      {new Date(p.date).toLocaleString('gu-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans text-[11px]">
                      {new Date(p.expiryDate).toLocaleDateString('gu-IN')}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        માન્ય (Approved)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          💡 નોંધ: દરેક નવો યુઝર ફ્રન્ટ પેજ પરથી ₹199 ચૂકવીને UTR નંબર સાથે રજિસ્ટર થાય છે. તમામ ડેટા અહીં krunal9797 ખાતામાં લાઈવ જોવા મળે છે.
        </span>
        <span className="font-semibold text-slate-700">સહાયતા હેલ્પલાઇન: +917043311587</span>
      </div>
    </div>
  );
};
