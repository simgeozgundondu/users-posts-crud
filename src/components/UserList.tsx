import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User, CreateUserData } from '../types';
import { userApi } from '../services/api';
import '../styles/components/UserList.css';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    username: '',
    email: '',
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidName = (name: string) => {
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    return nameRegex.test(name.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidName(formData.name)) {
      setError('Name can only contain letters and spaces');
      return;
    }
  
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      if (editingUser) {
        const updatedUser = await userApi.update({
          id: editingUser.id,
          ...formData,
        });
        setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
        setEditingUser(null);
      } else {
        const newUser = await userApi.create(formData);
        setUsers([...users, newUser]);
      }
      setFormData({ name: '', username: '', email: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to save user');
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: '', username: '', email: '' });
  };

  if (loading) {
    return (
      <div className="user-list">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">
              <i className="fi fi-rr-users"></i>
              Total Users ({users.length})
            </h1>
          </div>
          <div className="page-actions">
            <button 
              className="add-user-btn"
              onClick={() => setShowForm(true)}
            >
              <i className="fi fi-rr-plus"></i>
              Create User
            </button>
          </div>
        </div>


        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    pattern="[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+"
                    title="Name can only contain letters and spaces"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input
                    className="form-input"
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    title="Please enter a valid email address (e.g., user@example.com)"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    <i className="fi fi-rr-check"></i>
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">
                    <i className="fi fi-rr-cross"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {users.length === 0 && !loading ? (
          <div className="empty-state">
            <i className="fi fi-rr-user-add"></i>
            <h3>No Users Found</h3>
            <p>Add your first user to get started!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container">
              <div className="table-header">
                <h2 className="table-title">Users</h2>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="user-id-badge">{user.id}</span>
                      </td>
                      <td>
                        <div className="user-name">{user.name}</div>
                      </td>
                      <td>
                        <div className="user-username">@{user.username}</div>
                      </td>
                      <td>
                        <div className="user-email">{user.email}</div>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button 
                            onClick={() => navigate(`/posts?userId=${user.id}`)} 
                            className="action-btn view-posts-btn"
                            title="View Posts"
                          >
                            <i className="fi fi-rr-document"></i>
                            <span>View Posts</span>
                          </button>
                          <button 
                            onClick={() => handleEdit(user)} 
                            className="action-btn edit-btn"
                            title="Edit User"
                          >
                            <i className="fi fi-rr-edit"></i>
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)} 
                            className="action-btn delete-btn"
                            title="Delete User"
                          >
                            <i className="fi fi-rr-trash"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-card-info">
                      <h3>{user.name}</h3>
                      <p>@{user.username}</p>
                      <p>{user.email}</p>
                    </div>
                    <span className="user-card-id">#{user.id}</span>
                  </div>
                  <div className="user-card-actions">
                    <Link 
                      to={`/posts?userId=${user.id}`} 
                      className="action-btn view-posts-btn"
                    >
                      <i className="fi fi-rr-document"></i>
                      View Posts
                    </Link>
                    <button 
                      onClick={() => handleEdit(user)} 
                      className="action-btn edit-btn"
                    >
                      <i className="fi fi-rr-edit"></i>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className="action-btn delete-btn"
                    >
                      <i className="fi fi-rr-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;
