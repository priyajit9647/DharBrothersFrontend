import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MasterList from 'sections/admin/masters/MasterList';
import { fetchInAppNotificationHistory } from 'api/inAppNotification';

// ==============================|| BMS - IN-APP NOTIFICATIONS ||============================== //

export default function InAppNotifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchInAppNotificationHistory();
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setRows(items);
    } catch (err) {
      console.error('Failed to load in-app notifications', err);
      setError(err?.message || 'Failed to load in-app notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

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
            title="In-App Notifications"
            description="View the history of in-app notifications sent to customers."
            columns={[
              { id: 'customerName', label: 'Customer Name' },
              { id: 'customerEmail', label: 'Email' },
              { id: 'event', label: 'Event' },
              { id: 'subject', label: 'Subject' },
              { id: 'body', label: 'Body' },
              { id: 'sent', label: 'Sent', align: 'center', format: (value) => (value ? 'Yes' : 'No') },
              { id: 'retryCount', label: 'Retries', align: 'center' },
              { id: 'errorMessage', label: 'Error Message' },
              { id: 'createdDate', label: 'Created Time', format: (value) => (value ? new Date(value).toLocaleString() : '') }
            ]}
            rows={pagedRows}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={rows.length}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
            loading={loading}
            hideCreateButton
            hideActions
          />
        </Grid>
      </Grid>
    </>
  );
}