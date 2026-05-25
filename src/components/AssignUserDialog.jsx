import { useEffect, useState, useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import SearchOutlined from '@ant-design/icons/SearchOutlined';

import { getActiveUsersByBranch } from 'api/user';
import { initDocument } from 'api/document';
import { assignOrderStaff } from 'api/orders';
import { AuthContext } from 'contexts/AuthContext';

export default function AssignUserDialog({ open, onClose, order, onAssigned }) {
  const auth = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [dateAssigned, setDateAssigned] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setSearch('');
    setSelectedUserId('');
    setDateAssigned(new Date().toISOString().slice(0, 10));

    const branchId = order?.branchId ?? order?.branch?.id ?? auth?.user?.branchId ?? auth?.user?.branch?.id;

    const load = async () => {
      try {
        setLoading(true);
        const b = branchId;
        const targetBranch = b || (auth?.user?.branchId ?? auth?.user?.branch?.id);
        if (!targetBranch) {
          setUsers([]);
          return;
        }
        const data = await getActiveUsersByBranch(targetBranch);
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setUsers(items);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users for branch', err);
        setError(err?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = String(search).toLowerCase();
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase() || (u.userName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.mobile || u.phone || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError('');
    try {
      const staffId = String(selectedUserId);
      // If document-level orderDetails id present, try to init document (non-fatal)
      if (order?.id) {
        try {
          await initDocument({ orderDetailsId: String(order.id), assignedStaffId: staffId });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('initDocument failed', err);
        }
      }

      const orderId = order?.orderId || order?.orderNo || order?.id;
      if (orderId) {
        try {
          await assignOrderStaff(orderId, { assignedStaffId: staffId, assignedDate: dateAssigned || undefined });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('assignOrderStaff failed', err);
        }
      }

      const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));
      onAssigned && onAssigned({ user: selectedUser, dateAssigned: dateAssigned || new Date().toISOString() });
      onClose && onClose();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(open)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign — {order ? (order.orderId || order.id || '') : ''}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
          Assign a single user to this job. Select one user from the list and click Assign.
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined style={{ fontSize: 16 }} />
              </InputAdornment>
            )
          }}
          sx={{ mb: 1 }}
        />

        <TextField
          size="small"
          label="Date Assigned"
          type="date"
          value={dateAssigned}
          onChange={(e) => setDateAssigned(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 1 }}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <CircularProgress size={20} />
          </div>
        ) : (
          <List dense sx={{ maxHeight: '45vh', overflow: 'auto' }}>
            {filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No users available
              </Typography>
            ) : (
              filtered.map((u) => {
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email || `User ${u.id}`;
                return (
                  <div key={u.id}>
                    <ListItemButton selected={String(u.id) === String(selectedUserId)} onClick={() => setSelectedUserId(String(u.id))}>
                      <ListItemAvatar>
                        <Avatar>{(u.firstName || u.userName || 'U')[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={fullName} secondary={[u.email, u.mobile || u.phone].filter(Boolean).join(' • ')} />
                    </ListItemButton>
                    <Divider />
                  </div>
                );
              })
            )}
          </List>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAssign} disabled={!selectedUserId || saving}>
          {saving ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
