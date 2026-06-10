import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { EditTwoTone } from '@ant-design/icons';
import { Plus } from 'lucide-react';

import MainCard from 'components/MainCard';
import useAccess from 'hooks/useAccess';

function MasterList({
  title,
  description,
  columns,
  rows,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onCreate,
  onEdit,
  onToggleActive,
  loading,
  showCreateButton,
  createLabel,
  showActiveColumn,
  showActionsColumn,
  activeRight
}) {
  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(value);
    }
  };

  const displayRows = rows || [];
  const count = typeof totalCount === 'number' ? totalCount : displayRows.length;

  const { hasAccess } = useAccess();
  const hasActiveColumn = showActiveColumn !== false && (!activeRight || hasAccess(activeRight));
  // If the consumer already provided a custom column with id 'actions',
  // avoid rendering the built-in actions icon column to prevent duplicates.
  const hasActionsColumn = showActionsColumn !== false && !columns.some((c) => String(c.id).toLowerCase() === 'actions');
  const extraColumns = (hasActiveColumn ? 1 : 0) + (hasActionsColumn ? 1 : 0);

  return (
    <MainCard
      title={title}
      secondary={
        showCreateButton !== false && onCreate ? (
          <Button variant="contained" size="small" onClick={onCreate} disabled={loading} startIcon={<Plus size={14} />}>
            {createLabel || 'Create'}
          </Button>
        ) : null
      }
      sx={{ width: '100%' }}
      contentSX={{ p: 0 }}
    >
      {description && (
        <Box px={3} pt={2} pb={1}>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      )}

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table size="small" aria-label={`${title} table`} sx={{ width: '100%', minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align || 'left'} sx={column.sx}>
                  {column.label}
                </TableCell>
              ))}
              {hasActiveColumn && <TableCell align="center">Active</TableCell>}
              {hasActionsColumn && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + extraColumns} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + extraColumns} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <TableRow hover key={row.id || row.code || row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                  {hasActiveColumn && (
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={!!row.active}
                        onChange={(event) => {
                          if (row?.disableToggle) return;
                          onToggleActive && onToggleActive(row, event.target.checked);
                        }}
                        color="primary"
                        disabled={!!row.disableToggle}
                      />
                    </TableCell>
                  )}
                  {hasActionsColumn && (
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit && onEdit(row)}
                          aria-label="Edit"
                          disabled={!!row.disableEdit}
                        >
                          <EditTwoTone style={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box px={2} py={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </MainCard>
  );
}

MasterList.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'right', 'center']),
      sx: PropTypes.object,
      render: PropTypes.func
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object),
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onCreate: PropTypes.func,
  onEdit: PropTypes.func,
  onToggleActive: PropTypes.func,
  loading: PropTypes.bool,
  showCreateButton: PropTypes.bool,
  createLabel: PropTypes.string,
  showActiveColumn: PropTypes.bool,
  activeRight: PropTypes.string,
  showActionsColumn: PropTypes.bool
};

MasterList.defaultProps = {
  description: undefined,
  rows: [],
  page: 0,
  rowsPerPage: 10,
  totalCount: undefined,
  onPageChange: undefined,
  onRowsPerPageChange: undefined,
  onCreate: undefined,
  onEdit: undefined,
  onToggleActive: undefined,
  loading: false,
  showCreateButton: true,
  createLabel: 'Create',
  showActiveColumn: true,
  activeRight: undefined,
  showActionsColumn: true
};

export default MasterList;
