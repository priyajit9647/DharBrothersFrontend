import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| ADMIN - UPDATE ACCESS RIGHTS ||============================== //

export default function UpdateAccessRights() {
  return (
    <Grid container spacing={2} sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12}>
        <Typography variant="h5">Update Access Rights</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage roles and access permissions.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Typography>Placeholder UI for Update Access Rights.</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
