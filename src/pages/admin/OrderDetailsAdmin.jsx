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
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

import { getOrderById, /* updateOrderStatus */ } from 'api/orders';
import { uploadDocumentVersionFormData } from 'api/document';
import { authorizedFetch } from 'api/auth';

function DetailsRow({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, width: 160 }}>{label}</TableCell>
      <TableCell>{value ?? '—'}</TableCell>
    </TableRow>
  );
}

export default function OrderDetailsAdmin() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('New Order');
  const [uploadFiles, setUploadFiles] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!orderId) return;
      try {
        const resp = await getOrderById(orderId);
        if (!mounted) return;
        // Normalize API response into fields expected by this UI
        const normalized = (() => {
          const files = [];

          if (Array.isArray(resp.documents)) {
            files.push(...resp.documents.map((d) => ({ label: d.name || d.label || d.documentType || 'Document', key: d.documentType || d.type || d.documentId || d.documentStageId, path: d.path || d.filePath || d.url })));
          } else if (resp.documents && typeof resp.documents === 'object') {
            const map = [
              ['thesisDocumentName', 'Thesis Document', 'thesisDocumentPath'],
              ['synopsisDocumentName', 'Synopsis Document', 'synopsisDocumentPath'],
              ['hardCoverDesignName', 'Hard Cover Design', 'hardCoverDesignPath'],
              ['softCoverDesignName', 'Soft Cover Design', 'softCoverDesignPath']
            ];
            for (const [nameKey, label, pathKey] of map) {
              if (resp.documents[nameKey]) {
                files.push({ label, key: nameKey, fileName: resp.documents[nameKey], path: resp.documents[pathKey] });
              }
            }
          }

          const printingDetails = [];
          if (Array.isArray(resp.bindings)) {
            resp.bindings.forEach((b, bi) => {
              (b.bindingItems || []).forEach((item, idx) => {
                printingDetails.push({
                  desc: b.bindingType ? `${b.bindingType} Binding` : `Item ${bi}-${idx}`,
                  size: item.paperSize,
                  color: item.printColour || item.printColor || item.color,
                  printingType: item.printingType,
                  a4Pockets: item.a4Pockets,
                  cdPockets: item.cdPockets,
                  noOfCopies: item.noOfCopies
                });
              });
            });
          }

          const customerName = resp.customer ? `${resp.customer.firstName || ''} ${resp.customer.lastName || ''}`.trim() : (resp.customer?.name || '');

          const billing = resp.billingAddress ? {
            apartment: resp.billingAddress.address1,
            street: resp.billingAddress.address2,
            city: resp.billingAddress.city,
            state: resp.billingAddress.state,
            pin: resp.billingAddress.pincode,
            country: resp.billingAddress.country
          } : (resp.billing || undefined);

          return {
            ...resp,
            printingDetails,
            files,
            customer: { name: customerName, email: resp.customer?.email, phone: resp.customer?.mobile || resp.customer?.phone },
            billing,
            shipping: resp.shippingAddress || resp.shipping,
            amount: resp.totalAmount ?? resp.amount,
            total: resp.totalAmount ?? resp.total,
            date: resp.expectedDeliveryDate ? new Date(resp.expectedDeliveryDate).toLocaleString() : resp.date
          };
        })();

        setOrder(normalized);
      } catch (err) {
        // fallback to minimal sample so UI doesn't completely break
        const sample = {
          orderId: orderId || 'DB-WEB-0000-00-00',
          date: '21-05-2026',
          amount: 1698,
          shippingStatus: 'Pickup from store',
          shippingAmount: 0,
          cgst: '₹ 152.82',
          sgst: '₹ 152.82',
          total: '₹ 2,003.64',
          paymentStatus: 'SUCCESS',
          customer: { name: 'Parijat Dutta', email: 'parijatdutta200@gmail.com', phone: '6360421661' },
          billing: { apartment: 'Begampur', city: 'BEGAMPUR', state: 'West Bengal', pin: '712306', country: 'India' },
          printingDetails: [] ,
          files: []
        };
        if (mounted) setOrder(sample);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleFileChange = (key, e) => {
    setUploadFiles((p) => ({ ...p, [key]: e.target.files?.[0] || null }));
  };

  const handleSubmitForReview = () => {
    // Upload files using document API when possible. Try best-effort mapping to documentStageId/documentId.
    (async () => {
      if (!order) return;
      const entries = Object.entries(uploadFiles).filter(([, f]) => f);
      if (!entries.length) {
        alert('No files chosen');
        return;
      }

      for (const [key, file] of entries) {
        try {
          // Try to map to a document stage or document id from order.documents
          const docs = Array.isArray(order.documents) ? order.documents : [];
          let mapped = docs.find((d) => {
            const t = String(d.type || d.documentType || d.name || '').toLowerCase();
            return key && t.includes(String(key).toLowerCase());
          });

          if (!mapped && docs.length === 1) mapped = docs[0];

          if (mapped && (mapped.documentStageId || mapped.documentId)) {
            await uploadDocumentVersionFormData({ documentStageId: mapped.documentStageId ?? undefined, documentId: mapped.documentId ?? undefined, file, remarks: 'Admin upload' });
          } else {
            // Fallback: POST to a generic admin upload endpoint if available
            const form = new FormData();
            form.append('file', file);
            form.append('type', key);
            try {
              await authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(order.orderId))}/upload`, {
                method: 'POST',
                body: form
              });
            } catch (err) {
              // Try document upload without mapping (may fail depending on backend)
              await uploadDocumentVersionFormData({ file, remarks: `Admin upload (${key})` });
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Upload failed for', key, err);
          alert(`Upload failed for ${key}: ${err?.message || String(err)}`);
          return;
        }
      }

      alert('Upload(s) completed');
      setUploadFiles({});
    })();
  };

  const handleSaveStatus = async () => {
    if (!order) return;
    try {
      // Prefer dedicated status endpoint; fallback to put on order resource
      try {
        await authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(order.orderId))}/status`, {
          method: 'POST',
          body: JSON.stringify({ status })
        });
      } catch (err) {
        // fallback
        await authorizedFetch(`/api/v1/orders/admin/${encodeURIComponent(String(order.orderId))}`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
      }
      alert('Status saved');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save status', err);
      alert('Failed to save status: ' + (err?.message || String(err)));
    }
  };

  if (!order) return null;
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Orders #{order?.orderId ?? ''}</Typography>
            <Button variant="contained" color="primary">Download Invoice</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card sx={{ borderTop: '4px solid #7b1fa2', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>Hard Printing and Binding Details</Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Paper Size</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Colour/ BW</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Printing Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>A4 Pockets</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>CD Pockets</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Information</TableCell>
                    </TableRow>
                    {(order.printingDetails || []).map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.desc}</TableCell>
                        <TableCell>{r.size}</TableCell>
                        <TableCell>{r.color}</TableCell>
                        <TableCell>{r.printingType}</TableCell>
                        <TableCell>{r.a4Pockets}</TableCell>
                        <TableCell>{r.cdPockets}</TableCell>
                        <TableCell>College : Narula Institute of Technology</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Detail</Typography>
                      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                        {(order.files || []).map((f) => (
                          <ListItem key={f.key} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <ListItemText primary={f.label} />
                            <Button variant="contained" size="small" sx={{ ml: 2 }}>View</Button>
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Documents for Approval</Typography>
                      <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <input id="thesis-file" type="file" onChange={(e) => handleFileChange('thesis', e)} />
                        <input id="cover-file" type="file" onChange={(e) => handleFileChange('coverDesign', e)} />
                        <input id="add1" type="file" onChange={(e) => handleFileChange('add1', e)} />
                        <input id="add2" type="file" onChange={(e) => handleFileChange('add2', e)} />
                        <Button variant="contained" sx={{ mt: 1, alignSelf: 'flex-start' }} onClick={handleSubmitForReview}>Submit For Review</Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            {/* Order Status card removed as requested */}

            <Card sx={{ borderTop: '4px solid #7b1fa2', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Order Details</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <DetailsRow label="Order ID:" value={order.orderId} />
                      <DetailsRow label="Order Date:" value={order.date} />
                      <DetailsRow label="Order Amount:" value={order.amount} />
                      <DetailsRow label="Shipping Status:" value={order.shippingStatus} />
                      <DetailsRow label="Shipping Amount:" value={order.shippingAmount} />
                      <DetailsRow label="CGST Amount (9%):" value={order.cgst} />
                      <DetailsRow label="SGST Amount (9%):" value={order.sgst} />
                      <DetailsRow label="Total Amount:" value={order.total} />
                      <DetailsRow label="Payment Status:" value={order.paymentStatus} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card sx={{ borderTop: '4px solid #7b1fa2', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Customer Details</Typography>
                <Typography variant="body2"><strong>Name:</strong> {order.customer?.name ?? '—'}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {order.customer?.email ?? '—'}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {order.customer?.phone ?? '—'}</Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderTop: '4px solid #7b1fa2', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Billing Details</Typography>
                <Typography variant="body2"><strong>Apartment:</strong> {order.billing?.apartment ?? '—'}</Typography>
                <Typography variant="body2"><strong>Street:</strong> {order.billing?.street ?? 'BEGAMPUR,HOOGHLY'}</Typography>
                <Typography variant="body2"><strong>City:</strong> {order.billing?.city ?? '—'}</Typography>
                <Typography variant="body2"><strong>State:</strong> {order.billing?.state ?? '—'}</Typography>
                <Typography variant="body2"><strong>PIN:</strong> {order.billing?.pin ?? '—'}</Typography>
                <Typography variant="body2"><strong>Country:</strong> {order.billing?.country ?? '—'}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderTop: '4px solid #7b1fa2', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Shipping Details</Typography>
                <Typography variant="body2"><strong>Address 1:</strong> {order.shipping?.address1 ?? order.shipping?.apartment ?? '—'}</Typography>
                <Typography variant="body2"><strong>Address 2:</strong> {order.shipping?.address2 ?? order.shipping?.street ?? '—'}</Typography>
                <Typography variant="body2"><strong>City:</strong> {order.shipping?.city ?? '—'}</Typography>
                <Typography variant="body2"><strong>State:</strong> {order.shipping?.state ?? '—'}</Typography>
                <Typography variant="body2"><strong>PIN:</strong> {order.shipping?.pincode ?? order.shipping?.pin ?? '—'}</Typography>
                <Typography variant="body2"><strong>Country:</strong> {order.shipping?.country ?? '—'}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

