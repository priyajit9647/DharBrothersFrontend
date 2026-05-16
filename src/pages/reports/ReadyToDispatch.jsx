import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - READY TO DISPATCH REPORT ||============================== //

export default function ReadyToDispatch() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Ready To Dispatch</Typography>
        <Typography variant="body2" color="text.secondary">
          Orders/jobs that are ready and waiting for dispatch/collection.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Placeholder for Ready To Dispatch list and labels.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
