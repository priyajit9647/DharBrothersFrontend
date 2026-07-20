import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

import MasterList from 'sections/admin/masters/MasterList';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import { getJobList, completeMyJob } from 'api/myJobs';
import { getDocumentVersionListFromOrderId, uploadDocumentVersionFormData } from 'api/document';

// ==============================|| EXTRA TASKS ||============================== //

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getAssignedStaffName(row) {
  return row.assignedStaffName || row.assignedStuffName || '';
}

export default function ExtraTask() {
  const navigate = useNavigate();
  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedCompleteOrderId, setSelectedCompleteOrderId] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [completingOrderId, setCompletingOrderId] = useState(null);
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
    { key: 'thesisDocument', label: 'Thesis Document', required: true },
    { key: 'synopsisDocument', label: 'Synopsis Document', required: false },
    { key: 'coverPageDesignFileHard', label: 'Hard Cover Design', required: false },
    { key: 'coverPageDesignFileSoft', label: 'Soft Cover Design', required: false },
    { key: 'synopsisCoverPageDesignFile', label: 'Synopsis Cover Design', required: false }
  ];

  const emptyFiles = () => Object.fromEntries(FILE_SLOTS.map((s) => [s.key, null]));
  const [uploadFiles, setUploadFiles] = useState(emptyFiles());
  const fileInputRefs = useRef({});

  // Fetch jobs on mount
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJobList();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setError(err?.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return jobs.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, jobs]);

  // Handlers
  const openCompleteDialog = (row) => {
    if (!row || !row.orderId) return;
    setSelectedCompleteOrderId(row.orderId);
    setRemark('');
    setRemarkError('');
    setCompleteDialogOpen(true);
  };

  const handleActionsOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleViewOrder = () => {
    if (!activeRow) return;
    const id = activeRow.orderId;
    if (id) {
      navigate(`/admin/orders/view/${encodeURIComponent(String(id))}`);
    }
    handleActionsClose();
  };

  const handleDocumentApproval = async () => {
    if (!activeRow) return;
    setApprovalError('');
    setVersions([]);
    setUploadFiles(emptyFiles());
    setUploadRemarks('');
    setSelectedApprovalJob(activeRow);
    setApprovalDialogOpen(true);
    handleActionsClose();

    const orderNumber = activeRow.orderNumber || activeRow.orderId || activeRow.orderId;
    if (!orderNumber) {
      setApprovalError('Order number is not available for this job.');
      return;
    }

    setVersionLoading(true);
    try {
      const response = await getDocumentVersionListFromOrderId(orderNumber);
      const versionData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setVersions(versionData);
    } catch (err) {
      console.error('Failed to load document versions', err);
      setApprovalError(err?.message || 'Failed to load document version history');
      setVersions([]);
    } finally {
      setVersionLoading(false);
    }
  };

  const handleCloseCompleteDialog = () => {
    if (completingOrderId && completingOrderId === selectedCompleteOrderId) return;
    setCompleteDialogOpen(false);
    setSelectedCompleteOrderId(null);
    setRemark('');
    setRemarkError('');
  };

  const handleSubmitRemark = async () => {
    if (!selectedCompleteOrderId) return;
    const r = String(remark || '').trim();
    if (!r) {
      setRemarkError('Please enter a remark');
      return;
    }
    try {
      setCompletingOrderId(selectedCompleteOrderId);
      setRemarkError('');
      await completeMyJob(selectedCompleteOrderId, r);
      await loadJobs();
      setCompleteDialogOpen(false);
      setSelectedCompleteOrderId(null);
      setRemark('');
      setRemarkError('');
      showSnack('Job marked as complete successfully!', 'success');
    } catch (err) {
      console.error('Failed to complete job', err);
      setRemarkError(err?.message || 'Failed to complete job');
    } finally {
      setCompletingOrderId(null);
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
    Object.values(fileInputRefs.current).forEach((ref) => {
      if (ref) ref.value = '';
    });
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
    if (!selectedApprovalJob) return;
    if (!uploadFiles.thesisDocument) {
      setApprovalError('Thesis Document is required.');
      return;
    }

    const orderId = selectedApprovalJob.orderId || selectedApprovalJob.orderNumber;
    const orderNumber = selectedApprovalJob.orderNumber || selectedApprovalJob.orderId;
    if (!orderId) {
      setApprovalError('Order ID is required to upload a new document version.');
      return;
    }

    setUploading(true);
    setApprovalError('');
    try {
      await uploadDocumentVersionFormData({
        orderId,
        remarks: uploadRemarks,
        thesisDocument: uploadFiles.thesisDocument,
        synopsisDocument: uploadFiles.synopsisDocument,
        coverPageDesignFileHard: uploadFiles.coverPageDesignFileHard,
        coverPageDesignFileSoft: uploadFiles.coverPageDesignFileSoft,
        synopsisCoverPageDesignFile: uploadFiles.synopsisCoverPageDesignFile
      });

      if (orderNumber) {
        const response = await getDocumentVersionListFromOrderId(orderNumber);
        const updatedVersions = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setVersions(updatedVersions);
      }

      setUploadFiles(emptyFiles());
      setUploadRemarks('');
      Object.values(fileInputRefs.current).forEach((ref) => {
        if (ref) ref.value = '';
      });
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

  return (
    <Grid container sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        <MasterList
          title="Extra Tasks"
          columns={[
            {
              id: 'rowActions',
              label: '',
              align: 'center',
              sx: { width: '80px' },
              render: (row) => (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <IconButton size="small" onClick={(event) => handleActionsOpen(event, row)} aria-label="Job actions">
                    <EllipsisOutlined style={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              )
            },
            { id: 'orderNumber', label: 'Order ID', sx: { whiteSpace: 'nowrap' } },
            {
              id: 'customerFullName',
              label: 'Customer',
              sx: { maxWidth: 140 },
              render: (row) => (
                <Typography
                  variant="body2"
                  title={row.customerFullName || ''}
                  sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {row.customerFullName || '—'}
                </Typography>
              )
            },
            {
              id: 'processStageName',
              label: 'Stage',
              sx: { whiteSpace: 'nowrap' },
              render: (row) => (
                <Chip label={row.processStageName || '—'} size="small" variant="outlined" />
              )
            },
            {
              id: 'assignedStaff',
              label: 'Assigned Staff',
              sx: { maxWidth: 160 },
              render: (row) => {
                const staffName = getAssignedStaffName(row);
                return (
                  <Box sx={{ maxWidth: 160 }}>
                    <Typography
                      variant="body2"
                      title={staffName}
                      sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {staffName || 'Unassigned'}
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
                );
              }
            },
            {
              id: 'dueTime',
              label: 'Due Date',
              sx: { whiteSpace: 'nowrap' },
              render: (row) => (
                <Typography variant="body2" title={formatDateTime(row.dueTime)}>
                  {formatDateTime(row.dueTime)}
                </Typography>
              )
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'center',
              render: (row) => (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => openCompleteDialog(row)}
                  disabled={loading || completingOrderId === row.orderId}
                >
                  {completingOrderId === row.orderId ? 'Completing...' : 'Complete'}
                </Button>
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
          showCreateButton={false}
          showActiveColumn={false}
          showActionsColumn={false}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionsClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {activeRow && <MenuItem onClick={handleViewOrder}>View Order</MenuItem>}
          {activeRow && <MenuItem onClick={handleDocumentApproval}>Document Version Approval</MenuItem>}
        </Menu>
      </Grid>

      {/* Document Version Approval Dialog - From Binding Dashboard */}
      <Dialog open={approvalDialogOpen} onClose={handleCloseApprovalDialog} fullWidth maxWidth="lg">
        <DialogTitle>Document Version Approval</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Stack spacing={2} sx={{ py: 1 }}>
                <Typography variant="subtitle1">Upload New Version</Typography>

                {FILE_SLOTS.map((slot) => {
                  const file = uploadFiles[slot.key];
                  return (
                    <Box key={slot.key}>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[slot.key] = el;
                        }}
                        type="file"
                        accept="*/*"
                        onChange={(e) => handleFileChange(slot.key, e)}
                        style={{ display: 'none' }}
                      />
                      <Typography variant="caption" color={slot.required ? 'error' : 'text.secondary'} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                        {slot.label}
                        {slot.required ? ' *' : ''}
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
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
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
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: 12 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
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

                <TextField label="Remarks" value={uploadRemarks} onChange={(e) => setUploadRemarks(e.target.value)} fullWidth multiline minRows={2} />
                {approvalError && <Typography variant="body2" color="error">{approvalError}</Typography>}
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
          <Button onClick={handleCloseApprovalDialog} disabled={uploading || downloadLoading}>
            Close
          </Button>
          <Button variant="contained" onClick={handleUploadVersion} disabled={uploading || !uploadFiles.thesisDocument}>
            {uploading ? 'Uploading...' : 'Upload Version'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Complete Dialog - From Binding Dashboard */}
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
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} disabled={completingOrderId === selectedCompleteOrderId}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitRemark} disabled={completingOrderId === selectedCompleteOrderId}>
            {completingOrderId === selectedCompleteOrderId ? 'Completing...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}