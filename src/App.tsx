import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import UserList from './components/UserList';
import PostList from './components/PostList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/users" element={
            <>
              <Navbar />
              <UserList />
            </>
          } />
          <Route path="/posts" element={
            <>
              <Navbar />
              <PostList />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
