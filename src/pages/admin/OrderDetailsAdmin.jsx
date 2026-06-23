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
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { Download, User, Truck, Receipt, FileText, Copy } from 'lucide-react';

import { getOrderById, downloadOrderFile, downloadInvoice } from 'api/orders';

function pickFirst(source, keys) {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function normalizeOrderResponse(raw) {
  const resp = raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;

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
  const files = [];
  const fileMap = [
    ['thesisDocumentName', 'thesisDocumentPath', 'Thesis Document'],
    ['synopsisDocumentName', 'synopsisDocumentPath', 'Synopsis Document'],
    ['hardCoverDesignName', 'hardCoverDesignPath', 'Hard Cover Design'],
    ['softCoverDesignName', 'softCoverDesignPath', 'Soft Cover Design']
  ];
  for (const [nameKey, pathKey, label] of fileMap) {
    files.push({
      label,
      fileName: documents?.[nameKey] || null,
      filePath: documents?.[pathKey] || null
    });
  }

  const printingDetails = [];
  if (Array.isArray(resp?.bindings)) {
    resp.bindings.forEach((b) => {
      const items = b.bindingItems || [];
      const base = {
        desc: `${b.bindingType} Binding`,
        bindingType: b.bindingType,
        spinePrintingRequired: b.spinePrintingRequired,
        topContentArea: b.topContentArea,
        middleContentArea: b.middleContentArea,
        bottomContentArea: b.bottomContentArea,
        coverPageDesign: b.coverPageDesign,
        coverMaterial: b.coverMaterial,
        coverPageDesignFileName: b.coverPageDesignFileName
      };
      if (items.length) {
        items.forEach((item) => printingDetails.push({
          ...base,
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

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!orderId) return;
      try {
        const resp = await getOrderById(orderId);
        if (!mounted) return;

        setOrder(normalizeOrderResponse(resp));
      } catch (e) {
        console.log(e);
      }
    };

    load();
    return () => { mounted = false; };
  }, [orderId]);

  const handleDownloadFile = async (file) => {
    if (!file?.filePath) return;
    try {
      const blob = await downloadOrderFile({ filePath: file.filePath, fileName: file.fileName });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
            Manage and track order details gggg
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
            <CardTitle>Hard Printing & Binding Details</CardTitle>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: '10px', overflowX: 'auto', border: '1px solid #edf2f7', boxShadow: 'none' }}
            >
              <Table sx={{ minWidth: 900 }}>
                <TableBody>
                  <TableRow sx={{ background: '#f8fafc' }}>
                    {['Description', 'Paper Size', 'Paper Type', 'Colour', 'No. Copies', 'Printing', 'A4', 'CD', 'Information', 'Top Content', 'Middle Content', 'Bottom Content'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, fontSize: 11, color: '#374151', py: 1.5, px: 2, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.3px' }}
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
                            py: 1.75,
                            px: 2,
                            whiteSpace: ci === 8 ? 'normal' : 'nowrap',
                            wordBreak: 'break-word',
                            verticalAlign: 'top',
                            minWidth: ci === 8 ? 200 : undefined
                          }}
                        >
                          {v ?? '—'}
                        </TableCell>
                      ))}
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
            <CardTitle>Binding Info & Page Counts</CardTitle>

          <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
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

          <Divider sx={{ mb: 2.5, borderColor: '#edf2f7' }} />

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

        {/* Documents | Customer — equal width */}
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
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

          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
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
                <SectionHeader
                  icon={<Truck size={15} />}
                  title={hasShipping ? 'Shipping Details' : 'Branch Details'}
                  iconBg={hasShipping ? '#f0fdf4' : '#f5f3ff'}
                  iconColor={hasShipping ? '#16a34a' : '#7c3aed'}
                />
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
      </Stack>
    </Box>
  );
}
