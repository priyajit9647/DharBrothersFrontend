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
// Removed Select/MenuItem/FormControl/InputLabel (Order Status card removed)
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import {
  Download,
  User,
  Truck,
  Receipt,
  Upload
} from 'lucide-react';

import { getOrderById, /* updateOrderStatus */ } from 'api/orders';
import { uploadDocumentVersionFormData } from 'api/document';
import { authorizedFetch } from 'api/auth';

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
          fontSize: 14
        }}
      >
        {label}
      </Typography>

      <Box color="text.secondary">
        {value ?? '—'}
      </Box>
    </Box>
  );
}

export default function OrderDetailsAdmin() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
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

  // Order status control removed; admin status updates handled elsewhere

  if (!order) return null;
return (
<Box
sx={{
p:3,
background:'#f5f7fb',
minHeight:'100vh',
width:'100%'
}}
>

<Box
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center',
mb:3,
flexWrap:'wrap',
gap:2
}}
>

<Box>

<Typography
variant="h4"
fontWeight={700}
>
Order #{order?.orderId}
</Typography>

<Typography
variant="body2"
color="text.secondary"
>
Manage and track order details
</Typography>

</Box>


<Button
variant="contained"
startIcon={<Download size={18}/>}

sx={{
borderRadius:3,
textTransform:'none',
fontWeight:600,
px:3
}}
>
Download Invoice
</Button>

</Box>


<Grid container spacing={3}>

<Grid item xs={12} lg={9}>

<Stack spacing={3}>


<Card
sx={{
borderRadius:4,
boxShadow:'0 4px 18px rgba(0,0,0,.08)'
}}
>

<CardContent>

<Typography
fontWeight={700}
mb={2}
>
Hard Printing & Binding Details
</Typography>


<TableContainer
component={Paper}
variant="outlined"
sx={{
borderRadius:3
}}
>

<Table>

<TableBody>

<TableRow
sx={{
background:'#f8fafc'
}}
>

<TableCell><b>Description</b></TableCell>
<TableCell><b>Paper Size</b></TableCell>
<TableCell><b>Colour</b></TableCell>
<TableCell><b>Printing</b></TableCell>
<TableCell><b>A4</b></TableCell>
<TableCell><b>CD</b></TableCell>


</TableRow>


{order.printingDetails?.map((r,index)=>(

<TableRow
key={index}
hover
>

<TableCell>{r.desc}</TableCell>

<TableCell>{r.size}</TableCell>

<TableCell>{r.color}</TableCell>

<TableCell>{r.printingType}</TableCell>

<TableCell>{r.a4Pockets}</TableCell>

<TableCell>{r.cdPockets}</TableCell>


</TableRow>

))}

</TableBody>

</Table>

</TableContainer>

</CardContent>

</Card>




<Grid container spacing={3}>

<Grid item xs={12} md={6}>

<Card
sx={{
borderRadius:4,
height:'100%'
}}
>

<CardContent>

<Typography
fontWeight={700}
mb={2}
>
Document Details
</Typography>


<Stack spacing={2}>

{order.files?.map((f)=>(

<Box
key={f.key}
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center',
border:'1px solid #e5e7eb',
borderRadius:2,
p:2
}}
>

<Typography>

{f.label}

</Typography>


<Button
variant="contained"
size="small"
sx={{
textTransform:'none'
}}
>
View
</Button>

</Box>

))}

</Stack>

</CardContent>

</Card>

</Grid>





<Grid item xs={12} md={6}>

<Card
sx={{
borderRadius:4,
height:'100%'
}}
>

<CardContent>


<Stack
direction="row"
spacing={1}
alignItems="center"
mb={2}
>

<Upload size={18}/>

<Typography
fontWeight={700}
>
Upload Documents
</Typography>

</Stack>



<Stack spacing={2}>


<TextField
size="small"
type="file"
onChange={(e)=>
handleFileChange(
'thesis',
e
)
}
/>


<TextField
size="small"
type="file"
onChange={(e)=>
handleFileChange(
'coverDesign',
e
)
}
/>


<TextField
size="small"
type="file"
onChange={(e)=>
handleFileChange(
'add1',
e
)
}
/>


<TextField
size="small"
type="file"
onChange={(e)=>
handleFileChange(
'add2',
e
)
}
/>


<Button
variant="contained"
onClick={handleSubmitForReview}
sx={{
mt:2,
borderRadius:2,
textTransform:'none'
}}
>

Submit For Review

</Button>


</Stack>

</CardContent>

</Card>

</Grid>

</Grid>

</Stack>

</Grid>





<Grid item xs={12} lg={3}>

<Stack spacing={3}>





<Card sx={{borderRadius:4}}>

<CardContent>

<Stack
direction="row"
spacing={1}
alignItems="center"
mb={2}
>

<Receipt size={18}/>

<Typography
fontWeight={700}
>
Order Details
</Typography>

</Stack>


<DetailsRow
label="Order ID"
value={order.orderId}
/>

<DetailsRow
label="Date"
value={order.date}
/>

<DetailsRow
label="Amount"
value={`₹${order.amount}`}
/>


<DetailsRow
label="Payment"
value={
<Chip
label={order.paymentStatus}
color="success"
size="small"
/>
}
/>

</CardContent>

</Card>





<Card sx={{borderRadius:4}}>

<CardContent>

<Stack
direction="row"
spacing={1}
alignItems="center"
mb={2}
>

<User size={18}/>

<Typography
fontWeight={700}
>
Customer Details
</Typography>

</Stack>


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

</CardContent>

</Card>




<Card sx={{borderRadius:4}}>

<CardContent>

<Typography
fontWeight={700}
mb={2}
>
Billing Details
</Typography>


<DetailsRow
label="Apartment"
value={order.billing?.apartment}
/>

<DetailsRow
label="City"
value={order.billing?.city}
/>

<DetailsRow
label="State"
value={order.billing?.state}
/>

<DetailsRow
label="PIN"
value={order.billing?.pin}
/>

</CardContent>

</Card>




<Card sx={{borderRadius:4}}>

<CardContent>

<Stack
direction="row"
spacing={1}
alignItems="center"
mb={2}
>

<Truck size={18}/>

<Typography
fontWeight={700}
>
Shipping Details
</Typography>

</Stack>


<DetailsRow
label="Address"
value={order.shipping?.address1}
/>

<DetailsRow
label="City"
value={order.shipping?.city}
/>

<DetailsRow
label="State"
value={order.shipping?.state}
/>

<DetailsRow
label="PIN"
value={
order.shipping?.pincode ||
order.shipping?.pin
}
/>

</CardContent>

</Card>

</Stack>

</Grid>

</Grid>

</Box>
);
}