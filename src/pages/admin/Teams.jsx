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
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import MasterList from 'sections/admin/masters/MasterList';
import { getBranches } from 'api/branch';
import { createUserWithRoleId, getUsersByBranch, toggleUserActive, editUser } from 'api/user';
import { getRoles } from 'api/role';
import useAccess from 'hooks/useAccess';

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
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    branchId: '',
    roleId: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loading = loadingBranches || loadingUsers;

  const getInitials = (firstName, lastName, userName) => {
    const f = (firstName || '').trim();
    const l = (lastName || '').trim();
    if (f || l) return `${(f[0] || '').toUpperCase()}${(l[0] || '').toUpperCase()}`;
    if (userName) return userName.slice(0, 2).toUpperCase();
    return 'U';
  };

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

    // Load roles as well
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const data = await getRoles();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setRoles(items);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load roles', err);
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load users for all branches once branches are available
  const loadAllUsers = async () => {
    if (!branches || branches.length === 0) return;
    try {
      setLoadingUsers(true);
      setError('');
      const promises = branches.map(async (b) => {
        try {
          const data = await getUsersByBranch(String(b.id));
          const items = Array.isArray(data) ? data : data?.items || data?.data || [];
          return { branch: b, items };
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load users for branch ${b.id}`, err);
          return { branch: b, items: [] };
        }
      });

      const results = await Promise.all(promises);
      const normalized = [];
      results.forEach(({ branch, items }) => {
        items.forEach((item, index) => {
          const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
          normalized.push({
            id: item.id ?? `${branch.id}-${index}`,
            name: item.userName || fullName || 'User',
            fullName: fullName || '-',
            mobile: item.mobile || '',
            email: item.email || '',
            roleName: item.roleName || 'ADMIN',
            roleId: item.roleId ?? item.role?.id ?? null,
            active: item.active,
            branchId: branch.id,
            branchName: branch.name
          });
        });
      });
      setRows(normalized);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load users', err);
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  const { hasAccess } = useAccess();
  const canCreate = hasAccess('TEAMS_CREATE') || hasAccess('TEAMS_MGMT');
  const canEdit = hasAccess('TEAMS_EDIT') || hasAccess('TEAMS_MGMT');
  const canToggle = hasAccess('TEAMS_TOGGLE_ACTIVE') || hasAccess('TEAMS_MGMT');

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({
      name: '',
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      password: '',
      branchId: branches.length > 0 ? String(branches[0].id) : '',
      roleId: roles.length > 0 ? String(roles[0].id) : ''
    });
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
      password: '',
      branchId: row.branchId ? String(row.branchId) : '',
      roleId: row.roleId
        ? String(row.roleId)
        : roles.find((r) => r.name === row.roleName)
        ? String(roles.find((r) => r.name === row.roleName)?.id)
        : ''
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

    if (!formValues.branchId) {
      setError('Please select a branch');
      return;
    }

    if (!formValues.roleId) {
      setError('Please select a role');
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
        const payload = {
          userName: name,
          firstName: firstName || name,
          lastName,
          email,
          mobile,
          whatsapp: mobile,
          password,
          branchId: formValues.branchId,
          roleId: formValues.roleId
        };
        await editUser(editingRow.id, payload);
        await loadAllUsers();
        setDialogOpen(false);
      } else {
        // Create a new user for the selected branch via API (roleId required)
        const payload = {
          userName: name,
          firstName: firstName || name,
          lastName,
          email,
          mobile,
          whatsapp: mobile,
          password,
          branchId: formValues.branchId,
          roleId: formValues.roleId
        };
        await createUserWithRoleId(payload);
        // Reload all users to include the new user.
        await loadAllUsers();
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

  const selectedRole = roles.find((r) => String(r.id) === String(formValues.roleId));

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
            <Stack spacing={1} sx={{ mb: 1 }}>
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
              { id: 'roleName', label: 'Role' },
              { id: 'branchName', label: 'Branch' }
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
            showCreateButton={canCreate}
            showActionsColumn={canEdit}
            showActiveColumn={canToggle}
            activeRight="TEAMS_TOGGLE_ACTIVE"
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Team Member' : 'Create Team Member'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {getInitials(formValues.firstName, formValues.lastName, formValues.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{editingRow ? 'Edit Team Member' : 'New Team Member'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formValues.email || 'Enter details to create a team member'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="User Name"
                          value={formValues.name}
                          onChange={handleFormChange('name')}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          label="First Name"
                          value={formValues.firstName}
                          onChange={handleFormChange('firstName')}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          label="Last Name"
                          value={formValues.lastName}
                          onChange={handleFormChange('lastName')}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Mobile No"
                          value={formValues.mobile}
                          onChange={handleFormChange('mobile')}
                          fullWidth
                          required
                          type="tel"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email ID"
                          value={formValues.email}
                          onChange={handleFormChange('email')}
                          fullWidth
                          required
                          type="email"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Password"
                          type="password"
                          value={formValues.password}
                          onChange={handleFormChange('password')}
                          fullWidth
                          helperText={editingRow ? 'Leave empty to keep existing password' : ''}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl size="small" fullWidth>
                          <InputLabel id="team-branch-select-label">Branch</InputLabel>
                          <Select
                            labelId="team-branch-select-label"
                            label="Branch"
                            value={formValues.branchId}
                            onChange={handleFormChange('branchId')}
                          >
                            {branches.map((branch) => (
                              <MenuItem key={branch.id} value={String(branch.id)}>
                                {branch.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl size="small" fullWidth>
                          <InputLabel id="team-role-select-label">Role</InputLabel>
                          <Select
                            labelId="team-role-select-label"
                            label="Role"
                            value={formValues.roleId}
                            onChange={handleFormChange('roleId')}
                            disabled={loadingRoles}
                          >
                            {roles.map((r) => (
                              <MenuItem key={r.id} value={String(r.id)}>
                                {r.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        {error && (
                          <Typography variant="body2" color="error">
                            {error}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1">Access Rights</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedRole?.accessCodes || []).length} rights
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 1 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 320, overflow: 'auto' }}>
                  {(selectedRole?.accessCodes || []).map((code) => (
                    <Chip key={code} label={code} size="small" variant="outlined" />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
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
