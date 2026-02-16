import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - DELIVERY TYPE ||============================== //

export default function DeliveryTypeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Delivery Type Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure delivery modes like Self-pickup, Courier and Address Change.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Delivery Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            List and details of delivery types will be available here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
