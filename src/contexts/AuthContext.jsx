import PropTypes from 'prop-types';
import { createContext, useCallback, useMemo } from 'react';

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

  const login = useCallback((payload) => {
    setState({
      accessToken: payload?.accessToken ?? null,
      refreshToken: payload?.refreshToken ?? null,
      user: payload?.user ?? null
    });
  }, [setState]);

  const updateUser = useCallback((userData) => {
    setState((prevState) => ({
      ...prevState,
      user: { ...prevState.user, ...userData }
    }));
  }, [setState]);

  const logout = useCallback(() => {
    clearAuthCookies();
    resetState();
  }, [resetState]);

  const isAuthenticated = Boolean(state?.accessToken);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated,
      login,
      updateUser,
      logout
    }),
    [state, isAuthenticated, login, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };
