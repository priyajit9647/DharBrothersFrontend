import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import MainCard from 'components/MainCard';

// ==============================|| BMS - MY JOBS (STAFF VIEW) ||============================== //

export default function MyJobs() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">My Jobs</Typography>
        <Typography variant="body2" color="text.secondary">
          List of jobs assigned to the logged-in staff member. Simple actions to move stages, log delays and mark completion.
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <MainCard title="Assigned Jobs" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Table-style list with columns for Job ID, Customer, Current Stage, Due Time, and Delay Reason.
          </Typography>
          <Button variant="contained" color="primary" size="small">
            Example: Mark Selected as Completed
          </Button>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <MainCard title="Today&apos;s Targets" contentSX={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Summary of jobs due today vs completed, to guide staff focus.
            </Typography>
          </MainCard>
          <MainCard title="Recent Delays Logged" contentSX={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Quick list of delay reasons recently submitted by this staff member.
            </Typography>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
