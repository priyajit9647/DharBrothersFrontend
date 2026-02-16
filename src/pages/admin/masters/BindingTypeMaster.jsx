import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - BINDING TYPE ||============================== //

export default function BindingTypeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Binding Type Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Maintain binding types such as Hard Binding, Soft Binding and Synopsis.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Binding Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Binding type management UI will be designed here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
