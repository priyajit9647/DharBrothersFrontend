import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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

import MainCard from 'components/MainCard';

// API
import { getJobList, completeMyJob } from 'api/myJobs';

// icons
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';

// ==============================|| TABLE HEAD COMPONENT ||============================== //
const headCells = [
  { id: 'rowActions', align: 'center', label: 'Action', width: '80px' },
  { id: 'orderNumber', align: 'left', label: 'Order #', width: '120px' },
  { id: 'customerFullName', align: 'left', label: 'Customer', width: '140px' },
  { id: 'processStageName', align: 'left', label: 'Stage', width: '160px' },
  { id: 'assignedStuffName', align: 'left', label: 'Assigned To', width: '140px' },
  { id: 'dueTime', align: 'left', label: 'Due Date', width: '160px' }
];

function JobsTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{ whiteSpace: 'nowrap', width: headCell.width || 'auto' }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function ExtraTask() {
  const navigate = useNavigate();
  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  // Handlers
  const openCompleteDialog = (row) => {
    if (!row || !row.orderId) return;
    setSelectedCompleteOrderId(row.orderId);
    setRemark('');
    setRemarkError('');
    setCompleteDialogOpen(true);
    handleActionsClose();
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

  const handleDocumentApproval = () => {
    if (!activeRow) return;
    setApprovalError('');
    setVersions([]);
    setUploadFiles(emptyFiles());
    setUploadRemarks('');
    setSelectedApprovalJob(activeRow);
    setApprovalDialogOpen(true);
    handleActionsClose();
    // Simulate loading versions
    setVersionLoading(true);
    setTimeout(() => {
      setVersions([
        {
          id: '1',
          versionNo: 1,
          fileName: 'thesis-v1.pdf',
          approvalStatus: 'Approved',
          remarks: 'First version submitted',
          customerName: activeRow.customer
        }
      ]);
      setVersionLoading(false);
    }, 500);
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
    setUploading(true);
    setApprovalError('');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12}>
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 0 }}>
            <TableContainer
              sx={{
                width: '100%',
                overflowX: 'auto',
                position: 'relative',
                display: 'block',
                maxWidth: '100%',
                px: 2,
                '& td, & th': { whiteSpace: 'nowrap' }
              }}
            >
              <Table aria-labelledby="jobs-table" sx={{ width: '100%', tableLayout: 'fixed' }}>
                <JobsTableHead />
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No jobs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((row) => (
                      <TableRow hover tabIndex={-1} key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell align="center" sx={{ width: '80px' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={(event) => handleActionsOpen(event, row)}
                              aria-label="Job actions"
                            >
                              <EllipsisOutlined style={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="subtitle2">{row.orderNumber || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            title={row.customerFullName || ''}
                            sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {row.customerFullName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', width: '160px' }}>
                          <Chip label={row.processStageName || 'N/A'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', width: '140px' }}>
                          <Typography variant="body2">{row.assignedStuffName || 'Unassigned'}</Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', width: '160px' }}>
                          <Typography variant="caption" color="text.secondary">
                            {row.dueTime ? new Date(row.dueTime).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

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
        </MainCard>
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