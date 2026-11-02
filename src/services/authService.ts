import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider with Gmail Send scope
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.setCustomParameters({
  login_hint: 'gamitkrunal7997@gmail.com',
  prompt: 'select_account',
});

export const AUTHORIZED_EMAIL = 'gamitkrunal7997@gmail.com';

// In-memory cache for token
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = () => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Sign in with Google Popup
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || null;
  cachedAccessToken = token;

  const email = result.user.email?.toLowerCase().trim();
  if (email !== AUTHORIZED_EMAIL.toLowerCase()) {
    await signOut(auth);
    cachedAccessToken = null;
    throw new Error(
      `અનધિકૃત એકાઉન્ટ (${result.user.email})! ફક્ત અધિકૃત અધિકારી (${AUTHORIZED_EMAIL}) ને જ પ્રવેશની મંજૂરી છે.`
    );
  }

  return {
    user: result.user,
    accessToken: token,
  };
}

// Helper to encode string in base64url for Gmail API
function base64UrlEncode(str: string) {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Send Real OTP Email directly to gamitkrunal7997@gmail.com via Gmail API
export async function sendOtpEmailViaGmail(
  otpCode: string,
  targetEmail: string,
  accessToken: string
) {
  const subject = `પોલીસ પોર્ટલ OTP ચકાસણી કોડ: ${otpCode} - CYBER EXPERT TAPI (SONGADH POLICE STATION)`;
  const emailContent = `To: ${targetEmail}
Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CYBER EXPERT TAPI (SONGADH POLICE STATION) OTP</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">CYBER EXPERT TAPI (SONGADH POLICE STATION)</h1>
      <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Cyber Crime Cell • Songadh Police Station (Dist. Tapi)</p>
    </div>
    <div style="padding: 32px 24px; text-align: center;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">સુરક્ષિત લૉગિન વેરિફિકેશન કોડ</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        નમસ્તે <strong>Er. Krunal Gamit</strong>,<br>
        ગુજરાત પોલીસ 1930 સાયબર પોર્ટલ પર લૉગિન કરવા માટે તમારો વન ટાઇમ પાસવર્ડ (OTP) નીચે મુજબ છે:
      </p>
      <div style="margin: 20px auto; display: inline-block;">
        <span style="display: block; font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #1e40af; background: #eff6ff; padding: 14px 28px; border: 2px dashed #3b82f6; border-radius: 12px; font-family: monospace;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
        ⏱️ આ OTP કોડ <strong>10 મિનિટ</strong> માટે માન્ય રહેશે.<br>
        🔒 સુરક્ષા કારણોસર આ કોડ કોઈની સાથે શેર કરશો નહીં.
      </p>
    </div>
    <div style="background-color: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      Design & Develop by Er. Krunal Gamit • Helpline: +917043311587 (WhatsApp Only)
    </div>
  </div>
</body>
</html>`;

  const rawMessage = base64UrlEncode(emailContent);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawMessage }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to send email via Gmail API:', errorText);
    throw new Error('Gmail API દ્વારા ઈમેલ મોકલવામાં નિષ્ફળ રહ્યા: ' + errorText);
  }

  return await res.json();
}
