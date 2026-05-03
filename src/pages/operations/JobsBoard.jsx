import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - JOBS BOARD (MANAGER VIEW) ||============================== //

const pendingJobs = [
  {
    id: 'JOB-2401',
    customer: 'City Public School',
    branch: 'Kolkata North',
    stage: 'Binding',
    due: 'Today, 4:30 PM',
    priority: 'High',
    statusTone: 'warning'
  },
  {
    id: 'JOB-2407',
    customer: 'Scholar Hub',
    branch: 'Howrah',
    stage: 'Cutting',
    due: 'Tomorrow, 11:00 AM',
    priority: 'Medium',
    statusTone: 'info'
  },
  {
    id: 'JOB-2412',
    customer: 'Apex Coaching Centre',
    branch: 'Salt Lake',
    stage: 'Packing',
    due: 'Tomorrow, 6:15 PM',
    priority: 'High',
    statusTone: 'warning'
  }
];

const readyToDeliverJobs = [
  {
    id: 'JOB-2388',
    customer: 'Bright Future Academy',
    branch: 'Kolkata South',
    stage: 'Dispatch Desk',
    due: 'Pickup by 2:00 PM',
    priority: 'Ready',
    statusTone: 'success'
  },
  {
    id: 'JOB-2394',
    customer: 'National Commerce College',
    branch: 'Barasat',
    stage: 'Delivery Counter',
    due: 'Courier slot 5:30 PM',
    priority: 'Ready',
    statusTone: 'success'
  },
  {
    id: 'JOB-2400',
    customer: 'Stellar Institute',
    branch: 'Howrah',
    stage: 'Dispatch Desk',
    due: 'Customer pickup pending',
    priority: 'Ready',
    statusTone: 'success'
  }
];

const deliveredJobs = [
  {
    id: 'JOB-2370',
    customer: 'Oxford Tutorial Home',
    branch: 'Salt Lake',
    stage: 'Delivered',
    due: 'Delivered at 10:45 AM',
    priority: 'Closed',
    statusTone: 'default'
  },
  {
    id: 'JOB-2372',
    customer: 'Prime Classes',
    branch: 'Kolkata North',
    stage: 'Delivered',
    due: 'Delivered yesterday',
    priority: 'Closed',
    statusTone: 'default'
  },
  {
    id: 'JOB-2378',
    customer: 'Beacon School',
    branch: 'Kolkata South',
    stage: 'Delivered',
    due: 'Signed by front office',
    priority: 'Closed',
    statusTone: 'default'
  }
];

function SummaryTile({ label, value, helper, accent }) {
  return (
    <MainCard
      contentSX={{ p: 2.25 }}
      sx={{
        background: `linear-gradient(135deg, ${accent} 0%, transparent 130%)`
      }}
    >
      <Stack spacing={0.75}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      </Stack>
    </MainCard>
  );
}

function JobListCard({ title, subtitle, jobs, accent }) {
  return (
    <MainCard
      title={title}
      subheader={subtitle}
      contentSX={{ p: 0 }}
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderTop: `4px solid ${accent}`
      }}
    >
      <Stack divider={<Divider />}>
        {jobs.map((job) => (
          <Box key={job.id} sx={{ px: 2.5, py: 2 }}>
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                <Box>
                  <Typography variant="subtitle2">{job.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job.customer}
                  </Typography>
                </Box>
                <Chip label={job.priority} color={job.statusTone} size="small" variant={job.statusTone === 'default' ? 'outlined' : 'filled'} />
              </Stack>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip label={job.branch} size="small" variant="outlined" />
                <Chip label={job.stage} size="small" variant="outlined" />
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.2 }}>
                {job.due}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </MainCard>
  );
}

export default function JobsBoard() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Jobs Board</Typography>
        <Typography variant="body2" color="text.secondary">
          Central view of jobs grouped by delivery outcome so teams can focus on what is pending, what is ready to hand over and what is already closed.
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <SummaryTile label="Pending Jobs" value={pendingJobs.length} helper="Requires stage completion before delivery" accent="rgba(255, 196, 61, 0.28)" />
      </Grid>
      <Grid item xs={12} md={4}>
        <SummaryTile
          label="Ready To Deliver"
          value={readyToDeliverJobs.length}
          helper="Prepared for pickup, dispatch or courier handover"
          accent="rgba(134, 239, 172, 0.28)"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <SummaryTile label="Delivered Jobs" value={deliveredJobs.length} helper="Closed jobs with completed handover" accent="rgba(148, 163, 184, 0.2)" />
      </Grid>

      <Grid item xs={12} md={4}>
        <JobListCard
          title="Pending List"
          subtitle="Jobs still inside production or packing"
          jobs={pendingJobs}
          accent="#f59e0b"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <JobListCard
          title="Ready To Deliver List"
          subtitle="Jobs cleared for dispatch or customer pickup"
          jobs={readyToDeliverJobs}
          accent="#22c55e"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <JobListCard
          title="Delivered List"
          subtitle="Recently completed deliveries"
          jobs={deliveredJobs}
          accent="#94a3b8"
        />
      </Grid>
    </Grid>
  );
}
