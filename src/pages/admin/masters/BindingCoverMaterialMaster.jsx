import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MasterList from 'sections/admin/masters/MasterList';
import { createBindingCoverMaterial, editBindingCoverMaterial, getBindingCoverMaterials, toggleBindingCoverMaterialActive } from 'api/bindingCoverMaterial';

// ==============================|| MASTER - BINDING COVER MATERIAL ||============================== //

const BINDING_TYPE_OPTIONS = [
  { value: 'HARD', label: 'Hard Binding' },
  { value: 'SOFT', label: 'Soft Binding' },
  { value: 'SYN', label: 'Synopsis' }
];

export default function BindingCoverMaterialMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ code: '', name: '', bindingType: 'HARD', designFile: null, designPreview: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const loadBindingCoverMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBindingCoverMaterials();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            code: item.code,
            name: item.name,
            bindingType: item.bindingType,
            active: item.active,
            design: item.design
          }))
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load binding cover materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBindingCoverMaterials();
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ code: '', name: '', bindingType: 'HARD', designFile: null, designPreview: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      code: row.code || '',
      name: row.name || '',
      bindingType: row.bindingType || 'HARD',
      designFile: null,
      designPreview: row.design ? `data:image/*;base64,${row.design}` : ''
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

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setFormValues((prev) => ({
      ...prev,
      designFile: file || null,
      designPreview: file ? URL.createObjectURL(file) : prev.designPreview
    }));
  };

  const handleSave = async () => {
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    const bindingType = formValues.bindingType || 'HARD';

    if (!code || !name || !bindingType) {
      setError('Code, Name and Binding Type are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editBindingCoverMaterial(editingRow.id, {
          code,
          name,
          bindingType,
          designFile: formValues.designFile || undefined
        });
      } else {
        await createBindingCoverMaterial({
          code,
          name,
          bindingType,
          designFile: formValues.designFile || undefined
        });
      }

      await loadBindingCoverMaterials();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save binding cover material');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleBindingCoverMaterialActive(row.id, active);
    } catch (e) {
      // Revert on failure and show error
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(e.message || 'Failed to update active status');
    }
  };

  const openImagePreview = (base64) => {
    if (!base64) return;
    setPreviewImage(`data:image/*;base64,${base64}`);
    setPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setPreviewOpen(false);
    setPreviewImage('');
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
            title="Binding Cover Materials"
            description="Manage cover materials and reference designs for different binding types."
            columns={[
              { id: 'name', label: 'Name' },
              { id: 'code', label: 'Code' },
              { id: 'bindingType', label: 'Binding Type' },
              {
                id: 'design',
                label: 'Design',
                render: (row) =>
                  row.design ? (
                    <Box
                      component="img"
                      src={`data:image/*;base64,${row.design}`}
                      alt={row.name}
                      sx={{
                        // Thumbnail in ~831x1125 (portrait) ratio
                        width: 60,
                        height: 81,
                        objectFit: 'cover',
                        borderRadius: 0.5,
                        border: '1px solid rgba(0,0,0,0.12)',
                        cursor: 'zoom-in',
                        transition: 'transform 0.15s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => openImagePreview(row.design)}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No image
                    </Typography>
                  )
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
        <DialogTitle>{editingRow ? 'Edit Binding Cover Material' : 'Create Binding Cover Material'}</DialogTitle>
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
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Design Image
              </Typography>
              <Button variant="outlined" component="label" size="small">
                {formValues.designFile ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              {formValues.designPreview && (
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Preview
                  </Typography>
                  <Box
                    component="img"
                    src={formValues.designPreview}
                    alt="Design preview"
                    sx={{
                      // Dialog preview in ~831x1125 (portrait) ratio
                      width: 150,
                      height: 203,
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      border: '1px solid rgba(0,0,0,0.12)'
                    }}
                  />
                </Box>
              )}
            </Box>
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

      <Dialog fullScreen open={previewOpen} onClose={closeImagePreview} sx={{ bgcolor: 'rgba(0,0,0,0.9)' }}>
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 24,
            zIndex: 1301,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button variant="contained" color="secondary" size="small" onClick={closeImagePreview}>
            Close
          </Button>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'black'
          }}
        >
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Design full preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                boxShadow: 24
              }}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
}
