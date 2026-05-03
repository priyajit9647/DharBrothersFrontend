import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - Notification History (ADMIN) ||============================== //

export default function NotificationTemplates() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Notification History</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage WhatsApp, SMS and Email templates triggered at each workflow event.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Templates by Event" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Table of events (Order Received, Job Started, Stage Completed, Ready for Pickup, Dispatched, Delivered) with channel-wise templates.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
