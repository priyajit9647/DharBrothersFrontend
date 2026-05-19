import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import MasterList from 'sections/admin/masters/MasterList';
import Button from '@mui/material/Button';
import { getJobList, completeMyJob } from 'api/myJobs';
import { useAuth } from 'hooks/useAuth';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';

// ==============================|| MY JOBS ||============================== //

export default function MyJobs() {
  const { user, accessToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [completingId, setCompletingId] = useState(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedCompleteId, setSelectedCompleteId] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeJob, setActiveJob] = useState(null);

  const loadJobs = useCallback(async (uid) => {
    setLoading(true);
    setError('');

    try {
      // Determine effective userId to send — backend requires `userId` param
      let effectiveUid = uid || user?.id || user?.userId || user?.uid || null;

      if (!effectiveUid && accessToken) {
        try {
          // Decode token payload for common fields.
          const { parseJwt } = require('utils/authTokens');
          const payload = parseJwt(accessToken);
          if (payload) {
            effectiveUid = payload.userId || payload.user_id || payload.sub || payload.uid || payload.id || null;
          }
        } catch (err) {
          // ignore token parse errors
        }
      }

      if (!effectiveUid) {
        throw new Error('User ID not available for job list request');
      }

      const data = await getJobList(effectiveUid);
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setJobs(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load jobs', err);
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

  const openCompleteDialog = (id) => {
    if (!id) return;
    setSelectedCompleteId(id);
    setRemark('');
    setRemarkError('');
    setCompleteDialogOpen(true);
  };

  const handleActionsOpen = (event, job) => {
    setActionAnchorEl(event.currentTarget);
    setActiveJob(job);
  };

  const navigate = useNavigate();

  const handleActionsClose = () => {
    setActionAnchorEl(null);
    setActiveJob(null);
  };

  const handleViewOrder = () => {
    if (!activeJob) return;
    const id = activeJob.orderId || activeJob.id || activeJob.orderNo || activeJob.code;
    if (id) {
      navigate(`/orders/view/${encodeURIComponent(String(id))}`);
    }
    handleActionsClose();
  };

  const handleDocumentApproval = () => {
    if (!activeJob) return;
    window.alert(`Document version approval clicked for Order ID: ${activeJob.orderId || activeJob.id || 'unknown'}`);
    handleActionsClose();
  };

  const handleReinitiatePayment = () => {
    if (!activeJob) return;
    window.alert(`Re-initiate payment clicked for Order ID: ${activeJob.orderId || activeJob.id || 'unknown'}`);
    handleActionsClose();
  };

  const handleCloseCompleteDialog = () => {
    // prevent closing while a completion request is active for this job
    if (completingId && completingId === selectedCompleteId) return;
    setCompleteDialogOpen(false);
    setSelectedCompleteId(null);
    setRemark('');
    setRemarkError('');
  };

  const handleSubmitRemark = async () => {
    if (!selectedCompleteId) return;
    const r = String(remark || '').trim();
    if (!r) {
      setRemarkError('Please enter a remark');
      return;
    }

    try {
      setCompletingId(selectedCompleteId);
      setRemarkError('');
      setError('');
      await completeMyJob(selectedCompleteId, r);
      await loadJobs();
      // on success close dialog and clear selected id/remark
      setCompleteDialogOpen(false);
      setSelectedCompleteId(null);
      setRemark('');
      setRemarkError('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete job', err);
      setRemarkError(err?.message || 'Failed to complete job');
      setError(err?.message || 'Failed to complete job');
    } finally {
      // always clear completing flag; keep selectedCompleteId/remark so user can retry or cancel
      setCompletingId(null);
    }
  };

  useEffect(() => {
    // Always attempt to load jobs on mount; pass user id when available
    loadJobs(user?.id);
  }, [loadJobs, user?.id]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return jobs.slice(start, end);
  }, [page, rowsPerPage, jobs]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getCustomerName = (customer) => {
    if (!customer) return '';
    return customer.name || customer.customerName || '';
  };

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          <MasterList
            title="My Jobs"
            description="View the list of jobs assigned to you."
            columns={[
              {
                id: 'rowActions',
                label: '',
                align: 'center',
                sx: { width: '80px' },
                render: (row) => (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={(event) => handleActionsOpen(event, row)}
                      aria-label="Job actions"
                    >
                      <EllipsisOutlined style={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                )
              },
              { id: 'orderId', label: 'Order ID' },
              { id: 'documentId', label: 'Document ID' },
              { id: 'stage', label: 'Stage' },
              {
                id: 'customer',
                label: 'Customer',
                render: (row) => getCustomerName(row.customer)
              },
              {
                id: 'dueTime',
                label: 'Due Time',
                format: (value) => formatDate(value)
              },
              {
                id: 'completed',
                label: 'Completed',
                align: 'center',
                format: (value) => (value ? 'Yes' : 'No')
              },
              {
                id: 'completedAt',
                label: 'Completed At',
                format: (value) => formatDate(value)
              },
              { id: 'delayNote', label: 'Delay Note' },
              {
                id: 'delayedAt',
                label: 'Delayed At',
                format: (value) => formatDate(value)
              },
              {
                id: 'actions',
                label: 'Actions',
                align: 'center',
                render: (row) => (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => openCompleteDialog(row.id)}
                    disabled={loading || completingId === row.id}
                  >
                    {completingId === row.id ? 'Completing...' : 'Complete'}
                  </Button>
                )
              }
            ]}
            rows={pagedRows}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={jobs.length}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
            loading={loading}
            hideCreateButton
            showActiveColumn={false}
            showActionsColumn={false}
          />
          <Menu
            anchorEl={actionAnchorEl}
            open={Boolean(actionAnchorEl)}
            onClose={handleActionsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleViewOrder}>View Order</MenuItem>
            <MenuItem onClick={handleDocumentApproval}>Document Version Approval</MenuItem>
            <MenuItem onClick={handleReinitiatePayment}>Re-initiate Payment</MenuItem>
          </Menu>
        </Grid>
      </Grid>
        <Dialog open={completeDialogOpen} onClose={handleCloseCompleteDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Mark Job Complete</DialogTitle>
          <DialogContent>
            <TextField
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              error={Boolean(remarkError)}
              helperText={remarkError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCompleteDialog} disabled={completingId === selectedCompleteId}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmitRemark} disabled={completingId === selectedCompleteId}>
              {completingId === selectedCompleteId ? 'Completing...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
    </>
  );
}
