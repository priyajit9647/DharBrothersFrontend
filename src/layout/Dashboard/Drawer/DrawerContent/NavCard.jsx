// material-ui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project import
import MainCard from 'components/MainCard';

// assets
import headerLogo from 'assets/logo/hader-logo.svg';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

export default function NavCard() {
  return (
    <MainCard sx={{ bgcolor: 'grey.50', m: 3, p: { xs: 2, sm: 3 } }}>
      <Stack alignItems="center" justifyContent="center">
        <Box
          component="img"
          src={headerLogo}
          alt="Dharbadar Logo"
          sx={{
            height: { xs: 64, sm: 80, md: 96 },
            maxWidth: { xs: 160, sm: 240 },
            display: 'block'
          }}
        />
      </Stack>
    </MainCard>
  );
}
