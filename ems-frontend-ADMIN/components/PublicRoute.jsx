"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkAuth, hasRequiredRole } from '@/utils/auth';

function PublicRouteContent({ children, redirectTo }) {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    user: null,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    verifyAuth();
  }, []);

  async function verifyAuth() {
    const { authenticated, user } = await checkAuth();
    
    if (authenticated && hasRequiredRole(user, ['superAdmin', 'subAdmin'])) {
      // User is already logged in, redirect to requested page or dashboard
      const redirect = searchParams.get('redirect') || redirectTo;
      router.replace(redirect);
      return;
    }

    setAuthState({
      loading: false,
      authenticated: false,
      user: null,
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

  return children;
}

export default function PublicRoute({ children, redirectTo = '/dashboard' }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PublicRouteContent redirectTo={redirectTo}>
        {children}
      </PublicRouteContent>
    </Suspense>
  );
}