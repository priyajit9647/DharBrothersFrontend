// assets
import headerLogo from 'assets/logo/hader-logo.svg';

// ==============================|| LOGO IMAGE (MAIN) ||============================== //

export default function LogoMain() {
  return (
    <img
      src={headerLogo}
      alt="Logo"
      style={{ height: 32, maxWidth: '100%', display: 'block' }}
    />
  );
}
