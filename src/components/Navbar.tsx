import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <i className="fi fi-rr-home"></i>
            <span>Home</span>
          </Link>
          
          <Link 
            to="/users" 
            className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}
          >
            <i className="fi fi-rr-users"></i>
            <span>User Management</span>
          </Link>
          
          <Link 
            to="/posts" 
            className={`nav-link ${location.pathname === '/posts' ? 'active' : ''}`}
          >
            <i className="fi fi-rr-document"></i>
            <span>Post Management</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
