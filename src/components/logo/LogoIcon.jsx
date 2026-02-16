// assets
import headerLogoIcon from 'assets/logo/hader-logo.png';

// ==============================|| LOGO ICON IMAGE ||============================== //

export default function LogoIcon() {
  return (
    <img
      src={headerLogoIcon}
      alt="Logo icon"
      style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }}
    />
  );
}
