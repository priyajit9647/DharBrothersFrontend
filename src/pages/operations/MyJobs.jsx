import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MasterList from 'sections/admin/masters/MasterList';
import Button from '@mui/material/Button';
import { getJobList, completeMyJob } from 'api/myJobs';
import { useAuth } from 'hooks/useAuth';

// ==============================|| MY JOBS ||============================== //

export default function MyJobs() {
  const { user, accessToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [completingId, setCompletingId] = useState(null);

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

  const handleComplete = async (id) => {
    if (!id) return;
    try {
      setCompletingId(id);
      setError('');
      await completeMyJob(id);
      await loadJobs();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete job', err);
      setError(err?.message || 'Failed to complete job');
    } finally {
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
              }
,
              {
                id: 'actions',
                label: 'Actions',
                align: 'center',
                render: (row) => (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleComplete(row.id)}
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
        </Grid>
      </Grid>
    </>
  );
}
