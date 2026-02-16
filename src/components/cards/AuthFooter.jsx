// material-ui
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  return (
    <Container maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, justifyContent: { xs: 'center', sm: 'space-between', textAlign: { xs: 'center', sm: 'inherit' } } }}
      >
        <Typography variant="subtitle2" color="secondary">
          © Developed by Saraf Tech Lab LLP{' '}
          <Link href="https://saraftechlab.org/" target="_blank" underline="hover">
            Saraf Tech Lab LLP
          </Link>
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 1, sm: 3 }, textAlign: { xs: 'center', sm: 'inherit' } }}>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://dharbrothers.in/terms-and-condition"
            target="_blank"
            underline="hover"
          >
            Terms & Conditions
          </Typography>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://dharbrothers.in/privacy-and-policy"
            target="_blank"
            underline="hover"
          >
            Privacy Policy
          </Typography>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://dharbrothers.in/refund-policy"
            target="_blank"
            underline="hover"
          >
            Refund Policy
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
