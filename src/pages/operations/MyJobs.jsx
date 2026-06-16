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

import MasterList from 'sections/admin/masters/MasterList';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { getJobList, completeMyJob } from 'api/myJobs';
import { getDocumentVersionListFromOrderId, uploadDocumentVersionFormData } from 'api/document';
import { authorizedFetchRaw } from 'api/auth';
import { useAuth } from 'hooks/useAuth';
import useAccess from 'hooks/useAccess';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import DownloadDocumentButton from 'components/DownloadDocumentButton';

// ==============================|| MY JOBS ||============================== //

export default function MyJobs() {
  const { user, accessToken } = useAuth();
  const { hasAccess } = useAccess();
  const canComplete = hasAccess('MY_JOBS_MGMT') || hasAccess('MYJOBS_VIEW_ORDER');
  const canViewOrder = hasAccess('MYJOBS_VIEW_ORDER') || hasAccess('MY_JOBS_MGMT');
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
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadJobs = useCallback(async (uid) => {
    setLoading(true);
    setError('');

    try {
      // Determine effective userId to send — backend requires `userId` param
      let effectiveUid = uid || user?.id || user?.userId || user?.uid || null;

      if (!effectiveUid && accessToken) {
        try {
          // Decode token payload for common fields.
          const { parseJwt } = require('utils/authTokens');
          const payload = parseJwt(accessToken);
          if (payload) {
            effectiveUid = payload.userId || payload.user_id || payload.sub || payload.uid || payload.id || null;
          }
        } catch (err) {
          // ignore token parse errors
        }
      }

      if (!effectiveUid) {
        throw new Error('User ID not available for job list request');
      }

      const data = await getJobList(effectiveUid);
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      setJobs(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load jobs', err);
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

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

  const navigate = useNavigate();

  const handleActionsClose = () => {
    setActionAnchorEl(null);
    setActiveJob(null);
  };

  const handleViewOrder = () => {
    if (!activeJob) return;
    const id = activeJob.orderId || activeJob.id || activeJob.orderNo || activeJob.code;
    if (id) {
      // Navigate to admin-only order details page
      navigate(`/admin/orders/view/${encodeURIComponent(String(id))}`);
    }
    handleActionsClose();
  };

  const getJobDocumentIdentifier = (job) => {
    return job?.documentStageId ?? job?.documentId ?? job?.stageId ?? job?.processStageId;
  };

  const getJobOrderId = (job) => {
    return job?.orderId ?? null;
  }

  const getJobDocumentName = (job) => {
    return job?.documentFileName ?? '';
  };

  const handleDocumentApproval = async () => {
    if (!activeJob) return;
    setApprovalError('');
    setVersions([]);
    setUploadFile(null);
    setUploadFileName('');
    setUploadRemarks('');
    setSelectedApprovalJob(activeJob);
    setApprovalDialogOpen(true);
    handleActionsClose();
    const jobOrderId = getJobOrderId(activeJob);
    if (!jobOrderId) {
      setApprovalError('Document order ID is not available for this job.');
      return;
    }
    setVersionLoading(true);
    try {
      const versionList = await getDocumentVersionListFromOrderId(jobOrderId);
      if (Array.isArray(versionList)) {
        setVersions(versionList);
      } else if (versionList?.data && Array.isArray(versionList.data)) {
        setVersions(versionList.data);
      } else {
        setVersions([]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load document status', err);
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
      let filename = documentName;
      const m = /filename\*=UTF-8''([^;\n]+)/i.exec(cd) || /filename="?([^";\n]+)"?/i.exec(cd);
      if (m && m[1]) {
        try {
          filename = decodeURIComponent(m[1]);
        } catch (_e) {
          filename = m[1];
        }
      }
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to download current document', err);
      setApprovalError(err?.message || 'Failed to download current document');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setUploadFile(file);
    setUploadFileName(file?.name || '');
    // Reset input value so the same file can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadVersion = async () => {
    const jobId = selectedApprovalJob?.id ?? null;
    const jobOrderId = selectedApprovalJob?.orderId ?? null;
    // console.log('identifier', identifier);
    // return;
    if (!jobId) {
      setApprovalError('Document job ID is not available for upload.');
      return;
    }
    if (!uploadFile) {
      setApprovalError('Please choose a file to upload.');
      return;
    }
    setUploading(true);
    setApprovalError('');
    try {
      await uploadDocumentVersionFormData({ documentStageId: jobId, file: uploadFile, remarks: uploadRemarks });
      const versionList = await getDocumentVersionListFromOrderId(jobOrderId);
      setVersions(Array.isArray(versionList) ? versionList : Array.isArray(versionList?.data) ? versionList.data : []);
      setUploadFile(null);
      setUploadFileName('');
      setUploadRemarks('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to upload document version', err);
      setApprovalError(err?.message || 'Upload failed');
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
    setUploadFile(null);
    setUploadFileName('');
    setUploadRemarks('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReinitiatePayment = () => {
    if (!activeJob) return;
    window.alert(`Re-initiate payment clicked for Order ID: ${activeJob.orderId || activeJob.id || 'unknown'}`);
    handleActionsClose();
  };

  const handleCloseCompleteDialog = () => {
    // prevent closing while a completion request is active for this job
    if (completingId && completingId === selectedCompleteId) return;
    setCompleteDialogOpen(false);
    setSelectedCompleteId(null);
    setRemark('');
    setRemarkError('');
  };

  const handleSubmitRemark = async () => {
    if (!selectedCompleteId) return;
    const r = String(remark || '').trim();
    if (!r) {
      setRemarkError('Please enter a remark');
      return;
    }

    try {
      setCompletingId(selectedCompleteId);
      setRemarkError('');
      setError('');
      await completeMyJob(selectedCompleteId, r);
      await loadJobs();
      // on success close dialog and clear selected id/remark
      setCompleteDialogOpen(false);
      setSelectedCompleteId(null);
      setRemark('');
      setRemarkError('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete job', err);
      setRemarkError(err?.message || 'Failed to complete job');
      setError(err?.message || 'Failed to complete job');
    } finally {
      // always clear completing flag; keep selectedCompleteId/remark so user can retry or cancel
      setCompletingId(null);
    }
  };

  useEffect(() => {
    // Always attempt to load jobs on mount; pass user id when available
    loadJobs(user?.id);
  }, [loadJobs, user?.id]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return jobs.slice(start, end);
  }, [page, rowsPerPage, jobs]);

  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '');

    return `${day}/${month}/${year} - ${time}`;
  };

  const getCustomerName = (customer) => {
    if (!customer) return '';
    return customer.name || customer.customerName || '';
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
                      <IconButton
                        size="small"
                        onClick={(event) => handleActionsOpen(event, row)}
                        aria-label="Job actions"
                      >
                        <EllipsisOutlined style={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>
                )
              },
              { id: 'orderId', label: 'Order ID' },
              { id: 'processStageName', label: 'Stage' },
              {
                id: 'customerFullName',
                label: 'Customer',
              },
              {
                id: 'dueTime',
                label: 'Due Time',
                render: (row) => formatDate(row.dueTime)
              },
              {
                id: 'assignedDate',
                label: 'Assigned at',
                align: 'center',
                render: (row) => formatDate(row.assignedDate)
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
                render: (row) => (
                  canComplete ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => openCompleteDialog(row.id)}
                      disabled={loading || completingId === row.id}
                    >
                      {completingId === row.id ? 'Completing...' : 'Complete'}
                    </Button>
                  ) : null
                )
              }
            ]}
            rows={pagedRows}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={jobs.length}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
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
      <Dialog open={approvalDialogOpen} onClose={handleCloseApprovalDialog} fullWidth maxWidth="lg">
        <DialogTitle>Document Version Approval</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Stack spacing={2} sx={{ py: 1 }}>
                <Typography variant="subtitle1">Current Document</Typography>
                <Button
                  variant="outlined"
                  onClick={downloadCurrentDocument}
                  disabled={downloadLoading || !selectedApprovalJob}
                >
                  {downloadLoading ? 'Downloading...' : 'Download Current Document'}
                </Button>
                <Typography variant="subtitle1">Upload New Version</Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {!uploadFile ? (
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background-color 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Click to browse or drag & drop
                    </Typography>
                    <Button variant="outlined" size="small" component="span" tabIndex={-1}>
                      Browse File
                    </Button>
                  </Box>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <InsertDriveFileIcon color="primary" sx={{ flexShrink: 0, mt: 0.25 }} />
                      <Box sx={{ flex: 1, maxWidth: '150px' }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {uploadFileName}
                        </Typography>
                        {uploadFile?.size != null && (
                          <Typography variant="caption" color="text.secondary">
                            {uploadFile.size < 1024 * 1024
                              ? `${(uploadFile.size / 1024).toFixed(1)} KB`
                              : `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          Change
                        </Button>
                        <IconButton
                          size="small"
                          onClick={handleRemoveFile}
                          disabled={uploading}
                          aria-label="Remove file"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                )}
                <TextField
                  label="Remarks from customer"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                />
                {approvalError && (
                  <Typography variant="body2" color="error">
                    {approvalError}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1">Previous Versions & Customer Remarks</Typography>
              <Box sx={{ mt: 1, maxHeight: 460, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {versionLoading ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : versions.length > 0 ? (
                  <List dense>
                    {versions.map((version, versionIndex) => {
                      const versionNumber = version.versionNo ?? version.version ?? 'Unknown';
                      const listKey = version.id ?? version.documentMasterId ?? versionNumber;
                      return (
                        <Box key={listKey}>
                          <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch', mt: versionIndex != 0 ? 2 : 0, }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 0.5 }}>
                              <Box>
                                <Typography variant="subtitle2">
                                  {`Version ${versionNumber}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {version.fileName || version.documentMasterName || 'Unnamed file'}
                                </Typography>
                              </Box>
                              <Chip label={version.approvalStatus || 'Unknown'} size="small" />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {version.remarks || 'No remarks from customer.'}
                            </Typography>
                            {version.customerName || version.customerEmail || version.customerPhone ? (
                              <Typography variant="caption" color="text.secondary">
                                {version.customerName ? `Customer: ${version.customerName}` : ''}
                                {version.customerEmail ? ` ${version.customerEmail}` : ''}
                                {version.customerPhone ? ` ${version.customerPhone}` : ''}
                              </Typography>
                            ) : null}
                          </ListItem>
                          {versionIndex != (versions.length - 1) && <Divider component="li" />}
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
          <Button onClick={handleCloseApprovalDialog} disabled={uploading || downloadLoading}>
            Close
          </Button>
          <Button variant="contained" onClick={handleUploadVersion} disabled={uploading || !uploadFile}>
            {uploading ? 'Uploading...' : 'Upload Version'}
          </Button>
        </DialogActions>
      </Dialog>
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
            <Button onClick={handleCloseCompleteDialog} disabled={completingId === selectedCompleteId}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmitRemark} disabled={completingId === selectedCompleteId}>
              {completingId === selectedCompleteId ? 'Completing...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
    </>
  );
}
