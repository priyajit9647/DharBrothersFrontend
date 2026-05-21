import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import MainCard from 'components/MainCard';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import { listCustomerOrders, getCustomerPortalOrderPaymentStatus, reInitiateCustomerPayment, fetchCustomerPortalData } from 'api/customerPortal';

function StatusChip({ label }) {
  const key = String(label || '').toLowerCase();
  const variant = key.includes('approve') || key.includes('approved')
    ? 'success'
    : key.includes('pending') || key.includes('ready')
    ? 'warning'
    : key.includes('review')
    ? 'info'
    : 'default';
  return (
    <Chip
      label={label}
      color={variant}
      size="small"
      sx={{ fontWeight: 700, borderRadius: '999px', textTransform: 'none', px: 1, height: 28 }}
    />
  );
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [reInitiatingOrderId, setReInitiatingOrderId] = useState(null);
  const [checkingOrderId, setCheckingOrderId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Derived profile fields for display
  const profileName = profile?.fullName || profile?.name || profile?.displayName || profile?.email || null;
  const mobileNumber = profile?.mobile || profile?.mobileNumber || profile?.phone || profile?.phoneNumber || profile?.contact || profile?.telephone || null;
  const whatsappNumber = profile?.whatsapp || profile?.whatsappNumber || profile?.whatsappPhone || profile?.whatsApp || profile?.whats_app || null;
  const address = (() => {
    if (!profile) return null;
    if (profile.address && typeof profile.address === 'string') return profile.address;
    const parts = [];
    if (profile.addressLine1) parts.push(profile.addressLine1);
    if (profile.addressLine2) parts.push(profile.addressLine2);
    if (profile.city) parts.push(profile.city);
    if (profile.state) parts.push(profile.state);
    if (profile.pincode || profile.zip) parts.push(profile.pincode || profile.zip);
    if (parts.length) return parts.join(', ');
    if (profile.shippingAddress) return profile.shippingAddress;
    if (Array.isArray(profile.addresses) && profile.addresses.length > 0) {
      const a = profile.addresses[0];
      return [a.addressLine1, a.addressLine2, a.city, a.state, a.pincode].filter(Boolean).join(', ');
    }
    return null;
  })();

  const orderRef = 'ORD-2026-00123';
  const status = 'Ready for Approval';

  useEffect(() => {
    let mounted = true;
    setOrdersLoading(true);

    (async () => {
      try {
        const resp = await listCustomerOrders();
        const data = Array.isArray(resp) ? resp : resp?.data || resp?.orders || [];

        // Move the first 'Order-Created' to the top
        const idx = (data || []).findIndex((o) => o?.currentStage === 'Order-Created');
        const ordered = Array.from(data || []);
        if (idx > -1) {
          const [item] = ordered.splice(idx, 1);
          ordered.unshift(item);
        }

        if (mounted) setOrders(ordered);
      } catch (err) {
        if (mounted) setOrdersError(err?.message || 'Unable to load orders');
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setProfileLoading(true);
        const resp = await fetchCustomerPortalData();
        const data = resp?.data || resp || resp?.profile || resp?.user || null;
        if (mounted) setProfile(data);
      } catch (err) {
        if (mounted) setProfileError(err?.message || 'Unable to load profile');
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ backgroundColor: 'grey.100', minHeight: '100vh', px: { xs: 2, sm: 4 }, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard
              title="Order List"
              contentSX={{ p: 0 }}
              sx={{ boxShadow: 2, borderRadius: 3, transition: 'all 120ms ease' }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>My Profile</Typography>

                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : ordersError ? (
                  <Box sx={{ p: 2 }}>
                    <Typography color="error">{ordersError}</Typography>
                  </Box>
                ) : (
                  <>
                    {profileLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={160} height={28} />
                          <Skeleton variant="text" width={120} height={18} />
                        </Box>
                      </Box>
                    ) : profile ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{String((profileName || 'U')[0] || 'U')}</Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {profileName || 'Customer'}
                          </Typography>
                          {profile?.email && <Typography variant="caption" color="text.secondary">{profile.email}</Typography>}

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 90 }}>Mobile:</Typography>
                            <Typography variant="body2">{mobileNumber || '-'}</Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 90 }}>WhatsApp:</Typography>
                            <Typography variant="body2">{whatsappNumber || '-'}</Typography>
                          </Box>

                          {address && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{address}</Typography>
                          )}
                        </Box>
                      </Box>
                    ) : profileError ? (
                      <Typography color="error" sx={{ mb: 2 }}>{profileError}</Typography>
                    ) : null}

                    <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell>Expected Delivery</TableCell>
                        <TableCell>Shipping Address</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell align="right">Pages</TableCell>
                        <TableCell align="center">Payment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No orders found</TableCell>
                        </TableRow>
                      ) : (
                        orders.map((o, idx) => {
                          const stage = o.currentStage;
                          const sx =
                            stage === 'Order-Created'
                              ? { bgcolor: (theme) => alpha(theme.palette.success.main, 0.12) }
                              : stage === 'Order-Complete'
                              ? { bgcolor: 'grey.100', color: 'text.secondary' }
                              : stage === 'Ready-To-Dispatch'
                              ? { bgcolor: (theme) => alpha(theme.palette.info.main, 0.12) }
                              : {};

                          return (
                            <TableRow
                              key={o.orderId || idx}
                              sx={{ ...sx, cursor: 'pointer' }}
                              onClick={() => navigate(`/customer/orders/view/${o.orderId}`)}
                            >
                              <TableCell>{o.orderId}</TableCell>
                              <TableCell><StatusChip label={o.currentStage} /></TableCell>
                              <TableCell>{o.expectedDeliveryDate}</TableCell>
                              <TableCell>{o.shippingAddress}</TableCell>
                              <TableCell>{o.branchName}</TableCell>
                              <TableCell align="right">{o.totalPages ?? '-'}</TableCell>
                              <TableCell align="center">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                      <Chip label={o.paymentStatus || '-'} size="small" />
                                      {o.paymentStatus === 'PENDING' && (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="primary"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!o.orderId) return;
                                            try {
                                              setCheckingOrderId(o.orderId);
                                              const resp = await getCustomerPortalOrderPaymentStatus(o.orderId);
                                              // refresh orders list after check
                                              const listResp = await listCustomerOrders();
                                              const data = Array.isArray(listResp) ? listResp : listResp?.data || listResp?.orders || [];
                                              setOrders(data);
                                              // simple feedback
                                              // eslint-disable-next-line no-alert
                                              alert('Payment status: ' + (resp?.paymentStatus || JSON.stringify(resp)));
                                            } catch (err) {
                                              // eslint-disable-next-line no-alert
                                              alert(err?.message || 'Unable to check payment status');
                                            } finally {
                                              setCheckingOrderId(null);
                                            }
                                          }}
                                          disabled={checkingOrderId === o.orderId}
                                        >
                                          {checkingOrderId === o.orderId ? <CircularProgress size={14} color="inherit" /> : 'Check Payment'}
                                        </Button>
                                      )}
                                      {o.paymentStatus === 'FAILED' && (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="primary"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!o.orderId) return;
                                            try {
                                              setReInitiatingOrderId(o.orderId);
                                              await reInitiateCustomerPayment(o.orderId);
                                              // refresh orders list after re-initiation
                                              const resp = await listCustomerOrders();
                                              const data = Array.isArray(resp) ? resp : resp?.data || resp?.orders || [];
                                              setOrders(data);
                                              // simple feedback
                                              // eslint-disable-next-line no-alert
                                              alert('Re-payment initiated successfully.');
                                            } catch (err) {
                                              // eslint-disable-next-line no-alert
                                              alert(err?.message || 'Unable to re-initiate payment');
                                            } finally {
                                              setReInitiatingOrderId(null);
                                            }
                                          }}
                                          disabled={reInitiatingOrderId === o.orderId}
                                        >
                                          {reInitiatingOrderId === o.orderId ? <CircularProgress size={14} color="inherit" /> : 'Re-Payment'}
                                        </Button>
                                      )}
                                    </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                    </Table>
                  </>
                )}
              </Box>
            </MainCard>
          </Grid>

          {/* Removed additional sections; only Order List is shown per request */}
        </Grid>
      </Box>
    </Box>
  );
}
