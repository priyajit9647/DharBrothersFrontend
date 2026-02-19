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
import MenuItem from '@mui/material/MenuItem';

import MasterList from 'sections/admin/masters/MasterList';
import { createBindingRate, editBindingRate, getBindingRates, toggleBindingRateActive } from 'api/bindingRate';

// ==============================|| MASTER - BINDING RATE ||============================== //

const BINDING_TYPE_OPTIONS = [
  { value: 'HARD', label: 'Hard Binding' },
  { value: 'SOFT', label: 'Soft Binding' },
  { value: 'SYN', label: 'Synopsis' }
];

export default function BindingRateMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ bindingType: 'HARD', minCopies: '', maxCopies: '', ratePerCopy: '', active: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBindingRates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBindingRates();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            bindingType: item.bindingType,
            minCopies: item.minCopies,
            maxCopies: item.maxCopies,
            ratePerCopy: item.ratePerCopy,
            active: item.active
          }))
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load binding rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBindingRates();
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ bindingType: 'HARD', minCopies: '', maxCopies: '', ratePerCopy: '', active: true });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      bindingType: row.bindingType || 'HARD',
      minCopies: row.minCopies ?? '',
      maxCopies: row.maxCopies ?? '',
      ratePerCopy: row.ratePerCopy ?? '',
      active: row.active ?? true
    });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAndNormalize = () => {
    const bindingType = formValues.bindingType || 'HARD';
    const minRaw = String(formValues.minCopies).trim();
    const maxRaw = String(formValues.maxCopies).trim();
    const rateRaw = String(formValues.ratePerCopy).trim();

    const minCopies = minRaw ? Number(minRaw) : null;
    const maxCopies = maxRaw ? Number(maxRaw) : null;
    const ratePerCopy = rateRaw ? Number(rateRaw) : null;

    if (!bindingType) {
      return { error: 'Binding Type is required' };
    }

    if (minCopies == null || Number.isNaN(minCopies) || minCopies <= 0) {
      return { error: 'Min copies must be a number greater than 0' };
    }

    if (maxRaw && (maxCopies == null || Number.isNaN(maxCopies) || maxCopies <= minCopies)) {
      return { error: 'Max copies must be a number greater than Min copies or left blank' };
    }

    if (ratePerCopy == null || Number.isNaN(ratePerCopy) || ratePerCopy <= 0) {
      return { error: 'Rate per copy must be a number greater than 0' };
    }

    return {
      values: {
        bindingType,
        minCopies,
        maxCopies: maxRaw ? maxCopies : null,
        ratePerCopy,
        active: formValues.active
      }
    };
  };

  const handleSave = async () => {
    const { error: validationError, values } = validateAndNormalize();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editBindingRate(editingRow.id, values);
      } else {
        await createBindingRate(values);
      }

      await loadBindingRates();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save binding rate');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleBindingRateActive(row.id, active);
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
            title="Binding Rates"
            description="Maintain rate cards for different binding types and cover materials."
            columns={[
              {
                id: 'bindingType',
                label: 'Binding Type'
              },
              {
                id: 'minCopies',
                label: 'Min Copies'
              },
              {
                id: 'maxCopies',
                label: 'Max Copies',
                render: (row) => (row.maxCopies != null ? row.maxCopies : 'No upper limit')
              },
              {
                id: 'ratePerCopy',
                label: 'Rate / Copy',
                render: (row) => (row.ratePerCopy != null ? row.ratePerCopy.toFixed(2) : '-')
              }
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
        <DialogTitle>{editingRow ? 'Edit Binding Rate' : 'Create Binding Rate'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              select
              label="Binding Type"
              value={formValues.bindingType}
              onChange={handleFormChange('bindingType')}
              fullWidth
            >
              {BINDING_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Min Copies"
              type="number"
              value={formValues.minCopies}
              onChange={handleFormChange('minCopies')}
              fullWidth
              helperText="Must be greater than 0"
            />
            <TextField
              label="Max Copies (optional)"
              type="number"
              value={formValues.maxCopies}
              onChange={handleFormChange('maxCopies')}
              fullWidth
              helperText="Leave blank for no upper limit. If provided, must be greater than Min Copies."
            />
            <TextField
              label="Rate per Copy"
              type="number"
              value={formValues.ratePerCopy}
              onChange={handleFormChange('ratePerCopy')}
              fullWidth
              helperText="Must be greater than 0"
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
