import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MasterList from 'sections/admin/masters/MasterList';
import { createBranch, editBranch, getBranches, toggleBranchActive } from 'api/branch';
import useAccess from 'hooks/useAccess';

const BRANCH_TYPE_OPTIONS = [
  { value: 'MANUFACTURING_UNIT', label: 'Manufacturing Unit' },
  { value: 'LOOK_AND_FEEL_STORE', label: 'Look And Feel Store' }
];

// ==============================|| BMS - BRANCHES & TEAMS (ADMIN) ||============================== //

export default function Branches() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({
    code: '',
    name: '',
    branchType: '',
    address: '',
    pincode: '',
    keyContactPersonName: '',
    keyContactPersonPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBranches = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBranches();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            name: item.name,
            code: item.code,
            branchType: item.branchType,
            address: item.address,
            pincode: item.pincode,
            keyContactPersonName: item.keyContactPersonName,
            keyContactPersonPhone: item.keyContactPersonPhone,
            active: item.active
          }))
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const { hasAccess } = useAccess();
  const canCreate = hasAccess('BRANCH_CREATE') || hasAccess('BRANCH_MGMT');
  const canEdit = hasAccess('BRANCH_EDIT') || hasAccess('BRANCH_MGMT');
  const canToggle = hasAccess('BRANCH_TOGGLE_ACTIVE') || hasAccess('BRANCH_MGMT');

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({
      code: '',
      name: '',
      branchType: '',
      address: '',
      pincode: '',
      keyContactPersonName: '',
      keyContactPersonPhone: ''
    });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      code: row.code || '',
      name: row.name || '',
      branchType: row.branchType || '',
      address: row.address || '',
      pincode: row.pincode || '',
      keyContactPersonName: row.keyContactPersonName || '',
      keyContactPersonPhone: row.keyContactPersonPhone || ''
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
      [field]: field === 'code' ? value.toUpperCase() : value
    }));
  };

  const handleSave = async () => {
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    const branchType = formValues.branchType.trim();
    const address = formValues.address.trim();
    const pincode = formValues.pincode.trim();
    const keyContactPersonName = formValues.keyContactPersonName.trim();
    const keyContactPersonPhone = formValues.keyContactPersonPhone.trim();

    if (!code || !name || !branchType) {
      setError('Code, Name and Branch Type are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editBranch(editingRow.id, {
          code,
          name,
          branchType,
          address,
          pincode,
          keyContactPersonName,
          keyContactPersonPhone
        });
      } else {
        await createBranch({
          code,
          name,
          branchType,
          address,
          pincode,
          keyContactPersonName,
          keyContactPersonPhone
        });
      }

      await loadBranches();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await toggleBranchActive(row.id, active);
    } catch (e) {
      // Revert on failure and show error
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(e.message || 'Failed to update active status');
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
            title=" "
            columns={[
              { id: 'name', label: 'Branch Name' },
              { id: 'code', label: 'Code' },
              { id: 'branchType', label: 'Branch Type' },
              { id: 'address', label: 'Address' },
              { id: 'pincode', label: 'Pincode' },
              { id: 'keyContactPersonName', label: 'Key Contact Person' },
              { id: 'keyContactPersonPhone', label: 'Contact Phone' }
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
            onToggleActive={handleToggleActive}
            loading={loading}
            showCreateButton={canCreate}
            showActionsColumn={canEdit}
            showActiveColumn={canToggle}
            activeRight="BRANCHES_TOGGLE_ACTIVE"
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Branch' : 'Create Branch'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Code"
              value={formValues.code}
              onChange={handleFormChange('code')}
              fullWidth
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Branch Name"
              value={formValues.name}
              onChange={handleFormChange('name')}
              fullWidth
            />
            <TextField
              select
              label="Branch Type"
              value={formValues.branchType}
              onChange={handleFormChange('branchType')}
              fullWidth
            >
              {BRANCH_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Address"
              value={formValues.address}
              onChange={handleFormChange('address')}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Pincode"
              value={formValues.pincode}
              onChange={handleFormChange('pincode')}
              fullWidth
            />
            <TextField
              label="Key Contact Person Name"
              value={formValues.keyContactPersonName}
              onChange={handleFormChange('keyContactPersonName')}
              fullWidth
            />
            <TextField
              label="Key Contact Person Phone"
              value={formValues.keyContactPersonPhone}
              onChange={handleFormChange('keyContactPersonPhone')}
              fullWidth
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
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
