export function isAdmin(email: string): boolean {
  return email === process.env.ADMIN_EMAIL;
}
