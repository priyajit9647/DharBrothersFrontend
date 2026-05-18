import { useMemo, useState, useEffect } from 'react';

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

import MainCard from 'components/MainCard';
import MasterList from 'sections/admin/masters/MasterList';
import { createTemplateNotification, getTemplateNotificationList, getTemplateNotificationById, editTemplateNotification } from 'api/admin/template/notification';
import { getProcessStages } from 'api/processStage';
import { getRoles } from 'api/role';

// ==============================|| ADMIN - TEMPLATE PAGE ||============================== //

export default function Template() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [processStages, setProcessStages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState({
    processStageId: '',
    emailSubject: '',
    emailBody: '',
    whatsappTemplateCode: '',
    whatsappBody: '',
    inAppBody: '',
    isActive: true,
    dynamicData: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Removed automatic calls to master branch/process-stage list APIs to avoid backend hits from this page.
  // If you want pre-filled branch or stage options, provide them here or via a different admin page.

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTemplateNotificationList();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        const normalized = list.map((item) => ({
          id: item.id,
          branchId: item.branchId,
          branchName: item.branchId ? String(item.branchId) : '',
          processStageId: item.processStageId,
          processStageName: item.processStageName,
          emailSubject: item.emailSubject,
          emailBody: item.emailBody,
          whatsappTemplateCode: item.whatsappTemplateCode,
          whatsappBody: item.whatsappBody,
          inAppBody: item.inAppBody,
          isActive: item.isActive,
          roleName: item.roleName ?? item.role?.name ?? '',
          roleId: item.roleId ?? item.role?.id ?? null,
          default: item.default
        }));
        setRows(normalized);
      } catch (e) {
        // keep existing rows and show error in UI via state
        setError(e?.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormValues({
      processStageId: '',
      emailSubject: '',
      emailBody: '',
      whatsappTemplateCode: '',
      whatsappBody: '',
      inAppBody: '',
      isActive: true,
      dynamicData: ''
    });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = async (row) => {
    if (!row?.id) return;
    setError('');
    try {
      setLoading(true);
      const full = await getTemplateNotificationById(row.id);
      const fv = {
        processStageId: (full.processStageId ?? full.processStage) || '',
        emailSubject: full.emailSubject ?? '',
        emailBody: full.emailBody ?? '',
        whatsappTemplateCode: full.whatsappTemplateCode ?? '',
        whatsappBody: full.whatsappBody ?? '',
        inAppBody: full.inAppBody ?? '',
        isActive: typeof full.isActive === 'boolean' ? full.isActive : true,
        dynamicData: full.dynamicData ?? '',
        roleId: full.roleId ?? full.role?.id ?? full.roleId ?? ''
      };
      setFormValues(fv);
      setEditingId(row.id);
      setDialogOpen(true);
    } catch (e) {
      setError(e?.message || 'Failed to load template for edit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getProcessStages();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setProcessStages(list);
      } catch (e) {
        // ignore — dropdown will be empty
      }
    };
    load();
    // load roles
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const data = await getRoles();
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

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (field) => (event) => {
    const value = field === 'isActive' ? event.target.checked : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = {
      processStageId: Number(formValues.processStageId),
      emailSubject: formValues.emailSubject.trim(),
      emailBody: formValues.emailBody.trim(),
      whatsappTemplateCode: formValues.whatsappTemplateCode.trim(),
      whatsappBody: formValues.whatsappBody.trim(),
      inAppBody: formValues.inAppBody.trim(),
      isActive: Boolean(formValues.isActive),
      dynamicData: formValues.dynamicData ? String(formValues.dynamicData) : '',
      roleId: formValues.roleId ? Number(formValues.roleId) : undefined
    };

    if (!payload.processStageId || !payload.emailSubject || !payload.emailBody) {
      setError('ProcessStage, email subject and email body are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingId) {
        await editTemplateNotification(editingId, payload);
      } else {
        await createTemplateNotification(payload);
      }

      // reload list to reflect changes
      const data = await getTemplateNotificationList();
      const list = Array.isArray(data) ? data : data?.items || data?.data || [];
      const normalized = list.map((item) => ({
        id: item.id,
        branchId: item.branchId,
        branchName: item.branchId ? String(item.branchId) : '',
        processStageId: item.processStageId,
        processStageName: item.processStageName,
        emailSubject: item.emailSubject,
        emailBody: item.emailBody,
        whatsappTemplateCode: item.whatsappTemplateCode,
        whatsappBody: item.whatsappBody,
        inAppBody: item.inAppBody,
        isActive: item.isActive,
        roleName: item.roleName ?? item.role?.name ?? '',
        roleId: item.roleId ?? item.role?.id ?? null,
        default: item.default
      }));
      setRows(normalized);
      setDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err?.message || 'Failed to create notification template');
    } finally {
      setSaving(false);
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
            title="Notification Templates"
            description="Create and manage notification templates for branches and process stages."
            columns={[
              { id: 'branchName', label: 'Branch' },
              { id: 'processStageName', label: 'Process Stage' },
              { id: 'roleName', label: 'Role' },
              {
                id: 'email',
                label: 'Email (Subject + Body)',
                sx: { whiteSpace: 'normal', maxWidth: 480 },
                render: (r) => (
                  <div>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{r.emailSubject}</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'text.secondary' }}>{r.emailBody}</Typography>
                  </div>
                )
              },
              {
                id: 'whatsapp',
                label: 'WhatsApp (Template + Body)',
                sx: { whiteSpace: 'normal', maxWidth: 420 },
                render: (r) => (
                  <div>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{r.whatsappTemplateCode}</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'text.secondary' }}>{r.whatsappBody}</Typography>
                  </div>
                )
              },
              {
                id: 'inApp',
                label: 'In-App Notification',
                sx: { whiteSpace: 'normal', maxWidth: 420 },
                render: (r) => (
                  <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'text.secondary' }}>{r.inAppBody}</Typography>
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
            onEdit={(row) => openEditDialog(row)}
            showActiveColumn={false}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Notification Template' : 'Create Notification Template'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Select
              value={formValues.processStageId}
              onChange={handleFormChange('processStageId')}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Select Process Stage</MenuItem>
              {processStages.map((ps) => (
                <MenuItem key={ps.id} value={ps.id}>{ps.stageName || ps.code || ps.id}</MenuItem>
              ))}
            </Select>

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

            <TextField
              label="Email Subject"
              value={formValues.emailSubject}
              onChange={handleFormChange('emailSubject')}
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
              label="WhatsApp Template Code"
              value={formValues.whatsappTemplateCode}
              onChange={handleFormChange('whatsappTemplateCode')}
              fullWidth
            />
            <TextField
              label="WhatsApp Body"
              value={formValues.whatsappBody}
              onChange={handleFormChange('whatsappBody')}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="In-App Body"
              value={formValues.inAppBody}
              onChange={handleFormChange('inAppBody')}
              fullWidth
              multiline
              minRows={3}
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
            {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
