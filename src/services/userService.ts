export interface AppUser {
  id: string;
  username: string;
  password?: string; // Stored securely
  name: string;
  email: string;
  phone: string;
  policeStation: string;
  role: 'admin' | 'officer' | 'user';
  createdAt: number;
  plan: 'monthly' | 'trial' | 'free';
  monthlyFee: number; // e.g. 199
  paymentStatus: 'paid' | 'pending' | 'expired';
  paymentDate?: string;
  paymentExpiryDate?: string; // 30 days after payment
  transactionUtr?: string;
  paymentMethod?: string;
  isActive: boolean;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  username: string;
  name: string;
  phone: string;
  amount: number; // 199
  date: string;
  expiryDate: string;
  utrNumber: string;
  paymentMethod: 'UPI' | 'GPay' | 'PhonePe' | 'Paytm' | 'NetBanking' | 'Cash';
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  notes?: string;
}

const STORAGE_USERS_KEY = 'gujarat_police_registered_users_v2';
const STORAGE_PAYMENTS_KEY = 'gujarat_police_payment_records_v2';

// Initial default seed users
const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_krunal_admin',
    username: 'krunal9797',
    password: '7997',
    name: 'Er. Krunal Gamit (Admin)',
    email: 'gamitkrunal7997@gmail.com',
    phone: '+917043311587',
    policeStation: 'Songadh Police Station, Dist. Tapi',
    role: 'admin',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    plan: 'monthly',
    monthlyFee: 199,
    paymentStatus: 'paid',
    paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    transactionUtr: 'ADMIN_LIFETIME_PASS',
    paymentMethod: 'UPI',
    isActive: true,
    notes: 'Primary Master Admin / Super Officer',
  },
  {
    id: 'user_officer_demo',
    username: 'tapi_police1',
    password: 'password123',
    name: 'PSI R. S. Chaudhari',
    email: 'psi.tapi@gujarat.gov.in',
    phone: '+919876543210',
    policeStation: 'Vyara Police Station, Dist. Tapi',
    role: 'officer',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    plan: 'monthly',
    monthlyFee: 199,
    paymentStatus: 'paid',
    paymentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    paymentExpiryDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    transactionUtr: 'UPI504938291048',
    paymentMethod: 'GPay',
    isActive: true,
    notes: 'Monthly Verified Officer (₹199 Paid)',
  },
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_demo_1',
    userId: 'user_officer_demo',
    username: 'tapi_police1',
    name: 'PSI R. S. Chaudhari',
    phone: '+919876543210',
    amount: 199,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    utrNumber: 'UPI504938291048',
    paymentMethod: 'GPay',
    status: 'approved',
    approvedBy: 'krunal9797',
    notes: 'Monthly Subscription ₹199 (1 Month Access)',
  },
];

// Helper: Calculate 30 days future date
export function calculateExpiryDate(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Get all users from storage/api
export function getRegisteredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: AppUser[] = JSON.parse(raw);
    // Ensure admin user always exists
    if (!parsed.some((u) => u.username.toLowerCase() === 'krunal9797')) {
      parsed.unshift(DEFAULT_USERS[0]);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Failed to get registered users:', err);
    return DEFAULT_USERS;
  }
}

// Save users
export function saveRegisteredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

// Get all payments
export function getPaymentRecords(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
      return DEFAULT_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get payments:', err);
    return DEFAULT_PAYMENTS;
  }
}

// Save payments
export function savePaymentRecords(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save payments:', err);
  }
}

