import bcrypt from 'bcryptjs';
let key = 'x!A%D*G-KaPdSgVkYp3s5v8y/B?E(H+M';
export async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, 12);
  return hash;
}
export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
