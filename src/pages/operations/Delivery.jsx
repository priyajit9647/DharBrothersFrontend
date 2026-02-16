import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - DELIVERY & DISPATCH ||============================== //

export default function DeliveryDispatch() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Delivery &amp; Dispatch</Typography>
        <Typography variant="body2" color="text.secondary">
          Track ready-for-dispatch, in-transit and delivered jobs. Capture courier details and pickup confirmations.
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <MainCard title="Dispatch Queue" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            List of jobs waiting for pickup or courier handover with columns for Delivery Type, Partner, Tracking ID and SLA status.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <MainCard title="Delay Alerts" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Panel highlighting delayed deliveries and escalations sent to customers and managers.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
