import PropTypes from 'prop-types';
import { createContext, useMemo } from 'react';

import { useLocalStorage } from 'hooks/useLocalStorage';
import { clearAuthCookies } from 'utils/authTokens';

// ==============================|| AUTH CONTEXT ||============================== //

export const AuthContext = createContext(undefined);

const defaultAuthState = {
  accessToken: null,
  refreshToken: null,
  user: null
};

export function AuthProvider({ children }) {
  const { state, setState, resetState } = useLocalStorage('dharbrothers-auth', defaultAuthState);

  const login = (payload) => {
    setState({
      accessToken: payload?.accessToken ?? null,
      refreshToken: payload?.refreshToken ?? null,
      user: payload?.user ?? null
    });
  };

  const logout = () => {
    clearAuthCookies();
    resetState();
  };

  const isAuthenticated = Boolean(state?.accessToken);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated,
      login,
      logout
    }),
    [state, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };
