import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import MasterList from 'sections/admin/masters/MasterList';
import {
  getEmailTemplates,
  createEmailTemplate,
  editEmailTemplate,
  deleteEmailTemplate,
  toggleEmailTemplateActive
} from 'api/template';

// ==============================|| EMAIL TEMPLATE ||============================== //

export default function EmailTemplate() {
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
    subject: '',
    emailBody: '',
    recipients: '',
    isActive: true
  });

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmailTemplates();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            templateName: item.templateName,
            subject: item.subject,
            emailBody: item.emailBody,
            recipients: item.recipients,
            active: item.isActive || item.active
          }))
        : [];
      setRows(normalized);
    } catch (err) {
      setError(err?.message || 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({
      templateName: '',
      subject: '',
      emailBody: '',
      recipients: '',
      isActive: true
    });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      templateName: row.templateName || '',
      subject: row.subject || '',
      emailBody: row.emailBody || '',
      recipients: row.recipients || '',
      isActive: row.active ?? true
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
    const { templateName, subject, emailBody, recipients, isActive } = formValues;

    if (!templateName.trim() || !subject.trim() || !emailBody.trim()) {
      setError('Template Name, Subject and Email Body are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editEmailTemplate(editingRow.id, {
          templateName: templateName.trim(),
          subject: subject.trim(),
          emailBody: emailBody.trim(),
          recipients: recipients.trim(),
          isActive
        });
      } else {
        await createEmailTemplate({
          templateName: templateName.trim(),
          subject: subject.trim(),
          emailBody: emailBody.trim(),
          recipients: recipients.trim(),
          isActive
        });
      }

      await loadTemplates();
      setDialogOpen(false);
    } catch (err) {
      setError(err?.message || 'Failed to save email template');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleEmailTemplateActive(row.id, active);
    } catch (err) {
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(err?.message || 'Failed to update active status');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete template "${row.templateName}"?`)) return;

    try {
      await deleteEmailTemplate(row.id);
      await loadTemplates();
    } catch (err) {
      setError(err?.message || 'Failed to delete email template');
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
            title="Email Templates"
            description="Create and manage email notification templates."
            columns={[
              { id: 'templateName', label: 'Template Name' },
              { id: 'subject', label: 'Subject' },
              { id: 'recipients', label: 'Recipients' }
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
        <DialogTitle>{editingRow ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Template Name"
              value={formValues.templateName}
              onChange={handleFormChange('templateName')}
              fullWidth
            />
            <TextField
              label="Subject"
              value={formValues.subject}
              onChange={handleFormChange('subject')}
              fullWidth
            />
            <TextField
              label="Email Body"
              value={formValues.emailBody}
              onChange={handleFormChange('emailBody')}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Recipients"
              value={formValues.recipients}
              onChange={handleFormChange('recipients')}
              fullWidth
              placeholder="comma-separated emails"
            />
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
