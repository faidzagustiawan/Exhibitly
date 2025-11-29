import ImgLogo from '../assets/Logo.svg';

const Logo = ({ className }) => {
  return (
    <img
      src={ImgLogo}
      alt="Logo Exhibitly"
      width="40"
      height="40"
      className={className}
    />
  );
};

export default Logo;