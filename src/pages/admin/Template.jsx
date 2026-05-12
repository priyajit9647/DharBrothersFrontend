import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import MainCard from 'components/MainCard';
import MasterList from 'sections/admin/masters/MasterList';
import { getBranches } from 'api/branch';
import { getProcessStages } from 'api/processStage';
import { createNotificationTemplate } from 'api/branch';

// ==============================|| ADMIN - TEMPLATE PAGE ||============================== //

export default function Template() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [processStages, setProcessStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState({
    branchId: '',
    processStageId: '',
    emailSubject: '',
    emailBody: '',
    whatsappTemplateCode: '',
    whatsappBody: '',
    inAppBody: '',
    isActive: true
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const branchData = await getBranches();
        const stageData = await getProcessStages();

        setBranches(Array.isArray(branchData) ? branchData : branchData?.items || branchData?.data || []);
        setProcessStages(Array.isArray(stageData) ? stageData : stageData?.items || stageData?.data || []);
      } catch (err) {
        setError(err?.message || 'Failed to load branch or stage data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setFormValues({
      branchId: '',
      processStageId: '',
      emailSubject: '',
      emailBody: '',
      whatsappTemplateCode: '',
      whatsappBody: '',
      inAppBody: '',
      isActive: true
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
    const payload = {
      branchId: Number(formValues.branchId),
      processStageId: Number(formValues.processStageId),
      emailSubject: formValues.emailSubject.trim(),
      emailBody: formValues.emailBody.trim(),
      whatsappTemplateCode: formValues.whatsappTemplateCode.trim(),
      whatsappBody: formValues.whatsappBody.trim(),
      inAppBody: formValues.inAppBody.trim(),
      isActive: Boolean(formValues.isActive)
    };

    if (!payload.branchId || !payload.processStageId || !payload.emailSubject || !payload.emailBody || !payload.whatsappTemplateCode || !payload.whatsappBody || !payload.inAppBody) {
      setError('All fields are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const resp = await createNotificationTemplate(payload);
      const branch = branches.find((b) => Number(b.id) === payload.branchId);
      const stage = processStages.find((s) => Number(s.id) === payload.processStageId);

      setRows((prev) => [
        {
          id: resp?.branchId ?? Date.now(),
          branchName: branch?.name || String(payload.branchId),
          processStageName: stage?.stageName || String(payload.processStageId),
          emailSubject: payload.emailSubject,
          whatsappTemplateCode: payload.whatsappTemplateCode,
          active: payload.isActive
        },
        ...prev
      ]);
      setDialogOpen(false);
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
              { id: 'emailSubject', label: 'Email Subject' },
              { id: 'whatsappTemplateCode', label: 'WhatsApp Template' }
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
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Create Notification Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="branch-select-label">Branch</InputLabel>
              <Select
                labelId="branch-select-label"
                label="Branch"
                value={formValues.branchId}
                onChange={handleFormChange('branchId')}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name || branch.code || branch.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="stage-select-label">Process Stage</InputLabel>
              <Select
                labelId="stage-select-label"
                label="Process Stage"
                value={formValues.processStageId}
                onChange={handleFormChange('processStageId')}
              >
                {processStages.map((stage) => (
                  <MenuItem key={stage.id} value={stage.id}>
                    {stage.stageName || stage.code || stage.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
