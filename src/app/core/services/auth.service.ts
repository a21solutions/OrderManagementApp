import { Injectable } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, authState } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { initializeApp as fbInitializeApp, deleteApp as fbDeleteApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth as fbGetAuth, createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword } from 'firebase/auth';

export type UserRole = 'superadmin' | 'admin' | 'user' | 'anonymous';

interface UserProfile {
  email: string;
  role: UserRole;
  createdAt: any; // Firestore timestamp
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  // Create a new user and store profile with role (default 'user')
  // Uses a secondary Firebase app instance to avoid switching the current session
  signup(email: string, password: string, role: UserRole = 'user') {
    return from(this.createUserWithSecondaryApp(email, password)).pipe(
      switchMap(async cred => {
        const uid = cred.user.uid;
        const profileRef = doc(this.firestore, `users/${uid}`);
        const profile: UserProfile = {
          email,
          role,
          createdAt: serverTimestamp()
        } as any;
        await setDoc(profileRef, profile, { merge: true });
        return cred;
      }),
      catchError(err => {
        throw this.mapAuthError(err);
      })
    );
  }

  private async createUserWithSecondaryApp(email: string, password: string) {
    const name = 'secondary-admin-signup';
    let app: FirebaseApp | undefined = getApps().find(a => a.name === name);
    if (!app) {
      app = fbInitializeApp(environment.firebase, name);
    }
    try {
      const auth = fbGetAuth(app);
      const cred = await fbCreateUserWithEmailAndPassword(auth, email, password);
      return cred;
    } finally {
      try { await fbDeleteApp(app!); } catch (_) { /* no-op */ }
    }
  }

  // Login with rememberMe controlling persistence (local vs session)
  login(email: string, password: string, rememberMe: boolean) {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    return from(setPersistence(this.auth, persistence)).pipe(
      switchMap(() => from(signInWithEmailAndPassword(this.auth, email, password))),
      catchError(err => {
        throw this.mapAuthError(err);
      })
    );
  }

  // Logout current user
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError(err => {
        throw this.mapAuthError(err);
      })
    );
  }

  // Current firebase user as observable
  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }

  // Get role for a uid from Firestore users/{uid}
  async getUserRole(uid: string): Promise<UserRole> {
    try {
      const snap = await getDoc(doc(this.firestore, `users/${uid}`));
      const data = snap.data() as Partial<UserProfile> | undefined;
      return (data?.role as UserRole) || 'anonymous';
    } catch (err) {
      throw this.mapAuthError(err);
    }
  }

  // Check if current user has one of the required roles
  isAuthorized(requiredRoles: UserRole[]): Observable<boolean> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) return of(false);
        return from(getDoc(doc(this.firestore, `users/${user.uid}`))).pipe(
          map(snap => {
            const role = (snap.data() as any)?.role as UserRole | undefined;
            return requiredRoles.includes(role || 'anonymous');
          }),
          catchError(() => of(false))
        );
      })
    );
  }

  private mapAuthError(err: any): Error {
    const code = err?.code || '';
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Email already in use',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak',
      'auth/user-disabled': 'User account is disabled',
      'auth/user-not-found': 'Incorrect email or password',
      'auth/wrong-password': 'Incorrect email or password',
      'auth/network-request-failed': 'Network error, please try again',
    };
    const message = messages[code] || 'Authentication error, please try again';
    return new Error(message);
  }
}
