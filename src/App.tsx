import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MainScreen from './pages/MainScreen';
import NeighborhoodScreen from './pages/NeighborhoodScreen';
import SearchResultsScreen from './pages/SearchResultsScreen';
import CommerceDetailsScreen from './pages/CommerceDetailsScreen';
import CommerceDashboard from './pages/admin/CommerceDashboard';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main" element={<MainScreen />} />
          <Route path="/neighborhood" element={<NeighborhoodScreen />} />
          <Route path="/search-results" element={<SearchResultsScreen />} />
          <Route path="/commerce/:commerceId" element={<CommerceDetailsScreen />} />

          <Route path="/admin/commerce-dashboard" element={<CommerceDashboard />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #2a2a2a',
            },
          }}
        />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;