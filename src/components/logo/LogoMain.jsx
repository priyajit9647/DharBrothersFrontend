// assets
import headerLogo from 'assets/logo/hader-logo.svg';

// ==============================|| LOGO IMAGE (MAIN) ||============================== //

export default function LogoMain({ height = 32 }) {
  return (
    <img
      src={headerLogo}
      alt="Logo"
      style={{ height, maxWidth: '100%', display: 'block' }}
    />
  );
}
