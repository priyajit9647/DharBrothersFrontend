import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';

import MasterList from 'sections/admin/masters/MasterList';
import {
  fetchWhatsappNotificationTemplates,
  createWhatsappNotificationTemplate,
  editWhatsappNotificationTemplate,
  toggleWhatsappNotificationTemplate,
  fetchWhatsappNotificationHistory
} from 'api/whatsapp';

// ==============================|| BMS - WHATSAPP NOTIFICATION TEMPLATES ||============================== //

export default function NotificationWhatsapp() {
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateError, setTemplateError] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(0);
  const [templateRowsPerPage, setTemplateRowsPerPage] = useState(10);
  const [templateForm, setTemplateForm] = useState({
    event: 'ORDER_PLACED',
    subjectTemplate: '',
    bodyTemplate: '',
    active: true
  });

  const [notificationHistory, setNotificationHistory] = useState([]);
  const [notificationHistoryLoading, setNotificationHistoryLoading] = useState(false);
  const [notificationHistoryError, setNotificationHistoryError] = useState('');
  const [notificationHistoryPage, setNotificationHistoryPage] = useState(0);
  const [notificationHistoryRowsPerPage, setNotificationHistoryRowsPerPage] = useState(10);

  const templateEvents = ['ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'ORDER_DELIVERED'];

  const loadTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      setTemplateError('');

      const data = await fetchWhatsappNotificationTemplates();
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setTemplates(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load WhatsApp notification templates', err);
      setTemplateError(err?.message || 'Failed to load WhatsApp notification templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const loadNotificationHistory = useCallback(async () => {
    try {
      setNotificationHistoryLoading(true);
      setNotificationHistoryError('');

      const data = await fetchWhatsappNotificationHistory();
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setNotificationHistory(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load WhatsApp notification history', err);
      setNotificationHistoryError(err?.message || 'Failed to load WhatsApp notification history');
    } finally {
      setNotificationHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    loadNotificationHistory();
  }, [loadTemplates, loadNotificationHistory]);

  const handleTemplateFieldChange = (field) => (event) => {
    const value = event.target.value;
    setTemplateForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditTemplate = (template) => {
    setEditingTemplateId(template.id || template._id || null);
    setTemplateForm({
      event: template.event || 'ORDER_PLACED',
      subjectTemplate: template.subjectTemplate || '',
      bodyTemplate: template.bodyTemplate || '',
      active: typeof template.active === 'boolean' ? template.active : true
    });
    setTemplateError('');
    setTemplateDialogOpen(true);
  };

  const handleResetTemplateForm = () => {
    setEditingTemplateId(null);
    setTemplateForm({
      event: 'ORDER_PLACED',
      subjectTemplate: '',
      bodyTemplate: '',
      active: true
    });
    setTemplateError('');
  };

  const openCreateTemplateDialog = () => {
    handleResetTemplateForm();
    setTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    if (templateSaving) return;
    setTemplateDialogOpen(false);
  };

  const handleTemplateSubmit = async () => {
    if (!templateForm.event) {
      setTemplateError('Event is required');
      return;
    }

    try {
      setTemplateSaving(true);
      setTemplateError('');

      if (editingTemplateId) {
        await editWhatsappNotificationTemplate(editingTemplateId, templateForm);
      } else {
        await createWhatsappNotificationTemplate(templateForm);
      }

      handleResetTemplateForm();
      setTemplateDialogOpen(false);
      await loadTemplates();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save WhatsApp notification template', err);
      setTemplateError(err?.message || 'Failed to save WhatsApp notification template');
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleToggleTemplate = async (template) => {
    const templateId = template.id || template._id;

    if (!templateId) {
      setTemplateError('Template id is missing');
      return;
    }

    try {
      setTemplateError('');
      await toggleWhatsappNotificationTemplate(templateId, !template.active);
      await loadTemplates();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update WhatsApp notification template status', err);
      setTemplateError(err?.message || 'Failed to update WhatsApp notification template status');
    }
  };

  const pagedTemplateRows = useMemo(() => {
    const start = templatePage * templateRowsPerPage;
    const end = start + templateRowsPerPage;
    return templates.slice(start, end);
  }, [templatePage, templateRowsPerPage, templates]);

  const pagedNotificationHistoryRows = useMemo(() => {
    const start = notificationHistoryPage * notificationHistoryRowsPerPage;
    const end = start + notificationHistoryRowsPerPage;
    return notificationHistory.slice(start, end);
  }, [notificationHistoryPage, notificationHistoryRowsPerPage, notificationHistory]);

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
          {templateError && !templateDialogOpen && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {templateError}
            </Typography>
          )}
          <MasterList
            title="WhatsApp Notification Templates"
            description="Configure WhatsApp notification subjects, message bodies and activation status for order events."
            columns={[
              { id: 'event', label: 'Event' },
              { id: 'subjectTemplate', label: 'Subject Template' },
              { id: 'bodyTemplate', label: 'Body Template' }
            ]}
            rows={pagedTemplateRows}
            page={templatePage}
            rowsPerPage={templateRowsPerPage}
            totalCount={templates.length}
            onPageChange={setTemplatePage}
            onRowsPerPageChange={(value) => {
              setTemplateRowsPerPage(value);
              setTemplatePage(0);
            }}
            onCreate={openCreateTemplateDialog}
            onEdit={handleEditTemplate}
            onToggleActive={handleToggleTemplate}
            loading={templatesLoading}
          />
        </Grid>
      </Grid>

      <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTemplateId ? 'Edit WhatsApp Notification Template' : 'Create WhatsApp Notification Template'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField select label="Event" value={templateForm.event} onChange={handleTemplateFieldChange('event')} fullWidth>
              {templateEvents.map((eventName) => (
                <MenuItem key={eventName} value={eventName}>
                  {eventName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Subject Template"
              value={templateForm.subjectTemplate}
              onChange={handleTemplateFieldChange('subjectTemplate')}
              fullWidth
            />
            <TextField
              label="Body Template"
              value={templateForm.bodyTemplate}
              onChange={handleTemplateFieldChange('bodyTemplate')}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              select
              label="Status"
              value={templateForm.active ? 'active' : 'inactive'}
              onChange={(event) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  active: event.target.value === 'active'
                }))
              }
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            {templateError ? (
              <Typography variant="body2" color="error">
                {templateError}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog} disabled={templateSaving}>
            Cancel
          </Button>
          <Button onClick={handleTemplateSubmit} variant="contained" disabled={templateSaving}>
            {templateSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
