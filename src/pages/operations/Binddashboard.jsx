import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

import MasterList from 'sections/admin/masters/MasterList';
import { getBindingDashboardJobs, completeMyJob } from 'api/bind-dashboard';
import { getDocumentVersionListFromOrderId, uploadDocumentVersionFormData } from 'api/document';
import { authorizedFetchRaw } from 'api/auth';
import { useAuth } from 'hooks/useAuth';
import useAccess from 'hooks/useAccess';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import DownloadDocumentButton from 'components/DownloadDocumentButton';

// ==============================|| BIND DASHBOARD ||============================== //

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function Binddashboard() {
  const { accessToken } = useAuth();
  const { hasAccess } = useAccess();
  const canComplete = hasAccess('MY_JOBS_MGMT') || hasAccess('BIND_DASHBOARD_VIEW_ORDER');
  const canViewOrder = hasAccess('BIND_DASHBOARD_VIEW_ORDER') || hasAccess('MY_JOBS_MGMT');
  const canApproveDocument = hasAccess('MY_JOBS_MGMT');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [completingId, setCompletingId] = useState(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedCompleteId, setSelectedCompleteId] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedApprovalJob, setSelectedApprovalJob] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [approvalError, setApprovalError] = useState('');
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const FILE_SLOTS = [
    { key: 'thesisDocument',              label: 'Thesis Document',       required: true  },
    { key: 'synopsisDocument',            label: 'Synopsis Document',     required: false },
    { key: 'coverPageDesignFileHard',     label: 'Hard Cover Design',     required: false },
    { key: 'coverPageDesignFileSoft',     label: 'Soft Cover Design',     required: false },
    { key: 'synopsisCoverPageDesignFile', label: 'Synopsis Cover Design', required: false },
  ];
  const emptyFiles = () => Object.fromEntries(FILE_SLOTS.map((s) => [s.key, null]));
  const [uploadFiles, setUploadFiles] = useState(emptyFiles);
  const fileInputRefs = useRef({});

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBindingDashboardJobs();
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setJobs(items);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const navigate = useNavigate();

  const openCompleteDialog = (id) => {
    if (!id) return;
    setSelectedCompleteId(id);
    setRemark('');
    setRemarkError('');
    setCompleteDialogOpen(true);
  };

  const handleActionsOpen = (event, job) => {
    setActionAnchorEl(event.currentTarget);
    setActiveJob(job);
  };

  const handleActionsClose = () => {
    setActionAnchorEl(null);
    setActiveJob(null);
  };

  const handleViewOrder = () => {
    if (!activeJob) return;
    const id = activeJob.orderId || activeJob.id || activeJob.orderNo || activeJob.code;
    if (id) navigate(`/admin/orders/view/${encodeURIComponent(String(id))}`);
    handleActionsClose();
  };

  const getJobOrderId = (job) => job?.orderId ?? null;
  const getJobDocumentName = (job) => job?.printingDetails ?? job?.documentFileName ?? '';

  const handleDocumentApproval = async () => {
    if (!activeJob) return;
    setApprovalError('');
    setVersions([]);
    setUploadFiles(emptyFiles());
    setUploadRemarks('');
    setSelectedApprovalJob(activeJob);
    setApprovalDialogOpen(true);
    handleActionsClose();
    // Use orderNumber for version list lookup (API expects orderNumber query param)
    const orderNumber = activeJob.orderNumber ?? getJobOrderId(activeJob);
    if (!orderNumber) {
      setApprovalError('Order number is not available for this job.');
      return;
    }
    setVersionLoading(true);
    try {
      const versionList = await getDocumentVersionListFromOrderId(orderNumber);
      if (Array.isArray(versionList)) setVersions(versionList);
      else if (Array.isArray(versionList?.data)) setVersions(versionList.data);
      else setVersions([]);
    } catch (err) {
      console.error('Failed to load document versions', err);
      setApprovalError(err?.message || 'Failed to load document version history');
      setVersions([]);
    } finally {
      setVersionLoading(false);
    }
  };

  const downloadCurrentDocument = async () => {
    if (!selectedApprovalJob) return;
    const documentName = getJobDocumentName(selectedApprovalJob);
    const orderId = selectedApprovalJob.orderId ?? '';
    if (!orderId) {
      setApprovalError('Unable to determine order ID for current document download.');
      return;
    }
    setDownloadLoading(true);
    try {
      const path = `/api/v1/orders/admin/download/${encodeURIComponent(String(documentName))}/${encodeURIComponent(String(orderId))}`;
      const res = await authorizedFetchRaw(path, { method: 'GET' });
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition') || '';
      let filename = documentName || String(orderId);
      const m = /filename\*=UTF-8''([^;\n]+)/i.exec(cd) || /filename="?([^";\n]+)"?/i.exec(cd);
      if (m?.[1]) {
        try { filename = decodeURIComponent(m[1]); } catch (_e) { filename = m[1]; }
      }
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      showSnack('Document downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to download current document', err);
      const msg = err?.message || 'Failed to download current document';
      setApprovalError(msg);
      showSnack(msg, 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleFileChange = (slotKey, event) => {
    const file = event.target.files?.[0] || null;
    setUploadFiles((prev) => ({ ...prev, [slotKey]: file }));
    if (fileInputRefs.current[slotKey]) fileInputRefs.current[slotKey].value = '';
  };

  const handleRemoveFile = (slotKey) => {
    setUploadFiles((prev) => ({ ...prev, [slotKey]: null }));
    if (fileInputRefs.current[slotKey]) fileInputRefs.current[slotKey].value = '';
  };

  const handleUploadVersion = async () => {
    const jobId = selectedApprovalJob?.orderId ?? null;
    const jobOrderId = selectedApprovalJob?.orderNumber ?? selectedApprovalJob?.orderId ?? null;
    if (!jobId) { setApprovalError('Order ID is not available for upload.'); return; }
    if (!uploadFiles.thesisDocument) { setApprovalError('Thesis Document is required.'); return; }
    setUploading(true);
    setApprovalError('');
    try {
      await uploadDocumentVersionFormData({
        orderId: jobId,
        remarks: uploadRemarks,
        thesisDocument: uploadFiles.thesisDocument,
        synopsisDocument: uploadFiles.synopsisDocument,
        coverPageDesignFileHard: uploadFiles.coverPageDesignFileHard,
        coverPageDesignFileSoft: uploadFiles.coverPageDesignFileSoft,
        synopsisCoverPageDesignFile: uploadFiles.synopsisCoverPageDesignFile,
      });
      const versionList = await getDocumentVersionListFromOrderId(jobOrderId);
      setVersions(Array.isArray(versionList) ? versionList : Array.isArray(versionList?.data) ? versionList.data : []);
      setUploadFiles(emptyFiles());
      setUploadRemarks('');
      Object.values(fileInputRefs.current).forEach((ref) => { if (ref) ref.value = ''; });
      showSnack('Documents uploaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to upload document version', err);
      const msg = err?.message || 'Upload failed';
      setApprovalError(msg);
      showSnack(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseApprovalDialog = () => {
    if (uploading || downloadLoading) return;
    setApprovalDialogOpen(false);
    setSelectedApprovalJob(null);
    setVersions([]);
    setApprovalError('');
    setUploadFiles(emptyFiles());
    setUploadRemarks('');
    Object.values(fileInputRefs.current).forEach((ref) => { if (ref) ref.value = ''; });
  };

  const handleCloseCompleteDialog = () => {
    if (completingId && completingId === selectedCompleteId) return;
    setCompleteDialogOpen(false);
    setSelectedCompleteId(null);
    setRemark('');
    setRemarkError('');
  };

  const handleSubmitRemark = async () => {
    if (!selectedCompleteId) return;
    const r = String(remark || '').trim();
    if (!r) { setRemarkError('Please enter a remark'); return; }
    try {
      setCompletingId(selectedCompleteId);
      setRemarkError('');
      setError('');
      await completeMyJob(selectedCompleteId, r);
      await loadJobs();
      setCompleteDialogOpen(false);
      setSelectedCompleteId(null);
      setRemark('');
      setRemarkError('');
    } catch (err) {
      console.error('Failed to complete job', err);
      setRemarkError(err?.message || 'Failed to complete job');
      setError(err?.message || 'Failed to complete job');
    } finally {
      setCompletingId(null);
    }
  };

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return jobs.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, jobs]);

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          <MasterList
            columns={[
              {
                id: 'rowActions',
                label: '',
                align: 'center',
                sx: { width: '80px' },
                render: (row) => (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {(canViewOrder || canApproveDocument) && (
                      <IconButton size="small" onClick={(event) => handleActionsOpen(event, row)} aria-label="Job actions">
                        <EllipsisOutlined style={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>
                )
              },
              { id: 'orderNumber', label: 'Order ID', sx: { whiteSpace: 'nowrap' } },
              {
                id: 'customerName',
                label: 'Customer',
                sx: { maxWidth: 140 },
                render: (row) => (
                  <Typography
                    variant="body2"
                    title={row.customerName || ''}
                    sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {row.customerName || ''}
                  </Typography>
                )
              },
              {
                id: 'assignedStaff',
                label: 'Assigned Staff',
                sx: { maxWidth: 160 },
                render: (row) => (
                  <Box sx={{ maxWidth: 160 }}>
                    <Typography
                      variant="body2"
                      title={row.assignedStaffName || ''}
                      sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {row.assignedStaffName || '—'}
                    </Typography>
                    {row.assignedDate && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        title={formatDateTime(row.assignedDate)}
                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {formatDateTime(row.assignedDate)}
                      </Typography>
                    )}
                  </Box>
                )
              },
              { id: 'noOfCopies', label: 'Copies', align: 'center', sx: { whiteSpace: 'nowrap', width: 70 } },
              {
                id: 'coverDesign',
                label: 'Cover Design',
                sx: { maxWidth: 150 },
                render: (row) => (
                  <Typography
                    variant="body2"
                    title={row.coverDesign || ''}
                    sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {row.coverDesign || ''}
                  </Typography>
                )
              },
              { id: 'bindingType', label: 'Binding Type', sx: { whiteSpace: 'nowrap' } },
              {
                id: 'delivery',
                label: 'Delivery',
                sx: { maxWidth: 180 },
                render: (row) => (
                  <Box sx={{ maxWidth: 180 }}>
                    <Typography
                      variant="body2"
                      title={row.deliveryBranchName || ''}
                      sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {row.deliveryBranchName || ''}
                    </Typography>
                    {row.deleveryBranchAddress && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        title={row.deleveryBranchAddress}
                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {row.deleveryBranchAddress}
                      </Typography>
                    )}
                  </Box>
                )
              },
              { id: 'deliveryType', label: 'Delivery Type', sx: { whiteSpace: 'nowrap' } },
              {
                id: 'printingDetails',
                label: 'Printing Details',
                sx: { maxWidth: 180 },
                render: (row) => (
                  <Typography
                    variant="body2"
                    title={row.printingDetails || ''}
                    sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {row.printingDetails || ''}
                  </Typography>
                )
              },
              {
                id: 'documentVersion',
                label: 'Current Document',
                render: (row) => (
                  <DownloadDocumentButton
                    documentVersion={row.documentVersion || row.version || ''}
                    documentFilePath={row.documentFilePath || row.filePath || row.file_path || ''}
                    documentFileName={row.documentFileName || row.fileName || row.filename || ''}
                    accessToken={accessToken}
                  />
                )
              },
              {
                id: 'actions',
                label: 'Actions',
                align: 'center',
                render: (row) =>
                  canComplete ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => openCompleteDialog(row.orderId)}
                      disabled={loading || completingId === row.orderId}
                    >
                      {completingId === row.orderId ? 'Completing...' : 'Complete'}
                    </Button>
                  ) : null
              }
            ]}
            rows={pagedRows}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={jobs.length}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
            loading={loading}
            hideCreateButton
            showActiveColumn={false}
            showActionsColumn={false}
          />
          <Menu
            anchorEl={actionAnchorEl}
            open={Boolean(actionAnchorEl)}
            onClose={handleActionsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {canViewOrder && <MenuItem onClick={handleViewOrder}>View Order</MenuItem>}
            {canApproveDocument && <MenuItem onClick={handleDocumentApproval}>Document Version Approval</MenuItem>}
          </Menu>
        </Grid>
      </Grid>

      {/* Document Version Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={handleCloseApprovalDialog} fullWidth maxWidth="lg">
        <DialogTitle>Document Version Approval</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Stack spacing={2} sx={{ py: 1 }}>
                <Typography variant="subtitle1">Current Document</Typography>
                <Button variant="outlined" onClick={downloadCurrentDocument} disabled={downloadLoading || !selectedApprovalJob}>
                  {downloadLoading ? 'Downloading...' : 'Download Current Document'}
                </Button>

                <Typography variant="subtitle1" sx={{ mt: 1 }}>Upload New Version</Typography>

                {FILE_SLOTS.map((slot) => {
                  const file = uploadFiles[slot.key];
                  return (
                    <Box key={slot.key}>
                      <input
                        ref={(el) => { fileInputRefs.current[slot.key] = el; }}
                        type="file"
                        accept="*/*"
                        onChange={(e) => handleFileChange(slot.key, e)}
                        style={{ display: 'none' }}
                      />
                      <Typography variant="caption" color={slot.required ? 'error' : 'text.secondary'} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                        {slot.label}{slot.required ? ' *' : ''}
                      </Typography>
                      {!file ? (
                        <Box
                          onClick={() => fileInputRefs.current[slot.key]?.click()}
                          sx={{
                            border: '2px dashed',
                            borderColor: slot.required ? 'error.light' : 'divider',
                            borderRadius: 1,
                            p: 1.5,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s, background-color 0.2s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                          }}
                        >
                          <CloudUploadIcon sx={{ fontSize: 28, color: 'text.secondary', mb: 0.25 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Click to browse
                          </Typography>
                        </Box>
                      ) : (
                        <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1 }}>
                          <InsertDriveFileIcon color="primary" sx={{ flexShrink: 0, fontSize: 20 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: 12 }}>{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.size < 1024 * 1024
                                ? `${(file.size / 1024).toFixed(1)} KB`
                                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                            </Typography>
                          </Box>
                          <Button size="small" variant="text" onClick={() => fileInputRefs.current[slot.key]?.click()} disabled={uploading} sx={{ fontSize: 11, px: 0.5 }}>
                            Change
                          </Button>
                          <IconButton size="small" onClick={() => handleRemoveFile(slot.key)} disabled={uploading} aria-label={`Remove ${slot.label}`}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      )}
                    </Box>
                  );
                })}

                <TextField
                  label="Remarks"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                {approvalError && (
                  <Typography variant="body2" color="error">{approvalError}</Typography>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1">Previous Versions & Customer Remarks</Typography>
              <Box sx={{ mt: 1, maxHeight: 460, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {versionLoading ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
                ) : versions.length > 0 ? (
                  <List dense>
                    {versions.map((version, versionIndex) => {
                      const versionNumber = version.versionNo ?? version.version ?? 'Unknown';
                      const listKey = version.id ?? version.documentMasterId ?? versionNumber;
                      return (
                        <Box key={listKey}>
                          <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch', mt: versionIndex !== 0 ? 2 : 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 0.5 }}>
                              <Box>
                                <Typography variant="subtitle2">{`Version ${versionNumber}`}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {version.fileName || version.documentMasterName || 'Unnamed file'}
                                </Typography>
                              </Box>
                              <Chip label={version.approvalStatus || 'Unknown'} size="small" />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {version.remarks || 'No remarks from customer.'}
                            </Typography>
                            {(version.customerName || version.customerEmail || version.customerPhone) && (
                              <Typography variant="caption" color="text.secondary">
                                {version.customerName ? `Customer: ${version.customerName}` : ''}
                                {version.customerEmail ? ` ${version.customerEmail}` : ''}
                                {version.customerPhone ? ` ${version.customerPhone}` : ''}
                              </Typography>
                            )}
                          </ListItem>
                          {versionIndex !== versions.length - 1 && <Divider component="li" />}
                        </Box>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No previous versions available for this document.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApprovalDialog} disabled={uploading || downloadLoading}>Close</Button>
          <Button variant="contained" onClick={handleUploadVersion} disabled={uploading || !uploadFiles.thesisDocument}>
            {uploading ? 'Uploading...' : 'Upload Version'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Complete Dialog */}
      <Dialog open={completeDialogOpen} onClose={handleCloseCompleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Job Complete</DialogTitle>
        <DialogContent>
          <TextField
            label="Remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            error={Boolean(remarkError)}
            helperText={remarkError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} disabled={completingId === selectedCompleteId}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitRemark} disabled={completingId === selectedCompleteId}>
            {completingId === selectedCompleteId ? 'Completing...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
