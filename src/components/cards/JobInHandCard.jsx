import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import MainCard from 'components/MainCard';
import { SyncOutlined, EllipsisOutlined } from '@ant-design/icons';

const CityRow = ({ name, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, color: 'text.secondary' }}>
    <Typography variant="body2">{name}</Typography>
    <Typography variant="body2" sx={{ color: 'text.primary' }}>
      {value}
    </Typography>
  </Box>
);

export default function JobInHandCard() {
  return (
    <MainCard content={false} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <Grid container alignItems="stretch" spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: '100%',
                p: 2.25,
                borderRadius: 2,
                background: 'linear-gradient(180deg, rgba(255,244,229,0.8), rgba(255,249,241,0.9))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>
                    PENDING JOBS
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
                    7
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small">
                    <SyncOutlined />
                  </IconButton>
                  <IconButton size="small">
                    <EllipsisOutlined />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 1 }}>
                <CityRow name="Kolkata" value={3} />
                <CityRow name="Howrah" value={2} />
                <CityRow name="Siliguri" value={1} />
                <CityRow name="Durgapur" value={1} />
              </Box>

              <Box sx={{ mt: 1.5 }}>
                <Link underline="hover" color="primary">
                  View all pending jobs &nbsp;›
                </Link>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: '100%',
                p: 2.25,
                borderRadius: 2,
                background: 'linear-gradient(180deg, rgba(235,245,255,0.9), rgba(245,250,255,1))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    IN-PROGRESS JOBS
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
                    4
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small">
                    <SyncOutlined />
                  </IconButton>
                  <IconButton size="small">
                    <EllipsisOutlined />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 1 }}>
                <CityRow name="Kolkata" value={2} />
                <CityRow name="Howrah" value={1} />
                <CityRow name="Durgapur" value={1} />
              </Box>

              <Box sx={{ mt: 1.5 }}>
                <Link underline="hover" color="primary">
                  View all in-progress jobs &nbsp;›
                </Link>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1, background: 'rgba(13, 110, 253, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1v11l8 4" stroke="#0D6EFD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="#0D6EFD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    TOTAL JOBS IN HAND
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    11
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated: 10:30 AM
                </Typography>
                <IconButton size="small">
                  <SyncOutlined />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}
