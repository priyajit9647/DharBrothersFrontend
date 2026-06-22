import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MainCard from 'components/MainCard';

import { getOrderById } from 'api/orders';
import { authorizedFetchRaw } from 'api/auth';
import { getCustomerFeedbackByOrderId, getCustomerPortalOrderTimeline, editCustomerFeedbackForOrder } from 'api/customerPortal';
import { approveDocument } from 'api/document';
import { getDocumentVersionListForOrder, downloadOrderFile } from 'api/orders';
import { getCustomerPortalSession } from 'utils/authTokens';
import { Package, Settings, FileText, Printer, BookOpen, CheckCircle, Truck, DownloadCloud, Copy, ChevronDown, ChevronUp, Layers, MessageCircle, ArrowLeft, Star } from 'lucide-react';

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
  const [editOpen, setEditOpen] = useState(false);
  const [editableFeedback, setEditableFeedback] = useState([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
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
  const [approvalDocumentKey, setApprovalDocumentKey] = useState('hardcoverdesign');
  const [approvalVersion, setApprovalVersion] = useState('');
  const [approvalDecision, setApprovalDecision] = useState('Approve');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [versionOptions, setVersionOptions] = useState([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [allDocVersionsList, setAllDocVersionsList] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionActionMode, setVersionActionMode] = useState(null);
  const [versionActionRemarks, setVersionActionRemarks] = useState('');
  const [versionActionSubmitting, setVersionActionSubmitting] = useState(false);
  const [versionActionTargetNo, setVersionActionTargetNo] = useState(null);
  

  // Map document key to backend document stage id — adjust as required
  const DOC_STAGE_ID_BY_KEY = {
    hardcoverdesign: 1,
    softcoverdesign: 2,
    thesis: 3,
    synopsis: 4
  };
  

  const loadVersions = async () => {
    if (!orderId) return;
    setVersionLoading(true);
    setVersionOptions([]);
    try {
      const resp = await getDocumentVersionListForOrder(orderId);

      let list = [];
      if (Array.isArray(resp)) list = resp;
      else if (resp && Array.isArray(resp.data)) list = resp.data;
      else if (Array.isArray(resp?.content)) list = resp.content;

      setAllDocVersionsList(list);

      // Filter by selected document key where possible (match documentMasterId or name)
      const stageId = DOC_STAGE_ID_BY_KEY[approvalDocumentKey];
      const filtered = list.filter((v) => {
        if (stageId != null && (v.documentMasterId == null ? false : Number(v.documentMasterId) === Number(stageId))) return true;
        const name = String(v.documentMasterName || v.documentName || '').toLowerCase();
        if (name && name.includes(String(approvalDocumentKey).toLowerCase())) return true;
        return false;
      });

      setVersionOptions(filtered.length > 0 ? filtered : list);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load document versions for order', e);
      setVersionOptions([]);
    } finally {
      setVersionLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    loadVersions();

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

  const openEditFeedback = () => {
    const initial = Array.isArray(feedback) ? feedback.map((f) => ({ questionNo: f.questionNo ?? f.id ?? f.question_id, question: f.question || f.text || '', rating: Number(f.rating) || 0 })) : [];
    setEditableFeedback(initial);
    setEditError(null);
    setEditOpen(true);
  };

  const handleEditRatingChange = (questionNo, value) => {
    setEditableFeedback((prev) => prev.map((it) => (String(it.questionNo) === String(questionNo) ? { ...it, rating: value || 0 } : it)));
  };

  const submitEditedFeedback = async () => {
    if (!orderId) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const session = getCustomerPortalSession();
      const customerId = session?.customerId || session?.userId || order?.customer?.customerId || order?.customer?.id || null;

      const payload = {
        customerId,
        orderId,
        feedbacks: (editableFeedback || []).map((f) => ({ questionNo: f.questionNo, rating: Number(f.rating) || 0 }))
      };

      const resp = await editCustomerFeedbackForOrder(orderId, payload);
      // Update local feedback state from response if available, otherwise use editableFeedback
      const updated = resp?.feedbacks || resp?.data || editableFeedback;
      setFeedback(Array.isArray(updated) ? updated : (updated?.feedbacks || editableFeedback));
      setEditOpen(false);
    } catch (e) {
      setEditError(e?.message || String(e) || 'Failed to update feedback');
    } finally {
      setEditSubmitting(false);
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

            {/* Three main info cards — equal-width columns, stretch to same height */}
            <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', minWidth: 0 }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)', flex: 1, width: '100%', minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px' }}>Order Information</Typography>
                  <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Order ID: {order.orderId || '—'}</Typography>
                  <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Order Number: {order.orderNumber || order.orderNo || '—'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
                    <Typography variant="body2" sx={{ flexShrink: 0 }}>Status:</Typography>
                    <Chip label={order.orderStatus || order.orderStageName || '—'} color="primary" size="small" sx={{ fontWeight: 700, borderRadius: '8px', backgroundColor: '#e8f0ff', color: '#2563eb' }} />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Payment Status: {order.paymentStatus || '—'}</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Total Amount: ₹{order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '—'}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', minWidth: 0 }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)', flex: 1, width: '100%', minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px' }}>Customer & Billing Details</Typography>
                  <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Name: {order.customer?.firstName || order.customer?.lastName ? `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() : '—'}</Typography>
                  <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Email: {order.customer?.email || '—'}</Typography>
                  <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Phone: {order.customer?.mobile || '—'}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>Billing Address</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{order.billingAddress?.address1 || '—'}</Typography>
                    {order.billingAddress?.address2 && <Typography variant="body2" sx={{ mb: 0.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{order.billingAddress.address2}</Typography>}
                    <Typography variant="body2" sx={{ mb: 0.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{[order.billingAddress?.city, order.billingAddress?.state].filter(Boolean).join(', ') || '—'}</Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{[order.billingAddress?.country, order.billingAddress?.pincode].filter(Boolean).join(' - ') || '—'}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', minWidth: 0 }}>
                <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)', flex: 1, width: '100%', minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px' }}>Shipping Details</Typography>
                  <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{order.shippingAddress?.address1 || '—'}</Typography>
                  {order.shippingAddress?.address2 && <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{order.shippingAddress.address2}</Typography>}
                  <Typography variant="body2" sx={{ mb: 0.75, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ') || '—'}</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{[order.shippingAddress?.country, order.shippingAddress?.pincode].filter(Boolean).join(' - ') || '—'}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Documents + Thesis/Synopsis — full width stacked */}
            <Stack spacing={3} sx={{ mb: 2 }}>
              <Box sx={{ width: '100%' }}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={16} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.label}</Typography>
                          {d.name ? (
                            <Typography component="a" href={getDownloadHref(d.path) || '#'} onClick={(e) => { e.preventDefault(); downloadDocument(d.key, d.name, d.path); }} variant="body2" sx={{ color: 'primary.main', textDecoration: 'underline', wordBreak: 'break-word' }}>{d.name}</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">Not available</Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ flexShrink: 0 }}>
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

              <Box sx={{ width: '100%' }}>
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

              <Box sx={{ width: '100%' }}>
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
            </Stack>

            
            
            {/* Customer approval card Old */}
            {/* <Box sx={{ mb: 2 }}>
              <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #fff5eb', boxShadow: '0 6px 18px rgba(250,240,230,0.6)' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                    <Box sx={{ width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText color="#f97316" size={18} />
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Customer Approves or Rejects a Document Version</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Review the document version and approve or reject with your feedback.</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                      <Grid item xs={12} sm={2}>
                        <TextField select size="small" label="Document" value={approvalDocumentKey} onChange={(e) => setApprovalDocumentKey(e.target.value)} fullWidth>
                          <MenuItem value="thesis">Thesis Document</MenuItem>
                          <MenuItem value="synopsis">Synopsis Document</MenuItem>
                          <MenuItem value="hardcoverdesign">Hard Cover Design</MenuItem>
                          <MenuItem value="softcoverdesign">Soft Cover Design</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={7}>
                        <TextField
                          select
                          size="small"
                          label="Version No."
                          value={approvalVersion}
                          onChange={(e) => setApprovalVersion(e.target.value)}
                          fullWidth
                        >
                          {versionLoading ? (
                            <MenuItem disabled>Loading...</MenuItem>
                          ) : (versionOptions && versionOptions.length > 0) ? (
                            versionOptions.map((v) => (
                              <MenuItem key={v.versionNo ?? v.id} value={String((v.versionNo ?? v.version) || v.id)}>
                                {v.versionNo ?? v.version ?? v.id}{v.remarks ? ` — ${v.remarks}` : ''}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No versions</MenuItem>
                          )}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField select size="small" label="Decision" value={approvalDecision} onChange={(e) => setApprovalDecision(e.target.value)} fullWidth>
                          <MenuItem value="Approve">Approve</MenuItem>
                          <MenuItem value="Reject">Reject</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <TextField size="small" label="Remarks (Optional)" value={approvalRemarks} onChange={(e) => setApprovalRemarks(e.target.value.slice(0, 500))} fullWidth multiline minRows={3} />
                </Box>

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{approvalRemarks.length}/500</Typography>
                  <Button variant="contained" disabled={approvalSubmitting} onClick={async () => {
                    setApprovalSubmitting(true);
                    try {
                        if (!approvalVersion) {
                          // eslint-disable-next-line no-alert
                          alert('Please provide a version number');
                          return;
                        }

                        const documentData = order?.documents || {};
                        let docEntry = documentData?.[approvalDocumentKey] ?? null;
                        if (!docEntry && Array.isArray(order?.documents)) {
                          docEntry = order.documents.find((d) => String(d.type ?? d.documentType ?? '').toLowerCase().includes(approvalDocumentKey));
                        }
                        const documentId = docEntry?.documentId ?? docEntry?.id ?? null;

                        const session = getCustomerPortalSession();
                        const customerId = session?.customerId || session?.userId || session?.id || order?.customer?.customerId || order?.customer?.id || null;

                        if (!documentId) {
                          // eslint-disable-next-line no-alert
                          alert('Document identifier for selected document not available');
                          return;
                        }

                        if (!customerId) {
                          // eslint-disable-next-line no-alert
                          alert('Customer identity not available');
                          return;
                        }

                        await approveDocument({ documentId: Number(documentId), versionNo: Number(approvalVersion), customerId: String(customerId), approved: approvalDecision === 'Approve', remarks: approvalRemarks });

                      // eslint-disable-next-line no-alert
                      alert('Decision submitted');
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error('approval submit error', e);
                      // eslint-disable-next-line no-alert
                      alert(e?.message || 'Failed to submit decision');
                    } finally {
                      setApprovalSubmitting(false);
                    }
                  }} sx={{ textTransform: 'none', background: 'linear-gradient(90deg,#34d399 0%, #10b981 100%)', color: '#fff', borderRadius: '999px', px: 3 }}>
                    Submit Decision
                  </Button>
                </Box>
              </Box>
            </Box> */}

            {/* ================= DOCUMENT VERSIONS ================= */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ p: 3, borderRadius: 3, background: '#fff', border: '1px solid #eef2f7', boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, background: '#f0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} color="#2563eb" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Document Versions</Typography>
                    <Typography variant="body2" color="text.secondary">Review document versions sent for your approval</Typography>
                  </Box>
                </Box>

                {versionLoading ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
                ) : (() => {
                  const filteredVersions = allDocVersionsList;

                  if (filteredVersions.length === 0) {
                    return (
                      <Box sx={{ py: 5, textAlign: 'center', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: 2 }}>
                        <Layers size={32} color="#9ca3af" />
                        <Typography variant="subtitle2" sx={{ mt: 1.5, color: '#6b7280' }}>No document versions available</Typography>
                        <Typography variant="caption" color="text.secondary">Document versions will appear here once uploaded</Typography>
                      </Box>
                    );
                  }

                  const sorted = [...filteredVersions].sort((a, b) => Number(b.versionNo ?? 0) - Number(a.versionNo ?? 0));
                  const latestVer = sorted[0];
                  const historyVers = sorted.slice(1);

                  const handleDownloadVersion = async (v) => {
                    if (!v?.filePath) return;
                    try {
                      const blob = await downloadOrderFile({ filePath: v?.filePath ?? '', fileName: v?.fileName ?? '' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank', 'noopener');
                      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error('Download failed', e);
                      // lightweight fallback: try opening raw path
                      try {
                        window.open(file.filePath, '_blank', 'noopener');
                      } catch {}
                    }
                  }

                  const statusChipSx = (status) => ({
                    bgcolor: /approve/i.test(status) ? '#dcfce7' : /reject/i.test(status) ? '#fee2e2' : '#f1f5f9',
                    color: /approve/i.test(status) ? '#16a34a' : /reject/i.test(status) ? '#dc2626' : '#64748b',
                    fontWeight: 700,
                    fontSize: '11px',
                    height: 20,
                    borderRadius: '6px'
                  });

                  return (
                    <>
                      {/* Latest Version */}
                      <Box sx={{ p: 2.5, borderRadius: 2.5, background: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', border: '1.5px solid #7dd3fc', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FileText size={22} color="#fff" />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0c4a6e' }}>
                                  Version {latestVer.versionNo ?? '-'}
                                </Typography>
                                <Chip label="Latest" size="small" sx={{ bgcolor: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '11px', height: 20, borderRadius: '6px' }} />
                                {latestVer.approvalStatus && (
                                  <Chip label={latestVer.approvalStatus} size="small" sx={statusChipSx(latestVer.approvalStatus)} />
                                )}
                              </Box>
                              {(latestVer.documentMasterName || latestVer.documentName) && (
                                <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600, display: 'block' }}>
                                  {latestVer.documentMasterName || latestVer.documentName}
                                </Typography>
                              )}
                              {latestVer.remarks && (
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{latestVer.remarks}</Typography>
                              )}
                              {latestVer.createdAt && (
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{formatDateTime(latestVer.createdAt)}</Typography>
                              )}
                            </Box>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadCloud size={15} />}
                            onClick={() => handleDownloadVersion(latestVer)}
                            sx={{ textTransform: 'none', color: '#0ea5e9', borderColor: '#7dd3fc', '&:hover': { bgcolor: '#f0f9ff', borderColor: '#0ea5e9' }, borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            Download
                          </Button>
                        </Box>

                        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid rgba(125,211,252,0.4)' }}>
                          {versionActionMode === null ? (
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                              {(!latestVer.approvalStatus || /pending/i.test(latestVer.approvalStatus)) && (
                                <>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CheckCircle size={15} />}
                                    onClick={() => { setVersionActionMode('approve'); setVersionActionTargetNo(latestVer.versionNo ?? 0); setVersionActionRemarks(''); }}
                                    sx={{ textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: '999px', px: 2.5 }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => { setVersionActionMode('reject'); setVersionActionTargetNo(latestVer.versionNo ?? 0); setVersionActionRemarks(''); }}
                                    sx={{ textTransform: 'none', color: '#dc2626', borderColor: '#fca5a5', '&:hover': { bgcolor: '#fef2f2', borderColor: '#dc2626' }, borderRadius: '999px', px: 2.5 }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {historyVers.length > 0 && (
                                <Button
                                  variant="text"
                                  size="small"
                                  endIcon={showVersionHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                  onClick={() => setShowVersionHistory((prev) => !prev)}
                                  sx={{ textTransform: 'none', color: '#64748b', ml: 'auto' }}
                                >
                                  History ({historyVers.length})
                                </Button>
                              )}
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: versionActionMode === 'approve' ? '#16a34a' : '#dc2626', mb: 1, display: 'block' }}>
                                {versionActionMode === 'approve' ? 'Approving' : 'Rejecting'} Version {versionActionTargetNo}
                              </Typography>
                              <TextField
                                size="small"
                                label="Remarks (Optional)"
                                value={versionActionRemarks}
                                onChange={(e) => setVersionActionRemarks(e.target.value.slice(0, 500))}
                                fullWidth
                                multiline
                                minRows={2}
                                sx={{ mb: 1.5 }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">{versionActionRemarks.length}/500</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    onClick={() => { setVersionActionMode(null); setVersionActionRemarks(''); }}
                                    sx={{ textTransform: 'none', color: '#64748b' }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={versionActionSubmitting}
                                    onClick={async () => {
                                      setVersionActionSubmitting(true);
                                      try {
                                        const docDataObj = order?.documents || {};
                                        let docEntry = docDataObj?.[approvalDocumentKey] ?? null;
                                        if (!docEntry && Array.isArray(order?.documents)) {
                                          docEntry = order.documents.find((d) => String(d.type ?? d.documentType ?? '').toLowerCase().includes(approvalDocumentKey));
                                        }
                                        const docOrderId = latestVer?.orderId ?? null;
                                        const session = getCustomerPortalSession();
                                        // if (!documentId) {
                                        //   // eslint-disable-next-line no-alert
                                        //   alert('Document identifier not available');
                                        //   return;
                                        // }
                                        // if (!customerId) {
                                        //   // eslint-disable-next-line no-alert
                                        //   alert('Customer identity not available');
                                        //   return;
                                        // }
                                        await approveDocument({
                                          orderId: docOrderId,
                                          approved: versionActionMode === 'approve',
                                          remarks: versionActionRemarks
                                        });
                                        // eslint-disable-next-line no-alert
                                        alert('Decision submitted successfully');
                                        setVersionActionMode(null);
                                        setVersionActionRemarks('');
                                        loadVersions();
                                      } catch (e) {
                                        // eslint-disable-next-line no-console
                                        console.error('version action error', e);
                                        // eslint-disable-next-line no-alert
                                        alert(e?.message || 'Failed to submit decision');
                                      } finally {
                                        setVersionActionSubmitting(false);
                                      }
                                    }}
                                    sx={{
                                      textTransform: 'none',
                                      bgcolor: versionActionMode === 'approve' ? '#16a34a' : '#dc2626',
                                      '&:hover': { bgcolor: versionActionMode === 'approve' ? '#15803d' : '#b91c1c' },
                                      borderRadius: '999px',
                                      px: 2.5
                                    }}
                                  >
                                    {versionActionSubmitting
                                      ? <CircularProgress size={14} color="inherit" />
                                      : `Confirm ${versionActionMode === 'approve' ? 'Approval' : 'Rejection'}`}
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Previous Versions History */}
                      {showVersionHistory && historyVers.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>
                            Previous Versions
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {historyVers.map((v, i) => (
                              <Box key={v.versionNo ?? v.id ?? i} sx={{ p: 2, borderRadius: 2, border: '1px solid #eef2f7', background: '#fafbff', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <FileText size={15} color="#94a3b8" />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                                    Version {v.versionNo ?? '—'}
                                  </Typography>
                                  {v.remarks && <Typography variant="caption" color="text.secondary">{v.remarks ?? ''}</Typography>}
                                  {v.createdDate && (
                                    <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8' }}>{formatDateTime(v.createdDate)}</Typography>
                                  )}
                                </Box>
                                {v.approvalStatus && (
                                  <Chip label={v.approvalStatus} size="small" sx={statusChipSx(v.approvalStatus)} />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  );
                })()}
              </Box>
            </Box>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
              <DialogTitle>Edit Feedback</DialogTitle>
              <DialogContent dividers>
                {editableFeedback && editableFeedback.length > 0 ? (
                  <Grid container spacing={2}>
                    {editableFeedback.map((f) => (
                      <Grid item xs={12} key={String(f.questionNo)}>
                        <Box sx={{ p: 1 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>{f.question || `Question ${f.questionNo}`}</Typography>
                          <Rating
                            name={`edit-feedback-${f.questionNo}`}
                            value={Number(f.rating) || 0}
                            onChange={(e, v) => handleEditRatingChange(f.questionNo, v)}
                            precision={1}
                            max={5}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>No feedback items available to edit.</Typography>
                )}
                {editError && <Typography color="error" sx={{ mt: 1 }}>{editError}</Typography>}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditOpen(false)} disabled={editSubmitting}>Cancel</Button>
                <Button variant="contained" onClick={submitEditedFeedback} disabled={editSubmitting}>
                  {editSubmitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save Changes'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* ================= END DOCUMENT VERSIONS ================= */}

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageCircle size={16} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Feedback</Typography>
                  </Box>
                  {isFeedbackSubmitted && (
                    <Button
                      startIcon={<Star size={14} />}
                      variant="outlined"
                      onClick={openEditFeedback}
                      sx={{ textTransform: 'none', borderRadius: 2, px: 2 }}
                    >
                      Edit Feedback
                    </Button>
                  )}
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

                <Box sx={{ display: 'flex', alignItems: 'stretch', width: '100%', position: 'relative', gap: { xs: 1, md: 1.5 }, overflowX: { xs: 'auto', md: 'visible' }, pb: { xs: 1, md: 0 } }}>
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
                          flex: '1 1 0',
                          minWidth: { xs: 140, sm: 150, md: 0 },
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
                            flexShrink: 0,
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

                        <Box sx={{ width: 3, height: 24, flexShrink: 0, background: active ? '#1976d2' : '#d1d5db' }} />

                        {/* Card */}

                        <Box
                          sx={{
                            flex: 1,
                            width: '100%',
                            minHeight: 150,
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#fff',
                            borderRadius: '18px',
                            p: 2,
                            textAlign: 'center',
                            border: '1px solid #edf2f7',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                            transition: '0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 22px rgba(0,0,0,0.10)' }
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              mb: 1,
                              fontSize: '14px',
                              lineHeight: 1.35,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              minHeight: 38
                            }}
                          >
                            {s.stageName}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              flex: 1,
                              color: '#6b7280',
                              display: 'block',
                              mb: 1.5,
                              fontSize: '12px',
                              lineHeight: 1.45,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            {s.remarks || 'No remarks available'}
                          </Typography>

                          <Chip
                            label={s.isCompleted ? 'Completed' : 'Pending'}
                            color={s.isCompleted ? 'primary' : 'default'}
                            size="small"
                            sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '11px', alignSelf: 'center', mt: 'auto' }}
                          />
                        </Box>

                        {/* Time */}

                        <Typography
                          variant="caption"
                          sx={{
                            mt: 1.5,
                            flexShrink: 0,
                            fontWeight: 600,
                            color: active ? '#1976d2' : '#94a3b8',
                            textAlign: 'center',
                            fontSize: '11px',
                            px: 0.5,
                            width: '100%',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.4
                          }}
                        >
                          {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—'}
                        </Typography>
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
