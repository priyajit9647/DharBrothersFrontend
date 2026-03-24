import { useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MasterList from 'sections/admin/masters/MasterList';

// ==============================|| BMS - TEAMS (ADMIN) ||============================== //

// This page intentionally mirrors the Branches page layout, but
// focuses only on team member names in the grid. The create button
// and dialog behavior are kept the same from a UX perspective.

export default function Teams() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    mobile: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading] = useState(false);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ name: '', mobile: '', email: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      name: row.name || '',
      mobile: row.mobile || '',
      email: row.email || ''
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
    const mobile = formValues.mobile.trim();
    const email = formValues.email.trim();

    if (!name) {
      setError('User name is required');
      return;
    }

    setSaving(true);
    setError('');

    // Local-only update for now; wire to real API when backend is ready.
    setRows((prev) => {
      if (editingRow && editingRow.id) {
        return prev.map((item) =>
          item.id === editingRow.id ? { ...item, name, mobile, email } : item
        );
      }

      const nextId = prev.length > 0 ? Math.max(...prev.map((item) => item.id || 0)) + 1 : 1;
      return [...prev, { id: nextId, name, mobile, email, active: true }];
    });

    setSaving(false);
    setDialogOpen(false);
  };

  const handleToggleActive = async (row, active) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));
  };

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
          {error && !dialogOpen && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          <MasterList
            title="Branches & Teams"
            description="Configure branches, teams and role-based access for managers and staff."
            columns={[
              { id: 'name', label: 'User Name' },
              { id: 'mobile', label: 'Mobile No' },
              { id: 'email', label: 'Email ID' }
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
