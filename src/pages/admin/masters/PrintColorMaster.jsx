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

import MasterList from 'sections/admin/masters/MasterList';
import useAccess from 'hooks/useAccess';
import { createPrintColor, editPrintColor, getPrintColors, togglePrintColorActive } from 'api/printColor';

// ==============================|| MASTER - PRINT COLOR ||============================== //

export default function PrintColorMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ code: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPrintColors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPrintColors();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            code: item.code,
            name: item.name,
            active: item.active
          }))
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load print colors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrintColors();
  }, []);

  const { hasAccess } = useAccess();
  const canCreate = hasAccess('PRINT_COLORS_CREATE') || hasAccess('PRINTING_COLORS_CREATE') || hasAccess('PRINT_COLORS_MGMT');
  const canEdit = hasAccess('PRINT_COLORS_EDIT') || hasAccess('PRINT_COLORS_MGMT');
  const canToggle = hasAccess('PRINT_COLORS_TOGGLE_ACTIVE') || hasAccess('PRINT_COLORS_MGMT');

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ code: '', name: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      code: row.code || '',
      name: row.name || ''
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
      [field]: field === 'code' ? value.toUpperCase() : value
    }));
  };

  const handleSave = async () => {
    const code = formValues.code.trim();
    const name = formValues.name.trim();

    if (!code || !name) {
      setError('Code and Name are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editPrintColor(editingRow.id, { code, name });
        await loadPrintColors();
      } else {
        await createPrintColor({ code, name });
        await loadPrintColors();
      }

      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save print color');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await togglePrintColorActive(row.id, active);
    } catch (e) {
      // Revert on failure and show error
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(e.message || 'Failed to update active status');
    }
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
            title="Print Colors"
            description="Maintain color options like Black & White, Mixed Color, Royal Print, etc."
            columns={[
              { id: 'name', label: 'Name' },
              { id: 'code', label: 'Code' }
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
            showCreateButton={canCreate}
            showActionsColumn={canEdit}
            showActiveColumn={canToggle}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Print Color' : 'Create Print Color'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Code"
              value={formValues.code}
              onChange={handleFormChange('code')}
              fullWidth
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Name"
              value={formValues.name}
              onChange={handleFormChange('name')}
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
