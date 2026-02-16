import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PRINT COLOR ||============================== //

export default function PrintColorMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Print Color Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Maintain color options like Black & White, Mixed Color, Royal Print, etc.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Print Colors" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Grid and maintenance actions for print colors will go here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
