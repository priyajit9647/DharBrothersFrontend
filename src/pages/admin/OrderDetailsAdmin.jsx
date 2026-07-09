import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { Download, User, Truck, Receipt, FileText, Copy, Package, Settings, Printer, BookOpen, CheckCircle, Pencil } from 'lucide-react';

import { getOrderById, downloadOrderFile, downloadInvoice, updateAdminOrderBinding, updateAdminOrderShipping } from 'api/orders';
import { getCustomerPortalOrderTimeline } from 'api/customerPortal';

function pickFirst(source, keys) {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function unwrapOrderResponse(raw) {
  return raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;
}

function parseApiError(err) {
  if (!err) return 'Failed to update binding';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  return 'Failed to update binding';
}

function toNumberOrNull(value) {
  if (value === '' || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function findBindingLocation(bindings, row) {
  if (!Array.isArray(bindings) || !row) return null;

  if (
    row.bindingIndex != null
    && bindings[row.bindingIndex]
    && String(bindings[row.bindingIndex].bindingType || '').toUpperCase() === String(row.bindingType || '').toUpperCase()
  ) {
    return { bindingIndex: row.bindingIndex, binding: bindings[row.bindingIndex] };
  }

  const bindingIndex = bindings.findIndex(
    (binding) => String(binding?.bindingType || '').toUpperCase() === String(row.bindingType || '').toUpperCase()
  );

  if (bindingIndex < 0) return null;
  return { bindingIndex, binding: bindings[bindingIndex] };
}

function normalizeOrderResponse(raw) {
  const resp = unwrapOrderResponse(raw);

  const billingAddress = {
    address1: pickFirst(resp?.billingAddress, ['address1', 'addressLine1', 'line1', 'street'])
      ?? pickFirst(resp, ['customerAddress1', 'billingAddress1', 'addressLine1', 'address1']),
    address2: pickFirst(resp?.billingAddress, ['address2', 'addressLine2', 'line2'])
      ?? pickFirst(resp, ['customerAddress2', 'billingAddress2', 'addressLine2', 'address2']),
    city: pickFirst(resp?.billingAddress, ['city'])
      ?? pickFirst(resp, ['customerCity', 'billingCity', 'city']),
    state: pickFirst(resp?.billingAddress, ['state'])
      ?? pickFirst(resp, ['state', 'billingState']),
    country: pickFirst(resp?.billingAddress, ['country'])
      ?? pickFirst(resp, ['country', 'billingCountry']),
    pincode: pickFirst(resp?.billingAddress, ['pincode', 'pinCode', 'zip', 'postalCode'])
      ?? pickFirst(resp, ['pincode', 'billingPincode', 'customerPincode'])
  };

  const shippingAddress = {
    address1: pickFirst(resp?.shippingAddress, ['address1', 'addressLine1', 'line1', 'street'])
      ?? pickFirst(resp, ['shippingAddress1', 'address1']),
    address2: pickFirst(resp?.shippingAddress, ['address2', 'addressLine2', 'line2'])
      ?? pickFirst(resp, ['shippingAddress2', 'address2']),
    city: pickFirst(resp?.shippingAddress, ['city'])
      ?? pickFirst(resp, ['shippingCity', 'city']),
    state: pickFirst(resp?.shippingAddress, ['state'])
      ?? pickFirst(resp, ['shippingState', 'state']),
    country: pickFirst(resp?.shippingAddress, ['country'])
      ?? pickFirst(resp, ['shippingCountry', 'country']),
    pincode: pickFirst(resp?.shippingAddress, ['pincode', 'pinCode', 'zip', 'postalCode'])
      ?? pickFirst(resp, ['shippingPincode', 'pincode'])
  };

  const customerSource = resp?.customer && typeof resp.customer === 'object' ? resp.customer : resp;
  const customer = {
    name: `${customerSource?.firstName || ''} ${customerSource?.lastName || ''}`.trim()
      || pickFirst(resp, ['customerName', 'fullName', 'name'])
      || '—',
    email: pickFirst(customerSource, ['email', 'customerEmail']) ?? pickFirst(resp, ['customerEmail', 'email']),
    phone: pickFirst(customerSource, ['mobile', 'phone', 'whatsapp']) ?? pickFirst(resp, ['mobile', 'phone', 'whatsapp'])
  };

  const documents = resp?.documents && typeof resp.documents === 'object' ? resp.documents : resp;
  const approvedDocumentsSource = resp?.approvedDocuments && typeof resp.approvedDocuments === 'object' ? resp.approvedDocuments : null;
  const fileMap = [
    ['thesisDocumentName', 'thesisDocumentPath', 'Thesis Document'],
    ['synopsisDocumentName', 'synopsisDocumentPath', 'Synopsis Document'],
    ['hardCoverDesignName', 'hardCoverDesignPath', 'Hard Cover Design'],
    ['softCoverDesignName', 'softCoverDesignPath', 'Soft Cover Design'],
    ['synopsisCoverDesignName', 'synopsisCoverDesignPath', 'Synopsis Cover Design']
  ];
  const files = [];
  const approvedFiles = [];
  for (const [nameKey, pathKey, label] of fileMap) {
    files.push({
      label,
      fileName: documents?.[nameKey] || null,
      filePath: documents?.[pathKey] || null
    });
    approvedFiles.push({
      label,
      fileName: approvedDocumentsSource?.[nameKey] || null,
      filePath: approvedDocumentsSource?.[pathKey] || null
    });
  }

  const printingDetails = [];
  if (Array.isArray(resp?.bindings)) {
    resp.bindings.forEach((b, bindingIndex) => {
      const items = b.bindingItems || [];
      const base = {
        desc: `${b.bindingType} Binding`,
        bindingType: b.bindingType,
        bindingIndex,
        spinePrintingRequired: b.spinePrintingRequired,
        topContentArea: b.topContentArea,
        middleContentArea: b.middleContentArea,
        bottomContentArea: b.bottomContentArea,
        coverPageDesign: b.coverPageDesign,
        coverMaterial: b.coverMaterial,
        coverPageDesignFileName: b.coverPageDesignFileName
      };
      if (items.length) {
        items.forEach((item, itemIndex) => printingDetails.push({
          ...base,
          itemIndex,
          size: item.paperSize,
          paper: item.paper,
          color: item.printColour || item.printColor,
          printingType: item.printingType,
          noOfCopies: item.noOfCopies ?? item.noOfCopies === 0 ? item.noOfCopies : null,
          a4Pockets: item.a4Pockets,
          cdPockets: item.cdPockets,
          additionalInformation: item.additionalInformation || ''
        }));
      } else {
        printingDetails.push({
          ...base,
          itemIndex: 0,
          size: null,
          paper: null,
          color: null,
          printingType: null,
          noOfCopies: null,
          a4Pockets: null,
          cdPockets: null,
          additionalInformation: ''
        });
      }
    });
  }

  return {
    ...resp,
    files,
    approvedFiles,
    printingDetails,
    billingAddress,
    shippingAddress,
    customer,
    amount: resp?.totalAmount ?? resp?.amount,
    orderNumber: resp?.orderNumber ?? resp?.orderNo
  };
}

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)';
const CARD_SX = {
  borderRadius: '16px',
  boxShadow: CARD_SHADOW,
  border: '1px solid #edf2f7',
  width: '100%'
};
const CARD_CONTENT_SX = { p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } };

function DetailsRow({ label, value }) {
  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: '1px solid #f1f5f9',
        '&:last-child': { borderBottom: 'none', pb: 0 }
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ color: '#111827', fontSize: 14, fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>
        {value ?? '—'}
      </Box>
    </Box>
  );
}

