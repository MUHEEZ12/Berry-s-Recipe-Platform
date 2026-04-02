import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for better performance
const Home = lazy(() => import('./Pages/Home'));
const About = lazy(() => import('./Pages/About'));
const Contact = lazy(() => import('./Pages/Contact'));
const RecipesPage = lazy(() => import('./Pages/RecipesPage'));
const CreateRecipe = lazy(() => import('./Pages/CreateRecipe'));
const RecipeDetails = lazy(() => import('./Pages/Recipedetails'));
const Profile = lazy(() => import('./Pages/Profile'));
const Login = lazy(() => import('./components/Login'));
const SignUp = lazy(() => import('./components/SignUp'));
const Settings = lazy(() => import('./components/Settings'));
const Terms = lazy(() => import('./components/Terms'));
const Privacy = lazy(() => import('./components/Privacy'));

// Loading component
const Loading = () => (
  <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading...</p>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ element, isPrivate = false }) => {
  const { user } = useAuth();

  if (isPrivate && !user) {
    return <Navigate to="/login" />;
  }

  return element;
};

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <ScrollToTop />

      <Suspense fallback={<Loading />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* AUTH */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} isPrivate={true} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} isPrivate={true} />} />

          {/* RECIPE MANAGEMENT */}
          <Route path="/create-recipe" element={<ProtectedRoute element={<CreateRecipe />} isPrivate={true} />} />

          {/* LEGAL */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default App;

