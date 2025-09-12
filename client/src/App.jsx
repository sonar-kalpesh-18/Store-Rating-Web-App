import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Stores from './pages/Stores';
import Admin from './pages/Admin';
import Owner from './pages/Owner';
import './App.css';

function Layout({ children }) {
	const user = JSON.parse(localStorage.getItem('user') || 'null');
	const location = useLocation();
	
	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.location.href = '/login';
	}
	
	return (
		<div className="container">
			<nav className="navbar">
				<div className="nav-links">
					<Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
						Stores
					</Link>
					{user?.role === 'ADMIN' && (
						<Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
							Admin
						</Link>
					)}
					{user?.role === 'OWNER' && (
						<Link to="/owner" className={`nav-link ${location.pathname === '/owner' ? 'active' : ''}`}>
							Owner
						</Link>
					)}
				</div>
				<div className="auth-section">
					{user ? (
						<>
							<span style={{ color: '#4a5568', marginRight: '1rem' }}>
								Welcome, {user.name}
							</span>
							<button onClick={logout} className="btn btn-danger">
								Logout
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="btn btn-secondary">Login</Link>
							<Link to="/signup" className="btn">Signup</Link>
						</>
					)}
				</div>
			</nav>
			<main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</main>
		</div>
	);
}

function Private({ children, roles }) {
	const user = JSON.parse(localStorage.getItem('user') || 'null');
	const token = localStorage.getItem('token');
	if (!user || !token) return <Navigate to="/login" />;
	if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
	return children;
}

export default function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<Private roles={['USER', 'ADMIN']}><Stores /></Private>} />
					<Route path="/admin" element={<Private roles={['ADMIN']}><Admin /></Private>} />
					<Route path="/owner" element={<Private roles={['OWNER', 'ADMIN']}><Owner /></Private>} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
}
