import pkg from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
	// Create admin user
	const adminEmail = 'admin@storeapp.local';
	const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
	if (!adminExists) {
		const password = await hashPassword('Admin@123');
		await prisma.user.create({
			data: {
				name: 'System Administrator User',
				email: adminEmail,
				address: 'N/A',
				password,
				role: 'ADMIN'
			}
		});
		console.log('Seeded admin user:', adminEmail, 'password: Admin@123');
	} else {
		console.log('Admin already exists');
	}

	// Create sample stores with owners
	const stores = [
		{
			name: 'TechMart Electronics',
			email: 'contact@techmart.com',
			address: '123 Tech Street, Silicon Valley, CA 94000',
			owner: {
				name: 'John Smith',
				email: 'john@techmart.com',
				address: '123 Tech Street, Silicon Valley, CA 94000',
				password: 'Owner@123'
			}
		},
		{
			name: 'Fresh Grocery Store',
			email: 'info@freshgrocery.com',
			address: '456 Market Avenue, Downtown, NY 10001',
			owner: {
				name: 'Sarah Johnson',
				email: 'sarah@freshgrocery.com',
				address: '456 Market Avenue, Downtown, NY 10001',
				password: 'Owner@123'
			}
		},
		{
			name: 'Fashion Boutique',
			email: 'hello@fashionboutique.com',
			address: '789 Style Boulevard, Fashion District, LA 90210',
			owner: {
				name: 'Mike Davis',
				email: 'mike@fashionboutique.com',
				address: '789 Style Boulevard, Fashion District, LA 90210',
				password: 'Owner@123'
			}
		},
		{
			name: 'Book Haven',
			email: 'books@bookhaven.com',
			address: '321 Library Lane, University Town, MA 02138',
			owner: {
				name: 'Emily Wilson',
				email: 'emily@bookhaven.com',
				address: '321 Library Lane, University Town, MA 02138',
				password: 'Owner@123'
			}
		},
		{
			name: 'Coffee Corner',
			email: 'brew@coffeecorner.com',
			address: '654 Bean Street, Coffee District, WA 98101',
			owner: {
				name: 'Alex Rodriguez',
				email: 'alex@coffeecorner.com',
				address: '654 Bean Street, Coffee District, WA 98101',
				password: 'Owner@123'
			}
		}
	];

	// Create stores and their owners
	for (const storeData of stores) {
		const storeExists = await prisma.store.findUnique({ 
			where: { email: storeData.email } 
		});
		
		if (!storeExists) {
			// Create owner user
			const ownerPassword = await hashPassword(storeData.owner.password);
			const owner = await prisma.user.create({
				data: {
					name: storeData.owner.name,
					email: storeData.owner.email,
					address: storeData.owner.address,
					password: ownerPassword,
					role: 'OWNER'
				}
			});

			// Create store
			await prisma.store.create({
				data: {
					name: storeData.name,
					email: storeData.email,
					address: storeData.address,
					ownerId: owner.id
				}
			});

			console.log(`Created store: ${storeData.name} with owner: ${storeData.owner.email}`);
		} else {
			console.log(`Store ${storeData.name} already exists`);
		}
	}

	// Create some sample users and ratings
	const sampleUsers = [
		{
			name: 'Alice Brown',
			email: 'alice@example.com',
			address: '100 User Street, Sample City, TX 75001',
			password: 'User@123'
		},
		{
			name: 'Bob Green',
			email: 'bob@example.com',
			address: '200 Customer Avenue, Demo Town, FL 33101',
			password: 'User@123'
		},
		{
			name: 'Carol White',
			email: 'carol@example.com',
			address: '300 Client Road, Test City, IL 60601',
			password: 'User@123'
		}
	];

	for (const userData of sampleUsers) {
		const userExists = await prisma.user.findUnique({ 
			where: { email: userData.email } 
		});
		
		if (!userExists) {
			const userPassword = await hashPassword(userData.password);
			const user = await prisma.user.create({
				data: {
					name: userData.name,
					email: userData.email,
					address: userData.address,
					password: userPassword,
					role: 'USER'
				}
			});

			// Add some random ratings for this user
			const allStores = await prisma.store.findMany();
			const numRatings = Math.floor(Math.random() * 3) + 1; // 1-3 ratings per user
			const selectedStores = allStores.sort(() => 0.5 - Math.random()).slice(0, numRatings);

			for (const store of selectedStores) {
				await prisma.rating.create({
					data: {
						value: Math.floor(Math.random() * 5) + 1, // 1-5 rating
						comment: `Great service at ${store.name}!`,
						userId: user.id,
						storeId: store.id
					}
				});
			}

			console.log(`Created user: ${userData.name} with ${numRatings} ratings`);
		}
	}

	console.log('Database seeding completed!');
}

main().finally(async () => {
	await prisma.$disconnect();
});
