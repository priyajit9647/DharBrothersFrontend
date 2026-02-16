import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - COVER DESIGN TYPE ||============================== //

export default function CoverDesignTypeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Cover Design Type Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Define options for cover design such as Same as Thesis Cover or Upload New Design.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Cover Design Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Master data for cover design types will be configured here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
