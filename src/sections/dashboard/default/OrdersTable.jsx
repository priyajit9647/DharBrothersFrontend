import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { getRecentOrders } from 'api/orders';

const headCells = [
  {
    id: 'order_no',
    align: 'left',
    disablePadding: false,
    label: 'Order #'
  },
  {
    id: 'order_name',
    align: 'left',
    disablePadding: false,
    label: 'Order Name'
  },
  {
    id: 'status',
    align: 'center',
    disablePadding: false,
    label: 'Status'
  },
  {
    id: 'quantity',
    align: 'right',
    disablePadding: false,
    label: 'Qty'
  },
  {
    id: 'amount',
    align: 'right',
    disablePadding: false,
    label: 'Amount'
  },
  {
    id: 'createdDate',
    align: 'left',
    disablePadding: false,
    label: 'Created'
  }
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function getStatusMeta(status) {
  const normalized = String(status ?? '').toUpperCase();

  if (normalized.includes('PENDING')) {
    return { color: 'warning', label: 'Pending' };
  }

  if (normalized.includes('COMPLETED')) {
    return { color: 'success', label: 'Completed' };
  }

  if (normalized.includes('DELIVERED')) {
    return { color: 'info', label: 'Delivered' };
  }

  if (normalized.includes('READY')) {
    return { color: 'primary', label: 'Ready for Dispatch' };
  }

  if (normalized.includes('CANCEL') || normalized.includes('FAILED') || normalized.includes('REJECTED')) {
    return { color: 'error', label: 'Failed' };
  }

  return { color: 'default', label: status ? String(status) : 'Unknown' };
}

function getOrderId(order) {
  return order?.trackingNumber ?? order?.orderId ?? order?.orderNo ?? order?.id ?? order?.code ?? 'N/A';
}

function getOrderLabel(order) {
  return order?.orderName ?? order?.title ?? order?.name ?? 'N/A';
}

function getStatusLabel(order) {
  return order?.status ?? order?.stage ?? order?.orderStageName ?? 'Unknown';
}

function getQuantity(order) {
  return order?.totalQuantity ?? order?.quantity ?? '—';
}

function formatAmount(amount) {
  if (amount == null || amount === '') {
    return '—';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return `₹${String(amount)}`;
  }

  return `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadRecentOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getRecentOrders({
          page: 0,
          size: 10,
          sort: ['createdDate,DESC']
        });

        if (!active) return;

        setOrders(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!active) return;

        console.error(fetchError);
        setError('Failed to load recent orders');
        setOrders([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecentOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box>
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
        <Table aria-labelledby="recent-orders-table">
          <OrderTableHead order="asc" orderBy="order_no" />
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Loading recent orders...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!loading && error && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">No recent orders found.</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !error &&
              orders.map((row, index) => {
                const labelId = `recent-order-row-${index}`;
                const statusMeta = getStatusMeta(getStatusLabel(row));

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    tabIndex={-1}
                    key={`${getOrderId(row)}-${index}`}
                  >
                    <TableCell component="th" id={labelId} scope="row">
                      <Link color="secondary" underline="hover">
                        {getOrderId(row)}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="body2" noWrap>
                        {getOrderLabel(row)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={statusMeta.label} color={statusMeta.color} size="small" variant="soft" />
                    </TableCell>
                    <TableCell align="right">{getQuantity(row)}</TableCell>
                    <TableCell align="right">{formatAmount(row.totalAmount ?? row.amount ?? row.netAmount)}</TableCell>
                    <TableCell>{formatDate(row.createdDate ?? row.createdAt ?? row.orderDate)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

OrderTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };
