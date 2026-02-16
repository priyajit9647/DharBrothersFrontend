// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

export default function NavCard() {
  return (
    <MainCard sx={{ bgcolor: 'grey.50', m: 3 }}>
      <Stack alignItems="center" spacing={1.25}>
        <Typography variant="h5">Dhar Brothers</Typography>
        <Typography variant="h6" color="secondary" align="center">
          Binding Management System
        </Typography>
        <Typography variant="caption" color="secondary" align="center">
          Developed by Saraf Tech Lab LLP
        </Typography>
      </Stack>
    </MainCard>
  );
}
