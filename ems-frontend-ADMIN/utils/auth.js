// utils/auth.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function checkAuth() {
  try {
    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (response.ok) {
      const userData = await response.json();
      return { authenticated: true, user: userData };
    }
    return { authenticated: false, user: null };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false, user: null };
  }
}

export async function login(email, password) {
  try {
    const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      const errData = await loginRes.json();
      throw new Error(errData.message || 'Login failed');
    }

    const profileRes = await fetch(`${apiUrl}/api/auth/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!profileRes.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userProfile = await profileRes.json();
    return { success: true, user: userProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  try {
    const response = await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    // Even if backend fails, we consider it successful
    // Frontend will redirect to login anyway
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error);
    // Still return success so user gets logged out on frontend
    return { success: true };
  }
}

export function hasRequiredRole(user, requiredRoles = []) {
  if (!user || !user.roles) return false;
  if (requiredRoles.length === 0) return true;
  return requiredRoles.some(role => user.roles.includes(role));
}