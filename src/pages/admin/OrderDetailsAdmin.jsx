





// ==========================
// ORDERDETAILSADMIN.JSX — polished v3
// ==========================

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

// ─── Design tokens ───────────────────────────────────────────────────────────
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)';
const CARD_SX = {
  borderRadius: '16px',
  boxShadow: CARD_SHADOW,
  border: '1px solid #edf2f7',
  overflow: 'hidden',
  height: '100%'
};
const CARD_CONTENT_SX = { p: 2.5, '&:last-child': { pb: 2.5 } };

// ─── Reusable components ──────────────────────────────────────────────────────

/** Single label / value row */
function DetailsRow({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        py: 1.25,
        borderBottom: '1px solid #f1f5f9',
        '&:last-child': { borderBottom: 'none', pb: 0 }
      }}
    >
      <Typography sx={{ fontWeight: 500, fontSize: 13, color: '#6b7280', flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ color: '#111827', fontSize: 13, fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>
        {value ?? '—'}
      </Box>
    </Box>
  );
}

/** Coloured left-bar card title */
function CardTitle({ children, color = '#2563eb' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
      <Box
        sx={{
          width: 3,
          height: 20,
          borderRadius: '2px',
          background: color,
          flexShrink: 0
        }}
      />
      <Typography fontWeight={700} fontSize={15} lineHeight={1}>
        {children}
      </Typography>
    </Box>
  );
}

/** Section header with icon box */
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

