import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PRINTING TYPE ||============================== //

export default function PrintingTypeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Printing Type Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage printing types such as Single Side or Double Side.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Printing Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Printing type records and editing forms will be added here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