function InfoField({ label, value, action }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        border: '1px solid #edf2f7',
        background: '#fff',
        height: '100%',
        minWidth: 0,
        width: '100%'
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.75 }}>
        {label}
      </Typography>
      {action || (
        <Typography
          component="div"
          sx={{
            fontSize: 14,
            color: '#111827',
            fontWeight: 500,
            lineHeight: 1.55,
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            minWidth: 0
          }}
        >
          {value ?? '—'}
        </Typography>
      )}
    </Box>
  );
}

function CardTitle({ children, color = '#2563eb' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
      <Box sx={{ width: 3, height: 20, borderRadius: '2px', background: color, flexShrink: 0 }} />
      <Typography fontWeight={700} fontSize={15} lineHeight={1}>
        {children}
      </Typography>
    </Box>
  );
}

function SectionHeader({ icon, title, subtitle, iconBg = '#eff6ff', iconColor = '#2563eb' }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={700} fontSize={15} lineHeight={1.2}>
          {title}
        </Typography>
        {subtitle && (
          <Typography fontSize={12} color="text.secondary" mt={0.3}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function SubPanel({ label, labelColor, bg, border, children }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: '12px', background: bg, border: `1px solid ${border}` }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: labelColor, mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function PageCountBox({ label, value, borderColor, hoverBg, iconColor }) {
  const pageNumbers = String(value ?? '0')
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const displayText = pageNumbers.length ? pageNumbers.join(',') : '0';

  return (
    <Box sx={{ minWidth: 0, width: '100%' }}>
      <Typography sx={{ fontSize: 11, color: '#9ca3af', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          background: '#fff',
          borderRadius: '8px',
          pl: 1.5,
          pr: 0.5,
          py: 1,
          border: `1px solid ${borderColor}`,
          minWidth: 0,
          width: '100%'
        }}
      >
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            pr: 0.5
          }}
        >
          {displayText}
        </Typography>
        <IconButton
          size="small"
          onClick={async () => {
            try { await navigator.clipboard.writeText(displayText); } catch {}
          }}
          sx={{ width: 26, height: 26, borderRadius: '6px', flexShrink: 0, mt: 0.25, '&:hover': { background: hoverBg } }}
        >
          <Copy size={12} color={iconColor} />
        </IconButton>
      </Box>
    </Box>
  );
}

function PagePanel({ title, titleColor, headerBg, headerBorder, borderColor, hoverBg, iconColor, colorMap }) {
  const SECTIONS = [
    { label: 'Black & White', keys: ['BLACK & WHITE'] },
    { label: 'Colour', keys: ['COLOUR', 'COLOR'] }
  ];

  const getVal = (map, keys) => {
    if (!map) return '0';
    for (const k of keys) {
      if (map[k] != null && map[k] !== '') return String(map[k]);
    }
    const mk = Object.keys(map);
    for (const k of keys) {
      const m = mk.find((x) => x.toLowerCase() === k.toLowerCase());
      if (m && map[m] != null && map[m] !== '') return String(map[m]);
    }
    return '0';
  };

  return (
    <Box sx={{ borderRadius: '12px', border: `1px solid ${headerBorder}`, width: '100%', minWidth: 0, height: '100%' }}>
      <Box sx={{ px: 1.5, py: 1, background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
        <Typography fontSize={12} fontWeight={700} color={titleColor}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2, minWidth: 0 }}>
        <Stack spacing={2}>
          {SECTIONS.map(({ label, keys }) => (
            <PageCountBox
              key={label}
              label={label}
              value={getVal(colorMap, keys)}
              borderColor={borderColor}
              hoverBg={hoverBg}
              iconColor={iconColor}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default function OrderDetailsAdmin() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [apiOrder, setApiOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [shippingEditOpen, setShippingEditOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    pickup: false,
    branchId: ''
  });
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  const reloadOrder = async () => {
    const orderResp = await getOrderById(orderId);
    const raw = unwrapOrderResponse(orderResp);
    setApiOrder(raw ? JSON.parse(JSON.stringify(raw)) : null);
    setOrder(normalizeOrderResponse(orderResp));
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!orderId) return;

      setTimelineLoading(true);
      setTimelineError(null);

      try {
        const [orderResp, timelineResp] = await Promise.allSettled([
          getOrderById(orderId),
          getCustomerPortalOrderTimeline(orderId)
        ]);

        if (!mounted) return;

        if (orderResp.status === 'fulfilled') {
          const raw = unwrapOrderResponse(orderResp.value);
          setApiOrder(raw ? JSON.parse(JSON.stringify(raw)) : null);
          setOrder(normalizeOrderResponse(orderResp.value));
        } else {
          console.log(orderResp.reason);
        }

        if (timelineResp.status === 'fulfilled') {
          setTimeline(timelineResp.value || null);
        } else {
          setTimelineError(timelineResp.reason?.message || 'Unable to load order timeline.');
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (mounted) {
          setTimelineLoading(false);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, [orderId]);

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setEditForm({
      paperSize: row.size || '',
      paper: row.paper || '',
      printColour: row.color || '',
      printingType: row.printingType || '',
      noOfCopies: row.noOfCopies ?? '',
      a4Pockets: row.a4Pockets ?? '',
      cdPockets: row.cdPockets ?? '',
      additionalInformation: row.additionalInformation || '',
      topContentArea: row.topContentArea || '',
      middleContentArea: row.middleContentArea || '',
      bottomContentArea: row.bottomContentArea || '',
      coverMaterial: row.coverMaterial || '',
      spinePrintingRequired: Boolean(row.spinePrintingRequired)
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleEditFieldChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBinding = async () => {
    if (!editingRow) {
      setEditError('No binding row selected.');
      return;
    }
    if (!orderId) {
      setEditError('Order ID is missing.');
      return;
    }

    const sourceOrder = apiOrder || order;
    if (!sourceOrder) {
      setEditError('Order details are not loaded yet.');
      return;
    }

    setEditSaving(true);
    setEditError('');

    try {
      const bindings = Array.isArray(sourceOrder?.bindings) ? JSON.parse(JSON.stringify(sourceOrder.bindings)) : [];
      const location = findBindingLocation(bindings, editingRow);
      if (!location) throw new Error(`Binding "${editingRow.bindingType || 'unknown'}" not found`);

      const { binding } = location;
      const itemIndex = editingRow.itemIndex ?? 0;

      binding.topContentArea = editForm.topContentArea ?? '';
      binding.middleContentArea = editForm.middleContentArea ?? '';
      binding.bottomContentArea = editForm.bottomContentArea ?? '';
      binding.coverMaterial = editForm.coverMaterial ?? '';
      binding.spinePrintingRequired = Boolean(editForm.spinePrintingRequired);

      if (!Array.isArray(binding.bindingItems)) binding.bindingItems = [];
      const existingItem = binding.bindingItems[itemIndex] || {};
      binding.bindingItems[itemIndex] = {
        ...existingItem,
        paperSize: editForm.paperSize ?? '',
        paper: editForm.paper ?? '',
        printColour: editForm.printColour ?? '',
        printingType: editForm.printingType ?? '',
        noOfCopies: toNumberOrNull(editForm.noOfCopies),
        a4Pockets: toNumberOrNull(editForm.a4Pockets),
        cdPockets: toNumberOrNull(editForm.cdPockets),
        additionalInformation: editForm.additionalInformation ?? ''
      };

      await updateAdminOrderBinding(orderId, editingRow.bindingType, binding);

      try {
        await reloadOrder();
      } catch (reloadErr) {
        console.error('Binding saved but failed to reload order', reloadErr);
      }

      setEditOpen(false);
      setEditingRow(null);
    } catch (e) {
      console.error('Failed to update binding', e);
      setEditError(parseApiError(e));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDownloadFile = async (file) => {
    if (!file?.filePath) return;
    try {
      const blob = await downloadOrderFile({ filePath: file.filePath, fileName: file.fileName });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error('Download failed', e);
      try { window.open(file.filePath, '_blank', 'noopener'); } catch {}
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order?.orderId) return;
    try {
      const blob = await downloadInvoice(order.orderId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error('Invoice download failed', e);
      try {
        window.open(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/order/invoice/get/${encodeURIComponent(String(order.orderId))}`,
          '_blank', 'noopener'
        );
      } catch {}
    }
  };

  const handleOpenShippingEdit = () => {
    const source = apiOrder || order || {};
    const sourceAddress = source.shippingAddress || {};
    const placement = String(source.placementType || '').toLowerCase();
    const pickup = placement.includes('pickup') || Boolean(source.pickup);

    setShippingForm({
      address1: sourceAddress.address1 || '',
      address2: sourceAddress.address2 || '',
      city: sourceAddress.city || '',
      state: sourceAddress.state || '',
      country: sourceAddress.country || '',
      pincode: sourceAddress.pincode || '',
      pickup,
      branchId: source.branchId != null ? String(source.branchId) : ''
    });
    setShippingError('');
    setShippingEditOpen(true);
  };

  const handleShippingFieldChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveShipping = async () => {
    if (!orderId) {
      setShippingError('Order ID is missing.');
      return;
    }

    setShippingSaving(true);
    setShippingError('');
    try {
      const payload = {
        shippingAddress: {
          address1: shippingForm.address1 || '',
          address2: shippingForm.address2 || '',
          city: shippingForm.city || '',
          state: shippingForm.state || '',
          country: shippingForm.country || '',
          pincode: shippingForm.pincode || ''
        },
        pickup: Boolean(shippingForm.pickup),
        branchId: shippingForm.branchId === '' ? null : toNumberOrNull(shippingForm.branchId)
      };

      await updateAdminOrderShipping(orderId, payload);
      await reloadOrder();
      setShippingEditOpen(false);
    } catch (e) {
      setShippingError(parseApiError(e));
    } finally {
      setShippingSaving(false);
    }
  };

  if (!order) return null;

  const hardBinding =
    order.printingDetails?.find((p) => (p.bindingType || '').toLowerCase().includes('hard')) ||
    order.printingDetails?.find((p) => p.topContentArea || p.middleContentArea || p.bottomContentArea) ||
    {};

  const hasShipping = Boolean(
    order.shippingAddress &&
    (order.shippingAddress.address1 || order.shippingAddress.address2 || order.shippingAddress.city || order.shippingAddress.pincode)
  );

  const billingStreet = [order.billingAddress?.address1, order.billingAddress?.address2].filter(Boolean).join(', ') || null;
  const shippingStreet = [order.shippingAddress?.address1, order.shippingAddress?.address2].filter(Boolean).join(', ') || null;

  const thesisFile = order.files?.find((f) => f.label === 'Thesis Document');

  return (
    <Box sx={{ py: 3, background: '#f4f7fb', minHeight: '100vh', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.3px">
              Order #{order?.orderNumber || order?.orderId}
            </Typography>
            {order.orderStatus && (
              <Chip
                label={order.orderStatus}
                size="small"
                color="primary"
                sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" fontSize={13}>
            Manage and track order details
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Download size={16} />}
          onClick={handleDownloadInvoice}
          disabled={!order?.orderId}
          sx={{
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(37,99,235,0.22)',
            '&:hover': { boxShadow: '0 4px 14px rgba(37,99,235,0.32)' }
          }}
        >
          Download Invoice
        </Button>
      </Box>

      <Stack spacing={3}>
        {/* Printing table — full width */}
        <Card sx={CARD_SX}>
          <CardContent sx={CARD_CONTENT_SX}>
            <CardTitle>Hard Printing & Binding Details </CardTitle>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: '10px', overflowX: 'auto', border: '1px solid #edf2f7', boxShadow: 'none' }}
            >
              <Table sx={{ minWidth: 980, tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  {['130px', '90px', '110px', '90px', '80px', '100px', '60px', '60px', '160px', '110px', '120px', '120px', '70px'].map((w, idx) => (
                    <col key={idx} style={{ width: w }} />
                  ))}
                </colgroup>
                <TableBody>
                  <TableRow sx={{ background: '#f8fafc' }}>
                    {['Description', 'Paper Size', 'Paper Type', 'Colour', 'No. Copies', 'Printing', 'A4', 'CD', 'Information', 'Top Content', 'Middle Content', 'Bottom Content', 'Actions'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: '#374151',
                          py: 1.5,
                          px: 1.5,
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>

                  {order.printingDetails?.map((r, i) => (
                    <TableRow
                      key={i}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 'none' }, '&:hover': { background: '#f8fafc' } }}
                    >
                      {[r.desc, r.size, r.paper, r.color, (r.noOfCopies != null ? String(r.noOfCopies) : '—'), r.printingType, r.a4Pockets, r.cdPockets, r.additionalInformation || '—', r.topContentArea || '—', r.middleContentArea || '—', r.bottomContentArea || '—'].map((v, ci) => (
                        <TableCell
                          key={ci}
                          sx={{
                            fontSize: 13,
                            color: '#374151',
                            py: 1.5,
                            px: 1.5,
                            verticalAlign: 'top',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: ci === 8 ? 'normal' : 'nowrap',
                            wordBreak: ci === 8 ? 'break-word' : 'normal'
                          }}
                        >
                          {v ?? '—'}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                        <Tooltip title="Edit binding">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(r)}
                            aria-label="Edit binding row"
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              color: '#2563eb'
                            }}
                          >
                            <Pencil size={14} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Binding info — full width */}
        <Card sx={CARD_SX}>
          <CardContent sx={CARD_CONTENT_SX}>
            {/* <CardTitle>Binding Info & Page Counts</CardTitle> */}

          {/* <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
              <InfoField
                label="Thesis File"
                action={
                  thesisFile?.filePath ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleDownloadFile(thesisFile)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 12, py: 0.6, px: 2, boxShadow: 'none' }}
                    >
                      View File
                    </Button>
                  ) : (
                    <Typography sx={{ color: '#9ca3af', fontSize: 14 }}>Not available</Typography>
                  )
                }
              />
            </Grid>
            {[
              ['Cover Material', hardBinding.coverMaterial || '—'],
              ['Spine Print', hardBinding.spinePrintingRequired ? 'Required' : 'Not Required'],
              ['Top Content', hardBinding.topContentArea || '—'],
              ['Middle Content', hardBinding.middleContentArea || '—'],
              ['Bottom Content', hardBinding.bottomContentArea || '—']
            ].map(([lbl, val]) => (
              <Grid key={lbl} size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
                <InfoField label={lbl} value={val} />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 2.5, borderColor: '#edf2f7' }} /> */}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ minWidth: 0 }}>
              <PagePanel
                title="Thesis Pages"
                titleColor="#1d4ed8"
                headerBg="#eff6ff"
                headerBorder="#dbeafe"
                borderColor="#dbeafe"
                hoverBg="#eff6ff"
                iconColor="#2563eb"
                colorMap={order.pageColorMap}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ minWidth: 0 }}>
              <PagePanel
                title="Synopsis Pages"
                titleColor="#065f46"
                headerBg="#f0fdf4"
                headerBorder="#d1fae5"
                borderColor="#d1fae5"
                hoverBg="#f0fdf4"
                iconColor="#10b981"
                colorMap={order.pageColorMapSynopsis}
              />
            </Grid>
          </Grid>
          </CardContent>
        </Card>

        {/* Order Details — full width */}
        <Card sx={CARD_SX}>
          <CardContent sx={CARD_CONTENT_SX}>
            <SectionHeader icon={<Receipt size={15} />} title="Order Details" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow label="Order ID" value={order.orderId} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow label="Order Number" value={order.orderNumber} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow
                  label="Amount"
                  value={
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
                      ₹{Number(order.amount ?? 0).toFixed(2)}
                    </Typography>
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow
                  label="Payment"
                  value={
                    <Chip
                      label={order.paymentStatus || order.paymentOrderId || '—'}
                      color={
                        (order.paymentStatus || '').toLowerCase() === 'success' ? 'success' :
                        (order.paymentStatus || '').toLowerCase() === 'pending' ? 'warning' :
                        (order.paymentStatus || '').toLowerCase() === 'failed' ? 'error' : 'default'
                      }
                      size="small"
                      sx={{ height: 24, fontWeight: 600, fontSize: 12 }}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow label="Placement" value={order.placementType} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow label="Branch" value={order.branchName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DetailsRow label="Expected Delivery" value={formatDate(order.expectedDeliveryDate)} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Documents | Approved Documents | Customer — equal width */}
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', minWidth: 0 }}>
            <Card sx={{ ...CARD_SX, flex: 1 }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <CardTitle>Documents</CardTitle>
                <Stack spacing={1.5} divider={<Divider sx={{ borderColor: '#f1f5f9' }} />}>
                  {order.files?.map((file, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: file.fileName ? '#eff6ff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} color={file.fileName ? '#2563eb' : '#9ca3af'} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} fontSize={14} color="#111827">{file.label}</Typography>
                        {file.fileName ? (
                          <Typography sx={{ color: '#2563eb', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', wordBreak: 'break-word', lineHeight: 1.5, mt: 0.25 }} onClick={() => handleDownloadFile(file)}>
                            {file.fileName}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: '#9ca3af', fontSize: 13, mt: 0.25 }}>Not uploaded</Typography>
                        )}
                      </Box>
                      {file.filePath && (
                        <IconButton size="small" onClick={() => handleDownloadFile(file)} sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#eff6ff', flexShrink: 0 }}>
                          <Download size={14} color="#2563eb" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', minWidth: 0 }}>
            <Card sx={{ ...CARD_SX, flex: 1 }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <CardTitle color="#16a34a">Approved Documents</CardTitle>
                <Stack spacing={1.5} divider={<Divider sx={{ borderColor: '#f1f5f9' }} />}>
                  {order.approvedFiles?.map((file, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: file.fileName ? '#f0fdf4' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} color={file.fileName ? '#16a34a' : '#9ca3af'} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} fontSize={14} color="#111827">{file.label}</Typography>
                        {file.fileName ? (
                          <Typography sx={{ color: '#16a34a', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', wordBreak: 'break-word', lineHeight: 1.5, mt: 0.25 }} onClick={() => handleDownloadFile(file)}>
                            {file.fileName}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: '#9ca3af', fontSize: 13, mt: 0.25 }}>Not uploaded</Typography>
                        )}
                      </Box>
                      {file.filePath && (
                        <IconButton size="small" onClick={() => handleDownloadFile(file)} sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#f0fdf4', flexShrink: 0 }}>
                          <Download size={14} color="#16a34a" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', minWidth: 0 }}>
            <Card sx={{ ...CARD_SX, flex: 1 }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <SectionHeader icon={<User size={15} />} title="Customer" subtitle="Contact information" />
                <SubPanel label="Profile" labelColor="#2563eb" bg="#f8fbff" border="#dbeafe">
                  <DetailsRow label="Name" value={order.customer?.name} />
                  <DetailsRow label="Email" value={order.customer?.email} />
                  <DetailsRow label="Phone" value={order.customer?.phone} />
                  <DetailsRow label="WhatsApp" value={order.customer?.phone} />
                </SubPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Billing | Shipping — equal width */}
        <Card sx={CARD_SX}>
        <CardContent sx={CARD_CONTENT_SX}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%' }}>
                <SectionHeader
                  icon={<Receipt size={15} />}
                  title="Billing Address"
                  iconBg="#fafafa"
                  iconColor="#374151"
                />
                <SubPanel label="Address" labelColor="#374151" bg="#fafafa" border="#e5e7eb">
                  <DetailsRow label="Street" value={billingStreet} />
                  <DetailsRow label="City" value={order.billingAddress?.city} />
                  <DetailsRow label="State" value={order.billingAddress?.state} />
                  <DetailsRow label="Country" value={order.billingAddress?.country} />
                  <DetailsRow label="PIN Code" value={order.billingAddress?.pincode} />
                </SubPanel>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <SectionHeader
                    icon={<Truck size={15} />}
                    title={hasShipping ? 'Shipping Details' : 'Branch Details'}
                    iconBg={hasShipping ? '#f0fdf4' : '#f5f3ff'}
                    iconColor={hasShipping ? '#16a34a' : '#7c3aed'}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Pencil size={14} />}
                    onClick={handleOpenShippingEdit}
                    sx={{ textTransform: 'none', borderRadius: '8px', flexShrink: 0, mt: -2 }}
                  >
                    Edit
                  </Button>
                </Box>
                {hasShipping ? (
                  <SubPanel
                    label="Delivery Address"
                    labelColor={hasShipping ? '#16a34a' : '#7c3aed'}
                    bg={hasShipping ? '#f0fdf4' : '#f5f3ff'}
                    border={hasShipping ? '#d1fae5' : '#ede9fe'}
                  >
                    <DetailsRow label="Street" value={shippingStreet} />
                    <DetailsRow label="City" value={order.shippingAddress?.city} />
                    <DetailsRow label="State" value={order.shippingAddress?.state} />
                    <DetailsRow label="Country" value={order.shippingAddress?.country} />
                    <DetailsRow label="PIN Code" value={order.shippingAddress?.pincode} />
                  </SubPanel>
                ) : (
                  <SubPanel label="Branch" labelColor="#7c3aed" bg="#f5f3ff" border="#ede9fe">
                    <DetailsRow label="Branch" value={order.branchName || '—'} />
                    <DetailsRow label="Placement" value={order.placementType || '—'} />
                  </SubPanel>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        </Card>

        <Card sx={CARD_SX}>
          <CardContent sx={CARD_CONTENT_SX}>
            <SectionHeader icon={<Receipt size={15} />} title="Order Timeline" subtitle="Track complete workflow" />

            {timelineLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : timelineError ? (
              <Typography color="error">{timelineError}</Typography>
            ) : timeline ? (
              <>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap' }}>
                  <Chip label={`Stage: ${timeline.currentStage || '—'}`} color="primary" size="small" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                  <Chip label={`Payment: ${timeline.paymentStatus || '—'}`} color="success" size="small" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'stretch', width: '100%', position: 'relative', gap: { xs: 1, md: 1.5 }, overflowX: { xs: 'auto', md: 'visible' }, pb: { xs: 1, md: 0 } }}>
                  {timeline.stages?.map((s, idx) => {
                    const active = Boolean(s.isCompleted);
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
                        key={`${s.stageName || s.name || 'stage'}-${idx}`}
                        sx={{
                          flex: '1 1 0',
                          minWidth: { xs: 140, sm: 150, md: 0 },
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                      >
                        {idx !== (timeline.stages?.length || 0) - 1 && (
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
                          {icons[s.stageName] || <CheckCircle color="#fff" size={20} />}
                        </Box>

                        <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 700, color: active ? '#111827' : '#6b7280' }}>
                          {s.stageName || s.name || 'Stage'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {s.completedAt ? formatDate(s.completedAt) : (active ? 'In progress' : 'Pending')}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">No timeline data available.</Typography>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={editOpen} onClose={() => !editSaving && setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Edit Binding — {editingRow?.desc || editingRow?.bindingType || 'Binding'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Paper Size" value={editForm.paperSize ?? ''} onChange={handleEditFieldChange('paperSize')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Paper Type" value={editForm.paper ?? ''} onChange={handleEditFieldChange('paper')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Colour" value={editForm.printColour ?? ''} onChange={handleEditFieldChange('printColour')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Printing Type" value={editForm.printingType ?? ''} onChange={handleEditFieldChange('printingType')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="No. Copies" type="number" value={editForm.noOfCopies ?? ''} onChange={handleEditFieldChange('noOfCopies')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="A4 Pockets" type="number" value={editForm.a4Pockets ?? ''} onChange={handleEditFieldChange('a4Pockets')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="CD Pockets" type="number" value={editForm.cdPockets ?? ''} onChange={handleEditFieldChange('cdPockets')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Additional Information" multiline minRows={2} value={editForm.additionalInformation ?? ''} onChange={handleEditFieldChange('additionalInformation')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="Top Content" value={editForm.topContentArea ?? ''} onChange={handleEditFieldChange('topContentArea')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="Middle Content" value={editForm.middleContentArea ?? ''} onChange={handleEditFieldChange('middleContentArea')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" label="Bottom Content" value={editForm.bottomContentArea ?? ''} onChange={handleEditFieldChange('bottomContentArea')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Cover Material" value={editForm.coverMaterial ?? ''} onChange={handleEditFieldChange('coverMaterial')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(editForm.spinePrintingRequired)}
                    onChange={handleEditFieldChange('spinePrintingRequired')}
                  />
                }
                label="Spine Printing Required"
              />
            </Grid>
          </Grid>
          {editError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {editError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveBinding} disabled={editSaving}>
            {editSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shippingEditOpen} onClose={() => !shippingSaving && setShippingEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Shipping Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Address 1" value={shippingForm.address1} onChange={handleShippingFieldChange('address1')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Address 2" value={shippingForm.address2} onChange={handleShippingFieldChange('address2')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="City" value={shippingForm.city} onChange={handleShippingFieldChange('city')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="State" value={shippingForm.state} onChange={handleShippingFieldChange('state')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Country" value={shippingForm.country} onChange={handleShippingFieldChange('country')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Pincode" value={shippingForm.pincode} onChange={handleShippingFieldChange('pincode')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Checkbox checked={Boolean(shippingForm.pickup)} onChange={handleShippingFieldChange('pickup')} />}
                label="Pickup Order"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Branch ID" type="number" value={shippingForm.branchId} onChange={handleShippingFieldChange('branchId')} />
            </Grid>
          </Grid>
          {shippingError && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {shippingError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShippingEditOpen(false)} disabled={shippingSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveShipping} disabled={shippingSaving}>
            {shippingSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
