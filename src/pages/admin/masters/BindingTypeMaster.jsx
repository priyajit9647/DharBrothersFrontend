import { useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';

import MasterList from 'sections/admin/masters/MasterList';

export default function BindingTypeMaster() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([
    { id: 1, name: 'Hard Binding', code: 'HARD', description: 'Standard hard binding', active: true },
    { id: 2, name: 'Soft Binding', code: 'SOFT', description: 'Soft cover binding', active: true },
    { id: 3, name: 'Synopsis', code: 'SYN', description: 'Synopsis binding', active: false }
  ]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rowsPerPage, rows]);

  const handleCreate = () => {
    const nextId = rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    const newRow = {
      id: nextId,
      name: `New Binding ${nextId}`,
      code: `NEW_${nextId}`,
      description: 'New binding type',
      active: true
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleEdit = (row) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, name: `${row.name} (Edited)` } : item)));
  };

  const handleToggleActive = (row, active) => {
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active } : item)));
  };

  return (
    <Grid container sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
        <MasterList
          title="Binding Types"
          description="Manage the list of available binding types, toggle their active status and edit existing records."
          columns={[
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
            { id: 'description', label: 'Description' }
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
          onCreate={handleCreate}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />
      </Grid>
    </Grid>
  );
}

