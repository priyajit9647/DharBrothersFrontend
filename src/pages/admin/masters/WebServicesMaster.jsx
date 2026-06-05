import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

import MasterList from 'sections/admin/masters/MasterList';
import useAccess from 'hooks/useAccess';
import IconButton from '@mui/material/IconButton';
import {
  createWebService,
  editWebService,
  getAdminWebServices,
  toggleWebServiceActive,
  deleteWebService,
  reorderWebServices
} from 'api/webServices';
import { EditTwoTone, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';

// ==============================|| MASTER - WEB SERVICES ||============================== //

export default function WebServicesMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ title: '', shortDescription: '', displayOrder: 0, imageFile: null, imagePreview: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const loadServices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminWebServices();
      const normalized = Array.isArray(data)
        ? data
            .map((item, index) => ({
              id: item.id ?? item.serviceId ?? index + 1,
              title: item.title || item.name || 'Untitled',
              shortDescription: item.shortDescription || item.description || '',
              image: item.image || item.design || null,
              displayOrder: item.displayOrder ?? item.order ?? index,
              active: item.active === undefined ? true : !!item.active
            }))
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        : [];

      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const { hasAccess } = useAccess();
  const canCreate = hasAccess('WEB_SERVICES_CREATE') || hasAccess('WEB_SERVICES_MGMT');
  const canEdit = hasAccess('WEB_SERVICES_EDIT') || hasAccess('WEB_SERVICES_MGMT');
  const canToggle = hasAccess('WEB_SERVICES_TOGGLE_ACTIVE') || hasAccess('WEB_SERVICES_MGMT');
  const canDelete = hasAccess('WEB_SERVICES_DELETE') || hasAccess('WEB_SERVICES_MGMT');

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ title: '', shortDescription: '', displayOrder: rows.length ? rows[rows.length - 1].displayOrder + 1 : 0, imageFile: null, imagePreview: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({ title: row.title || '', shortDescription: row.shortDescription || '', displayOrder: row.displayOrder ?? 0, imageFile: null, imagePreview: row.image ? (String(row.image).startsWith('data:') ? row.image : `data:image/*;base64,${row.image}`) : '' });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target ? event.target.value : event;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setFormValues((prev) => ({ ...prev, imageFile: file || null, imagePreview: file ? URL.createObjectURL(file) : prev.imagePreview }));
  };

  const handleSave = async () => {
    const title = formValues.title.trim();
    const shortDescription = formValues.shortDescription.trim();
    const displayOrder = Number(formValues.displayOrder) || 0;

    if (!title) {
      setError('Title is required');
      return;
    }

    if (!editingRow && !formValues.imageFile) {
      setError('Image is required for new service');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editWebService(editingRow.id, {
          title,
          shortDescription,
          displayOrder,
          imageFile: formValues.imageFile || undefined
        });
      } else {
        await createWebService({ title, shortDescription, displayOrder, imageFile: formValues.imageFile || undefined });
      }

      await loadServices();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));
    try {
      await toggleWebServiceActive(row.id, active);
    } catch (e) {
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(e.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!editingRow || !editingRow.id) return;
    if (!window.confirm('Delete this service? This action cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteWebService(editingRow.id);
      await loadServices();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to delete service');
    } finally {
      setSaving(false);
    }
  };

  const openImagePreview = (base64) => {
    if (!base64) return;
    setPreviewImage(String(base64).startsWith('data:') ? base64 : `data:image/*;base64,${base64}`);
    setPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setPreviewOpen(false);
    setPreviewImage('');
  };

  const handleReorderMove = async (row, direction) => {
    // direction: -1 for up, +1 for down
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx === -1) return;
    const newIndex = idx + direction;
    if (newIndex < 0 || newIndex >= rows.length) return;

    const before = [...rows];
    const reordered = [...rows];
    // swap
    const temp = reordered[newIndex];
    reordered[newIndex] = { ...reordered[idx] };
    reordered[idx] = { ...temp };

    // normalize displayOrder
    const payload = reordered.map((r, i) => ({ id: r.id, displayOrder: i }));

    // optimistic update
    setRows(reordered.map((r, i) => ({ ...r, displayOrder: i })));

    try {
      await reorderWebServices(payload);
    } catch (e) {
      // revert
      setRows(before);
      setError(e.message || 'Failed to reorder services');
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
            title="Web Services"
            description="Manage the services shown on the public 'What We Do' page. Add images, titles, short descriptions and control display order."
            showActionsColumn={false}
            columns={[
              { id: 'title', label: 'Title' },
              { id: 'shortDescription', label: 'Short Description', render: (row) => <Typography sx={{ maxWidth: 300 }}>{row.shortDescription}</Typography> },
              {
                id: 'image',
                label: 'Image',
                render: (row) =>
                  row.image ? (
                    <Box
                      component="img"
                      src={String(row.image).startsWith('http') || String(row.image).startsWith('data:') ? row.image : `data:image/*;base64,${row.image}`}
                      alt={row.title}
                      sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 0.5, border: '1px solid rgba(0,0,0,0.12)', cursor: 'zoom-in' }}
                      onClick={() => openImagePreview(row.image)}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">No image</Typography>
                  )
              },
              { id: 'displayOrder', label: 'Order' },
              {
                id: 'actions',
                label: 'Actions',
                render: (row) => {
                  const idx = rows.findIndex((r) => r.id === row.id);
                  return (
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {canEdit && (
                        <IconButton size="small" color="primary" onClick={() => openEditDialog(row)} aria-label="Edit">
                          <EditTwoTone style={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                      {canEdit && (
                        <IconButton size="small" onClick={() => handleReorderMove(row, -1)} disabled={idx <= 0} aria-label="Move up">
                          <ArrowUpOutlined style={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                      {canEdit && (
                        <IconButton size="small" onClick={() => handleReorderMove(row, 1)} disabled={idx === -1 || idx >= rows.length - 1} aria-label="Move down">
                          <ArrowDownOutlined style={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton size="small" color="error" onClick={() => { setEditingRow(row); setDialogOpen(true); }} aria-label="Delete">
                          <DeleteOutlined style={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Stack>
                  );
                }
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
            onToggleActive={handleToggleActive}
            showCreateButton={canCreate}
            showActiveColumn={canToggle}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Service' : 'Create Service'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField label="Title" value={formValues.title} onChange={handleFormChange('title')} fullWidth />
            <TextField label="Short Description" value={formValues.shortDescription} onChange={handleFormChange('shortDescription')} fullWidth multiline rows={3} />
            <TextField label="Display Order" value={formValues.displayOrder} onChange={handleFormChange('displayOrder')} fullWidth type="number" />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Image</Typography>
              <Button variant="outlined" component="label" size="small">
                {formValues.imageFile ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              {formValues.imagePreview && (
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Preview</Typography>
                  <Box component="img" src={formValues.imagePreview} alt="Preview" sx={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 0.5, border: '1px solid rgba(0,0,0,0.12)' }} />
                </Box>
              )}
            </Box>
            {error && (
              <Typography variant="body2" color="error">{error}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          {editingRow && (
            <Button onClick={handleDelete} color="error" disabled={saving}>
              Delete
            </Button>
          )}
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog fullScreen open={previewOpen} onClose={closeImagePreview} sx={{ bgcolor: 'rgba(0,0,0,0.9)' }}>
        <Box sx={{ position: 'fixed', top: 16, right: 24, zIndex: 1301, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="secondary" size="small" onClick={closeImagePreview}>Close</Button>
        </Box>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'black' }}>
          {previewImage && (
            <Box component="img" src={previewImage} alt="Preview full" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: 24 }} />
          )}
        </Box>
      </Dialog>
    </>
  );
}
