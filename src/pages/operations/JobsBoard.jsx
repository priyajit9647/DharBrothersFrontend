import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';

// icons
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';

// ==============================|| BMS - JOBS BOARD (TABLE VIEW) ||============================== //

const pendingJobs = [
  { id: 'JOB-2401', customer: 'City Public School', branch: 'Kolkata North', stage: 'Binding', due: 'Today, 4:30 PM', priority: 'High', statusTone: 'warning' },
  { id: 'JOB-2407', customer: 'Scholar Hub', branch: 'Howrah', stage: 'Cutting', due: 'Tomorrow, 11:00 AM', priority: 'Medium', statusTone: 'info' },
  { id: 'JOB-2412', customer: 'Apex Coaching Centre', branch: 'Salt Lake', stage: 'Packing', due: 'Tomorrow, 6:15 PM', priority: 'High', statusTone: 'warning' }
];

const readyToDeliverJobs = [
  { id: 'JOB-2388', customer: 'Bright Future Academy', branch: 'Kolkata South', stage: 'Dispatch Desk', due: 'Pickup by 2:00 PM', priority: 'Ready', statusTone: 'success' },
  { id: 'JOB-2394', customer: 'National Commerce College', branch: 'Barasat', stage: 'Delivery Counter', due: 'Courier slot 5:30 PM', priority: 'Ready', statusTone: 'success' },
  { id: 'JOB-2400', customer: 'Stellar Institute', branch: 'Howrah', stage: 'Dispatch Desk', due: 'Customer pickup pending', priority: 'Ready', statusTone: 'success' }
];

const deliveredJobs = [
  { id: 'JOB-2370', customer: 'Oxford Tutorial Home', branch: 'Salt Lake', stage: 'Delivered', due: 'Delivered at 10:45 AM', priority: 'Closed', statusTone: 'default' },
  { id: 'JOB-2372', customer: 'Prime Classes', branch: 'Kolkata North', stage: 'Delivered', due: 'Delivered yesterday', priority: 'Closed', statusTone: 'default' },
  { id: 'JOB-2378', customer: 'Beacon School', branch: 'Kolkata South', stage: 'Delivered', due: 'Signed by front office', priority: 'Closed', statusTone: 'default' }
];

const cancelledJobs = [
  { id: 'JOB-2415', customer: 'Greenwood Academy', branch: 'Howrah', stage: 'Cancelled', due: 'Cancelled', priority: 'Cancelled', statusTone: 'error' }
];

function SummaryTile({ label, value, helper, accent }) {
  return (
    <MainCard contentSX={{ p: 2.25 }} sx={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 130%)` }}>
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

const headCells = [
  { id: 'actions', align: 'left', label: '', width: '48px' },
  { id: 'id', align: 'left', label: 'Job #', width: '120px' },
  { id: 'customer', align: 'left', label: 'Customer' },
  { id: 'branch', align: 'left', label: 'Branch', width: '140px' },
  { id: 'stage', align: 'left', label: 'Stage', width: '140px' },
  { id: 'due', align: 'left', label: 'Due', width: '160px' },
  { id: 'priority', align: 'center', label: 'Priority', width: '110px' }
];

function JobsTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{ whiteSpace: 'nowrap', width: headCell.width || 'auto' }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function JobStatus({ statusTone }) {
  // reuse the status tone string used on the data for consistent colors
  let tone = statusTone || 'primary';
  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Dot color={tone} />
      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{tone}</Typography>
    </Stack>
  );
}

export default function JobsBoard() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const rows = [
    ...pendingJobs.map((j) => ({ ...j, status: 0 })),
    ...readyToDeliverJobs.map((j) => ({ ...j, status: 1 })),
    ...deliveredJobs.map((j) => ({ ...j, status: 2 })),
    ...cancelledJobs.map((j) => ({ ...j, status: 3 }))
  ];

  const handleActionClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5">Jobs Board</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Central view of jobs — table-first layout for quick operations.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="stretch" sx={{ flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 220, width: 'auto' }}>
                <SummaryTile label="Pending Jobs" value={pendingJobs.length} helper="Requires stage completion before delivery" accent="rgba(255, 196, 61, 0.28)" />
              </Box>
              <Box sx={{ minWidth: 220, width: 'auto' }}>
                <SummaryTile label="Ready To Deliver" value={readyToDeliverJobs.length} helper="Prepared for pickup, dispatch or courier handover" accent="rgba(134, 239, 172, 0.28)" />
              </Box>
              <Box sx={{ minWidth: 220, width: 'auto' }}>
                <SummaryTile label="Delivered Jobs" value={deliveredJobs.length} helper="Closed jobs with completed handover" accent="rgba(148, 163, 184, 0.2)" />
              </Box>
              <Box sx={{ minWidth: 220, width: 'auto' }}>
                <SummaryTile label="Cancelled Jobs" value={cancelledJobs.length} helper="Jobs cancelled or voided" accent="rgba(255, 150, 150, 0.18)" />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <MainCard sx={{ mt: 3 }} content={false}>
          <Box sx={{ p: 0 }}>
            <TableContainer
              sx={{
                width: '100%',
                overflowX: 'auto',
                position: 'relative',
                display: 'block',
                maxWidth: '100%',
                px: 2,
                '& td, & th': { whiteSpace: 'nowrap' }
              }}
            >
              <Table aria-labelledby="jobs-table" sx={{ width: '100%', tableLayout: 'fixed' }}>
                <JobsTableHead />
                <TableBody>
                  {rows.map((row) => (
                    <TableRow hover tabIndex={-1} key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, row)}>
                          <EllipsisOutlined style={{ fontSize: '1rem' }} />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{row.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{row.customer}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.branch} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.stage}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{row.due}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.priority} color={row.statusTone} size="small" variant={row.statusTone === 'default' ? 'outlined' : 'filled'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem onClick={handleMenuClose}>View Job</MenuItem>
            <MenuItem onClick={handleMenuClose}>Assign</MenuItem>
            <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
            <MenuItem onClick={handleMenuClose} disabled={activeRow && activeRow.status === 2}>
              Mark as Delivered
            </MenuItem>
          </Menu>
        </MainCard>
      </Grid>
    </Grid>
  );
}
