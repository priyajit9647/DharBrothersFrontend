import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import MasterList from 'sections/admin/masters/MasterList';
import {
  getInAppTemplates,
  createInAppTemplate,
  editInAppTemplate,
  deleteInAppTemplate,
  toggleInAppTemplateActive
} from 'api/template';
import { getRoles } from 'api/role';

// ==============================|| IN-APP TEMPLATE ||============================== //

export default function InAppTemplate() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formValues, setFormValues] = useState({
    templateName: '',
    title: '',
    content: '',
    actionUrl: '',
    isActive: true
  });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInAppTemplates();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            templateName: item.templateName,
            title: item.title,
            content: item.content,
            actionUrl: item.actionUrl,
            active: item.isActive || item.active,
            roleName: item.roleName ?? item.role?.name ?? '',
            roleId: item.roleId ?? item.role?.id ?? null
          }))
        : [];
      setRows(normalized);
    } catch (err) {
      setError(err?.message || 'Failed to load In-App templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    let mounted = true;
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const data = await getRoles();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setRoles(list);
      } catch (e) {
        // ignore
      } finally {
        setLoadingRoles(false);
      }
    };
    loadRoles();
    return () => { mounted = false; };
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({
      templateName: '',
      title: '',
      content: '',
      actionUrl: '',
      isActive: true,
      roleId: ''
    });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      templateName: row.templateName || '',
      title: row.title || '',
      content: row.content || '',
      actionUrl: row.actionUrl || '',
      isActive: row.active ?? true,
      roleId: row.roleId ?? ''
    });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = field === 'isActive' ? event.target.checked : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const { templateName, title, content, actionUrl, isActive } = formValues;

    if (!templateName.trim() || !title.trim() || !content.trim()) {
      setError('Template Name, Title and Content are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editInAppTemplate(editingRow.id, {
          templateName: templateName.trim(),
          title: title.trim(),
          content: content.trim(),
          actionUrl: actionUrl.trim(),
          isActive,
          roleId: formValues.roleId ? Number(formValues.roleId) : undefined
        });
      } else {
        await createInAppTemplate({
          templateName: templateName.trim(),
          title: title.trim(),
          content: content.trim(),
          actionUrl: actionUrl.trim(),
          isActive,
          roleId: formValues.roleId ? Number(formValues.roleId) : undefined
        });
      }

      await loadTemplates();
      setDialogOpen(false);
    } catch (err) {
      setError(err?.message || 'Failed to save In-App template');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleInAppTemplateActive(row.id, active);
    } catch (err) {
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(err?.message || 'Failed to update active status');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete template "${row.templateName}"?`)) return;

    try {
      await deleteInAppTemplate(row.id);
      await loadTemplates();
    } catch (err) {
      setError(err?.message || 'Failed to delete In-App template');
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
            title="In-App Templates"
            description="Create and manage In-App notification templates."
            columns={[
              { id: 'templateName', label: 'Template Name' },
              { id: 'title', label: 'Title' },
                { id: 'content', label: 'Content' },
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
            onDelete={handleDelete}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingRow ? 'Edit In-App Template' : 'Create In-App Template'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Template Name"
              value={formValues.templateName}
              onChange={handleFormChange('templateName')}
              fullWidth
            />
            <TextField
              label="Title"
              value={formValues.title}
              onChange={handleFormChange('title')}
              fullWidth
            />
            <TextField
              label="Content"
              value={formValues.content}
              onChange={handleFormChange('content')}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Action URL"
              value={formValues.actionUrl}
              onChange={handleFormChange('actionUrl')}
              fullWidth
              placeholder="optional action URL"
            />
            <Select
              value={formValues.roleId ?? ''}
              onChange={handleFormChange('roleId')}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Select Role</MenuItem>
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.isActive}
                  onChange={handleFormChange('isActive')}
                  color="primary"
                />
              }
              label="Active"
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
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
