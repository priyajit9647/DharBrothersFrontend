// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}
    >
      <Typography variant="caption">
        &copy; {new Date().getFullYear()}{' '}
        <Link href="https://dharbrothers.in/" target="_blank" underline="hover">
          Dhar Brothers
        </Link>
        	&nbsp; Developed by Silicon Gen X Global
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="https://dharbrothers.saraftechlab.org/order" target="_blank" variant="caption" color="text.primary">
          Place Order
        </Link>
      </Stack>
    </Stack>
  );
}
