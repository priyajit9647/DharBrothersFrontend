import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import MasterList from 'sections/admin/masters/MasterList';
import { getBranches } from 'api/branch';
import { getProcessStages } from 'api/processStage';
import { createProcessStageAssignment, editProcessStageAssignment, getProcessStageAssignments } from 'api/processStageAssignment';
import { getActiveUsersByBranch } from 'api/user';

// ==============================|| MASTER - PROCESS STAGE ASSIGNMENT ||============================== //

export default function ProcessStageAssignment() {
  const [branches, setBranches] = useState([]);
  const [stages, setStages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedStageIds, setSelectedStageIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [noOfDays, setNoOfDays] = useState('');

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await getProcessStageAssignments();
      const items = Array.isArray(data) ? data : [];
      setRows(items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load process stage assignments', err);
      setError(err?.message || 'Failed to load process stage assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await getBranches();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setBranches(items);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load branches', err);
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    const loadStages = async () => {
      try {
        setLoadingStages(true);
        const data = await getProcessStages();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setStages(items);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load process stages', err);
      } finally {
        setLoadingStages(false);
      }
    };
    loadStages();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedBranchId) {
        setUsers([]);
        setSelectedUserId('');
        return;
      }
      try {
        setLoadingUsers(true);
        const data = await getActiveUsersByBranch(selectedBranchId);
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setUsers(items);
        if (!items.some((item) => String(item.id) === String(selectedUserId))) {
          setSelectedUserId(items.length > 0 ? String(items[0].id) : '');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users for branch', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, rows]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setSelectedBranchId('');
    setSelectedStageIds([]);
    setSelectedUserId('');
    setNoOfDays('');
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setSelectedBranchId(String(row.branchId || ''));
    // support row.stageId being a single id or an array
    const stageIdsFromRow = row.stageId == null ? [] : Array.isArray(row.stageId) ? row.stageId.map(String) : [String(row.stageId)];
    setSelectedStageIds(stageIdsFromRow);
    setSelectedUserId(String(row.userId || ''));
    setNoOfDays(row.noOfDays || '');
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSave = async () => {
    const branchId = Number(selectedBranchId);
    const stageIds = Array.isArray(selectedStageIds) ? selectedStageIds.map((s) => Number(s)) : [Number(selectedStageIds)];
    const userId = String(selectedUserId).trim();
    const daysNum = Number(String(noOfDays).trim());

    if (!selectedBranchId || Number.isNaN(branchId)) {
      setError('Please select a branch');
      return;
    }
    if (!selectedStageIds || selectedStageIds.length === 0 || stageIds.some((s) => Number.isNaN(s))) {
      setError('Please select at least one valid process stage');
      return;
    }
    if (!userId) {
      setError('Please select a user');
      return;
    }
    if (!String(noOfDays).trim() || Number.isNaN(daysNum)) {
      setError('No of days is required and must be a number');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingRow?.id) {
        await editProcessStageAssignment(editingRow.id, { stageId: stageIds, userId, noOfDays: daysNum, branchId });
      } else {
        await createProcessStageAssignment({ stageId: stageIds, userId, noOfDays: daysNum, branchId });
      }
      await loadAssignments();
      setDialogOpen(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save process stage assignment', err);
      setError(err?.message || 'Failed to save process stage assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    if (row?.disableToggle) return;
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      // Use the edit endpoint to toggle active — include existing assignment fields.
      await editProcessStageAssignment(row.id, {
        stageId: row.stageId,
        userId: row.userId,
        noOfDays: row.noOfDays,
        branchId: row.branchId,
        active
      });
    } catch (err) {
      // Revert on failure and show error
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(err?.message || 'Failed to update active status');
    }
  };

  const loading = loadingBranches || loadingStages || loadingUsers || loadingAssignments;

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
            title={'\u200b'}
            columns={[
              { id: 'branchName', label: 'Branch' },
              { id: 'stageName', label: 'Process Stage' },
              { id: 'userName', label: 'User' },
              { id: 'noOfDays', label: 'No Of Days' }
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
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <FormControl fullWidth size="small" disabled={loadingBranches}>
              <InputLabel id="branch-label">Branch</InputLabel>
              <Select
                labelId="branch-label"
                label="Branch"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={loadingStages}>
              <InputLabel id="stage-label">Process Stage</InputLabel>
              <Select
                labelId="stage-label"
                label="Process Stage"
                multiple
                value={selectedStageIds}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedStageIds(typeof value === 'string' ? value.split(',') : value);
                }}
                renderValue={(selected) => {
                  const sel = Array.isArray(selected) ? selected : [selected];
                  return sel
                    .map((id) => {
                      const s = stages.find((st) => String(st.id) === String(id));
                      return s ? (s.stageName || s.code || `Stage ${s.id}`) : id;
                    })
                    .join(', ');
                }}
              >
                {stages.map((stage) => (
                  <MenuItem key={stage.id} value={String(stage.id)}>
                    {stage.stageName || stage.code || `Stage ${stage.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={loadingUsers || !selectedBranchId}>
              <InputLabel id="user-label">User</InputLabel>
              <Select
                labelId="user-label"
                label="User"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map((user) => {
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                  const label = user.userName || fullName || user.email || `User ${user.id}`;
                  return (
                    <MenuItem key={user.id} value={String(user.id)}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="No Of Days"
              value={noOfDays}
              onChange={(e) => setNoOfDays(e.target.value)}
              placeholder="e.g. 7"
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
          <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : editingRow ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}