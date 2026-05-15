import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';

import orderService from 'services/orderService';

export default function ShippingQrModal({ open, onClose, order = {} }) {
  const [loading, setLoading] = useState(false);
  const [base64, setBase64] = useState(null);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) {
        console.log('[ShippingQrModal] Modal not open, skipping load');
        return;
      }
      const id = order?.orderId ?? order?.id ?? order?.orderNo ?? order?.code;
      console.log('[ShippingQrModal] Modal opened, order:', order, 'id:', id);
      if (!id) {
        console.error('[ShippingQrModal] No order id found in:', order);
        setError('Order id not available');
        return;
      }
      setLoading(true);
      setError('');
      setBase64(null);
      try {
        console.log('[ShippingQrModal] Calling getShippingQrBase64 with id:', id);
        const data = await orderService.getShippingQrBase64(id);
        console.log('[ShippingQrModal] API response received, data length:', data?.length);
        if (!mounted) return;
        setBase64(data);
      } catch (e) {
        console.error('[ShippingQrModal] API Error:', e);
        if (!mounted) return;
        setError(e?.message || 'Failed to fetch QR');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [open, order]);

  const handleDownload = () => {
    if (!base64) return setSnack({ open: true, message: 'No image to download' });
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    const id = order?.orderId ?? order?.id ?? order?.orderNo ?? order?.code ?? 'qr';
    link.download = `shipping-qr-${id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    if (!base64) return setSnack({ open: true, message: 'No image to print' });
    const w = window.open('', '_blank');
    if (!w) return setSnack({ open: true, message: 'Unable to open print window' });
    w.document.write(`<img src="data:image/png;base64,${base64}" onload="window.print();window.close()" style="max-width:100%"/>`);
  };

  const imageSrc = base64 ? `data:image/png;base64,${base64}` : null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Shipping Address QR{order?.orderId ? ` — ${order.orderId}` : ''}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 180 }}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : imageSrc ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <img src={imageSrc} alt="Shipping QR" style={{ maxWidth: '100%', height: 'auto' }} />
              <Typography variant="caption" color="text.secondary">
                {order?.customerName || ''}
              </Typography>
            </Box>
          ) : (
            <Typography color="text.secondary">No QR available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ flex: '1 1 auto', px: 1 }} />
          <IconButton onClick={handleDownload} disabled={!base64} title="Download QR">
            <DownloadOutlined />
          </IconButton>
          <Button onClick={handlePrint} disabled={!base64}>
            Print
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ open: false, message: '' })} message={snack.message} />
    </>
  );
}
