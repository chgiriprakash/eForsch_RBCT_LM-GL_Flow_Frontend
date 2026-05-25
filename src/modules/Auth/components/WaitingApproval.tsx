import { Link } from "react-router-dom";

const WaitingApproval = () => (
  <div style={{ padding: '0.5rem 2rem', textAlign: 'center', color: '#333' }}>
    <h2>Your account is pending approval.</h2>
    <p>Please contact your group leader or admin for access.</p>

    <Link style={{ fontSize:  '15px' }} to="/auth/login">Try Login Again</Link>
  </div>
);

export default WaitingApproval;
