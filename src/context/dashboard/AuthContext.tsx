import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGet, apiPost, setAuthToken, removeAuthToken, getAuthToken } from '../lib/api';

interface User {
    id: string;
    email: string;
    nama: string;
    role: string;
    avatar: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getAuthToken();
            if (token) {
                const response = await apiGet<{ user: User }>('/auth/me');
                if (response.success && response.data) {
                    setUser(response.data.user);
                } else {
                    removeAuthToken();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiPost<{ token: string; user: User }>('/auth/login', {
            email,
            password,
        });

        if (response.success && response.data) {
            setAuthToken(response.data.token);
            setUser(response.data.user);
            return { success: true };
        }

        return { success: false, error: response.error || 'Login gagal' };
    };

    const logout = () => {
        removeAuthToken();
        setUser(null);
        window.location.href = 'http://localhost:3000/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
