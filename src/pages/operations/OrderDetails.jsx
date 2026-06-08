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
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MainCard from 'components/MainCard';

import { getOrderById } from 'api/orders';
import { authorizedFetchRaw } from 'api/auth';
import { getCustomerFeedbackByOrderId, getCustomerPortalOrderTimeline } from 'api/customerPortal';
import { getCustomerPortalSession } from 'utils/authTokens';
import { Package, Settings, FileText, Printer, BookOpen, CheckCircle, Truck, DownloadCloud, Copy, ChevronDown, ChevronUp, Layers, MessageCircle, ArrowLeft } from 'lucide-react';

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
      if (parsed && (parsed.code === 'BMS-404' || /feedback not found/i.test(parsed.message || '') || /feedback not found/i.test(parsed.reason || '') ) ) {
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
  const [thesisPagesInput, setThesisPagesInput] = useState('');
  const [thesisColorInput, setThesisColorInput] = useState(0);
  const [synopsisPagesInput, setSynopsisPagesInput] = useState('');
  const [synopsisColorInput, setSynopsisColorInput] = useState(0);
  const [thesisCopied, setThesisCopied] = useState(false);
  const [synopsisCopied, setSynopsisCopied] = useState(false);
  const [expandedBindings, setExpandedBindings] = useState({});

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
        // preload page inputs if provided by API
        try {
          // Prefer pageColorMap values from API when available, matching keys case-insensitively
          const pageColorMap = response?.pageColorMap || null;
          const pageColorMapSynopsis = response?.pageColorMapSynopsis || null;

          const findValueByKeyContains = (map, keyword) => {
            if (!map) return null;
            const keys = Object.keys(map || {});
            const foundKey = keys.find((k) => String(k).toLowerCase().includes(keyword.toLowerCase()));
            return foundKey ? map[foundKey] : null;
          };

          const thesisBWVal = findValueByKeyContains(pageColorMap, 'black') || findValueByKeyContains(pageColorMap, 'bw') || null;
          const thesisColorVal = findValueByKeyContains(pageColorMap, 'color') || findValueByKeyContains(pageColorMap, 'colour') || null;

          const synopsisBWVal = findValueByKeyContains(pageColorMapSynopsis, 'black') || findValueByKeyContains(pageColorMapSynopsis, 'bw') || null;
          const synopsisColorVal = findValueByKeyContains(pageColorMapSynopsis, 'color') || findValueByKeyContains(pageColorMapSynopsis, 'colour') || null;

          const thesisBW = thesisBWVal != null ? String(thesisBWVal) : (response?.thesisPageNumbers || response?.thesisPages || '');
          const thesisColor = thesisColorVal != null ? String(thesisColorVal) : (response?.thesisColorPages ?? '');

          const synopsisBW = synopsisBWVal != null ? String(synopsisBWVal) : (response?.synopsisPageNumbers || response?.synopsisPages || '');
          const synopsisColor = synopsisColorVal != null ? String(synopsisColorVal) : (response?.synopsisColorPages ?? '');

          setThesisPagesInput(thesisBW);
          setSynopsisPagesInput(synopsisBW);
          setThesisColorInput(thesisColor);
          setSynopsisColorInput(synopsisColor);
        } catch (e) {
          // ignore
        }
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

  const copyText = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('copy failed', e);
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
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>Order #{order?.orderNumber || order?.orderNo || orderId}</Typography>
            </Box>
            <Chip label={order?.orderStageName || order?.orderStatus || 'Order Received'} size="small" sx={{ bgcolor: '#ecfdf5', color: '#16a34a', fontWeight: 800, borderRadius: '8px' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<MessageCircle size={16} />}
              variant="contained"
              onClick={() => navigate(`/customer/orders/feedback/${orderId}`)}
              disabled={isFeedbackSubmitted}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(90deg,#60a5fa 0%, #2563eb 100%)',
                color: '#fff',
                borderRadius: '999px',
                px: 2.5,
                py: 0.7,
                minWidth: 120,
                boxShadow: '0 10px 24px rgba(59,130,246,0.18)',
                '&:hover': { filter: 'brightness(0.98)' }
              }}
            >
              Feedback
            </Button>
            <Button
              startIcon={<ArrowLeft size={16} />}
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{
                textTransform: 'none',
                bgcolor: '#2563eb',
                color: '#fff',
                borderRadius: 2,
                px: 2,
                py: 0.6,
                boxShadow: '0 6px 18px rgba(37,99,235,0.12)',
                '&:hover': { bgcolor: '#1e40af' }
              }}
            >
              Back
            </Button>
          </Box>
        </Box>
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
            {/* Top summary cards - responsive flex to fill full row */}
            <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 220px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(90deg, rgba(220,253,231,1) 0%, rgba(238,252,242,1) 100%)', border: '1px solid #e6f4ea', display: 'flex', alignItems: 'center', gap: 2, minHeight: 110, boxShadow: '0 8px 22px rgba(2,6,23,0.06)' }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '14px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle color="#16a34a" size={26} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>Payment Status</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>{order.paymentStatus || '—'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{order.paymentOrderId || '—'}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 220px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(90deg,#eef6ff 0%, #f7fbff 100%)', border: '1px solid #e6eefc', display: 'flex', alignItems: 'center', gap: 2, minHeight: 110, boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '14px', background: 'rgba(37,99,235,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package color="#2563eb" size={26} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>Total Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>₹{order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '—'}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 220px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(90deg,#fff9f0 0%, #fffbf7 100%)', border: '1px solid #fff2d9', display: 'flex', alignItems: 'center', gap: 2, minHeight: 110, boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '14px', background: 'rgba(249,115,22,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings color="#f97316" size={26} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>Expected Delivery</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{formatDateTime(order.expectedDeliveryDate)}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 220px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(90deg,#f5f3ff 0%, #fbfbff 100%)', border: '1px solid #ecebff', display: 'flex', alignItems: 'center', gap: 2, minHeight: 110, boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '14px', background: 'rgba(124,58,237,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText color="#7c3aed" size={26} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>Placement Type</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{order.placementType || '—'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Three main info cards - responsive flex to fill row */}
            <Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 340px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, fontSize: '16px' }}>Order Information</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Order ID: {order.orderId || '—'}</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Order Number: {order.orderNumber || order.orderNo || '—'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip label={order.orderStatus || order.orderStageName || '—'} color="primary" size="small" sx={{ fontWeight: 700, borderRadius: '8px', backgroundColor: '#e8f0ff', color: '#2563eb' }} />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>Payment Status: {order.paymentStatus || '—'}</Typography>
                  <Typography variant="body2">Total Amount: ₹{order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '—'}</Typography>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 340px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, fontSize: '16px' }}>Customer & Billing Details</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Name: {order.customer?.firstName || order.customer?.lastName ? `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() : '—'}</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Email: {order.customer?.email || '—'}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Phone: {order.customer?.mobile || '—'}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Billing Address</Typography>
                    <Typography variant="body2">{order.billingAddress?.address1 || '—'}</Typography>
                    {order.billingAddress?.address2 && <Typography variant="body2">{order.billingAddress.address2}</Typography>}
                    <Typography variant="body2">{[order.billingAddress?.city, order.billingAddress?.state].filter(Boolean).join(', ')}</Typography>
                    <Typography variant="body2">{[order.billingAddress?.country, order.billingAddress?.pincode].filter(Boolean).join(' - ')}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 340px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, fontSize: '16px' }}>Shipping Details</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{order.shippingAddress?.address1 || '—'}</Typography>
                  {order.shippingAddress?.address2 && <Typography variant="body2" sx={{ mb: 0.5 }}>{order.shippingAddress.address2}</Typography>}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}</Typography>
                  <Typography variant="body2">{[order.shippingAddress?.country, order.shippingAddress?.pincode].filter(Boolean).join(' - ')}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Documents + Thesis/Synopsis - responsive flex layout */}
            <Box sx={{ mb: 2, display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 520px' }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, bgcolor: '#eef6ff', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color="#2563eb" /></Box>
                    Documents
                  </Typography>

                  {[
                    { key: 'thesis', label: 'Thesis Document', name: documentData.thesisDocumentName, path: documentData.thesisDocumentPath },
                    { key: 'synopsis', label: 'Synopsis Document', name: documentData.synopsisDocumentName, path: documentData.synopsisDocumentPath },
                    { key: 'hardcoverdesign', label: 'Hard Cover Design', name: documentData.hardCoverDesignName, path: documentData.hardCoverDesignPath },
                    { key: 'softcoverdesign', label: 'Soft Cover Design', name: documentData.softCoverDesignName, path: documentData.softCoverDesignPath }
                  ].map((d) => (
                    <Box key={d.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.label}</Typography>
                          {d.name ? (
                            <Typography component="a" href={getDownloadHref(d.path) || '#'} onClick={(e) => { e.preventDefault(); downloadDocument(d.key, d.name, d.path); }} variant="body2" sx={{ color: 'primary.main', textDecoration: 'underline' }}>{d.name}</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">Not available</Typography>
                          )}
                        </Box>
                      </Box>

                      <Box>
                        {d.name && (
                          <IconButton size="small" onClick={() => downloadDocument(d.key, d.name, d.path)} aria-label={`download-${d.key}`} sx={{ border: '1px solid #eef2f7' }}>
                            <DownloadCloud size={18} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ flex: '0 0 1px', width: 16 }} />

              <Box sx={{ flex: '1 1 260px' }}>
                <Box sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(180deg,#f3f6ff 0%, #ffffff 100%)', border: '1px solid #eef6ff', boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 24, height: 24, bgcolor: '#eef6ff', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} color="#2563eb" /></Box>
                    Thesis Page
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>BLACK & WHITE</Typography>
                  <TextField size="small" value={thesisPagesInput} onChange={(e) => setThesisPagesInput(e.target.value)} fullWidth InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => copyText(thesisPagesInput || '', setThesisCopied)}>
                        <Copy size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) }} />

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2, mb: 1 }}>COLOR</Typography>
                  <TextField size="small" value={thesisColorInput} onChange={(e) => setThesisColorInput(e.target.value)} fullWidth InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => copyText(String(thesisColorInput || 0), setThesisCopied)}>
                        <Copy size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) }} />
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 260px' }}>
                <Box sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(180deg,#f0fff4 0%, #ffffff 100%)', border: '1px solid #ecf9f0', boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 24, height: 24, bgcolor: '#ecfff4', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} color="#16a34a" /></Box>
                    Synopsis Page
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>BLACK & WHITE</Typography>
                  <TextField size="small" value={synopsisPagesInput} onChange={(e) => setSynopsisPagesInput(e.target.value)} fullWidth InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => copyText(synopsisPagesInput || '', setSynopsisCopied)}>
                        <Copy size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) }} />

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2, mb: 1 }}>COLOR</Typography>
                  <TextField size="small" value={synopsisColorInput} onChange={(e) => setSynopsisColorInput(e.target.value)} fullWidth InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => copyText(String(synopsisColorInput || 0), setSynopsisCopied)}>
                        <Copy size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) }} />
                </Box>
              </Box>
            </Box>

            
            
            <Typography variant="h6" sx={{ mb: 2 }}>Bindings</Typography>
            {Array.isArray(order.bindings) && order.bindings.length > 0 ? (
              <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {order.bindings.map((binding, index) => {
                  const item = Array.isArray(binding.bindingItems) && binding.bindingItems.length > 0 ? binding.bindingItems[0] : {};
                  const isSynopsis = String(binding.bindingType || '').toLowerCase().includes('synopsis');
                  const expanded = expandedBindings?.[index] !== false;

                  return (
                    <Box key={index} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 300 }}>
                      <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                        {/* Header bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 1.5, background: isSynopsis ? 'linear-gradient(90deg,#f0fff4 0%, #ffffff 100%)' : 'linear-gradient(90deg,#f3f6ff 0%, #ffffff 100%)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: isSynopsis ? 'rgba(16,185,129,0.08)' : 'rgba(37,99,235,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Layers size={18} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{binding.bindingType ? `${binding.bindingType} Binding` : 'Binding'}</Typography>
                          </Box>

                          <IconButton size="small" onClick={() => setExpandedBindings((s) => ({ ...(s || {}), [index]: !expanded }))}>
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </IconButton>
                        </Box>

                        {expanded && (
                          <Box sx={{ p: 3, background: '#fff' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color="text.secondary">Cover page design</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{binding.coverPageDesign ? 'Yes' : 'No'}</Typography>

                                <Typography variant="body2" color="text.secondary">Spine printing required</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{binding.spinePrintingRequired ? 'Yes' : 'No'}</Typography>

                                <Typography variant="body2" color="text.secondary">Paper size</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.paperSize || '—'}</Typography>

                                <Typography variant="body2" color="text.secondary">Paper</Typography>
                                <Typography variant="body2">{item.paper || '—'}</Typography>
                              </Box>

                              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(0,0,0,0.06)' }} />

                              <Box sx={{ width: 220 }}>
                                <Typography variant="body2" color="text.secondary">Printing type</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.printingType || '—'}</Typography>

                                <Typography variant="body2" color="text.secondary">Copies</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.noOfCopies ?? '—'}</Typography>

                                <Typography variant="body2" color="text.secondary">A4 pockets</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{item.a4Pockets ?? 0}</Typography>

                                <Typography variant="body2" color="text.secondary">CD pockets</Typography>
                                <Typography variant="body2">{item.cdPockets ?? 0}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2">No binding information available.</Typography>
            )}

            <Box sx={{ mb: 3 }}>
              <Box sx={{ p: 2.5, borderRadius: 2, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={16} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Feedback</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  {feedbackLoading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CircularProgress />
                    </Box>
                  ) : feedbackError ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="error">{feedbackErrorMessage}</Typography>
                    </Box>
                  ) : isFeedbackSubmitted ? (
                    <Grid container spacing={2}>
                      {feedback.map((f) => (
                        <Grid item xs={12} sm={6} key={f.questionNo}>
                          <Box sx={{ p: 2, borderRadius: 1, background: '#fff' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>{f.question}</Typography>
                            <Rating name={`feedback-display-${f.questionNo}`} value={f.rating} readOnly precision={1} max={5} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ mt: 2, p: 4, borderRadius: 2, border: '1px dashed rgba(99,102,241,0.18)', background: '#fafbff', textAlign: 'center' }}>
                      <MessageCircle size={28} color="#6b7280" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>No Feedback Yet</Typography>
                      <Typography variant="body2" color="text.secondary">Customer has not provided any feedback yet.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

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
