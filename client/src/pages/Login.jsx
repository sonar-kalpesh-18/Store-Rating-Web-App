import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setLoading(true);
		
		try {
			const { data } = await api.post('/auth/login', { email, password });
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			navigate('/');
		} catch (err) {
			setError(err.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
			<h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2d3748' }}>Login</h2>
			<form onSubmit={onSubmit}>
				<div className="form-group">
					<label className="form-label">Email</label>
					<input 
						className="form-input"
						type="email" 
						placeholder="Enter your email" 
						value={email} 
						onChange={e => setEmail(e.target.value)}
						required
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Password</label>
					<input 
						className="form-input"
						type="password" 
						placeholder="Enter your password" 
						value={password} 
						onChange={e => setPassword(e.target.value)}
						required
					/>
				</div>
				<button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
			{error && <div className="alert alert-error">{error}</div>}
			<p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096' }}>
				No account? <Link to="/signup" style={{ color: '#667eea', textDecoration: 'none' }}>Sign up</Link>
			</p>
		</div>
	);
}


