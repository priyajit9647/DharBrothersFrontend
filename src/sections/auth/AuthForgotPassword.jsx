import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { publicFetch } from 'api/auth';

// ============================|| FORGOT PASSWORD ||============================ //

export default function AuthForgotPassword({ onSuccess = null }) {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <>
      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Password reset instructions have been sent to your email. Please check your inbox and follow the link to reset your password.
          </Typography>
        </Alert>
      )}

      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email('Must be a valid email')
            .max(255)
            .required('Email is required')
        })}
        onSubmit={async (values, { setSubmitting, setStatus, setErrors }) => {
          try {
            setStatus({ success: null, error: null });

            // Call the forgot password API
            const data = await publicFetch('/api/v1/auth/forgot-password', {
              method: 'POST',
              body: JSON.stringify({ email: values.email })
            });

            setStatus({ success: true, error: null });
            setSubmitted(true);

            if (onSuccess) {
              onSuccess(data);
            }
          } catch (error) {
            const message = error?.message || 'Unable to process forgot password request. Please try again.';
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
                  <InputLabel htmlFor="email-forgot">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-forgot"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-forgot">
                    {errors.email}
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
                    disabled={isSubmitting || submitted}
                  >
                    Send Reset Link
                  </Button>
                </AnimateButton>
              </Grid>

              <Grid size={12}>
                <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body2">Remember your password?</Typography>
                  <Link variant="body2" component={RouterLink} to="/login" color="primary">
                    Back to Login
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthForgotPassword.propTypes = { onSuccess: PropTypes.func };
