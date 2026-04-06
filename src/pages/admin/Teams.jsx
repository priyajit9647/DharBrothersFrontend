import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import MasterList from 'sections/admin/masters/MasterList';
import { getBranches } from 'api/branch';
import { createAdminUser, getUsersByBranch, toggleUserActive } from 'api/user';

// ==============================|| BMS - TEAMS (ADMIN) ||============================== //

// This page intentionally mirrors the Branches page layout, but
// focuses only on team member names in the grid. The create button
// and dialog behavior are kept the same from a UX perspective.

export default function Teams() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loading = loadingBranches || loadingUsers;

  // Load branches once and set default branch
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load users whenever selected branch changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedBranchId) return;
      try {
        setLoadingUsers(true);
        setError('');
        const data = await getUsersByBranch(selectedBranchId);
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        const normalized = items.map((item, index) => {
          const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
          return {
            id: item.id ?? index + 1,
            name: item.userName || fullName || 'User',
            fullName: fullName || '-',
            mobile: item.mobile || '',
            email: item.email || '',
            roleName: item.roleName || 'ADMIN',
            active: item.active
          };
        });
        setRows(normalized);
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

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ name: '', firstName: '', lastName: '', mobile: '', email: '', password: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      name: row.name || '',
      firstName: row.fullName?.split(' ')[0] || '',
      lastName: row.fullName?.split(' ').slice(1).join(' ') || '',
      mobile: row.mobile || '',
      email: row.email || '',
      password: ''
    });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const name = formValues.name.trim();
    const firstName = formValues.firstName.trim();
    const lastName = formValues.lastName.trim();
    const mobile = formValues.mobile.trim();
    const email = formValues.email.trim();
    const password = formValues.password.trim();

    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    if (!name || !mobile || !email || !password) {
      setError('User name, mobile, email and password are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingRow && editingRow.id) {
        // For now, edits are applied locally in the grid only.
        const updatedFullName = `${firstName || ''} ${lastName || ''}`.trim();
        setRows((prev) =>
          prev.map((item) =>
            item.id === editingRow.id
              ? {
                  ...item,
                  name,
                  fullName: updatedFullName || item.fullName,
                  mobile,
                  email
                }
              : item
          )
        );
        setDialogOpen(false);
      } else {
        // Create a new admin-type user for the selected branch via API.
        await createAdminUser({
          userName: name,
          firstName: firstName || name,
          lastName,
          email,
          mobile,
          whatsapp: mobile,
          password,
          branchId: selectedBranchId
        });

        // Reload users from API to include the new user.
        const data = await getUsersByBranch(selectedBranchId);
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        const normalized = items.map((item, index) => {
          const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
          return {
            id: item.id ?? index + 1,
            name: item.userName || fullName || 'User',
            fullName: fullName || '-',
            mobile: item.mobile || '',
            email: item.email || '',
            roleName: item.roleName || 'ADMIN',
            active: item.active
          };
        });
        setRows(normalized);

        setDialogOpen(false);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create team user', err);
      setError(err?.message || 'Failed to save team user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleUserActive(row.id, active);
    } catch (err) {
      // Revert on failure and show error
      // eslint-disable-next-line no-console
      console.error('Failed to toggle user active state', err);
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(err?.message || 'Failed to update user status');
    }
  };

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
            <Stack spacing={1} sx={{ mb: 1 }}>
              <FormControl size="small" sx={{ minWidth: 220 }} disabled={loadingBranches}>
                <InputLabel id="teams-branch-select-label">Branch</InputLabel>
                <Select
                  labelId="teams-branch-select-label"
                  label="Branch"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {error && !dialogOpen && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
            </Stack>
          <MasterList
            title="Branches & Teams"
            description="Configure branches, teams and role-based access for managers and staff."
            columns={[
              { id: 'name', label: 'User Name' },
              { id: 'fullName', label: 'Full Name' },
              { id: 'mobile', label: 'Mobile No' },
              { id: 'email', label: 'Email ID' },
              { id: 'roleName', label: 'Role' }
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
            onCreate={openCreateDialog}
            onEdit={openEditDialog}
            onToggleActive={handleToggleActive}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Team Member' : 'Create Team Member'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="User Name"
              value={formValues.name}
              onChange={handleFormChange('name')}
              fullWidth
            />
            <TextField
              label="First Name"
              value={formValues.firstName}
              onChange={handleFormChange('firstName')}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formValues.lastName}
              onChange={handleFormChange('lastName')}
              fullWidth
            />
            <TextField
              label="Mobile No"
              value={formValues.mobile}
              onChange={handleFormChange('mobile')}
              fullWidth
            />
            <TextField
              label="Email ID"
              value={formValues.email}
              onChange={handleFormChange('email')}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={formValues.password}
              onChange={handleFormChange('password')}
              fullWidth
            />
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
