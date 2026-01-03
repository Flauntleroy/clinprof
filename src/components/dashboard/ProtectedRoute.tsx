import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
                </div>
            </div>
        );
    }

    // Redirect to main app login if not authenticated
    if (!isAuthenticated) {
        window.location.href = 'http://localhost:3000/login';
        return null;
    }

    return <>{children}</>;
}



