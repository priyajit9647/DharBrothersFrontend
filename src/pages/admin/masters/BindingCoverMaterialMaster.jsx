import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - BINDING COVER MATERIAL ||============================== //

export default function BindingCoverMaterialMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Binding Cover Material Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage cover materials and color codes used for bindings.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Cover Materials" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Configuration for binding cover materials will be added here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
