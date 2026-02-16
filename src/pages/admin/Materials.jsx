import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - MATERIALS & INVENTORY (ADMIN) ||============================== //

export default function Materials() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Materials &amp; Inventory</Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor material stock per branch and track auto-deductions when jobs start.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Material Stock" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Inventory grid with columns for Material Name, Unit, Available Qty, Reorder Level and Branch.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
