import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress non-critical Firestore network timeout logs in sandboxed/offline environments
try {
  setLogLevel('silent');
} catch (e) {
  // ignore
}

// Check if Firebase Config is valid (i.e. not the default placeholder from the remixed app)
export const isFirebaseConfigValid = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('remixed') && 
  firebaseConfig.apiKey !== '';

// Safe initialization of Firebase
let app: any;
let realAuth: any;
export let db: any = null;

if (isFirebaseConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    realAuth = getAuth(app);
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    const firestoreSettings = { experimentalForceLongPolling: true };
    if (dbId) {
      db = initializeFirestore(app, firestoreSettings, dbId);
    } else {
      db = initializeFirestore(app, firestoreSettings);
    }
  } catch (err) {
    console.warn("Failed to initialize real Firebase:", err);
    try {
      db = getFirestore(app);
    } catch (e) {
      db = null;
    }
  }
}

// Mock auth object for demo/preview mode
class MockAuth {
  currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    // Emit initial user state
    setTimeout(() => callback(this.currentUser), 10);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  setCurrentUser(user: any) {
    this.currentUser = user;
    this.listeners.forEach(l => l(user));
  }

  async signOut() {
    this.setCurrentUser(null);
  }
}

const mockAuthInstance = new MockAuth();

export const auth: any = isFirebaseConfigValid && realAuth
  ? realAuth
  : (import.meta.env.PROD ? null : mockAuthInstance);

const provider = new GoogleAuthProvider();
// Request Workspace Sheets readonly scope
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  try {
    if (!auth) {
      if (onAuthFailure) onAuthFailure();
      return () => {};
    }
    return onAuthStateChanged(
      auth,
      async (user: User | null) => {
        if (user) {
          if (cachedAccessToken) {
            if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
          } else {
            if (onAuthFailure) onAuthFailure();
          }
        } else {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      },
      (err) => {
        console.warn('initAuth listener notice:', err);
        if (onAuthFailure) onAuthFailure();
      }
    );
  } catch (err) {
    console.warn('initAuth setup notice:', err);
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

// Google Sign-in trigger
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!isFirebaseConfigValid || !realAuth) {
    if (import.meta.env.PROD) {
      throw new Error('مصادقة Firebase غير مهيأة. لا يمكن تسجيل الدخول في بيئة الإنتاج.');
    }
    // Demo authentication is intentionally limited to non-production builds.
    const mockUser = {
      uid: 'demo-user-123',
      displayName: 'مُجرّب المنصة التنموية',
      email: 'demo@example.com',
      emailVerified: true,
      photoURL: null,
      getIdTokenResult: async () => ({ claims: {} }),
    };
    mockAuthInstance.setCurrentUser(mockUser);
    cachedAccessToken = null;
    return { user: mockUser as any, accessToken: '' };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(realAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('تعذر الحصول على رمز Google المطلوب.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.warn('Sign-in failed:', error?.message || error);
    // Never turn a failed real authentication attempt into a fake identity.
    throw new Error(error?.message || 'تعذر تسجيل الدخول عبر Google.');
  } finally {
    isSigningIn = false;
  }
};

/**
 * Real Firebase email/password authentication. Predefined accounts are display
 * metadata only and are never treated as credentials.
 */
export const emailPasswordSignIn = async (email: string, password: string): Promise<User> => {
  if (!isFirebaseConfigValid || !realAuth) {
    throw new Error('مصادقة البريد الإلكتروني غير متاحة بدون Firebase.');
  }
  if (!email?.trim() || !password) {
    throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان.');
  }
  const credential = await signInWithEmailAndPassword(realAuth, email.trim(), password);
  if (!credential.user.emailVerified) {
    await realAuth.signOut();
    throw new Error('يجب توثيق البريد الإلكتروني قبل الدخول.');
  }
  return credential.user;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  if (!auth) {
    cachedAccessToken = null;
    return;
  }
  await auth.signOut();
  cachedAccessToken = null;
};

// Fetch Google Sheets worksheets list
export const fetchSpreadsheetInfo = async (spreadsheetId: string, token: string) => {
  if (!isFirebaseConfigValid) {
    // Return a mock spreadsheet response with sheets
    return {
      sheets: [
        { properties: { title: 'مبادرات الطرق بمحافظة إب الـ ٧٣٣' } },
        { properties: { title: 'مبادرات الطرق بالمديريات' } },
        { properties: { title: 'عينة مبادرات جديدة' } }
      ]
    };
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`خطأ أثناء جلب معلومات جدول البيانات: ${res.statusText} - ${errorText}`);
  }
  return await res.json();
};

// Fetch values from a specific sheet range
export const fetchSheetData = async (spreadsheetId: string, range: string, token: string) => {
  if (!isFirebaseConfigValid) {
    // Return mock row values
    return {
      values: [
        // Headers
        [
          'رقم المبادرة',
          'اسم المبادرة',
          'المديرية',
          'العزلة',
          'القرية',
          'الموقع الجغرافي / الإحداثيات',
          'التكلفة الكلية (ريال)',
          'المساهمات المجتمعية (ريال)',
          'مساهمة وحدة التدخلات (ريال)',
          'نسبة الإنجاز (%)',
          'الحالة'
        ],
        // Row 1
        [
          '726',
          'رصف طريق عقبة الجفيين بشوائط بذي السفال',
          'مديرية ذي السفال',
          'شوائط',
          'الجفيين',
          '13.842314, 44.021354',
          '25000000',
          '15000000',
          '10000000',
          '85',
          'ongoing'
        ],
        // Row 2
        [
          '727',
          'شق طريق محلة المنزل ببلاد المليكي بالسياني',
          'مديرية السياني',
          'بلاد المليكي',
          'المنزل',
          '13.812345, 44.041234',
          '18000000',
          '10000000',
          '8000000',
          '100',
          'completed'
        ],
        // Row 3
        [
          '728',
          'بناء جدران ساندة لعقبة عرامة بالجعاشن',
          'مديرية ذي السفال',
          'الجعاشن',
          'عرامة',
          '13.856123, 44.012345',
          '32000000',
          '20000000',
          '12000000',
          '45',
          'ongoing'
        ],
        // Row 4
        [
          '729',
          'رصف وتأهيل طريق قرية ريد بمديرية جبلة',
          'مديرية جبلة',
          'جبلة',
          'ريد',
          '13.912345, 44.112345',
          '15000000',
          '9000000',
          '6000000',
          '10',
          'stagnant'
        ]
      ]
    };
  }

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`خطأ أثناء جلب بيانات الورقة: ${res.statusText} - ${errorText}`);
  }
  return await res.json();
};

