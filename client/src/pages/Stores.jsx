import { useEffect, useState } from 'react';
import api from '../api';

export default function Stores() {
	const [stores, setStores] = useState([]);
	const [q, setQ] = useState('');
	const [loading, setLoading] = useState(false);
	const [rating, setRating] = useState({});
	const user = JSON.parse(localStorage.getItem('user') || 'null');

	async function load() {
		setLoading(true);
		try {
			const params = { q, userId: user?.id };
			const { data } = await api.get('/stores', { params });
			setStores(data);
		} catch (err) {
			console.error('Failed to load stores:', err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(); }, []);

	async function rate(id, value) {
		if (!value) return;
		try {
			await api.post(`/stores/${id}/rate`, { value: Number(value), userId: user.id });
			setRating(prev => ({ ...prev, [id]: value }));
			await load();
		} catch (err) {
			console.error('Failed to rate store:', err);
		}
	}

	return (
		<div className="card">
			<h2 style={{ marginBottom: '2rem', color: '#2d3748' }}>Store Directory</h2>
			
			<div className="filters">
				<input 
					className="form-input filter-input"
					placeholder="Search by name or address..." 
					value={q} 
					onChange={e => setQ(e.target.value)}
				/>
				<button onClick={load} className="btn" disabled={loading}>
					{loading ? 'Searching...' : 'Search'}
				</button>
			</div>

			{loading ? (
				<div className="loading">
					<div className="spinner"></div>
				</div>
			) : (
				<div className="table-container">
					<table className="table">
						<thead>
							<tr>
								<th>Store Name</th>
								<th>Address</th>
								<th>Overall Rating</th>
								<th>Your Rating</th>
								<th>Rate Store</th>
							</tr>
						</thead>
						<tbody>
							{stores.length === 0 ? (
								<tr>
									<td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
										No stores found
									</td>
								</tr>
							) : (
								stores.map(s => (
									<tr key={s.id}>
										<td style={{ fontWeight: '500' }}>{s.name}</td>
										<td>{s.address}</td>
										<td>
											<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
												<span style={{ fontWeight: '600' }}>{s.overallRating.toFixed(1)}</span>
												<div className="rating-stars">
													{[1,2,3,4,5].map(n => (
														<span key={n} className={`star ${n <= s.overallRating ? 'active' : ''}`}>★</span>
													))}
												</div>
											</div>
										</td>
										<td>
											{s.userRating ? (
												<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
													<span style={{ fontWeight: '600' }}>{s.userRating}</span>
													<div className="rating-stars">
														{[1,2,3,4,5].map(n => (
															<span key={n} className={`star ${n <= s.userRating ? 'active' : ''}`}>★</span>
														))}
													</div>
												</div>
											) : '-'}
										</td>
										<td>
											<select 
												className="form-input"
												value={rating[s.id] || s.userRating || ''} 
												onChange={e => rate(s.id, e.target.value)}
												style={{ minWidth: '100px' }}
											>
												<option value="">Rate</option>
												{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
											</select>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}


