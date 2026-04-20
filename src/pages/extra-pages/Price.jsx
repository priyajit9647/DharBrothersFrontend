import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import banner2 from 'assets/banner/banner2.jpg';

import { HeaderNav, TopInfoBar, FooterSection, PriceSection } from './PlaceOrder';
import { getBindingRates } from 'api/bindingRate';
import { getPrintingRates } from 'api/printingRate';

export default function Price() {
  const [bindingRates, setBindingRates] = useState(null);
  const [printingRates, setPrintingRates] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [bindingData, printingData] = await Promise.all([getBindingRates(), getPrintingRates()]);
        const list = Array.isArray(bindingData) ? bindingData : Array.isArray(bindingData?.data) ? bindingData.data : [];
        const printingList = Array.isArray(printingData) ? printingData : Array.isArray(printingData?.data) ? printingData.data : [];
        if (mounted) {
          setBindingRates(list);
          setPrintingRates(printingList);
        }
      } catch (e) {
        // keep fallback from PriceSection; log error
        // eslint-disable-next-line no-console
        console.warn('Price: failed to load binding rates, using fallback', e.message || e);
        if (mounted) setError(e.message || 'Failed to load binding rates');
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      <TopInfoBar />
      <HeaderNav />
      <PriceHero />

      <PriceSection bindingRates={bindingRates} printingRates={printingRates} />

      <FooterSection />
    </Box>
  );
}

function PriceHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 220, md: 260 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'common.white',
        backgroundImage: `linear-gradient(0deg, rgba(27, 24, 20, 0.38), rgba(27, 24, 20, 0.38)), url(${banner2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} alignItems="center">
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 400, letterSpacing: 0.4 }}>
            Price
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', letterSpacing: 0.5 }}>Home / Price</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
