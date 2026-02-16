import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PRINTING RATE ||============================== //

export default function PrintingRateMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Printing Rate Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Maintain rate cards for printing based on paper, size, color and type.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Printing Rates" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Rate configuration and slabs for printing will be managed here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
