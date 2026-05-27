// ==========================
// UPDATED ORDERDETAILSADMIN.JSX
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

import {
  Download,
  User,
  Truck,
  Receipt,
  FileText,
  Copy
} from 'lucide-react';

import { getOrderById, downloadOrderFile } from 'api/orders';

function DetailsRow({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid #edf2f7'
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 14,
          color: '#111827'
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          color: '#6b7280',
          fontSize: 14,
          textAlign: 'right'
        }}
      >
        {value ?? '—'}
      </Box>
    </Box>
  );
}

export default function OrderDetailsAdmin() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const date = new Date(d);
      return date.toLocaleString();
    } catch (e) {
      return d;
    }
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
            files.push({
              label,
              fileName: resp.documents?.[nameKey] || null,
              filePath: resp.documents?.[pathKey] || null
            });
          }
        }

        const printingDetails = [];

        if (Array.isArray(resp.bindings)) {
          resp.bindings.forEach((b) => {
            (b.bindingItems || []).forEach((item) => {
              printingDetails.push({
                desc: `${b.bindingType} Binding`,
                size: item.paperSize,
                paper: item.paper,
                color: item.printColour || item.printColor,
                printingType: item.printingType,
                a4Pockets: item.a4Pockets,
                cdPockets: item.cdPockets,
                additionalInformation: item.additionalInformation || '',
                bindingType: b.bindingType,
                spinePrintingRequired: b.spinePrintingRequired,
                topContentArea: b.topContentArea,
                middleContentArea: b.middleContentArea,
                bottomContentArea: b.bottomContentArea,
                coverPageDesign: b.coverPageDesign,
                coverMaterial: b.coverMaterial,
                coverPageDesignFileName: b.coverPageDesignFileName
              });
            });
          });
        }

        setOrder({
          ...resp,
          files,
          printingDetails,
          amount: resp.totalAmount,
          customer: {
            name: `${resp.customer?.firstName || ''} ${
              resp.customer?.lastName || ''
            }`,
            email: resp.customer?.email,
            phone: resp.customer?.mobile
          }
        });
      } catch (e) {
        console.log(e);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleDownloadFile = async (file) => {
    if (!file?.filePath) return;
    try {
      const blob = await downloadOrderFile({ filePath: file.filePath, fileName: file.fileName });
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
  };

  if (!order) return null;

  const hardBinding = order.printingDetails?.find((p) => (p.bindingType || '').toUpperCase() === 'HARD') || {};

  const hasShipping = Boolean(
    order.shippingAddress && (
      order.shippingAddress.address1 ||
      order.shippingAddress.city ||
      order.shippingAddress.pincode
    )
  );

  const getPagesDisplay = (map, key) => {
    const raw = map?.[key] || '';
    if (!raw) return '0';
    // if multiple pages provided as CSV, show the list, otherwise show single page or count
    return raw.includes(',') ? raw : raw;
  };

  return (
    <Box
      sx={{
        p: 3,
        background: '#f4f7fb',
        minHeight: '100vh'
      }}
    >
      {/* ================= HEADER ================= */}

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
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Order #{order?.orderNumber || order?.orderId}
            </Typography>

            {order.orderStatus && (
              <Chip
                label={order.orderStatus}
                size="small"
                color="primary"
                sx={{ height: 26 }}
              />
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Manage and track order details
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Download size={18} />}
          onClick={async () => {
            const thesis = order.files?.find((f) => f.label === 'Thesis Document');
            await handleDownloadFile(thesis);
          }}
          disabled={!order.files?.some((f) => f.filePath)}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none'
          }}
        >
          Download Invoice
        </Button>
      </Box>

      {/* ================= MAIN GRID ================= */}

      <Grid container spacing={3}>
        {/* ================= LEFT SECTION ================= */}

        <Grid item xs={12} lg={8.5}>
          <Stack spacing={3}>
            {/* ================= PRINTING TABLE ================= */}

            <Card
              sx={{
                borderRadius: 5,
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              <CardContent>
                <Typography
                  fontWeight={700}
                  fontSize={18}
                  mb={2}
                >
                  Hard Printing & Binding Details
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 3,
                    overflowX: 'auto',
                    border: '1px solid #edf2f7',
                    boxShadow: 'none'
                  }}
                >
                  <Table sx={{ minWidth: 1300 }}>
                    <TableBody>
                      <TableRow
                        sx={{
                          background: '#f8fafc'
                        }}
                      >
                        <TableCell><b>Description</b></TableCell>
                        <TableCell><b>Paper Size</b></TableCell>
                        <TableCell><b>Paper Type</b></TableCell>
                        <TableCell><b>Colour</b></TableCell>
                        <TableCell><b>Printing</b></TableCell>
                        <TableCell><b>A4</b></TableCell>
                        <TableCell><b>CD</b></TableCell>
                        <TableCell><b>Information</b></TableCell>
                      </TableRow>

                      {order.printingDetails?.map((r, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{r.desc}</TableCell>
                          <TableCell>{r.size}</TableCell>
                          <TableCell>{r.paper}</TableCell>
                          <TableCell>{r.color}</TableCell>
                          <TableCell>{r.printingType}</TableCell>
                          <TableCell>{r.a4Pockets}</TableCell>
                          <TableCell>{r.cdPockets}</TableCell>
                          <TableCell>{r.additionalInformation || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* ================= BOTTOM SECTION ================= */}

            <Grid container spacing={3}>
              {/* ================= DETAIL TABLE CARD ================= */}

              <Grid item xs={12} md={6.2}>
                <Card
                  sx={{
                    borderRadius: 5,
                    minHeight: 420,
                    boxShadow:
                      '0 6px 20px rgba(0,0,0,0.06)'
                  }}
                >
                  <CardContent>
                    <Grid container spacing={4}>
                      {/* LEFT TABLE */}

                      <Grid item xs={12} md={6}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <b>Detail</b>
                              </TableCell>

                              <TableCell>
                                <b>Value</b>
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>Thesis File</TableCell>

                              <TableCell>
                                {order.files?.find((f) => f.label === 'Thesis Document')?.filePath ? (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={async () => {
                                      const f = order.files.find((x) => x.label === 'Thesis Document');
                                      await handleDownloadFile(f);
                                    }}
                                    sx={{ minWidth: 70, borderRadius: 2, textTransform: 'none' }}
                                  >
                                    View
                                  </Button>
                                ) : (
                                  <Typography sx={{ color: '#9ca3af' }}>Not available</Typography>
                                )}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>Cover DB</TableCell>

                              <TableCell>{hardBinding.coverMaterial || '—'}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>Spine Printing</TableCell>

                              <TableCell>{hardBinding.spinePrintingRequired ? 'Print Required' : 'Print Not Required'}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>Spine Top Content</TableCell>

                              <TableCell>{hardBinding.topContentArea || '-'}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>Spine Middle Content</TableCell>

                              <TableCell>{hardBinding.middleContentArea || '-'}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell>Spine Bottom Content</TableCell>

                              <TableCell>{hardBinding.bottomContentArea || '-'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>

                      {/* RIGHT TABLE */}

                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid #e6f2ff',
                              background: '#f7fbff'
                            }}
                          >
                            <Typography fontWeight={700} mb={1}>
                              Thesis Page
                            </Typography>

                            <Stack spacing={1}>
                              {['BLACK & WHITE', 'COLOR'].map((ct) => {
                                const val = getPagesDisplay(order.pageColorMap, ct);
                                return (
                                  <Box key={ct} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{ct}</Typography>

                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        background: '#fff',
                                        borderRadius: 2,
                                        p: 1,
                                        border: '1px solid #e6f2ff',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                      }}
                                    >
                                      <Typography sx={{ color: '#111827', flex: 1, wordBreak: 'break-all' }}>{val}</Typography>

                                      <IconButton
                                        size="small"
                                        onClick={async () => {
                                          try {
                                            await navigator.clipboard.writeText(String(val ?? ''));
                                          } catch (e) {
                                            // ignore
                                          }
                                        }}
                                        sx={{
                                          ml: 1,
                                          width: 36,
                                          height: 36,
                                          borderRadius: 1.2,
                                          border: '1px solid #e6f2ff',
                                          background: '#ffffff',
                                          flex: '0 0 auto'
                                        }}
                                      >
                                        <Copy size={16} color="#2563eb" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Box>

                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid #e9fff0',
                              background: '#f7fff5'
                            }}
                          >
                            <Typography fontWeight={700} mb={1}>
                              Synopsis Page
                            </Typography>

                            <Stack spacing={1}>
                              {['BLACK & WHITE', 'COLOR'].map((ct) => {
                                const val = getPagesDisplay(order.pageColorMapSynopsis, ct);
                                return (
                                  <Box key={ct} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{ct}</Typography>

                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        background: '#fff',
                                        borderRadius: 2,
                                        p: 1,
                                        border: '1px solid #d1fae5',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                      }}
                                    >
                                      <Typography sx={{ color: '#111827', flex: 1, wordBreak: 'break-all' }}>{val}</Typography>

                                      <IconButton
                                        size="small"
                                        onClick={async () => {
                                          try {
                                            await navigator.clipboard.writeText(String(val ?? ''));
                                          } catch (e) {
                                            // ignore
                                          }
                                        }}
                                        sx={{
                                          ml: 1,
                                          width: 36,
                                          height: 36,
                                          borderRadius: 1.2,
                                          border: '1px solid #d1fae5',
                                          background: '#ffffff',
                                          flex: '0 0 auto'
                                        }}
                                      >
                                        <Copy size={16} color="#10b981" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* ================= DOCUMENT CARD ================= */}

              <Grid item xs={12} md={5.8}>
                <Card
                  sx={{
                    borderRadius: 5,
                    minHeight: 338,
                    width: '100%',
                    height: '100%',
                    boxShadow:
                      '0 6px 20px rgba(0,0,0,0.06)'
                  }}
                >
                  <CardContent>
                    <Typography
                      fontWeight={700}
                      fontSize={22}
                      mb={3}
                    >
                      Documents
                    </Typography>

                    <Stack spacing={3}>
                      {order.files?.map(
                        (file, index) => (
                          <Box key={index}>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <FileText
                                size={18}
                                color="#2563eb"
                              />

                              <Box>
                                <Typography
                                  fontWeight={600}
                                  mb={0.5}
                                >
                                  {file.label}
                                </Typography>

                                {file.fileName ? (
                                  <Typography
                                    sx={{
                                      color: '#2563eb',
                                      cursor: file.filePath ? 'pointer' : 'default',
                                      fontSize: 14,
                                      textDecoration: file.filePath ? 'underline' : 'none'
                                    }}
                                    onClick={async () => {
                                      await handleDownloadFile(file);
                                    }}
                                  >
                                    {file.fileName}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ color: '#9ca3af' }}>Not available</Typography>
                                )}
                              </Box>
                            </Stack>

                            {index !==
                              order.files
                                .length -
                                1 && (
                              <Divider
                                sx={{ mt: 2 }}
                              />
                            )}
                          </Box>
                        )
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* ================= ORDER + CUSTOMER + SHIPPING SECTION ================= */}

        <Grid item xs={12} lg={3.5}>
          <Grid container spacing={2.2}>
            {/* ================= ORDER DETAILS ================= */}

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                  boxShadow:
                    '0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #edf2f7'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    '&:last-child': {
                      pb: 2.5
                    }
                  }}
                >
                  {/* HEADER */}

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={3}
                  >
                    <Receipt size={18} />

                    <Typography
                      fontWeight={700}
                      fontSize={17}
                    >
                      Order Details
                    </Typography>
                  </Stack>

                  <DetailsRow
                    label="Order ID"
                    value={order.orderId}
                  />

                  <DetailsRow
                    label="Order Number"
                    value={order.orderNumber}
                  />

                  <DetailsRow
                    label="Amount"
                    value={`₹${Number(order.amount ?? 0).toFixed(2)}`}
                  />

                  <DetailsRow
                    label="Payment"
                    value={
                      <Chip
                        label={order.paymentStatus || order.paymentOrderId || '—'}
                        color={
                          (order.paymentStatus || '').toLowerCase() === 'success'
                            ? 'success'
                            : (order.paymentStatus || '').toLowerCase() === 'pending'
                            ? 'warning'
                            : (order.paymentStatus || '').toLowerCase() === 'failed'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    }
                  />

                  <DetailsRow
                    label="Placement"
                    value={order.placementType}
                  />

                  <DetailsRow
                    label="Branch"
                    value={order.branchName}
                  />

                  <DetailsRow
                    label="Expected Delivery"
                    value={formatDate(order.expectedDeliveryDate)}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* ================= CUSTOMER + BILLING ================= */}

            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                  overflow: 'hidden',
                  boxShadow:
                    '0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #edf2f7'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    '&:last-child': {
                      pb: 2.5
                    }
                  }}
                >
                  {/* HEADER */}

                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    mb={3}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2.5,
                        background:
                          'linear-gradient(135deg,#2563eb,#3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}
                    >
                      <User size={18} />
                    </Box>

                    <Box>
                      <Typography
                        fontWeight={700}
                        fontSize={17}
                      >
                        Customer & Billing Details
                      </Typography>

                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        Customer profile & address
                      </Typography>
                    </Box>
                  </Stack>

                  {/* DETAILS GRID */}

                  <Grid container spacing={2}>
                    {/* CUSTOMER */}

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: '#f8fbff',
                          border: '1px solid #dbeafe',
                          height: '100%'
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#2563eb',
                            mb: 2
                          }}
                        >
                          Customer Details
                        </Typography>

                        <DetailsRow
                          label="Name"
                          value={order.customer?.name}
                        />

                        <DetailsRow
                          label="Email"
                          value={order.customer?.email}
                        />

                        <DetailsRow
                          label="Phone"
                          value={order.customer?.phone}
                        />

                        <DetailsRow
                          label="WhatsApp"
                          value={order.customer?.phone}
                        />
                      </Box>
                    </Grid>

                    {/* BILLING */}

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: '#fafafa',
                          border: '1px solid #eeeeee',
                          height: '100%'
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#111827',
                            mb: 2
                          }}
                        >
                          Billing Details
                        </Typography>

                        <DetailsRow
                          label="Address"
                          value={
                            order.billingAddress
                              ?.address1
                          }
                        />

                        <DetailsRow
                          label="City"
                          value={
                            order.billingAddress?.city
                          }
                        />

                        <DetailsRow
                          label="State"
                          value={
                            order.billingAddress
                              ?.state
                          }
                        />

                        <DetailsRow
                          label="PIN"
                          value={
                            order.billingAddress
                              ?.pincode
                          }
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ================= SHIPPING ================= */}

            <Grid item xs={12} md={12}>
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                  boxShadow:
                    '0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #edf2f7'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    '&:last-child': {
                      pb: 2.5
                    }
                  }}
                >
                  {/* HEADER */}

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={3}
                  >
                    <Truck size={18} />

                    <Typography
                      fontWeight={700}
                      fontSize={17}
                    >
                      {hasShipping ? 'Shipping Details' : 'Branch Details'}
                    </Typography>
                  </Stack>

                  {hasShipping ? (
                    <>
                      <DetailsRow
                        label="Address"
                        value={
                          [
                            order.shippingAddress?.address1,
                            order.shippingAddress?.address2
                          ]
                            .filter(Boolean)
                            .join(', ') || '—'
                        }
                      />

                      <DetailsRow label="City" value={order.shippingAddress?.city} />

                      <DetailsRow label="State" value={order.shippingAddress?.state} />

                      <DetailsRow label="PIN" value={order.shippingAddress?.pincode} />
                    </>
                  ) : (
                    <>
                      <DetailsRow label="Branch" value={order.branchName || '—'} />
                      <DetailsRow label="Placement" value={order.placementType || '—'} />
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}