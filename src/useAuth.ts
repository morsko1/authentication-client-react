import { CredentialResponse } from '@react-oauth/google';
import { useState, useEffect } from 'react';

const { REACT_APP_API_URL } = process.env;

interface User {
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({ loading: true, user: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) throw new Error('no access token');

        const res = await fetch(`${REACT_APP_API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
          credentials: 'include'
        });

        if (res.status === 401) {
          await refreshAccessToken();
          return;
        }

        const { user } = await res.json();
        setAuthState({ loading: false, user });
      } catch (error) {
        setAuthState({ loading: false, user: null });
      }
    };

    checkAuth();
  }, []);

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const res = await fetch(`${REACT_APP_API_URL}/auth/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credential}`
        },
        credentials: 'include'
      });
      const { accessToken, user } = await res.json();
      setAuthState({ loading: false, user });
      localStorage.setItem('accessToken', accessToken);
    } catch (error) {
      console.error(error);
      setAuthState({ loading: false, user: null });
    }
  };

  const onGoogleLoginFailure = async () => {
    console.log('login failed');
  };

  const logout = async () => {
    try {
      await fetch(`${REACT_APP_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setAuthState({ loading: false, user: null });
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error(error);
      setAuthState({ loading: false, user: null });
    }
  };

  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${REACT_APP_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const { user, accessToken } = await res.json();
      localStorage.setItem('accessToken', accessToken);
      setAuthState({ loading: false, user });
    } catch (error) {
      setAuthState({ loading: false, user: null });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const { exp } = JSON.parse(atob(accessToken.split('.')[1]));
        if (exp * 1000 < Date.now() + 60000) {
          refreshAccessToken();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    user: authState.user,
    onGoogleLoginSuccess,
    onGoogleLoginFailure,
    logout,
    loading: authState.loading
  };
};

export default useAuth;