/** Tinted sub-panel (Customer / Billing boxes) */
function SubPanel({ label, labelColor, bg, border, children }) {
  return (
    <Box sx={{ p: 2, borderRadius: '12px', background: bg, border: `1px solid ${border}`, height: '100%' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: labelColor, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/** Page-count display box with copy button */
function PageCountBox({ label, value, borderColor, hoverBg, iconColor }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, color: '#9ca3af', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderRadius: '8px',
          pl: 1.5,
          pr: 0.5,
          py: 0.5,
          border: `1px solid ${borderColor}`
        }}
      >
        <Typography sx={{ color: '#111827', flex: 1, fontSize: 13, fontWeight: 600 }}>{value}</Typography>
        <IconButton
          size="small"
          onClick={async () => {
            try { await navigator.clipboard.writeText(String(value ?? '')); } catch {}
          }}
          sx={{ width: 26, height: 26, borderRadius: '6px', '&:hover': { background: hoverBg } }}
        >
          <Copy size={12} color={iconColor} />
        </IconButton>
      </Box>
    </Box>
  );
}

/** Tinted page-count panel (Thesis / Synopsis) */
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
    <Box sx={{ borderRadius: '12px', border: `1px solid ${headerBorder}`, overflow: 'hidden' }}>
      <Box sx={{ px: 1.5, py: 1, background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
        <Typography fontSize={12} fontWeight={700} color={titleColor}>{title}</Typography>
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Stack spacing={1}>
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

// ─── Main component ───────────────────────────────────────────────────────────
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

        const files = [];
        if (resp.documents && typeof resp.documents === 'object') {
          const map = [
            ['thesisDocumentName', 'thesisDocumentPath', 'Thesis Document'],
            ['synopsisDocumentName', 'synopsisDocumentPath', 'Synopsis Document'],
            ['hardCoverDesignName', 'hardCoverDesignPath', 'Hard Cover Design'],
            ['softCoverDesignName', 'softCoverDesignPath', 'Soft Cover Design']
          ];
          for (const [nameKey, pathKey, label] of map) {
            files.push({ label, fileName: resp.documents?.[nameKey] || null, filePath: resp.documents?.[pathKey] || null });
          }
        }

        const printingDetails = [];
        if (Array.isArray(resp.bindings)) {
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
                a4Pockets: item.a4Pockets,
                cdPockets: item.cdPockets,
                additionalInformation: item.additionalInformation || ''
              }));
            } else {
              printingDetails.push({ ...base, size: null, paper: null, color: null, printingType: null, a4Pockets: null, cdPockets: null, additionalInformation: '' });
            }
          });
        }

        setOrder({
          ...resp,
          files,
          printingDetails,
          amount: resp.totalAmount,
          customer: {
            name: `${resp.customer?.firstName || ''} ${resp.customer?.lastName || ''}`.trim(),
            email: resp.customer?.email,
            phone: resp.customer?.mobile
          }
        });
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
    (order.shippingAddress.address1 || order.shippingAddress.city || order.shippingAddress.pincode)
  );

  const thesisFile = order.files?.find((f) => f.label === 'Thesis Document');

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3.5, background: '#f4f7fb', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3.5,
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

      {/* ── MAIN GRID ────────────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} alignItems="flex-start">

        {/* ══ LEFT COL (8/12) ═══════════════════════════════════════════════ */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>

            {/* ── 1. PRINTING TABLE ───────────────────────────────────────── */}
            <Card sx={{ ...CARD_SX, height: 'auto' }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <CardTitle>Hard Printing & Binding Details</CardTitle>
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: '10px', overflowX: 'auto', border: '1px solid #edf2f7', boxShadow: 'none' }}
                >
                  <Table sx={{ minWidth: 1100 }}>
                    <TableBody>
                      {/* Header row */}
                      <TableRow sx={{ background: '#f8fafc' }}>
                        {['Description', 'Paper Size', 'Paper Type', 'Colour', 'Printing', 'A4', 'CD', 'Information'].map((h) => (
                          <TableCell
                            key={h}
                            sx={{ fontWeight: 700, fontSize: 11, color: '#374151', py: 1.25, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.3px' }}
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
                          {[r.desc, r.size, r.paper, r.color, r.printingType, r.a4Pockets, r.cdPockets, r.additionalInformation || '—'].map((v, ci) => (
                            <TableCell key={ci} sx={{ fontSize: 13, color: '#374151', py: 1.5 }}>{v ?? '—'}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* ── 2. BOTTOM ROW: Binding Info + Page Counts | Documents ───── */}
            {/*    Each card is xs=12 so it always takes full width on small    */}
            {/*    screens, and md=6 splits them side-by-side on medium+.       */}
            <Grid container spacing={2.5} sx={{ width: '100%' }}>

              {/* ── 2a. Binding Info + Page Counts ─────────────────────────── */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
                <Card sx={{ ...CARD_SX, width: '100%' }}>
                  <CardContent sx={CARD_CONTENT_SX}>
                    <CardTitle>Binding Info & Page Counts</CardTitle>

                    <Grid container spacing={2.5} sx={{ height: 'calc(100% - 44px)' }}>

                      {/* Binding table */}
                      <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ borderRadius: '10px', border: '1px solid #edf2f7', overflow: 'hidden', flex: 1 }}>
                          <Box sx={{ px: 2, py: 1.25, background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                            <Typography fontSize={11} fontWeight={700} color="#6b7280" textTransform="uppercase" letterSpacing="0.4px">
                              Details
                            </Typography>
                          </Box>
                          <Box sx={{ px: 2, py: 1.5 }}>
                            {/* Thesis file row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                              <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Thesis File</Typography>
                              {thesisFile?.filePath ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleDownloadFile(thesisFile)}
                                  sx={{ minWidth: 52, borderRadius: '6px', textTransform: 'none', fontSize: 11, py: 0.4, px: 1, boxShadow: 'none' }}
                                >
                                  View
                                </Button>
                              ) : (
                                <Typography sx={{ color: '#9ca3af', fontSize: 12 }}>N/A</Typography>
                              )}
                            </Box>

                            {/* Binding fields */}
                            {[
                              ['Cover', hardBinding.coverMaterial || '—'],
                              ['Spine Print', hardBinding.spinePrintingRequired ? 'Required' : 'Not Required'],
                              ['Top Content', hardBinding.topContentArea || '—'],
                              ['Mid Content', hardBinding.middleContentArea || '—'],
                              ['Bot Content', hardBinding.bottomContentArea || '—']
                            ].map(([lbl, val]) => (
                              <Box
                                key={lbl}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: 2,
                                  py: 1.25,
                                  borderBottom: '1px solid #f1f5f9',
                                  '&:last-child': { borderBottom: 'none', pb: 0.25 }
                                }}
                              >
                                <Typography sx={{ fontSize: 12, color: '#6b7280', flexShrink: 0, minWidth: 72 }}>{lbl}</Typography>
                                <Typography sx={{ fontSize: 12, color: '#374151', textAlign: 'right', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{val}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Page count panels */}
                      <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={1.5} sx={{ flex: 1 }}>
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
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* ── 2b. Documents ──────────────────────────────────────────── */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
                <Card sx={{ ...CARD_SX, width: '100%' }}>
                  <CardContent sx={CARD_CONTENT_SX}>
                    <CardTitle>Documents</CardTitle>

                    <Stack divider={<Divider sx={{ borderColor: '#f1f5f9' }} />}>
                      {order.files?.map((file, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.75,
                            px: 1,
                            borderRadius: '8px',
                            transition: 'background 0.12s',
                            '&:hover': { background: '#f8fafc' }
                          }}
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '8px',
                              background: file.fileName ? '#eff6ff' : '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <FileText size={15} color={file.fileName ? '#2563eb' : '#9ca3af'} />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography fontWeight={600} fontSize={13} mb={0.25} color="#111827">
                              {file.label}
                            </Typography>
                            {file.fileName ? (
                              <Typography
                                sx={{
                                  color: file.filePath ? '#2563eb' : '#6b7280',
                                  cursor: file.filePath ? 'pointer' : 'default',
                                  fontSize: 12,
                                  textDecoration: file.filePath ? 'underline' : 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => handleDownloadFile(file)}
                              >
                                {file.fileName}
                              </Typography>
                            ) : (
                              <Typography sx={{ color: '#9ca3af', fontSize: 12 }}>Not uploaded</Typography>
                            )}
                          </Box>
                          {file.filePath && (
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile(file)}
                              sx={{ width: 28, height: 28, borderRadius: '6px', background: '#eff6ff', '&:hover': { background: '#dbeafe' }, flexShrink: 0 }}
                            >
                              <Download size={13} color="#2563eb" />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Stack>
        </Grid>

        {/* ══ RIGHT COL (4/12) ══════════════════════════════════════════════ */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>

            {/* ── Order Details ───────────────────────────────────────────── */}
            <Card sx={{ ...CARD_SX, height: 'auto' }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <SectionHeader icon={<Receipt size={15} />} title="Order Details" />

                <DetailsRow label="Order ID" value={order.orderId} />
                <DetailsRow label="Order Number" value={order.orderNumber} />
                <DetailsRow
                  label="Amount"
                  value={
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                      ₹{Number(order.amount ?? 0).toFixed(2)}
                    </Typography>
                  }
                />
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
                      sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
                    />
                  }
                />
                <DetailsRow label="Placement" value={order.placementType} />
                <DetailsRow label="Branch" value={order.branchName} />
                <DetailsRow label="Expected Delivery" value={formatDate(order.expectedDeliveryDate)} />
              </CardContent>
            </Card>

            {/* ── Customer & Billing ──────────────────────────────────────── */}
            <Card sx={{ ...CARD_SX, height: 'auto' }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <SectionHeader
                  icon={<User size={15} />}
                  title="Customer & Billing"
                  subtitle="Profile & billing address"
                />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <SubPanel label="Customer" labelColor="#2563eb" bg="#f8fbff" border="#dbeafe">
                      <DetailsRow label="Name"      value={order.customer?.name} />
                      <DetailsRow label="Email"     value={order.customer?.email} />
                      <DetailsRow label="Phone"     value={order.customer?.phone} />
                      <DetailsRow label="WhatsApp"  value={order.customer?.phone} />
                    </SubPanel>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SubPanel label="Billing" labelColor="#374151" bg="#fafafa" border="#e5e7eb">
                      <DetailsRow label="Address" value={order.billingAddress?.address1} />
                      <DetailsRow label="City"    value={order.billingAddress?.city} />
                      <DetailsRow label="State"   value={order.billingAddress?.state} />
                      <DetailsRow label="PIN"     value={order.billingAddress?.pincode} />
                    </SubPanel>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── Shipping / Branch ───────────────────────────────────────── */}
            <Card sx={{ ...CARD_SX, height: 'auto' }}>
              <CardContent sx={CARD_CONTENT_SX}>
                <SectionHeader
                  icon={<Truck size={15} />}
                  title={hasShipping ? 'Shipping Details' : 'Branch Details'}
                  iconBg={hasShipping ? '#f0fdf4' : '#f5f3ff'}
                  iconColor={hasShipping ? '#16a34a' : '#7c3aed'}
                />

                {hasShipping ? (
                  <>
                    <DetailsRow
                      label="Address"
                      value={[order.shippingAddress?.address1, order.shippingAddress?.address2].filter(Boolean).join(', ') || '—'}
                    />
                    <DetailsRow label="City"  value={order.shippingAddress?.city} />
                    <DetailsRow label="State" value={order.shippingAddress?.state} />
                    <DetailsRow label="PIN"   value={order.shippingAddress?.pincode} />
                  </>
                ) : (
                  <>
                    <DetailsRow label="Branch"    value={order.branchName || '—'} />
                    <DetailsRow label="Placement" value={order.placementType || '—'} />
                  </>
                )}
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  );
}