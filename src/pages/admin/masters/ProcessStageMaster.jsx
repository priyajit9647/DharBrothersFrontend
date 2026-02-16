import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PROCESS STAGE ||============================== //

export default function ProcessStageMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Process Stage Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Define and maintain stages in the production workflow (e.g. Cutting, Binding, Packing).
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Stages" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Stage listing and configuration UI will be implemented here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
