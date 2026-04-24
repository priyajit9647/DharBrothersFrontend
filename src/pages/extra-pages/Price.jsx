import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import banner2 from 'assets/banner/banner2.jpg';

import { HeaderNav, TopInfoBar, FooterSection, PriceSection } from './PlaceOrder';

export default function Price() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      <TopInfoBar />
      <HeaderNav />
      <PriceHero />

      <PriceSection />

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
