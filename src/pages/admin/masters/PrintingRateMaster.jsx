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

import MasterList from 'sections/admin/masters/MasterList';
import useAccess from 'hooks/useAccess';
import { getPapers } from 'api/paper';
import { getPrintColors } from 'api/printColor';
import { createPrintingRate, editPrintingRate, getPrintingRates, togglePrintingRateActive } from 'api/printingRate';

// ==============================|| MASTER - PRINTING RATE ||============================== //

const PRINTING_COLOUR_OPTIONS = [
  { value: 'BLACK_AND_WHITE', label: 'Black & White' },
  { value: 'COLOUR', label: 'Colour' }
];

export default function PrintingRateMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ paperId: '', printColorId: '', printingColour: 'BLACK_AND_WHITE', firstCopyRate: '', additionalCopyRate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [papers, setPapers] = useState([]);
  const [printColors, setPrintColors] = useState([]);

  const loadLookups = async () => {
    try {
      const [paperData, colorData] = await Promise.all([getPapers(), getPrintColors()]);
      const normalizedPapers = Array.isArray(paperData)
        ? paperData.map((item, index) => ({
            id: item.id ?? index + 1,
            name: item.name,
            code: item.code
          }))
        : [];

      const normalizedColors = Array.isArray(colorData)
        ? colorData.map((item, index) => ({
            id: item.id ?? index + 1,
            name: item.name,
            code: item.code
          }))
        : [];

      setPapers(normalizedPapers);
      setPrintColors(normalizedColors);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load lookup data for printing rates', e);
    }
  };

  const loadPrintingRates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPrintingRates();
      const normalized = Array.isArray(data)
        ? data.map((item, index) => ({
            id: item.id ?? index + 1,
            paperId: item.paperId,
            paperName: item.paperName,
            printColorId: item.printColorId,
            printColorName: item.printColorName,
            printingColour: item.printingColour,
            firstCopyRate: item.firstCopyRate,
            additionalCopyRate: item.additionalCopyRate,
            active: item.active
          }))
        : [];
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load printing rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
    loadPrintingRates();
  }, []);

  const { hasAccess } = useAccess();
  const canCreate = hasAccess('PRINTING_RATES_CREATE');
  const canEdit = hasAccess('PRINTING_RATES_EDIT');
  const canToggle = hasAccess('PRINTING_RATES_TOGGLE_ACTIVE');

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const paperMap = useMemo(() => {
    const map = new Map();
    papers.forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [papers]);

  const colorMap = useMemo(() => {
    const map = new Map();
    printColors.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [printColors]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setFormValues({ paperId: '', printColorId: '', printingColour: 'BLACK_AND_WHITE', firstCopyRate: '', additionalCopyRate: '' });
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues({
      paperId: row.paperId ?? '',
      printColorId: row.printColorId ?? '',
      printingColour: row.printingColour || 'BLACK_AND_WHITE',
      firstCopyRate: row.firstCopyRate ?? '',
      additionalCopyRate: row.additionalCopyRate ?? ''
    });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAndNormalize = () => {
    const paperIdRaw = formValues.paperId;
    const printColorIdRaw = formValues.printColorId;
    const printingColour = formValues.printingColour || 'BLACK_AND_WHITE';
    const firstRaw = String(formValues.firstCopyRate).trim();
    const additionalRaw = String(formValues.additionalCopyRate).trim();

    const paperId = paperIdRaw ? Number(paperIdRaw) : null;
    const printColorId = printColorIdRaw ? Number(printColorIdRaw) : null;
    const firstCopyRate = firstRaw ? Number(firstRaw) : null;
    const additionalCopyRate = additionalRaw ? Number(additionalRaw) : null;

    if (!paperId || Number.isNaN(paperId)) {
      return { error: 'Paper is required' };
    }

    if (!printColorId || Number.isNaN(printColorId)) {
      return { error: 'Print Color is required' };
    }

    if (!printingColour) {
      return { error: 'Printing Colour is required' };
    }

    if (firstCopyRate == null || Number.isNaN(firstCopyRate) || firstCopyRate <= 0) {
      return { error: 'First copy rate must be a number greater than 0' };
    }

    if (additionalCopyRate == null || Number.isNaN(additionalCopyRate) || additionalCopyRate <= 0) {
      return { error: 'Additional copy rate must be a number greater than 0' };
    }

    return {
      values: {
        paperId,
        printColorId,
        printingColour,
        firstCopyRate,
        additionalCopyRate,
        active: editingRow?.active ?? true
      }
    };
  };

  const handleSave = async () => {
    const { error: validationError, values } = validateAndNormalize();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRow && editingRow.id) {
        await editPrintingRate(editingRow.id, values);
      } else {
        await createPrintingRate(values);
      }

      await loadPrintingRates();
      setDialogOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save printing rate');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row, active) => {
    // Optimistic UI update
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));

    try {
      await togglePrintingRateActive(row.id, active);
    } catch (e) {
      // Revert on failure and show error
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: !active } : item)));
      setError(e.message || 'Failed to update active status');
    }
  };

  const resolvePaperName = (paperId) => {
    const entry = paperMap.get(paperId);
    if (!entry) return '-';
    return entry.name || '-';
  };

  const resolveColorName = (colorId) => {
    const entry = colorMap.get(colorId);
    if (!entry) return '-';
    return entry.name || '-';
  };

  const resolvePrintingColourLabel = (value) => {
    const option = PRINTING_COLOUR_OPTIONS.find((o) => o.value === value);
    return option ? option.label : value || '-';
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
              {
                id: 'paperName',
                label: 'Paper',
                render: (row) => row.paperName || '-'
              },
              {
                id: 'printColorName',
                label: 'Print Color',
                render: (row) => row.printColorName || '-'
              },
              {
                id: 'printingColour',
                label: 'Printing Colour',
                render: (row) => resolvePrintingColourLabel(row.printingColour)
              },
              {
                id: 'firstCopyRate',
                label: 'First Copy Rate',
                render: (row) => (row.firstCopyRate != null ? row.firstCopyRate.toFixed(2) : '-')
              },
              {
                id: 'additionalCopyRate',
                label: 'Additional Copy Rate',
                render: (row) => (row.additionalCopyRate != null ? row.additionalCopyRate.toFixed(2) : '-')
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
            onToggleActive={handleToggleActive}
            showCreateButton={canCreate}
            showActionsColumn={canEdit}
            showActiveColumn={canToggle}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRow ? 'Edit Printing Rate' : 'Create Printing Rate'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              select
              label="Paper"
              value={formValues.paperId}
              onChange={handleFormChange('paperId')}
              fullWidth
            >
              {papers.map((paper) => (
                <MenuItem key={paper.id} value={paper.id}>
                  {resolvePaperName(paper.id)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Print Color"
              value={formValues.printColorId}
              onChange={handleFormChange('printColorId')}
              fullWidth
            >
              {printColors.map((color) => (
                <MenuItem key={color.id} value={color.id}>
                  {resolveColorName(color.id)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Printing Colour"
              value={formValues.printingColour}
              onChange={handleFormChange('printingColour')}
              fullWidth
            >
              {PRINTING_COLOUR_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="First Copy Rate"
              type="number"
              value={formValues.firstCopyRate}
              onChange={handleFormChange('firstCopyRate')}
              fullWidth
              helperText="Must be greater than 0"
            />
            <TextField
              label="Additional Copy Rate"
              type="number"
              value={formValues.additionalCopyRate}
              onChange={handleFormChange('additionalCopyRate')}
              fullWidth
              helperText="Must be greater than 0"
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
