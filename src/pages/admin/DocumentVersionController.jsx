import { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import MasterList from 'sections/admin/masters/MasterList';
import { uploadDocumentVersion, getDocumentStatus, initDocument } from 'api/document';

// ==============================|| DOCUMENT VERSION CONTROLLER (ADMIN) ||============================== //

export default function DocumentVersionController() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState({ documentId: '', staffId: '', file: '' });

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [commandText, setCommandText] = useState('');

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setFormValues({ documentId: '', staffId: '', file: '' });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  // Populate sample orders if none exist (replace with real fetch)
  useEffect(() => {
    if (rows.length === 0) {
      setRows([
        {
          id: 1,
          orderId: 'ORD-1001',
          customer: 'John Doe',
          documentId: 1001,
          thesisUrl: '',
          sinopsisUrl: '',
          hardCoverUrl: '',
          softCoverUrl: ''
        },
        {
          id: 2,
          orderId: 'ORD-1002',
          customer: 'Jane Smith',
          documentId: 1002,
          thesisUrl: '',
          sinopsisUrl: '',
          hardCoverUrl: '',
          softCoverUrl: ''
        }
      ]);
    }
  }, []);

  const handleView = async (row) => {
    setSelectedOrder(row);
    setViewOpen(true);
    setVersions([]);
    try {
      const resp = await getDocumentStatus(row.documentId);
      if (resp && resp.versions) setVersions(resp.versions);
    } catch (e) {
      // ignore errors; show empty versions
    }
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedOrder(null);
    setVersions([]);
    setCommandText('');
    setUploadFileName('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFormValues((prev) => ({ ...prev, file: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadVersion = async () => {
    if (!selectedOrder) return setError('No document selected');
    if (!formValues.file) return setError('Please choose a file to upload');
    setSaving(true);
    setError('');
    try {
      const payload = { documentId: Number(selectedOrder.documentId), staffId: formValues.staffId || 'admin', file: formValues.file };
      await uploadDocumentVersion(payload);
      try {
        const status = await getDocumentStatus(selectedOrder.documentId);
        if (status && status.versions) setVersions(status.versions);
      } catch (e) {}
      setUploadFileName('');
      setFormValues((prev) => ({ ...prev, file: '' }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to upload document version', e);
      setError(e?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!selectedOrder) return setError('No document selected');
    setSaving(true);
    setError('');
    try {
      await initDocument({ orderDetailsId: String(selectedOrder.id), assignedStaffId: formValues.staffId || 'admin' });
      try {
        const status = await getDocumentStatus(selectedOrder.documentId);
        if (status && status.versions) setVersions(status.versions);
      } catch (e) {}
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to init document', e);
      setError(e?.message || 'Failed to send for approval');
    } finally {
      setSaving(false);
    }
  };

  const openVersionDetail = (version) => {
    setSelectedVersion(version);
    setVersionDialogOpen(true);
  };

  const closeVersionDetail = () => {
    setSelectedVersion(null);
    setVersionDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const documentId = formValues.documentId.toString().trim();
    const staffId = (formValues.staffId || '').trim();
    const file = (formValues.file || '').trim();

    if (!documentId || !staffId || !file) {
      setError('documentId, staffId and file are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = { documentId: Number(documentId), staffId, file };
      const resp = await uploadDocumentVersion(payload);

      // Append to local list with a simple normalized shape
      const newRow = {
        id: resp?.id ?? Date.now(),
        documentId: payload.documentId,
        staffId: payload.staffId,
        file: payload.file,
        message: resp?.message || ''
      };
      setRows((prev) => [newRow, ...prev]);
      setDialogOpen(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to upload document version', e);
      setError(e?.message || 'Failed to upload document version');
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
            title="Document Version Controller"
            description="List of orders with downloadable documents and version controls."
            columns={[
              { id: 'orderId', label: 'Order' },
              { id: 'customer', label: 'Customer' },
              {
                id: 'thesis',
                label: 'Thesis',
                render: (row) => (
                  row.thesisUrl ? (
                    <a href={row.thesisUrl} target="_blank" rel="noreferrer">Download</a>
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )
                )
              },
              {
                id: 'sinopsis',
                label: 'Sinopsis',
                render: (row) => (
                  row.sinopsisUrl ? (
                    <a href={row.sinopsisUrl} target="_blank" rel="noreferrer">Download</a>
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )
                )
              },
              {
                id: 'hardCover',
                label: 'Hard Cover',
                render: (row) => (
                  row.hardCoverUrl ? (
                    <a href={row.hardCoverUrl} target="_blank" rel="noreferrer">Download</a>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Optional</Typography>
                  )
                )
              },
              {
                id: 'softCover',
                label: 'Soft Cover',
                render: (row) => (
                  row.softCoverUrl ? (
                    <a href={row.softCoverUrl} target="_blank" rel="noreferrer">Download</a>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Optional</Typography>
                  )
                )
              },
              {
                id: 'actions',
                label: 'Actions',
                render: (row) => (
                  <Button size="small" variant="outlined" onClick={() => handleView(row)}>View</Button>
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
            showCreateButton={false}
            showActionsColumn={false}
            loading={false}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Upload Document Version</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Document ID" value={formValues.documentId} onChange={handleFormChange('documentId')} fullWidth />
            <TextField label="Staff ID" value={formValues.staffId} onChange={handleFormChange('staffId')} fullWidth />
            <TextField label="File (base64 or URL)" value={formValues.file} onChange={handleFormChange('file')} fullWidth multiline rows={4} />
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
            {saving ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* View / Upload panel */}
      <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="lg">
        <DialogTitle>Document: {selectedOrder?.orderId || ''}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                <Typography variant="subtitle1">Upload New Version</Typography>
                <input type="file" onChange={handleFileChange} />
                {uploadFileName && (
                  <Typography variant="body2">Selected: {uploadFileName}</Typography>
                )}
                <TextField label="Staff ID" value={formValues.staffId} onChange={handleFormChange('staffId')} fullWidth />
                <TextField label="Command / Notes" value={commandText} onChange={(e) => setCommandText(e.target.value)} fullWidth multiline rows={3} />
                {error && (
                  <Typography variant="body2" color="error">{error}</Typography>
                )}
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleUploadVersion} disabled={saving}>{saving ? 'Uploading...' : 'Upload Version'}</Button>
                  <Button variant="outlined" onClick={handleSendForApproval} disabled={saving}>{saving ? 'Sending...' : 'Send For Approval'}</Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle1">Previous Versions</Typography>
              <Box sx={{ maxHeight: 420, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 1 }}>
                {versions && versions.length > 0 ? (
                  <List dense>
                    {versions.map((v) => (
                      <div key={v.versionNo}>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => openVersionDetail(v)}>
                            <ListItemText primary={`v${v.versionNo} — ${v.approvalStatus || 'N/A'}`} secondary={v.remarks || ''} />
                          </ListItemButton>
                        </ListItem>
                        <Divider />
                      </div>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No previous versions</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Version detail modal (chat + feedback) */}
      <Dialog open={versionDialogOpen} onClose={closeVersionDetail} fullWidth maxWidth="sm">
        <DialogTitle>Version v{selectedVersion?.versionNo}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2">Approval Status: {selectedVersion?.approvalStatus || 'N/A'}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{selectedVersion?.remarks || 'No remarks'}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Document Chat / Customer Feedback</Typography>
          {/* Placeholder: if you have an API for chat/feedback, fetch and render here */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Customer feedback and document chat will appear here for the selected version.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVersionDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
