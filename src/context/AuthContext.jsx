import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsRole, setNeedsRole] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                        setNeedsRole(false);
                    } else {
                        setNeedsRole(true);
                    }
                } catch {
                    // If Firestore is not configured, use localStorage fallback
                    const savedRole = localStorage.getItem('jaldrushti_role');
                    if (savedRole) {
                        setRole(savedRole);
                        setNeedsRole(false);
                    } else {
                        setNeedsRole(true);
                    }
                }
            } else {
                setUser(null);
                setRole(null);
                setNeedsRole(false);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err) {
            console.error('Google sign-in error:', err);
            throw err;
        }
    };

    const loginDemo = (selectedRole) => {
        const demoUser = {
            uid: 'demo-' + selectedRole,
            displayName: selectedRole === 'admin' ? 'District Collector' : 'Tanker Operator',
            email: selectedRole === 'admin' ? 'collector@nagpur.gov.in' : 'operator@tanker.in',
            photoURL: null,
        };
        setUser(demoUser);
        setRole(selectedRole);
        localStorage.setItem('jaldrushti_role', selectedRole);
        setNeedsRole(false);
    };

    const selectRole = async (selectedRole) => {
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    name: user.displayName,
                    role: selectedRole,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                });
            } catch {
                localStorage.setItem('jaldrushti_role', selectedRole);
            }
            setRole(selectedRole);
            setNeedsRole(false);
        }
    };

    const logout = async () => {
        try { await signOut(auth); } catch { }
        setUser(null);
        setRole(null);
        setNeedsRole(false);
        localStorage.removeItem('jaldrushti_role');
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, needsRole, loginWithGoogle, loginDemo, selectRole, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
