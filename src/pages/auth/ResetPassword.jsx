import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthResetPassword from 'sections/auth/AuthResetPassword';
import { useAuth } from 'hooks/useAuth';
import { isTokenExpired, getRefreshTokenFromCookies } from 'utils/authTokens';

// ================================|| RESET PASSWORD ||================================ //

export default function ResetPassword() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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

    // If no token provided, redirect to forgot password
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [accessToken, navigate, token]);

  if (!token) {
    return null;
  }

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'flex-start', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Reset Password</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please enter a new strong password. Your password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
          </Typography>
        </Grid>
        <Grid size={12}>
          <AuthResetPassword token={token} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
