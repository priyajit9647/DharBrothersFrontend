import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - ORDERS & INTAKE ||============================== //

export default function OrdersIntake() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Orders &amp; Intake</Typography>
        <Typography variant="body2" color="text.secondary">
          Unified queue of orders coming from the website and manually created jobs. Supports prioritization and allocation.
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <MainCard title="Order Queue" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Data grid for all new and in-intake orders with filters for branch, source (Website / Walk-in), and priority.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <MainCard title="Assignment Rules" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Side panel summarizing current auto-assignment logic (by workload, branch, or manual override) with quick links to settings.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
