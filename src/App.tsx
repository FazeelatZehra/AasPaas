import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import PostRequest from './pages/PostRequest';
import RequestFeed from './pages/RequestFeed';
import BusinessRegistration from './pages/BusinessRegistration';
import Profile from './pages/Profile';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/request-feed" element={<RequestFeed />} />
            <Route path="/business-registration" element={<BusinessRegistration />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