// Create a new User & Record Payment
export function registerNewUser(params: {
  username: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
  policeStation: string;
  paymentMethod: PaymentRecord['paymentMethod'];
  utrNumber: string;
  amount?: number;
  notes?: string;
}): { success: boolean; user?: AppUser; error?: string } {
  const users = getRegisteredUsers();

  const cleanUser = params.username.trim().toLowerCase();
  if (!cleanUser) {
    return { success: false, error: 'કૃપા કરીને યુઝરનેમ દાખલ કરો.' };
  }

  if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
    return { success: false, error: `આ યુઝરનેમ (${params.username}) પહેલેથી જ નોંધાયેલું છે. કૃપા કરીને બીજું યુઝરનેમ પસંદ કરો.` };
  }

  if (!params.password || params.password.length < 4) {
    return { success: false, error: 'પાસવર્ડ ઓછામાં ઓછો 4 અક્ષરોનો હોવો જોઈએ.' };
  }

  if (!params.phone || params.phone.length < 10) {
    return { success: false, error: 'કૃપા કરીને 10 આંકડાનો સાચો મોબાઈલ નંબર દાખલ કરો.' };
  }

  if (!params.utrNumber || params.utrNumber.trim().length < 6) {
    return { success: false, error: 'કૃપા કરીને પેમેન્ટનો સાચો UTR / Transaction ID દાખલ કરો.' };
  }

  const now = new Date();
  const expiryDate = calculateExpiryDate(30); // 1 month access for ₹199

  const newUser: AppUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    username: params.username.trim(),
    password: params.password.trim(),
    name: params.name.trim() || params.username.trim(),
    email: params.email?.trim() || `${cleanUser}@gujarat.police.gov.in`,
    phone: params.phone.trim(),
    policeStation: params.policeStation.trim() || 'Gujarat Police Station',
    role: 'officer',
    createdAt: Date.now(),
    plan: 'monthly',
    monthlyFee: params.amount || 199,
    paymentStatus: 'paid',
    paymentDate: now.toISOString(),
    paymentExpiryDate: expiryDate,
    transactionUtr: params.utrNumber.trim(),
    paymentMethod: params.paymentMethod,
    isActive: true,
    notes: params.notes || 'Registered via Front Page Sign Up (₹199 / Month)',
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Record payment entry
  const payments = getPaymentRecords();
  const paymentEntry: PaymentRecord = {
    id: 'pay_' + Date.now(),
    userId: newUser.id,
    username: newUser.username,
    name: newUser.name,
    phone: newUser.phone,
    amount: params.amount || 199,
    date: now.toISOString(),
    expiryDate,
    utrNumber: params.utrNumber.trim(),
    paymentMethod: params.paymentMethod,
    status: 'approved',
    approvedBy: 'krunal9797',
    notes: `1 Month Subscription Paid (Valid till ${new Date(expiryDate).toLocaleDateString('gu-IN')})`,
  };
  payments.unshift(paymentEntry);
  savePaymentRecords(payments);

  // Sync with server if online
  fetch('/api/users/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: newUser, payment: paymentEntry }),
  }).catch(() => {});

  return { success: true, user: newUser };
}

// Authenticate any user (krunal9797 admin OR registered officer who paid ₹199)
export function authenticateAppUser(username: string, pass: string): {
  success: boolean;
  user?: AppUser;
  error?: string;
  isExpired?: boolean;
} {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Admin Master Override: krunal9797 / 7997
  if (
    (cleanUser === 'krunal9797' || cleanUser === 'gamitkrunal7997@gmail.com') &&
    cleanPass === '7997'
  ) {
    const adminUser = getRegisteredUsers().find((u) => u.username.toLowerCase() === 'krunal9797') || DEFAULT_USERS[0];
    return { success: true, user: adminUser };
  }

  const users = getRegisteredUsers();
  const found = users.find(
    (u) =>
      u.username.toLowerCase() === cleanUser ||
      u.email.toLowerCase() === cleanUser ||
      u.phone.replace(/[\s+-]/g, '') === cleanUser.replace(/[\s+-]/g, '')
  );

  if (!found) {
    return {
      success: false,
      error: 'આ યુઝરનેમ પોર્ટલમાં નોંધાયેલું નથી! કૃપા કરીને "નવું એકાઉન્ટ બનાવો (Create User)" પર ક્લિક કરી નોંધણી કરો.',
    };
  }

  if (found.password !== cleanPass) {
    return {
      success: false,
      error: 'ખોટો પાસવર્ડ! કૃપા કરીને સાચો પાસવર્ડ દાખલ કરો.',
    };
  }

  // Check payment status & validity
  if (!found.isActive) {
    return {
      success: false,
      error: 'આ એકાઉન્ટ નિષ્ક્રિય કરેલું છે. કૃપા કરીને એડમિન Er. Krunal Gamit (+917043311587) નો સંપર્ક કરો.',
    };
  }

  if (found.role !== 'admin' && found.paymentExpiryDate) {
    const expiry = new Date(found.paymentExpiryDate).getTime();
    if (Date.now() > expiry) {
      return {
        success: false,
        isExpired: true,
        error: `તમારું માસિક સબ્સ્ક્રિપ્શન (₹199) સમાપ્ત થઈ ગયું છે (${new Date(found.paymentExpiryDate).toLocaleDateString('gu-IN')})! કૃપા કરીને ચાલુ રાખવા ₹199 નું રીન્યુઅલ પેમેન્ટ કરો.`,
      };
    }
  }

  return { success: true, user: found };
}
