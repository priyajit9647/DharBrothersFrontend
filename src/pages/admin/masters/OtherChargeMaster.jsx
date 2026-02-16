import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - OTHER CHARGE ||============================== //

export default function OtherChargeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Other Charge Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure additional charges such as packing, urgent delivery, or customization.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Other Charges" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Definition of miscellaneous charges will be available here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
