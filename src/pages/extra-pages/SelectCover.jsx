import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';

import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';
import { publicFetch } from 'api/auth';

import CopyOutlined from '@ant-design/icons/CopyOutlined';
import ZoomInOutlined from '@ant-design/icons/ZoomInOutlined';
import ZoomOutOutlined from '@ant-design/icons/ZoomOutOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

// ==============================|| SELECT COVER (PUBLIC) ||============================== //

function makeDataUrl(design) {
  if (!design) return '';
  if (String(design).startsWith('data:')) return design;
  return `data:image/*;base64,${design}`;
}

export default function SelectCover() {
  const { type } = useParams();
  const bindingType = (type || '').toUpperCase();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState('');
  const [zoom, setZoom] = useState(1);

  const [snack, setSnack] = useState({ open: false, message: '' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await publicFetch('/api/v1/web/master/binding-cover-material', { method: 'GET' });
        if (!mounted) return;
        const normalized = Array.isArray(data)
          ? data
              .filter((item) => String(item?.bindingType || '').toUpperCase() === bindingType)
              .map((item) => ({
                id: item.id,
                code: item.code || item.name || String(item.id),
                name: item.name || item.code || String(item.id),
                design: makeDataUrl(item.design),
                active: item.active
              }))
          : [];

        setItems(normalized);
      } catch (e) {
        setError(e.message || 'Failed to load cover materials');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (bindingType === 'HARD' || bindingType === 'SOFT') {
      load();
    } else {
      setItems([]);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [bindingType]);

  const handleOpenViewer = (image) => {
    setViewerImage(image);
    setZoom(1);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setViewerImage('');
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(String(code || ''));
      setSnack({ open: true, message: 'Code copied to clipboard' });
    } catch (e) {
      setSnack({ open: true, message: 'Unable to copy' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <TopInfoBar />
      <HeaderNav />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>Select Cover — {bindingType}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a cover design. Click to view and zoom. Use the copy button to copy the cover code.
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : items.length === 0 ? (
          <Typography>No designs available for {bindingType}.</Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardHeader title={item.name} subheader={item.code} />
                  {item.design ? (
                    <CardMedia
                      component="img"
                      image={item.design}
                      alt={item.name}
                      sx={{ height: 220, objectFit: 'contain', cursor: 'zoom-in' }}
                      onClick={() => handleOpenViewer(item.design)}
                    />
                  ) : (
                    <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary">No design</Typography>
                    </Box>
                  )}
                  <CardContent>
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Copy code">
                          <IconButton size="small" onClick={() => handleCopyCode(item.code)}>
                            <CopyOutlined />
                          </IconButton>
                        </Tooltip>
                        <Button size="small" component={RouterLink} to="/order" variant="outlined">Use</Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <FooterSection />

      <Dialog open={viewerOpen} onClose={handleCloseViewer} maxWidth="lg" fullWidth>
        <DialogContent sx={{ position: 'relative', height: { xs: 400, md: 600 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Zoom out">
                <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>
                  <ZoomOutOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom in">
                <IconButton size="small" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
                  <ZoomInOutlined />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={handleCloseViewer}>
                <CloseOutlined />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
            {viewerImage ? (
              <Box component="img" src={viewerImage} alt="design" sx={{ transform: `scale(${zoom})`, transition: 'transform 120ms ease-in-out', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Typography>No image</Typography>
            )}
          </Box>

          <Box sx={{ px: 3, py: 1 }}>
            <Slider value={zoom} min={0.25} max={3} step={0.05} onChange={(e, v) => setZoom(Number(v))} aria-label="zoom" />
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack({ open: false, message: '' })} message={snack.message} />
    </Box>
  );
}
