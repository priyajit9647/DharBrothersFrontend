import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - BRANCHES & TEAMS (ADMIN) ||============================== //

export default function Branches() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Branches &amp; Teams</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure branches, teams and role-based access for managers and staff.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Branch Directory" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Table of branches with columns for Branch Code, City, Manager, Contact and Active Status.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
