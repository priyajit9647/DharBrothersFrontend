import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - ORDER STATUS ||============================== //

export default function OrderStatusMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Order Status Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage overall order statuses for the BMS workflow.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Order Statuses" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Definitions for statuses like Pending, In Progress, Ready, Delivered will live here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
