import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthForgotPassword from 'sections/auth/AuthForgotPassword';
import { useAuth } from 'hooks/useAuth';
import { isTokenExpired, getRefreshTokenFromCookies } from 'utils/authTokens';

// ================================|| FORGOT PASSWORD ||================================ //

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (accessToken && !isTokenExpired(accessToken)) {
      navigate('/dashboard/default', { replace: true });
      return;
    }

    const cookieRefreshToken = getRefreshTokenFromCookies();
    if (cookieRefreshToken && !isTokenExpired(cookieRefreshToken)) {
      navigate('/dashboard/default', { replace: true });
    }
  }, [accessToken, navigate]);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'flex-start', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Forgot Password</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
        </Grid>
        <Grid size={12}>
          <AuthForgotPassword />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
