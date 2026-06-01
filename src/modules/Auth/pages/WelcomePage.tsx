import { Outlet } from 'react-router-dom';
import logo from '../../../assets/Eforsch.png';

const WelcomePage = () => {
  return (
    <div className="welocomeText">
      <div className="welocomeWidget">
        <img src={logo} alt="Logo" className="logo" />
        <Outlet />
      </div>
    </div>
  );
};

export default WelcomePage;
