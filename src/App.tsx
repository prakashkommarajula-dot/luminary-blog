import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Authors } from './pages/Authors';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyBlogs } from './pages/MyBlogs';
import { AdminDashboard } from './pages/AdminDashboard';
import { PostEditor } from './pages/PostEditor';
import { AuthorProfile } from './pages/AuthorProfile';
import { NotFound } from './pages/NotFound';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, loading, isAdmin, isAuthor } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login?redirect=/write" />;

  if (role === 'admin' && !isAdmin) return <Navigate to="/" />;
  if (role === 'author' && !isAuthor) return <Navigate to="/" />;

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (user) return <Navigate to={redirect} />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogPost />} />
              <Route path="authors" element={<Authors />} />
              <Route path="profile/:id" element={<AuthorProfile />} />
              <Route path="login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="write" element={
                <ProtectedRoute>
                  <PostEditor />
                </ProtectedRoute>
              } />
              <Route path="edit/:id" element={
                <ProtectedRoute>
                  <PostEditor />
                </ProtectedRoute>
              } />
              <Route path="my-blogs" element={
                <ProtectedRoute>
                  <MyBlogs />
                </ProtectedRoute>
              } />
              <Route path="admin" element={
                <ProtectedRoute role="author">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

