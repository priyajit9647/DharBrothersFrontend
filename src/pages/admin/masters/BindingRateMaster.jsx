import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - BINDING RATE ||============================== //

export default function BindingRateMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Binding Rate Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Maintain rate cards for different binding types and cover materials.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Binding Rates" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Binding rate configuration and slabs will be designed here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
