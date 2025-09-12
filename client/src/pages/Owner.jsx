import { useEffect, useState } from 'react';
import api from '../api';

export default function Owner() {
	const user = JSON.parse(localStorage.getItem('user') || 'null');
	const [store, setStore] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		async function load() {
			try {
				const { data } = await api.get('/owner/my-store', { params: { ownerId: user?.id } });
				setStore(data);
			} catch (err) {
				setError('Failed to load store data: ' + (err.response?.data?.message || 'Unknown error'));
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	if (loading) {
		return (
			<div className="card">
				<div className="loading">
					<div className="spinner"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="card">
				<div className="alert alert-error">{error}</div>
			</div>
		);
	}

	if (!store) {
		return (
			<div className="card">
				<div className="alert alert-error">No store found. Contact an admin to create a store for you.</div>
			</div>
		);
	}

	return (
		<div>
			<div className="card">
				<h2 style={{ marginBottom: '2rem', color: '#2d3748' }}>My Store Dashboard</h2>
				
				<div className="stats-grid">
					<div className="stat-card">
						<div className="stat-number">{store.averageRating?.toFixed?.(1) || 0}</div>
						<div className="stat-label">Average Rating</div>
					</div>
					<div className="stat-card">
						<div className="stat-number">{store.ratings?.length || 0}</div>
						<div className="stat-label">Total Ratings</div>
					</div>
				</div>

				<div style={{ marginBottom: '2rem' }}>
					<h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Store Information</h3>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
						<div>
							<strong>Store Name:</strong> {store.name}
						</div>
						<div>
							<strong>Overall Rating:</strong> 
							<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
								<span style={{ fontWeight: '600' }}>{store.averageRating?.toFixed?.(1) || 0}</span>
								<div className="rating-stars">
									{[1,2,3,4,5].map(n => (
										<span key={n} className={`star ${n <= (store.averageRating || 0) ? 'active' : ''}`}>★</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card">
				<h3 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Customer Ratings</h3>
				
				{store.ratings?.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
						No ratings yet. Encourage customers to rate your store!
					</div>
				) : (
					<div className="table-container">
						<table className="table">
							<thead>
								<tr>
									<th>Customer Name</th>
									<th>Email</th>
									<th>Rating</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{store.ratings.map(r => (
									<tr key={r.id}>
										<td style={{ fontWeight: '500' }}>{r.user.name}</td>
										<td>{r.user.email}</td>
										<td>
											<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
												<span style={{ fontWeight: '600' }}>{r.value}</span>
												<div className="rating-stars">
													{[1,2,3,4,5].map(n => (
														<span key={n} className={`star ${n <= r.value ? 'active' : ''}`}>★</span>
													))}
												</div>
											</div>
										</td>
										<td>{new Date(r.createdAt).toLocaleDateString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}


