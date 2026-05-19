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
import { createProcessStage, editProcessStage, getProcessStages, toggleProcessStageActive } from 'api/processStage';

// ==============================|| MASTER - PROCESS STAGE ||============================== //

export default function ProcessStageMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ code: '', stageName: '', sequenceNo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProcessStages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProcessStages();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => {
            const code = item.code || '';
            const protectedCodes = [];
            const isProtected = protectedCodes.includes(code);
            return {
              id: item.id ?? index + 1,
              code,
              stageName: item.stageName,
              sequenceNo: item.sequenceNo,
              active: item.active,
              // flags used by MasterList to disable edit/toggle UI
              disableEdit: isProtected,
              disableToggle: isProtected
            };
          })
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load process stages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcessStages();
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ code: '', stageName: '', sequenceNo: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    if (row?.disableEdit) return; // protected rows are not editable
    setEditingRow(row);
    setFormValues({
      code: row.code || '',
      stageName: row.stageName || '',
      sequenceNo: row.sequenceNo ?? ''
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
      [field]: field === 'code' ? value.toUpperCase() : value
    }));
  };

  const handleSave = async () => {
    const code = formValues.code.trim();
    const stageName = formValues.stageName.trim();
    const sequenceNoRaw = String(formValues.sequenceNo).trim();
    const sequenceNo = sequenceNoRaw ? Number(sequenceNoRaw) : null;

    if (!code || !stageName || sequenceNo == null || Number.isNaN(sequenceNo)) {
      setError('Code, Stage Name and a valid Sequence No are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editProcessStage(editingRow.id, { code, stageName, sequenceNo });
      } else {
        await createProcessStage({ code, stageName, sequenceNo });
      }

      await loadProcessStages();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save process stage');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    if (row?.disableToggle) return; // protected rows cannot be toggled
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleProcessStageActive(row.id, active);
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
            title="Process Stages"
            description="Define and maintain stages in the production workflow (e.g. Cutting, Binding, Packing)."
            columns={[
              { id: 'stageName', label: 'Stage Name' },
              { id: 'code', label: 'Code' },
              { id: 'sequenceNo', label: 'Sequence No' }
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
        <DialogTitle>{editingRow ? 'Edit Process Stage' : 'Create Process Stage'}</DialogTitle>
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
              label="Stage Name"
              value={formValues.stageName}
              onChange={handleFormChange('stageName')}
              fullWidth
            />
            <TextField
              label="Sequence No"
              type="number"
              value={formValues.sequenceNo}
              onChange={handleFormChange('sequenceNo')}
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
