import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MasterList from 'sections/admin/masters/MasterList';
import { fetchWhatsappNotificationHistory } from 'api/whatsapp';

// ==============================|| BMS - WHATSAPP NOTIFICATIONS (HISTORY) ||============================== //

export default function WhatsappNotifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWhatsappNotificationHistory();
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setRows(items);
    } catch (e) {
      setError(e.message || 'Failed to load WhatsApp notifications');
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
            title="WhatsApp Notifications"
            description="View the history of WhatsApp notifications sent to customers."
            columns={[
              { id: 'customerName', label: 'Customer Name' },
              { id: 'customerPhone', label: 'Phone' },
              { id: 'event', label: 'Event' },
              { id: 'subject', label: 'Subject' },
              { id: 'body', label: 'Body' },
              { id: 'sent', label: 'Sent', align: 'center', format: (value) => (value ? 'Yes' : 'No') },
              { id: 'retryCount', label: 'Retries', align: 'center' },
              { id: 'errorMessage', label: 'Error Message' },
              { id: 'createdDate', label: 'Created Date', format: (value) => new Date(value).toLocaleString() }
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
