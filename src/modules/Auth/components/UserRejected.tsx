import { Link } from "react-router-dom";

const UserRejected = () => (
  <div style={{ padding: '0.5rem 2rem', textAlign: 'center', color: '#333' }}>
    <h2>Your account is rejected.</h2>
    <p>Please contact support for more details.</p>

    <button type="submit" className="btn btn-color">
      <Link to="/auth/login" style={{ 
          color: 'white'}}>Login</Link>
    </button>
    {/* <Link style={{ fontSize:  '15px' }} to="/auth/login">Try Login Again</Link> */}
  </div>
);

export default UserRejected;
