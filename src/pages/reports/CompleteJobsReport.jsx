import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - COMPLETE JOBS REPORT ||============================== //

export default function CompleteJobsReport() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Complete Jobs Report</Typography>
        <Typography variant="body2" color="text.secondary">
          Summary and detailed list of completed jobs with timestamps and metrics.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Placeholder for completed jobs analytics and export options.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
