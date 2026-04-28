import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import MainCard from 'components/MainCard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { getBranches } from 'api/branch';
import { getProcessStages } from 'api/processStage';
import { createProcessStageAssignment, editProcessStageAssignment } from 'api/processStageAssignment';
import { getActiveUsersByBranch } from 'api/user';

// ==============================|| MASTER - PROCESS STAGE ASSIGNMENT ||============================== //

export default function ProcessStageAssignment() {
  const [branches, setBranches] = useState([]);
  const [stages, setStages] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [assignmentId, setAssignmentId] = useState('');

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    const loadStages = async () => {
      try {
        setLoadingStages(true);
        setError('');
        const data = await getProcessStages();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setStages(items);
        if (!selectedStageId && items.length > 0) {
          setSelectedStageId(String(items[0].id));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load process stages', err);
        setError(err?.message || 'Failed to load process stages');
      } finally {
        setLoadingStages(false);
      }
    };

    loadStages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedBranchId) return;

      try {
        setLoadingUsers(true);
        setError('');
        const data = await getActiveUsersByBranch(selectedBranchId);
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setUsers(items);
        if (!items.some((item) => String(item.id) === String(selectedUserId))) {
          setSelectedUserId(items.length > 0 ? String(items[0].id) : '');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users for branch', err);
        setError(err?.message || 'Failed to load users for this branch');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const selectedBranchName = useMemo(
    () => branches.find((branch) => String(branch.id) === String(selectedBranchId))?.name || '',
    [branches, selectedBranchId]
  );

  const selectedStageName = useMemo(
    () => stages.find((stage) => String(stage.id) === String(selectedStageId))?.stageName || '',
    [selectedStageId, stages]
  );

  const selectedUserLabel = useMemo(() => {
    const user = users.find((item) => String(item.id) === String(selectedUserId));
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return user?.userName || fullName || user?.email || '';
  }, [selectedUserId, users]);

  const handleSubmit = async () => {
    const stageId = Number(selectedStageId);
    const userId = String(selectedUserId).trim();
    const type = assignmentType.trim();
    const id = assignmentId.trim();

    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    if (!selectedStageId || Number.isNaN(stageId)) {
      setError('Please select a valid process stage');
      return;
    }

    if (!userId) {
      setError('Please select a user');
      return;
    }

    if (!type) {
      setError('Assignment type is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (id) {
        // Edit existing assignment
        await editProcessStageAssignment(id, {
          stageId,
          userId,
          assignmentType: type
        });
        setSuccess('Process stage assignment updated successfully.');
      } else {
        // Create new assignment
        await createProcessStageAssignment({
          stageId,
          userId,
          assignmentType: type
        });
        setSuccess('Process stage assignment created successfully.');
      }

      setAssignmentType('');
      setAssignmentId('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save process stage assignment', err);
      setError(err?.message || 'Failed to save process stage assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleClearForm = () => {
    setAssignmentId('');
    setAssignmentType('');
    setError('');
    setSuccess('');
  };

  const loading = loadingBranches || loadingStages || loadingUsers;

  return (
    <Grid container spacing={2} sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12}>
        <Typography variant="h5">Process Stage Assignment</Typography>
        <Typography variant="body2" color="text.secondary">
          Assign an active user to a process stage using the backend create endpoint.
        </Typography>
        {error && (
          <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
            {success}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12} lg={8}>
        <MainCard title="Create Assignment">
          <Stack spacing={2}>
            <FormControl fullWidth size="small" disabled={loadingBranches}>
              <InputLabel id="assignment-branch-label">Branch</InputLabel>
              <Select
                labelId="assignment-branch-label"
                label="Branch"
                value={selectedBranchId}
                onChange={(event) => setSelectedBranchId(event.target.value)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={loadingStages}>
              <InputLabel id="assignment-stage-label">Process Stage</InputLabel>
              <Select
                labelId="assignment-stage-label"
                label="Process Stage"
                value={selectedStageId}
                onChange={(event) => setSelectedStageId(event.target.value)}
              >
                {stages.map((stage) => (
                  <MenuItem key={stage.id} value={String(stage.id)}>
                    {stage.stageName || stage.code || `Stage ${stage.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={loadingUsers || !selectedBranchId}>
              <InputLabel id="assignment-user-label">User</InputLabel>
              <Select
                labelId="assignment-user-label"
                label="User"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
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
              label="Assignment Type"
              value={assignmentType}
              onChange={(event) => setAssignmentType(event.target.value)}
              placeholder="e.g. MANUAL or AUTO"
            />

            <TextField
              fullWidth
              size="small"
              label="Assignment ID (for editing)"
              value={assignmentId}
              onChange={(event) => setAssignmentId(event.target.value)}
              placeholder="Leave empty to create new, fill to edit existing"
            />

            <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
              <Button variant="contained" onClick={handleSubmit} disabled={saving || loading}>
                {saving ? 'Saving...' : assignmentId ? 'Update Assignment' : 'Create Assignment'}
              </Button>
              {assignmentId && (
                <Button variant="outlined" onClick={handleClearForm} disabled={saving}>
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={12} lg={4}>
        <MainCard title="Current Selection">
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Branch: {selectedBranchName || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stage: {selectedStageName || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              User: {selectedUserLabel || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active users are loaded from the selected branch.
            </Typography>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
