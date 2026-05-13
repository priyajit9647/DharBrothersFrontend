import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import MainCard from 'components/MainCard';
import MasterList from 'sections/admin/masters/MasterList';
import { getTemplateNotificationList, getTemplateNotificationById, editTemplateNotification, createTemplateNotification } from 'api/admin/template/notification';
import { getProcessStages } from 'api/processStage';

export default function TemplateNotifications() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getTemplateNotificationList();
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setRows(list);
      } catch (e) {
        setError(e?.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadStages = async () => {
      try {
        const data = await getProcessStages();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setProcessStages(list);
      } catch (e) {
        // ignore
      }
    };
    loadStages();
    return () => { mounted = false; };
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openDetail = async (row) => {
    setError('');
    try {
      const full = await getTemplateNotificationById(row.id);
      setSelected(full || row);
      setDetailOpen(true);
    } catch (e) {
      setError(e?.message || 'Failed to load template');
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    processStageId: '',
    emailSubject: '',
    emailBody: '',
    whatsappTemplateCode: '',
    whatsappBody: '',
    inAppBody: '',
    isActive: true,
    dynamicData: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [processStages, setProcessStages] = useState([]);

  const openEdit = async (row) => {
    setEditError('');
    try {
      const full = await getTemplateNotificationById(row.id);
      setEditData(full || row);
      setEditOpen(true);
    } catch (e) {
      setEditError(e?.message || 'Failed to load template for edit');
    }
  };

  const closeEdit = () => {
    setEditData(null);
    setEditOpen(false);
    setEditLoading(false);
    setEditError('');
  };

  const openCreate = () => {
    setCreateError('');
    setCreateData({
      processStageId: '',
      emailSubject: '',
      emailBody: '',
      whatsappTemplateCode: '',
      whatsappBody: '',
      inAppBody: '',
      isActive: true,
      dynamicData: ''
    });
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateLoading(false);
    setCreateError('');
  };

  const saveCreate = async () => {
    setCreateLoading(true);
    setCreateError('');
    try {
      const payload = {
        processStageId: Number(createData.processStageId),
        emailSubject: createData.emailSubject,
        emailBody: createData.emailBody,
        whatsappTemplateCode: createData.whatsappTemplateCode,
        whatsappBody: createData.whatsappBody,
        inAppBody: createData.inAppBody,
        isActive: !!createData.isActive,
        dynamicData: createData.dynamicData
      };
      await createTemplateNotification(payload);
      const data = await getTemplateNotificationList();
      const list = Array.isArray(data) ? data : data?.items || data?.data || [];
      setRows(list);
      closeCreate();
    } catch (e) {
      setCreateError(e?.message || 'Failed to create template');
    } finally {
      setCreateLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editData) return;
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        processStageId: editData.processStageId,
        emailSubject: editData.emailSubject,
        emailBody: editData.emailBody,
        whatsappTemplateCode: editData.whatsappTemplateCode,
        whatsappBody: editData.whatsappBody,
        inAppBody: editData.inAppBody,
        isActive: !!editData.isActive,
        dynamicData: editData.dynamicData
      };
      await editTemplateNotification(editData.id, payload);
      // refresh list
      const data = await getTemplateNotificationList();
      const list = Array.isArray(data) ? data : data?.items || data?.data || [];
      setRows(list);
      closeEdit();
    } catch (e) {
      setEditError(e?.message || 'Failed to save template');
    } finally {
      setEditLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetailOpen(false);
  };

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          <MainCard title="Template Notifications" sx={{ width: '100%' }} contentSX={{ p: 0 }}>
            <MasterList
              title="Template Notifications"
              description="List of notification templates"
              columns={[
                { id: 'id', label: 'ID' },
                { id: 'branchId', label: 'Branch ID' },
                { id: 'processStageId', label: 'Process Stage ID' },
                { id: 'processStageName', label: 'Process Stage' },
                { id: 'emailSubject', label: 'Email Subject' },
                { id: 'whatsappTemplateCode', label: 'WhatsApp Template' },
                { id: 'isActive', label: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
                { id: 'default', label: 'Default', render: (r) => (r.default ? 'Yes' : 'No') },
                { id: 'actions', label: 'Actions', render: (r) => (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => openDetail(r)}>View</Button>
                    <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
                  </Stack>
                ) }
              ]}
              rows={pagedRows}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={rows.length}
              onPageChange={setPage}
              onRowsPerPageChange={(v) => {
                setRowsPerPage(v);
                setPage(0);
              }}
              showCreateButton={false}
              showActionsColumn={false}
              loading={loading}
            />
            <Stack direction="row" spacing={1} sx={{ p: 2 }}>
              <Button variant="contained" onClick={() => { if (rows.length) openDetail(rows[0]); }}>View first</Button>
              <Button variant="outlined" onClick={openCreate}>Create New</Button>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      <Dialog open={detailOpen} onClose={closeDetail} fullWidth maxWidth="md">
        <DialogTitle>Template Detail</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography><strong>ID:</strong> {selected.id}</Typography>
              <Typography><strong>Branch ID:</strong> {selected.branchId}</Typography>
              <Typography><strong>Process Stage:</strong> {selected.processStageName || selected.processStageId}</Typography>
              <Typography><strong>Email Subject:</strong> {selected.emailSubject}</Typography>
              <Typography><strong>Email Body:</strong></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected.emailBody}</Typography>
              <Typography><strong>WhatsApp Template Code:</strong> {selected.whatsappTemplateCode}</Typography>
              <Typography><strong>WhatsApp Body:</strong></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected.whatsappBody}</Typography>
              <Typography><strong>In-App Body:</strong></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected.inAppBody}</Typography>
              <Typography><strong>Dynamic Data:</strong> {selected.dynamicData}</Typography>
              <Typography><strong>Active:</strong> {selected.isActive ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Default:</strong> {selected.default ? 'Yes' : 'No'}</Typography>
            </Stack>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="md">
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent>
          {editError && <Typography color="error">{editError}</Typography>}
          {editData ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Select value={editData.processStageId ?? ''} onChange={(e) => setEditData({ ...editData, processStageId: Number(e.target.value) })} displayEmpty>
                <MenuItem value="">Select Process Stage</MenuItem>
                {processStages.map((ps) => (
                  <MenuItem key={ps.id} value={ps.id}>{ps.stageName || ps.code || ps.id}</MenuItem>
                ))}
              </Select>
              <TextField label="Email Subject" value={editData.emailSubject ?? ''} onChange={(e) => setEditData({ ...editData, emailSubject: e.target.value })} />
              <TextField label="Email Body" multiline minRows={3} value={editData.emailBody ?? ''} onChange={(e) => setEditData({ ...editData, emailBody: e.target.value })} />
              <TextField label="WhatsApp Template Code" value={editData.whatsappTemplateCode ?? ''} onChange={(e) => setEditData({ ...editData, whatsappTemplateCode: e.target.value })} />
              <TextField label="WhatsApp Body" multiline minRows={2} value={editData.whatsappBody ?? ''} onChange={(e) => setEditData({ ...editData, whatsappBody: e.target.value })} />
              <TextField label="In-App Body" multiline minRows={2} value={editData.inAppBody ?? ''} onChange={(e) => setEditData({ ...editData, inAppBody: e.target.value })} />
              <TextField label="Dynamic Data" value={editData.dynamicData ?? ''} onChange={(e) => setEditData({ ...editData, dynamicData: e.target.value })} />
              <FormControlLabel control={<Switch checked={!!editData.isActive} onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} />} label="Active" />
            </Stack>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={editLoading}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="md">
        <DialogTitle>Create Template</DialogTitle>
        <DialogContent>
          {createError && <Typography color="error">{createError}</Typography>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Select value={createData.processStageId ?? ''} onChange={(e) => setCreateData({ ...createData, processStageId: e.target.value })} displayEmpty>
              <MenuItem value="">Select Process Stage</MenuItem>
              {processStages.map((ps) => (
                <MenuItem key={ps.id} value={ps.id}>{ps.stageName || ps.code || ps.id}</MenuItem>
              ))}
            </Select>
            <TextField label="Email Subject" value={createData.emailSubject ?? ''} onChange={(e) => setCreateData({ ...createData, emailSubject: e.target.value })} />
            <TextField label="Email Body" multiline minRows={3} value={createData.emailBody ?? ''} onChange={(e) => setCreateData({ ...createData, emailBody: e.target.value })} />
            <TextField label="WhatsApp Template Code" value={createData.whatsappTemplateCode ?? ''} onChange={(e) => setCreateData({ ...createData, whatsappTemplateCode: e.target.value })} />
            <TextField label="WhatsApp Body" multiline minRows={2} value={createData.whatsappBody ?? ''} onChange={(e) => setCreateData({ ...createData, whatsappBody: e.target.value })} />
            <TextField label="In-App Body" multiline minRows={2} value={createData.inAppBody ?? ''} onChange={(e) => setCreateData({ ...createData, inAppBody: e.target.value })} />
            <TextField label="Dynamic Data" value={createData.dynamicData ?? ''} onChange={(e) => setCreateData({ ...createData, dynamicData: e.target.value })} />
            <FormControlLabel control={<Switch checked={!!createData.isActive} onChange={(e) => setCreateData({ ...createData, isActive: e.target.checked })} />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreate} disabled={createLoading}>Cancel</Button>
          <Button onClick={saveCreate} variant="contained" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
