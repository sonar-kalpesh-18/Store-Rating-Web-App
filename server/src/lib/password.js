import bcrypt from 'bcrypt';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export function validatePasswordPolicy(password) {
	return PASSWORD_REGEX.test(password);
}

export async function hashPassword(plain) {
	const saltRounds = 10;
	return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain, hash) {
	return bcrypt.compare(plain, hash);
}


