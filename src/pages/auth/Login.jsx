import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';
import { useAuth } from 'hooks/useAuth';
import { isTokenExpired, getRefreshTokenFromCookies, setAuthCookies } from 'utils/authTokens';
import { refreshTokenApi } from 'api/auth';

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, login } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      // If we already have a valid access token in state, go straight to dashboard
      if (accessToken && !isTokenExpired(accessToken)) {
        navigate('/dashboard/default', { replace: true });
        return;
      }

      // Otherwise, try with refresh token from cookies (preferred) or state
      const cookieRefreshToken = getRefreshTokenFromCookies();
      const effectiveRefreshToken = cookieRefreshToken || refreshToken;

      if (!effectiveRefreshToken || isTokenExpired(effectiveRefreshToken)) {
        return;
      }

      try {
        const data = await refreshTokenApi(effectiveRefreshToken);
        if (cancelled) return;

        const nextRefreshToken = data.refreshToken ?? effectiveRefreshToken;

        // Persist the fresh tokens in cookies
        setAuthCookies({ accessToken: data.accessToken, refreshToken: nextRefreshToken });

        // Update auth context so the rest of the app sees the user as logged in
        login({
          accessToken: data.accessToken,
          refreshToken: nextRefreshToken,
          user: {
            // backend may optionally return user info; fall back to undefined
            email: data.email
          }
        });

        navigate('/dashboard/default', { replace: true });
      } catch (error) {
        // If refresh fails, stay on the login page
      }
    }

    checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, login, navigate]);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'flex-start', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
