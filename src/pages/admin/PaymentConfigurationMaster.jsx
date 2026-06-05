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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import MasterList from 'sections/admin/masters/MasterList';
import { getBranches } from 'api/branch';
import { createPaymentConfiguration, editPaymentConfiguration, getPaymentConfigurations } from 'api/paymentConfiguration';
import useAccess from 'hooks/useAccess';

// ==============================|| MASTER - PAYMENT CONFIGURATION ||============================== //

export default function PaymentConfigurationMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingConfigurations, setLoadingConfigurations] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({
    merchantId: '',
    aggregatorId: '',
    secretKey: '',
    percentage: '1',
    active: 'true',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPaymentConfigurations = async (branchId) => {
    if (!branchId) {
      setRows([]);
      return;
    }

    try {
      setLoadingConfigurations(true);
      setError('');
      const data = await getPaymentConfigurations(branchId);
      const items = Array.isArray(data) ? data : data?.items || data?.data || [];
      const normalized = items.map((item, index) => ({
        id: item.id ?? `${branchId}-${index + 1}`,
        branchId: String(item.branchId ?? branchId),
        branchName: item.branchName || selectedBranchName || 'Branch',
        configId: item.id ?? '-',
        merchantId: item.merchantId || '',
        aggregatorId: item.aggregatorId || '',
        secretKey: item.secretKey || '',
        accountNumber: item.accountNumber || '',
        accountHolderName: item.accountHolderName || '',
        ifscCode: item.ifscCode || '',
        bankName: item.bankName || '',
        percentage: Number(item.percentage ?? 0),
        active: item.active
      }));
      setRows(normalized);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load payment configurations', err);
      setError(err?.message || 'Failed to load payment configurations');
    } finally {
      setLoadingConfigurations(false);
    }
  };

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        setError('');
        const data = await getBranches();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setBranches(items);
        if (!selectedBranchId && items.length > 0) {
          setSelectedBranchId(String(items[0].id));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load branches', err);
        setError(err?.message || 'Failed to load branches');
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBranchName = useMemo(() => {
    return branches.find((branch) => String(branch.id) === String(selectedBranchId))?.name || '';
  }, [branches, selectedBranchId]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rows, rowsPerPage]);

  useEffect(() => {
    loadPaymentConfigurations(selectedBranchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ merchantId: '', aggregatorId: '', secretKey: '', percentage: '1', active: 'true', accountNumber: '', accountHolderName: '', ifscCode: '', bankName: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      merchantId: row.merchantId || '',
      aggregatorId: row.aggregatorId || '',
      secretKey: row.secretKey || '',
      percentage: String(row.percentage ?? '1'),
      active: String(row.active ?? true),
      accountNumber: row.accountNumber || '',
      accountHolderName: row.accountHolderName || '',
      ifscCode: row.ifscCode || '',
      bankName: row.bankName || ''
    });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const merchantId = formValues.merchantId.trim();
    const aggregatorId = formValues.aggregatorId.trim();
    const secretKey = formValues.secretKey.trim();
    const accountNumber = formValues.accountNumber?.trim();
    const accountHolderName = formValues.accountHolderName?.trim();
    const ifscCode = formValues.ifscCode?.trim();
    const bankName = formValues.bankName?.trim();
    const percentage = Number(formValues.percentage);
    const active = String(formValues.active) === 'true';

    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    if (!merchantId || !aggregatorId || !secretKey) {
      setError('Merchant ID, Aggregator ID and Secret Key are required');
      return;
    }

    if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) {
      setError('Percentage is required and must be between 1 and 100');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editPaymentConfiguration(editingRow.id, {
          branchId: Number(selectedBranchId),
          merchantId,
          aggregatorId,
          secretKey,
          accountNumber,
          accountHolderName,
          ifscCode,
          bankName,
          percentage,
          active
        });

        await loadPaymentConfigurations(selectedBranchId);
      } else {
        await createPaymentConfiguration({
          id: '',
          branchId: Number(selectedBranchId),
          merchantId,
          aggregatorId,
          secretKey,
          accountNumber,
          accountHolderName,
          ifscCode,
          bankName,
          percentage,
          active
        });

        await loadPaymentConfigurations(selectedBranchId);
      }

      setDialogOpen(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save payment configuration', err);
      setError(err?.message || 'Failed to save payment configuration');
    } finally {
      setSaving(false);
    }
  };

  const { hasAccess } = useAccess();
  const canCreate = hasAccess('PAYMENT_CONFIGURATION_CREATE') || hasAccess('PAYMENT_CONFIGURATION_MGMT');
  const canEdit = hasAccess('PAYMENT_CONFIGURATION_EDIT') || hasAccess('PAYMENT_CONFIGURATION_MGMT');
  const canToggle = hasAccess('PAYMENT_CONFIGURATION_TOGGLE_ACTIVE') || hasAccess('PAYMENT_CONFIGURATION_MGMT');

  return (
    <>
      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
          <Stack spacing={1} sx={{ mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 220 }} disabled={loadingBranches}>
              <InputLabel id="payment-config-branch-select-label">Branch</InputLabel>
              <Select
                labelId="payment-config-branch-select-label"
                label="Branch"
                value={selectedBranchId}
                onChange={(event) => {
                  setSelectedBranchId(event.target.value);
                  setPage(0);
                }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && !dialogOpen && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>

          <MasterList
            title="Payment Configuration"
            description="Configure payment gateway credentials branch-wise, including payment percentage allocation."
            columns={[
              { id: 'branchName', label: 'Branch' },
              { id: 'configId', label: 'ID' },
              { id: 'merchantId', label: 'Merchant ID' },
              { id: 'aggregatorId', label: 'Aggregator ID' },
              {
                id: 'percentage',
                label: 'Percentage',
                render: (row) => `${row.percentage || 0}%`
              },
              {
                id: 'secretKey',
                label: 'Secret Key',
                render: (row) => (row.secretKey ? '********' : '-')
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
            onEdit={openEditDialog}
            loading={loadingBranches || loadingConfigurations}
            showActiveColumn={false}
            showCreateButton={canCreate}
            showActionsColumn={canEdit}
            showActiveColumn={false}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Payment Configuration' : 'Create Payment Configuration'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField label="Branch" value={selectedBranchName} fullWidth disabled />
            <TextField label="Merchant ID" value={formValues.merchantId} onChange={handleFormChange('merchantId')} fullWidth />
            <TextField label="Aggregator ID" value={formValues.aggregatorId} onChange={handleFormChange('aggregatorId')} fullWidth />
            <TextField label="Secret Key" value={formValues.secretKey} onChange={handleFormChange('secretKey')} fullWidth />
            <TextField label="Account Number" value={formValues.accountNumber} onChange={handleFormChange('accountNumber')} fullWidth />
            <TextField label="Account Holder Name" value={formValues.accountHolderName} onChange={handleFormChange('accountHolderName')} fullWidth />
            <TextField label="IFSC Code" value={formValues.ifscCode} onChange={handleFormChange('ifscCode')} fullWidth />
            <TextField label="Bank Name" value={formValues.bankName} onChange={handleFormChange('bankName')} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="payment-config-percentage-label">Percentage</InputLabel>
              <Select
                labelId="payment-config-percentage-label"
                label="Percentage"
                value={formValues.percentage}
                onChange={handleFormChange('percentage')}
              >
                {Array.from({ length: 100 }, (_, index) => {
                  const value = String(index + 1);
                  return (
                    <MenuItem key={value} value={value}>
                      {value}%
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="payment-config-active-label">Active</InputLabel>
              <Select labelId="payment-config-active-label" label="Active" value={formValues.active} onChange={handleFormChange('active')}>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
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
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
