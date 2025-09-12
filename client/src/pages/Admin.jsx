import { useEffect, useState } from 'react';
import api from '../api';

export default function Admin() {
	const [stats, setStats] = useState({ userCount: 0, storeCount: 0, ratingCount: 0 });
	const [stores, setStores] = useState([]);
	const [users, setUsers] = useState([]);
	const [q, setQ] = useState('');
	const [sortBy, setSortBy] = useState('name');
	const [sortOrder, setSortOrder] = useState('asc');
	const [loading, setLoading] = useState(false);

	const [newUser, setNewUser] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
	const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
	const [message, setMessage] = useState('');

	async function load() {
		setLoading(true);
		try {
			const [statsRes, storesRes, usersRes] = await Promise.all([
				api.get('/admin/dashboard'),
				api.get('/admin/stores', { params: { q, sortBy, sortOrder } }),
				api.get('/admin/users', { params: { q, sortBy, sortOrder } })
			]);
			setStats(statsRes.data);
			setStores(storesRes.data);
			setUsers(usersRes.data);
		} catch (err) {
			console.error('Failed to load admin data:', err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(); }, []);

	async function createUser(e) {
		e.preventDefault();
		try {
			await api.post('/admin/users', newUser);
			setNewUser({ name: '', email: '', address: '', password: '', role: 'USER' });
			setMessage('User created successfully!');
			await load();
		} catch (err) {
			setMessage('Failed to create user: ' + (err.response?.data?.message || 'Unknown error'));
		}
	}

	async function createStore(e) {
		e.preventDefault();
		try {
			await api.post('/admin/stores', newStore);
			setNewStore({ name: '', email: '', address: '', ownerId: '' });
			setMessage('Store created successfully!');
			await load();
		} catch (err) {
			setMessage('Failed to create store: ' + (err.response?.data?.message || 'Unknown error'));
		}
	}

	return (
		<div>
			<div className="card">
				<h2 style={{ marginBottom: '2rem', color: '#2d3748' }}>Admin Dashboard</h2>
				
				<div className="stats-grid">
					<div className="stat-card">
						<div className="stat-number">{stats.userCount}</div>
						<div className="stat-label">Total Users</div>
					</div>
					<div className="stat-card">
						<div className="stat-number">{stats.storeCount}</div>
						<div className="stat-label">Total Stores</div>
					</div>
					<div className="stat-card">
						<div className="stat-number">{stats.ratingCount}</div>
						<div className="stat-label">Total Ratings</div>
					</div>
				</div>

				<div className="filters">
					<input 
						className="form-input filter-input"
						placeholder="Filter by name/email/address..." 
						value={q} 
						onChange={e => setQ(e.target.value)} 
					/>
					<select className="form-input filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
						<option value="name">Name</option>
						<option value="email">Email</option>
						<option value="address">Address</option>
						<option value="role">Role</option>
						<option value="createdAt">Created</option>
					</select>
					<select className="form-input filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
						<option value="asc">Ascending</option>
						<option value="desc">Descending</option>
					</select>
					<button onClick={load} className="btn" disabled={loading}>
						{loading ? 'Loading...' : 'Apply'}
					</button>
				</div>
			</div>

			{message && (
				<div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
					{message}
				</div>
			)}

			<div className="card">
				<h3 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Create New User</h3>
				<form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
					<div className="form-group">
						<label className="form-label">Name</label>
						<input 
							className="form-input"
							placeholder="Full name (20-60 chars)" 
							value={newUser.name} 
							onChange={e => setNewUser({ ...newUser, name: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Email</label>
						<input 
							className="form-input"
							type="email"
							placeholder="Email address" 
							value={newUser.email} 
							onChange={e => setNewUser({ ...newUser, email: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Address</label>
						<input 
							className="form-input"
							placeholder="Address (max 400 chars)" 
							value={newUser.address} 
							onChange={e => setNewUser({ ...newUser, address: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Password</label>
						<input 
							className="form-input"
							type="password"
							placeholder="Password" 
							value={newUser.password} 
							onChange={e => setNewUser({ ...newUser, password: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Role</label>
						<select 
							className="form-input"
							value={newUser.role} 
							onChange={e => setNewUser({ ...newUser, role: e.target.value })}
						>
							<option value="USER">User</option>
							<option value="OWNER">Store Owner</option>
							<option value="ADMIN">Admin</option>
						</select>
					</div>
					<button type="submit" className="btn">Create User</button>
				</form>
			</div>

			<div className="card">
				<h3 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Create New Store</h3>
				<form onSubmit={createStore} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
					<div className="form-group">
						<label className="form-label">Store Name</label>
						<input 
							className="form-input"
							placeholder="Store name" 
							value={newStore.name} 
							onChange={e => setNewStore({ ...newStore, name: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Email</label>
						<input 
							className="form-input"
							type="email"
							placeholder="Store email" 
							value={newStore.email} 
							onChange={e => setNewStore({ ...newStore, email: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Address</label>
						<input 
							className="form-input"
							placeholder="Store address" 
							value={newStore.address} 
							onChange={e => setNewStore({ ...newStore, address: e.target.value })}
							required
						/>
					</div>
					<div className="form-group">
						<label className="form-label">Owner ID</label>
						<input 
							className="form-input"
							placeholder="User ID of owner" 
							value={newStore.ownerId} 
							onChange={e => setNewStore({ ...newStore, ownerId: e.target.value })}
							required
						/>
					</div>
					<button type="submit" className="btn">Create Store</button>
				</form>
			</div>

			<div className="card">
				<h3 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Stores</h3>
				<div className="table-container">
					<table className="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Address</th>
								<th>Rating</th>
								<th>Owner</th>
							</tr>
						</thead>
						<tbody>
							{stores.map(s => (
								<tr key={s.id}>
									<td style={{ fontWeight: '500' }}>{s.name}</td>
									<td>{s.email}</td>
									<td>{s.address}</td>
									<td>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
											<span style={{ fontWeight: '600' }}>{s.rating?.toFixed?.(1) || 0}</span>
											<div className="rating-stars">
												{[1,2,3,4,5].map(n => (
													<span key={n} className={`star ${n <= (s.rating || 0) ? 'active' : ''}`}>★</span>
												))}
											</div>
										</div>
									</td>
									<td>{s.owner?.email}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="card">
				<h3 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Users</h3>
				<div className="table-container">
					<table className="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Address</th>
								<th>Role</th>
								<th>Store Rating</th>
							</tr>
						</thead>
						<tbody>
							{users.map(u => (
								<tr key={u.id}>
									<td style={{ fontWeight: '500' }}>{u.name}</td>
									<td>{u.email}</td>
									<td>{u.address}</td>
									<td>
										<span style={{ 
											padding: '0.25rem 0.5rem', 
											borderRadius: '4px', 
											fontSize: '0.875rem',
											backgroundColor: u.role === 'ADMIN' ? '#fed7d7' : u.role === 'OWNER' ? '#c6f6d5' : '#e2e8f0',
											color: u.role === 'ADMIN' ? '#c53030' : u.role === 'OWNER' ? '#2f855a' : '#4a5568'
										}}>
											{u.role}
										</span>
									</td>
									<td>
										{u.rating ? (
											<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
												<span style={{ fontWeight: '600' }}>{u.rating.toFixed(1)}</span>
												<div className="rating-stars">
													{[1,2,3,4,5].map(n => (
														<span key={n} className={`star ${n <= u.rating ? 'active' : ''}`}>★</span>
													))}
												</div>
											</div>
										) : '-'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
