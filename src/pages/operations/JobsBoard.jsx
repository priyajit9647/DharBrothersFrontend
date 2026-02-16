import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - JOBS BOARD (MANAGER VIEW) ||============================== //

export default function JobsBoard() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Jobs Board</Typography>
        <Typography variant="body2" color="text.secondary">
          Central view of all binding jobs across branches. Filter by branch, status, priority and SLA breaches.
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <MainCard title="Active Jobs by Stage" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Kanban-style board for stages (Cutting → Binding → Packing → Delivery). Each card shows job ID, customer, due date and delay flag.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <MainCard title="SLA & Delays" contentSX={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Summary tiles for On-time, At Risk and Delayed jobs with drill-down into reasons.
            </Typography>
          </MainCard>
          <MainCard title="Branch Workload" contentSX={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bar or donut visualization of workload per branch/team to support manual re-allocation.
            </Typography>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
