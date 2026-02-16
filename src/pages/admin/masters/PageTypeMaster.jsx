import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PAGE TYPE ||============================== //

export default function PageTypeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Page Type Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure page classifications like Color page and B/W page.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Page Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page-type master data grid will be added here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
