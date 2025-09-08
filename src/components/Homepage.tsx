import { Link } from 'react-router-dom';
import '../styles/components/homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <div className="hero-section">
        <h1 className="hero-title">
          User & Post Manager
        </h1>
        
        <p className="hero-subtitle">
          A powerful, intuitive platform for managing users and posts with full CRUD operations. 
          Built with modern technologies and designed for efficiency.
        </p>
        
        <div className="navigation-section">
          <h2 className="navigation-title">Get Started</h2>
          <div className="navigation-cards">
            <Link to="/users" className="nav-card">
              <div className="nav-card-icon">
                <i className="fi fi-rr-users"></i>
              </div>
              <h3 className="nav-card-title">Manage Users</h3>
              <p className="nav-card-description">
                Create, edit, and manage user accounts with a clean, intuitive interface.
              </p>
              <div className="nav-card-arrow">
                <i className="fi fi-rr-arrow-right"></i>
              </div>
            </Link>
            
            <Link to="/posts" className="nav-card">
              <div className="nav-card-icon">
                <i className="fi fi-rr-document"></i>
              </div>
              <h3 className="nav-card-title">Manage Posts</h3>
              <p className="nav-card-description">
                Organize posts, track user relationships, and manage content efficiently.
              </p>
              <div className="nav-card-arrow">
                <i className="fi fi-rr-arrow-right"></i>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
