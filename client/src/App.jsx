import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Expenses from "./pages/Expenses/Expenses";
import Profile from "./pages/Profile/Profile";
import AIInsights from "./pages/AIInsights/AIInsights";
import Chat from "./pages/Chat/Chat";
import Goals from "./pages/Goals/Goals";
import IncomeSetup from "./components/IncomeSetup/IncomeSetup";
import Loading from "./components/Loading/Loading";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (!user) return <Navigate to="/login" />;
  if (user.monthlyIncome === null || user.monthlyIncome === undefined) return <Navigate to="/setup-income" />;
  return children;
};

const SetupIncomeRoute = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return <Loading fullPage />;
  if (!user) return <Navigate to="/login" />;
  if (user.monthlyIncome !== null && user.monthlyIncome !== undefined) return <Navigate to="/dashboard" />;
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#f9fafb" }}>
      <IncomeSetup onDone={() => navigate("/dashboard")} />
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/setup-income" element={<SetupIncomeRoute />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ExpenseProvider>
        <AppLayout />
      </ExpenseProvider>
    </AuthProvider>
  </BrowserRouter>
);

const AppLayout = () => {
  const { user } = useAuth();
  return (
    <>
      {user && user.monthlyIncome !== null && user.monthlyIncome !== undefined ? <Navbar /> : null}
      <AppRoutes />
    </>
  );
};

export default App;
