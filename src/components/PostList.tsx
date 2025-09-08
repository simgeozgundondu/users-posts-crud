import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Post, CreatePostData, User } from '../types';
import { postApi, userApi } from '../services/api';
import '../styles/components/PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchParams] = useSearchParams();
  const [filterUserId, setFilterUserId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  
  const [formData, setFormData] = useState<CreatePostData>({
    userId: 1,
    title: '',
    body: '',
  });

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      setFilterUserId(parseInt(userIdParam));
    }
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsData, usersData] = await Promise.all([
        postApi.getAll(),
        userApi.getAll()
      ]);
      
      setPosts(postsData);
      setUsers(usersData);
      
      // Set default userId for new posts
      if (usersData.length > 0) {
        setFormData(prev => ({ ...prev, userId: usersData[0].id }));
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const filteredPosts = filterUserId 
    ? posts.filter(post => post.userId === filterUserId)
    : posts;

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterUserId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smart pagination - show limited pages with ellipsis
  const getVisiblePages = () => {
    const delta = 1; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        const updatedPost = await postApi.update({
          id: editingPost.id,
          ...formData,
        });
        setPosts(posts.map(post => post.id === editingPost.id ? updatedPost : post));
        setEditingPost(null);
      } else {
        const newPost = await postApi.create(formData);
        setPosts([...posts, newPost]);
      }
      setFormData({ userId: users[0]?.id || 1, title: '', body: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to save post');
      console.error('Error saving post:', err);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      userId: post.userId,
      title: post.title,
      body: post.body || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postApi.delete(id);
        setPosts(posts.filter(post => post.id !== id));
      } catch (err) {
        setError('Failed to delete post');
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({ userId: users[0]?.id || 1, title: '', body: '' });
  };

  const clearFilter = () => {
    setFilterUserId(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('userId');
    window.history.replaceState({}, '', `?${newSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="post-list">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="post-list">
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">
              <i className="fi fi-rr-document"></i>
              {filterUserId 
                ? `Total posts (${filteredPosts.length})`
                : `Total Posts (${posts.length})`
              }
            </h1>
          </div>
          <div className="page-actions">
            <button 
              className="add-post-btn"
              onClick={() => setShowForm(true)}
            >
              <i className="fi fi-rr-plus"></i>
              Create Post
            </button>
          </div>
        </div>

        

        {filterUserId && (
          <div className="filter-info">
            <p>
              <i className="fi fi-rr-filter"></i>
              Showing posts by <strong>{getUserName(filterUserId)}</strong> 
            </p>
            <button onClick={clearFilter} className="clear-filter-btn">
              Show All Posts
            </button>
          </div>
        )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h2>{editingPost ? 'Edit Post' : 'Add New Post'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="userId">Author</label>
                <select
                  className="form-select"
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                  required
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input
                  className="form-input"
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter post title"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="body">Content</label>
                <textarea
                  className="form-textarea"
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  placeholder="Enter post content"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  <i className="fi fi-rr-check"></i>
                  {editingPost ? 'Update Post' : 'Create Post'}
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

        {filteredPosts.length === 0 && !loading ? (
          <div className="empty-state">
            <i className="fi fi-rr-document-add"></i>
            <h3>No Posts Found</h3>
            <p>
              {filterUserId 
                ? `No posts found for ${getUserName(filterUserId)}.` 
                : 'Add your first post to get started!'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Social Media Style Cards */}
            <div className="posts-grid">
              {currentPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-card-header">
                    <div className="post-author-info">
                      <div className="author-avatar">
                        <i className="fi fi-rr-user"></i>
                      </div>
                      <div className="author-details">
                        <div className="author-name">{getUserName(post.userId)}</div>
                        <div className="post-id">#{post.id}</div>
                      </div>
                    </div>
                    <div className="post-actions">
                      <button 
                        onClick={() => handleEdit(post)} 
                        className="action-btn edit-btn"
                        title="Edit Post"
                      >
                        <i className="fi fi-rr-edit"></i>
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="action-btn delete-btn"
                        title="Delete Post"
                      >
                        <i className="fi fi-rr-trash"></i>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="post-card-content">
                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-card-body">{post.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="fi fi-rr-angle-left"></i>
                Previous
              </button>
              
              {getVisiblePages().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
                <i className="fi fi-rr-angle-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
