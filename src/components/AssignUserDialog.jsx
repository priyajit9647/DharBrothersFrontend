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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { getActiveUsersByBranch } from 'api/user';
import { initDocument } from 'api/document';
import { reassignOrderStaff } from 'api/orders';
import { AuthContext } from 'contexts/AuthContext';

// You'll need a function to fetch all branches – adjust import/path accordingly
// import { getAllBranches } from 'api/branch';

export default function AssignUserDialog({ open, onClose, order, onAssigned }) {
  const auth = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Try to auto-detect branch from order or logged-in user
  const autoBranchId = order?.branchId ?? order?.branch?.id ?? auth?.user?.branchId ?? auth?.user?.branch?.id;
  const hasAutoBranch = !!autoBranchId;

  // Fetch all branches if no auto branch (so admin can pick)
  const fetchAllBranches = async () => {
    try {
      setLoadingBranches(true);
      // TODO: Replace with your actual branch list API
      // const data = await getAllBranches();
      // const branchList = Array.isArray(data) ? data : data?.data || data?.items || [];
      // setBranches(branchList);
      // if (branchList.length > 0) setSelectedBranchId(branchList[0].id);
      console.warn('Implement branch list API (e.g., getAllBranches)');
      // Temporary mock – remove after real implementation
      setBranches([{ id: '1', name: 'Branch 1' }]);
      setSelectedBranchId('1');
    } catch (err) {
      console.error('Failed to load branches', err);
      setError('Could not load branch list.');
    } finally {
      setLoadingBranches(false);
    }
  };

  // On dialog open, decide branch
  useEffect(() => {
    if (!open) return;
    setError('');
    setSearch('');
    setSelectedUserId('');
    setUsers([]);
    if (hasAutoBranch) {
      setSelectedBranchId(autoBranchId);
    } else {
      fetchAllBranches();
    }
  }, [open, hasAutoBranch, autoBranchId]);

  // Fetch users when branch changes
  useEffect(() => {
    if (!open) return;
    if (!selectedBranchId) return;

    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getActiveUsersByBranch(selectedBranchId);
        let extractedUsers = [];
        if (Array.isArray(data)) extractedUsers = data;
        else if (data?.data && Array.isArray(data.data)) extractedUsers = data.data;
        else if (data?.items && Array.isArray(data.items)) extractedUsers = data.items;
        else if (data?.content && Array.isArray(data.content)) extractedUsers = data.content;
        else console.warn('Unexpected response shape', data);
        setUsers(extractedUsers);
        if (extractedUsers.length === 0) setError('No active users found in this branch.');
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [open, selectedBranchId]);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
    const userName = (u.userName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.mobile || u.phone || '').toLowerCase();
    return fullName.includes(q) || userName.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError('');
    try {
      const selectedUser = users.find((u) => String(u.id) === selectedUserId);
      const staffId = String(selectedUserId);

      // Extract jobId from order — try multiple property names
      const jobId = order?.jobId || order?.documentStageId || order?.stageId;

      // Debug logging
      console.log('Assign order =', order);
      console.log('jobId =', jobId);
      console.log('selected user =', selectedUser);

      // Validate jobId before proceeding
      if (!jobId) {
        console.error('Missing jobId', order);
        setError('Job ID missing');
        return;
      }

      // Optional document initialisation (ignore errors)
      if (order?.id) {
        try {
          await initDocument({ orderDetailsId: String(order.id), assignedStaffId: staffId });
        } catch (err) {
          console.warn('initDocument failed', err);
        }
      }

      // Use the reassign API with jobId and staffId
      await reassignOrderStaff(jobId, staffId, '');

      // Trigger callback with user and dateAssigned
      onAssigned?.({
        user: selectedUser,
        dateAssigned: new Date().toISOString()
      });
      onClose?.();
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign user — {order ? order.orderId || order.id || '' : ''}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
          Select a branch (if not automatically detected) and then choose a user.
        </Typography>

        {!hasAutoBranch && (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Branch</InputLabel>
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              label="Select Branch"
              disabled={loadingBranches}
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name || branch.branchName || branch.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedBranchId && (
          <>
            <TextField
              size="small"
              fullWidth
              placeholder="Search users by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined style={{ fontSize: 16 }} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              autoFocus
            />

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <CircularProgress size={24} />
              </div>
            )}

            {!loading && (
              <List dense sx={{ maxHeight: '50vh', overflow: 'auto' }}>
                {filteredUsers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No users available in this branch
                  </Typography>
                ) : (
                  filteredUsers.map((user) => {
                    const fullName =
                      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || user.email || `User ${user.id}`;
                    const secondaryText = [user.email, user.mobile || user.phone].filter(Boolean).join(' • ');
                    return (
                      <div key={user.id}>
                        <ListItemButton selected={String(user.id) === selectedUserId} onClick={() => setSelectedUserId(String(user.id))}>
                          <ListItemAvatar>
                            <Avatar>{(user.firstName || user.userName || 'U')[0].toUpperCase()}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={fullName} secondary={secondaryText} />
                        </ListItemButton>
                        <Divider />
                      </div>
                    );
                  })
                )}
              </List>
            )}
          </>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAssign} disabled={!selectedUserId || saving || !selectedBranchId}>
          {saving ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
