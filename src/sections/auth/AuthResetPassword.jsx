import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { publicFetch } from 'api/auth';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';

// ============================|| PASSWORD STRENGTH VALIDATOR ||============================ //

const validatePasswordStrength = (password) => {
  if (!password) return { score: 0, requirements: [] };

  const requirements = [
    { label: 'Minimum 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];

  const score = requirements.filter((r) => r.met).length;

  return { score, requirements };
};

// ============================|| RESET PASSWORD ||============================ //

export default function AuthResetPassword({ token = '' }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState({ score: 0, requirements: [] });
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const passwordStrengthColor = () => {
    if (passwordStrength.score === 0) return 'inherit';
    if (passwordStrength.score <= 2) return 'error';
    if (passwordStrength.score <= 3) return 'warning';
    return 'success';
  };

  const passwordStrengthLabel = () => {
    if (passwordStrength.score === 0) return '';
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Fair';
    return 'Strong';
  };

  const validatePasswordStrengthSchema = Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

  return (
    <>
      {resetSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Your password has been successfully reset. Redirecting to login...
          </Typography>
        </Alert>
      )}

      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          password: validatePasswordStrengthSchema,
          confirmPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
        })}
        onSubmit={async (values, { setSubmitting, setStatus, setErrors }) => {
          try {
            setStatus({ success: null, error: null });

            if (!token) {
              throw new Error('Invalid reset token');
            }

            // Call the reset password API
            await publicFetch('/api/v1/auth/reset-password', {
              method: 'POST',
              body: JSON.stringify({
                token,
                newPassword: values.password
              })
            });

            setStatus({ success: true, error: null });
            setResetSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
              navigate('/login', { replace: true });
            }, 2000);
          } catch (error) {
            const message = error?.message || 'Unable to reset password. Please try again.';
            setStatus({ success: false, error: message });
            setErrors({ submit: message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, touched, values, handleSubmit, isSubmitting }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-reset">New Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-reset"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      setPasswordStrength(validatePasswordStrength(e.target.value));
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter new password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-reset">
                    {errors.password}
                  </FormHelperText>
                )}

                {/* Password Strength Indicator */}
                {values.password && (
                  <Box sx={{ mt: 1.5 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(passwordStrength.score / 5) * 100}
                            color={passwordStrengthColor()}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption" color={passwordStrengthColor()}>
                          {passwordStrengthLabel()}
                        </Typography>
                      </Stack>

                      {/* Requirements List */}
                      <Stack spacing={0.5}>
                        {passwordStrength.requirements.map((req, idx) => (
                          <Stack key={idx} direction="row" spacing={1} alignItems="center">
                            {req.met ? (
                              <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} />
                            ) : (
                              <CloseCircleOutlined style={{ fontSize: 16, color: '#ff7875' }} />
                            )}
                            <Typography variant="caption" color={req.met ? 'success.main' : 'text.secondary'}>
                              {req.label}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="confirmPassword-reset">Confirm Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    id="confirmPassword-reset"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Confirm password"
                  />
                </Stack>
                {touched.confirmPassword && errors.confirmPassword && (
                  <FormHelperText error id="standard-weight-helper-text-confirmPassword-reset">
                    {errors.confirmPassword}
                  </FormHelperText>
                )}
              </Grid>

              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid size={12}>
                <AnimateButton>
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting || resetSuccess}
                  >
                    Reset Password
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthResetPassword.propTypes = { token: PropTypes.string };
