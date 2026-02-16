import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PAPER ||============================== //

export default function PaperMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Paper Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage paper types such as Imported Matt, Bond, and Standard.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Paper Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Paper definitions and properties will be configured here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
