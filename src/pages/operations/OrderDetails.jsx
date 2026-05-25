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

import { getOrderById } from 'api/orders';
import { authorizedFetchRaw } from 'api/auth';
import { getCustomerFeedbackByOrderId, getCustomerPortalOrderTimeline } from 'api/customerPortal';
import { getCustomerPortalSession } from 'utils/authTokens';
import { Package, Settings, FileText, Printer, BookOpen, CheckCircle, Truck } from 'lucide-react';

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

function getDownloadHref(path) {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return null;
}

// Normalize various error shapes into a user-friendly message for feedback
function normalizeFeedbackErrorMessage(err) {
  if (!err) return null;

  // If it's already an object
  if (typeof err === 'object') {
    if (err.code === 'BMS-404' || /feedback not found/i.test(err.message || '') || /feedback not found/i.test(err.reason || '')) {
      return 'No Feedback Present Yet';
    }
    return err.message || String(err);
  }

  // If it's a JSON string, try to parse and inspect
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      if (parsed && (parsed.code === 'BMS-404' || /feedback not found/i.test(parsed.message || '') || /feedback not found/i.test(parsed.reason || '')) ) {
        return 'No Feedback Present Yet';
      }
    } catch (e) {
      // not JSON — fall through
    }

    if (/feedback not found/i.test(err) || /BMS-404/i.test(err)) return 'No Feedback Present Yet';
    return err;
  }

  return String(err);
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
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState(null);

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

    const loadTimelineIfPortal = async () => {
      if (!orderId) return;
      // Only attempt portal timeline for customer portal sessions or when route indicates customer view
      const session = getCustomerPortalSession();
      const isCustomerPortal = Boolean(session);
      if (!isCustomerPortal) return;

      setTimelineLoading(true);
      setTimelineError(null);
      try {
        const resp = await getCustomerPortalOrderTimeline(orderId);
        if (!mounted) return;
        setTimeline(resp || null);
      } catch (err) {
        if (!mounted) return;
        setTimelineError(err?.message || 'Unable to load order timeline.');
      } finally {
        if (!mounted) return;
        setTimelineLoading(false);
      }
    };

    loadFeedback();
    loadTimelineIfPortal();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const documentData = order?.documents || {};
  const isFeedbackSubmitted = feedback && feedback.length > 0;
  const feedbackErrorMessage = normalizeFeedbackErrorMessage(feedbackError);

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
        <Button variant="contained" color="success" onClick={() => console.log('Order Received clicked')}>Order Received</Button>
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

                {/* University Department (show if present) */}
                <Typography variant="body2">{order.billingAddress?.universityDepartment || '—'}</Typography>
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

            {feedbackLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : feedbackError ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="error">{feedbackErrorMessage}</Typography>
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
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="error">No Feedback Present Yet</Typography>
              </Box>
            )}

            {/* ================= MODERN COMPACT TIMELINE ================= */}

            {timelineLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : timelineError ? (
              <Typography color="error">{timelineError}</Typography>
            ) : timeline ? (
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: '24px',
                  background: '#fff',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
                  border: '1px solid #eef2f7',
                  overflowX: 'auto'
                }}
              >
                {/* Header */}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 5
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#111827'
                      }}
                    >
                      Order Timeline
                    </Typography>

                    <Typography variant="body2" color="text.secondary">Track complete workflow</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={`Stage: ${timeline.currentStage || '—'}`} color="primary" size="small" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                    <Chip label={`Payment: ${timeline.paymentStatus || '—'}`} color="success" size="small" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                  </Box>
                </Box>

                {/* Timeline */}

                <Box sx={{ display: 'flex', alignItems: 'flex-start', minWidth: '1200px', position: 'relative' }}>
                  {timeline.stages?.map((s, idx) => {
                    const active = s.isCompleted;

                    const icons = {
                      'Order-Created': <Package color="#fff" size={20} />,
                      'Order-Processing': <Settings color="#fff" size={20} />,
                      'Document-Edit-Stage': <FileText color="#fff" size={20} />,
                      'Printing-Done': <Printer color="#fff" size={20} />,
                      'Binding-Done': <BookOpen color="#fff" size={20} />,
                      'Order-Ready-Check': <CheckCircle color="#fff" size={20} />,
                      'Ready-To-Dispatch': <Truck color="#fff" size={20} />
                    };

                    return (
                      <Box
                        key={idx}
                        sx={{
                          flex: 1,
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        {/* Connector */}

                        {idx !== timeline.stages.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 24,
                              left: '50%',
                              width: '100%',
                              borderTop: active ? '2px dashed #1976d2' : '2px dashed #d1d5db',
                              zIndex: 0
                            }}
                          />
                        )}

                        {/* Circle */}

                        <Box
                          sx={{
                            zIndex: 2,
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: active ? 'linear-gradient(135deg,#1976d2,#42a5f5)' : '#d1d5db',
                            color: '#fff',
                            fontSize: '22px',
                            boxShadow: active ? '0 6px 18px rgba(25,118,210,0.28)' : 'none'
                          }}
                        >
                          {icons[s.stageName]}
                        </Box>

                        {/* Line */}

                        <Box sx={{ width: 3, height: 24, background: active ? '#1976d2' : '#d1d5db' }} />

                        {/* Card */}

                        <Box sx={{ width: 180, background: '#fff', borderRadius: '18px', p: 2, textAlign: 'center', border: '1px solid #edf2f7', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 22px rgba(0,0,0,0.10)' } }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '15px' }}>{s.stageName}</Typography>

                          <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', minHeight: 36, mb: 1.5, fontSize: '12px' }}>{s.remarks || 'No remarks available'}</Typography>

                          <Chip label={s.isCompleted ? 'Completed' : 'Pending'} color={s.isCompleted ? 'primary' : 'default'} size="small" sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '11px' }} />
                        </Box>

                        {/* Time */}

                        <Typography variant="caption" sx={{ mt: 1.5, fontWeight: 600, color: active ? '#1976d2' : '#94a3b8', textAlign: 'center', fontSize: '11px', px: 1 }}>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—'}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : null}
            {/* ================= END TIMELINE ================= */}
          </Box>
        )}
      </MainCard>
    </Box>
  );
}
