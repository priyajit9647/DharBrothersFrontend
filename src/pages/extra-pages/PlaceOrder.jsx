import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

// project imports
import Logo from 'components/logo';
import AuthFooter from 'components/cards/AuthFooter';
import AuthBackground from 'sections/auth/AuthBackground';

const steps = ['Upload Documents', 'Binding Type', 'Hard Print Details', 'Soft Print Details', 'Synopsis Details', 'Order Summary'];

// ==============================|| PLACE ORDER - MULTI STEP FORM ||============================== //

export default function PlaceOrder() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <AuthBackground />

      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ px: 3, pt: 3 }}>
          <Logo to="/" logoHeight={64} />
        </Box>

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3 },
            py: { xs: 3, sm: 4 },
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }}
        >
          <Grid item xs={12} md={10} lg={9} xl={8}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: { xs: 2.5, sm: 3, md: 4 },
                backgroundColor: 'rgba(255,255,255,0.96)',
                boxShadow: (theme) => theme.vars.customShadows.z1
              }}
            >
              <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                Order Thesis Online
              </Typography>

              {/* top progress bar like Upload File / Document Details */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.primary">
                    Upload File
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Document Details
                  </Typography>
                </Box>
                <Box sx={{ position: 'relative', height: 3, bgcolor: 'divider', borderRadius: 9999 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '40%',
                      bgcolor: 'primary.main',
                      borderRadius: 9999
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, minHeight: 360, backgroundColor: 'transparent' }}>
                  {activeStep === 0 && <StepUploadDocuments />}
                  {activeStep === 1 && <StepBindingType />}
                  {activeStep === 2 && <StepHardPrintDetails />}
                  {activeStep === 3 && <StepSoftPrintDetails />}
                  {activeStep === 4 && <StepSynopsisDetails />}
                  {activeStep === 5 && <StepOrderSummary />}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button onClick={handleNext} variant="contained" color="warning" sx={{ px: 4 }}>
                    {activeStep === steps.length - 1 ? 'Next' : 'Next'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ p: 3 }}>
          <AuthFooter />
        </Box>
      </Box>
    </Box>
  );
}

function StepUploadDocuments() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 4,
            py: 5,
            textAlign: 'center',
            height: '100%'
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700 }}>
            UPLOAD THESIS DOCUMENT
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'primary.main',
              py: 4,
              px: 2,
              cursor: 'pointer'
            }}
          >
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              DROP YOUR FILE HERE
            </Typography>
            <Typography variant="caption" color="text.secondary">
              or click to select
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="error.main" display="block">
              *Please upload a pdf.
            </Typography>
            <Typography variant="caption" display="block">
              Maximum size allowed is 512MB. Supported formats are: pdf
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'inline-block', cursor: 'pointer' }}>
              Convert Doc to Pdf here
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 4,
            py: 5,
            textAlign: 'center',
            height: '100%'
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700 }}>
            UPLOAD SYNOPSIS DOCUMENT (Optional)
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'primary.main',
              py: 4,
              px: 2,
              cursor: 'pointer'
            }}
          >
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              DROP YOUR FILE HERE
            </Typography>
            <Typography variant="caption" color="text.secondary">
              or click to select
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" display="block">
              Maximum size allowed is 512MB. Supported formats are: pdf
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'inline-block', cursor: 'pointer' }}>
              Convert Doc to Pdf here
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box
          sx={{
            mt: 2,
            borderRadius: 2,
            borderTop: '2px solid',
            borderColor: 'primary.main',
            bgcolor: 'background.paper',
            px: 3,
            py: 2
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Additional Information
          </Typography>
          <Typography component="ol" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body2">
              Upload only one thesis per order.
            </Typography>
            <Typography component="li" variant="body2">
              We prefer pdf.
            </Typography>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

function StepBindingType() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Select type of Binding
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle1">Hard Binding</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle1">Soft Binding</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle1">Synopsis</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function StepHardPrintDetails() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Hard Print Details
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Configure paper size, copies, paper type, printing color, and additional information for hard binding.
      </Typography>
    </Box>
  );
}

function StepSoftPrintDetails() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Soft Print Details
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Configure paper size, copies, paper type, printing color, and additional information for soft binding.
      </Typography>
    </Box>
  );
}

function StepSynopsisDetails() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Synopsis Print Details
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Configure printing options and cover design for synopsis documents.
      </Typography>
    </Box>
  );
}

function StepOrderSummary() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Order Summary
      </Typography>
      <Typography variant="body2" color="text.secondary">
        A detailed summary of your selections and pricing will appear here.
      </Typography>
    </Box>
  );
}
