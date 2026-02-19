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
import { createOtherCharge, editOtherCharge, getOtherCharges, toggleOtherChargeActive } from 'api/otherCharge';

// ==============================|| MASTER - OTHER CHARGE ||============================== //

export default function OtherChargeMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ code: '', quantityUnit: '', rate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadOtherCharges = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOtherCharges();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            code: item.code,
            quantityUnit: item.quantityUnit,
            rate: item.rate,
            active: item.active
          }))
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load other charges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOtherCharges();
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ code: '', quantityUnit: '', rate: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      code: row.code || '',
      quantityUnit: row.quantityUnit || '',
      rate: row.rate ?? ''
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

  const handleSave = async () => {
    const code = formValues.code.trim();
    const quantityUnit = formValues.quantityUnit.trim();
    const rateRaw = String(formValues.rate).trim();
    const rate = rateRaw ? Number(rateRaw) : null;

    if (!code) {
      setError('Code is required');
      return;
    }

    if (!quantityUnit) {
      setError('Quantity Unit is required');
      return;
    }

    if (rate == null || Number.isNaN(rate) || rate <= 0) {
      setError('Rate must be a number greater than 0');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      code,
      quantityUnit,
      rate,
      active: editingRow?.active ?? true
    };

    try {
      if (editingRow && editingRow.id) {
        await editOtherCharge(editingRow.id, payload);
      } else {
        await createOtherCharge(payload);
      }

      await loadOtherCharges();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save other charge');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleOtherChargeActive(row.id, active);
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
            title="Other Charges"
            description="Configure additional charges such as packing, urgent delivery, or customization."
            columns={[
              { id: 'code', label: 'Code' },
              { id: 'quantityUnit', label: 'Quantity Unit' },
              {
                id: 'rate',
                label: 'Rate',
                render: (row) => (row.rate != null ? row.rate.toFixed(2) : '-')
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Other Charge' : 'Create Other Charge'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Code"
              value={formValues.code}
              onChange={handleFormChange('code')}
              fullWidth
            />
            <TextField
              label="Quantity Unit"
              value={formValues.quantityUnit}
              onChange={handleFormChange('quantityUnit')}
              fullWidth
            />
            <TextField
              label="Rate"
              type="number"
              value={formValues.rate}
              onChange={handleFormChange('rate')}
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
