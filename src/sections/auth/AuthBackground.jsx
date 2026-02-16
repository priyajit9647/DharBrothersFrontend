import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// assets
import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';

// ==============================|| AUTH BACKGROUND BANNER SLIDESHOW ||============================== //

const banners = [banner1, banner2, banner3];

export default function AuthBackground() {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000); // change banner every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      <Box
        component="img"
        src={currentBanner}
        alt="Authentication background"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(2px)',
          transform: 'scale(1.02)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: theme.vars.palette.mode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)'
        }}
      />
    </Box>
  );
}
