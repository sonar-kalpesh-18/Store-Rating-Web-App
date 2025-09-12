import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Signup() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [address, setAddress] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setLoading(true);
		
		try {
			await api.post('/auth/signup', { name, email, address, password });
			navigate('/login');
		} catch (err) {
			setError(err.response?.data?.message || 'Signup failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="card" style={{ maxWidth: 520, margin: '40px auto' }}>
			<h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2d3748' }}>Signup</h2>
			<form onSubmit={onSubmit}>
				<div className="form-group">
					<label className="form-label">Full Name</label>
					<input 
						className="form-input"
						type="text" 
						placeholder="Enter your full name (20-60 characters)" 
						value={name} 
						onChange={e => setName(e.target.value)}
						minLength="20"
						maxLength="60"
						required
					/>
				</div>
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
					<label className="form-label">Address</label>
					<textarea 
						className="form-input"
						placeholder="Enter your address (max 400 characters)" 
						value={address} 
						onChange={e => setAddress(e.target.value)}
						maxLength="400"
						rows="3"
						required
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Password</label>
					<input 
						className="form-input"
						type="password" 
						placeholder="8-16 characters, 1 uppercase, 1 special character" 
						value={password} 
						onChange={e => setPassword(e.target.value)}
						minLength="8"
						maxLength="16"
						required
					/>
				</div>
				<button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
					{loading ? 'Creating Account...' : 'Create Account'}
				</button>
			</form>
			{error && <div className="alert alert-error">{error}</div>}
			<p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096' }}>
				Have an account? <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>Login</Link>
			</p>
		</div>
	);
}


