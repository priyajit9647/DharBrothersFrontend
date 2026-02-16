import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - REPORTS & INSIGHTS ||============================== //

export default function ReportsOverview() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Reports &amp; Insights</Typography>
        <Typography variant="body2" color="text.secondary">
          Management view of operational performance: throughput, delays, material consumption and revenue per job/branch.
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <MainCard title="Job Performance" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Area or line charts for jobs per day, average turnaround time and on-time completion rate.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <MainCard title="Material Usage" contentSX={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Breakdown of key materials consumed by branch and by job type.
            </Typography>
          </MainCard>
          <MainCard title="Revenue &amp; Branch Comparison" contentSX={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              High-level revenue per job/branch card stack to compare branches.
            </Typography>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
