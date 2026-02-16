import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - SPINE PRINTING OPTION ||============================== //

export default function SpinePrintingOptionMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Spine Printing Option Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure available spine printing options for hard and soft bindings.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Spine Printing Options" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Table and form for managing spine printing options will be implemented here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
