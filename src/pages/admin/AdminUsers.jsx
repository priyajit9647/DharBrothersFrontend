import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';

import MainCard from 'components/MainCard';
import { getBranches } from 'api/branch';
import { createAdminUser, getUsersByBranch, toggleUserActive } from 'api/user';

// ==============================|| ADMIN - USERS MANAGEMENT ||============================== //

export default function AdminUsers() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    whatsapp: '',
    password: ''
  });

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        setError('');
        const data = await getBranches();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setBranches(items);
        if (!selectedBranchId && items.length > 0) {
          setSelectedBranchId(String(items[0].id));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load branches', err);
        setError(err?.message || 'Failed to load branches');
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [selectedBranchId]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedBranchId) return;
      try {
        setLoadingUsers(true);
        setError('');
        const data = await getUsersByBranch(selectedBranchId);
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setUsers(items);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users for branch', err);
        setError(err?.message || 'Failed to load users for this branch');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [selectedBranchId]);

  const handleFormChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateAdmin = async () => {
    if (!selectedBranchId) return;

    const { userName, firstName, lastName, email, mobile, whatsapp, password } = form;

    if (!userName || !firstName || !email || !mobile || !password) {
      setError('Please fill in all required fields (User Name, First Name, Email, Mobile, Password).');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createAdminUser({
        userName,
        firstName,
        lastName,
        email,
        mobile,
        whatsapp: whatsapp || mobile,
        password,
        branchId: selectedBranchId
      });

      setSuccess('Admin user created successfully.');
      setForm({
        userName: '',
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        whatsapp: '',
        password: ''
      });

      const data = await getUsersByBranch(selectedBranchId);
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setUsers(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create admin user', err);
      setError(err?.message || 'Failed to create admin user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      setError('');
      setSuccess('');
      await toggleUserActive(user.id, !user.active);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: !user.active } : u))
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle user active state', err);
      setError(err?.message || 'Failed to update user status');
    }
  };

  const selectedBranchName = useMemo(() => {
    const b = branches.find((br) => String(br.id) === String(selectedBranchId));
    return b?.name || '';
  }, [branches, selectedBranchId]);

  return (
    <Grid container spacing={2} sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12}>
        <Typography variant="h5">Admin Users</Typography>
        <Typography variant="body2" color="text.secondary">
          Create and manage admin users per branch.
        </Typography>
        {error && (
          <Typography variant="caption" color="error.main">
            {error}
          </Typography>
        )}
        {success && (
          <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
            {success}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="branch-select-label">Branch</InputLabel>
              <Select
                labelId="branch-select-label"
                label="Branch"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={loadingBranches}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1">Create Admin User</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="User Name"
                  value={form.userName}
                  onChange={handleFormChange('userName')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={form.firstName}
                  onChange={handleFormChange('firstName')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={form.lastName}
                  onChange={handleFormChange('lastName')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange('email')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile"
                  value={form.mobile}
                  onChange={handleFormChange('mobile')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="WhatsApp (optional)"
                  value={form.whatsapp}
                  onChange={handleFormChange('whatsapp')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange('password')}
                />
              </Grid>
            </Grid>

            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateAdmin}
                disabled={saving || !selectedBranchId}
              >
                {saving ? 'Creating…' : 'Create Admin User'}
              </Button>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard title={selectedBranchName ? `Users in ${selectedBranchName}` : 'Branch Users'}>
          {loadingUsers ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : users.length ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.userName}</TableCell>
                    <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>{user.roleName}</TableCell>
                    <TableCell>
                      <Switch
                        checked={Boolean(user.active)}
                        onChange={() => handleToggleActive(user)}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No users found for this branch.
            </Typography>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
