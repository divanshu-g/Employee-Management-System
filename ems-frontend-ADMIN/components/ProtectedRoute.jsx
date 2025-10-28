"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkAuth, hasRequiredRole } from '@/utils/auth';

function ProtectedRouteContent({ children, requiredRoles }) {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    user: null,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    verifyAuth();
  }, [pathname]);

  async function verifyAuth() {
    const { authenticated, user } = await checkAuth();
    
    if (!authenticated) {
      // Save the attempted URL for redirect after login
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check if user has required roles
    if (requiredRoles.length > 0 && !hasRequiredRole(user, requiredRoles)) {
      router.replace('/signin?error=unauthorized');
      return;
    }

    setAuthState({
      loading: false,
      authenticated: true,
      user,
    });
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.authenticated) {
    return null; // Router will redirect
  }

  return children;
}

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ProtectedRouteContent requiredRoles={requiredRoles}>
        {children}
      </ProtectedRouteContent>
    </Suspense>
  );
}