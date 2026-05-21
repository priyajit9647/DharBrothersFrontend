import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import MainCard from 'components/MainCard';

import { getOrderById, confirmOrderReceived, adminConfirmOrderReceived } from 'api/orders';
import { authorizedFetchRaw } from 'api/auth';
import { getCustomerFeedbackByOrderId } from 'api/customerPortal';

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function isOrderConfirmAllowed(order) {
  if (!order) return false;
  const candidates = [order.orderStatus, order.currentStage, order.orderStageName, order.stage, order.status];
  const normalized = candidates.filter(Boolean).map((v) => String(v).toUpperCase()).join(' ');
  if (!normalized) return false;
  return normalized.includes('COMPLET') || normalized.includes('DELIVER');
}

function getDownloadHref(path) {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return null;
}

// renderDocumentRow removed — rendering is handled inside the component so it can call downloadDocument

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError('');

      try {
        const response = await getOrderById(orderId);
        if (!mounted) return;
        setOrder(response || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Unable to load order details.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadOrder();

    const loadFeedback = async () => {
      if (!orderId) return;
      setFeedbackLoading(true);
      setFeedbackError(null);
      try {
        const response = await getCustomerFeedbackByOrderId(orderId);
        if (mounted) setFeedback(response?.feedbacks || null);
      } catch (err) {
        if (mounted) setFeedbackError(err?.message || 'Unable to load feedback.');
      } finally {
        if (mounted) setFeedbackLoading(false);
      }
    };

    loadFeedback();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const documentData = order?.documents || {};
  const isFeedbackSubmitted = feedback && feedback.length > 0;

  const downloadDocument = async (documentName, suggestedFileName, fallbackPath) => {
    if (!order) return;
    setDownloading((s) => ({ ...s, [documentName]: true }));
    try {
      const path = `/api/v1/orders/admin/download/${encodeURIComponent(String(documentName))}/${encodeURIComponent(String(orderId))}`;

      const res = await authorizedFetchRaw(path, { method: 'GET' });

      // prefer filename from Content-Disposition header
      let filename = suggestedFileName || `${orderId}-${documentName}`;
      const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition');
      if (cd) {
        const m = /filename\*=?UTF-8''([^;\n\r]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd);
        if (m && m[1]) {
          try {
            filename = decodeURIComponent(m[1]);
          } catch (e) {
            filename = m[1];
          }
        }
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[OrderDetails.downloadDocument] Error', e);
      // Do not auto-open fallbackPath — prefer API download. Log fallback for debugging.
      if (fallbackPath) {
        // eslint-disable-next-line no-console
        console.warn('[OrderDetails.downloadDocument] Fallback path available, not auto-opening:', fallbackPath);
      }
    } finally {
      setDownloading((s) => ({ ...s, [documentName]: false }));
    }
  };

  const renderDocRow = (label, name, path, docKey) => {
    const isDownloading = Boolean(downloading[docKey]);
    return (
      <Box key={label} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {name ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              component="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadDocument(docKey, name, path);
              }}
              variant="body2"
              sx={{
                p: 0,
                m: 0,
                bg: 'transparent',
                border: 0,
                color: 'primary.main',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {name}
            </Typography>
            {isDownloading && <CircularProgress size={14} />}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not available
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Order Details</Typography>
          <Typography variant="body2" color="text.secondary">
            View admin order details for order ID {orderId}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          onClick={async (e) => {
            e.stopPropagation();
            if (!orderId) return;
            const payload = {
              orderId: order?.orderId || orderId,
              currentStage: order?.currentStage || order?.orderStatus || '',
              expectedDeliveryDate: order?.expectedDeliveryDate || null,
              shippingAddress: order?.shippingAddress || '',
              pickupBranchId: order?.pickupBranchId ?? order?.pickupBranch?.id ?? null,
              branchName: order?.branchName || '',
              totalPages: order?.totalPages ?? 0,
              paymentStatus: order?.paymentStatus || '',
              receivedByCustomer: true
            };
            try {
              setConfirmLoading(true);

              const isCustomerPath = typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.startsWith('/customer');

              if (isCustomerPath) {
                await confirmOrderReceived(orderId, payload);
              } else {
                await adminConfirmOrderReceived(orderId, payload);
              }

              // refresh order and feedback
              const refreshed = await getOrderById(orderId);
              setOrder(refreshed || null);
              try {
                const fb = await getCustomerFeedbackByOrderId(orderId);
                setFeedback(fb?.feedbacks || null);
              } catch (e) {
                // ignore feedback refresh error
              }

              // simple feedback
              // eslint-disable-next-line no-alert
              alert(isCustomerPath ? 'Order confirmed as received.' : 'Order confirmed as received via admin endpoint.');
            } catch (err) {
              // generic error
              // eslint-disable-next-line no-alert
              alert(err?.message || 'Unable to confirm order received');
            } finally {
              setConfirmLoading(false);
            }
          }}
          disabled={confirmLoading || order?.receivedByCustomer === true || !isOrderConfirmAllowed(order)}
        >
          {confirmLoading ? <CircularProgress size={18} color="inherit" /> : 'Order Received'}
        </Button>
        <Button variant="contained" color="primary" onClick={() => navigate(`/customer/orders/feedback/${orderId}`)} disabled={isFeedbackSubmitted}>Feedback</Button>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <MainCard content={false} sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : !order ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography>No order found.</Typography>
          </Box>
        ) : (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.orderId || '—'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip label={order.orderStatus || order.orderStageName || '—'} color="primary" size="small" sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Status
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.paymentStatus || '—'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Order ID
                </Typography>
                <Typography variant="body1">{order.paymentOrderId || '—'}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1">{order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '—'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expected Delivery
                </Typography>
                <Typography variant="body1">{formatDateTime(order.expectedDeliveryDate)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Placement Type
                </Typography>
                <Typography variant="body1">{order.placementType || '—'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Customer
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {order.customer?.firstName || order.customer?.lastName
                    ? `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim()
                    : '—'}
                </Typography>
                <Typography variant="body2">Email: {order.customer?.email || '—'}</Typography>
                <Typography variant="body2">Mobile: {order.customer?.mobile || '—'}</Typography>
                <Typography variant="body2">WhatsApp: {order.customer?.whatsapp || '—'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Branch
                </Typography>
                <Typography variant="body2">{order.branchName || '—'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Shipping Address
                </Typography>
                <Typography variant="body2">{order.shippingAddress?.address1 || '—'}</Typography>
                {order.shippingAddress?.address2 && <Typography variant="body2">{order.shippingAddress.address2}</Typography>}
                <Typography variant="body2">
                  {order.shippingAddress?.city || ''} {order.shippingAddress?.state || ''}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.country || ''} {order.shippingAddress?.pincode || ''}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Billing Address
                </Typography>
                <Typography variant="body2">{order.billingAddress?.address1 || '—'}</Typography>
                {order.billingAddress?.address2 && <Typography variant="body2">{order.billingAddress.address2}</Typography>}
                <Typography variant="body2">
                  {order.billingAddress?.city || ''} {order.billingAddress?.state || ''}
                </Typography>
                <Typography variant="body2">
                  {order.billingAddress?.country || ''} {order.billingAddress?.pincode || ''}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Documents
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mb: 2 }}>
              {renderDocRow('Thesis Document', documentData.thesisDocumentName, documentData.thesisDocumentPath, 'thesis')}
              {renderDocRow('Synopsis Document', documentData.synopsisDocumentName, documentData.synopsisDocumentPath, 'synopsis')}
              {renderDocRow('Hard Cover Design', documentData.hardCoverDesignName, documentData.hardCoverDesignPath, 'hardcoverdesign')}
              {renderDocRow('Soft Cover Design', documentData.softCoverDesignName, documentData.softCoverDesignPath, 'softcoverdesign')}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Pages
                </Typography>
                <Typography variant="body1">{order.totalPages ?? '—'}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Colour Pages
                </Typography>
                <Typography variant="body1">{order.colourPages ?? '—'}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  B/W Pages
                </Typography>
                <Typography variant="body1">{order.bwPages ?? '—'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {feedbackLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : feedbackError ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="error">{feedbackError}</Typography>
              </Box>
            ) : isFeedbackSubmitted ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Customer Feedback
                </Typography>
                <Grid container spacing={2}>
                  {feedback.map((f) => (
                    <Grid item xs={12} key={f.questionNo}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {f.question}
                      </Typography>
                      <Rating name={`feedback-display-${f.questionNo}`} value={f.rating} readOnly precision={1} max={5} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : null}

            <Typography variant="h6" sx={{ mb: 2 }}>
              Bindings
            </Typography>
            {Array.isArray(order.bindings) && order.bindings.length > 0 ? (
              order.bindings.map((binding, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {binding.bindingType || 'Binding'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Cover page design: {binding.coverPageDesign ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">Spine printing required: {binding.spinePrintingRequired ? 'Yes' : 'No'}</Typography>
                  {Array.isArray(binding.bindingItems) && binding.bindingItems.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {binding.bindingItems.map((item, itemIndex) => (
                        <Box key={itemIndex} sx={{ mb: 2, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.08)' }}>
                          <Typography variant="body2">Paper size: {item.paperSize || '—'}</Typography>
                          <Typography variant="body2">Paper: {item.paper || '—'}</Typography>
                          <Typography variant="body2">Print color: {item.printColour || '—'}</Typography>
                          <Typography variant="body2">Printing type: {item.printingType || '—'}</Typography>
                          <Typography variant="body2">Copies: {item.noOfCopies ?? '—'}</Typography>
                          <Typography variant="body2">A4 pockets: {item.a4Pockets ?? 0}</Typography>
                          <Typography variant="body2">CD pockets: {item.cdPockets ?? 0}</Typography>
                          {item.additionalInformation && (
                            <Typography variant="body2">Notes: {item.additionalInformation}</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2">No binding information available.</Typography>
            )}
          </Box>
        )}
      </MainCard>
    </Box>
  );
}
