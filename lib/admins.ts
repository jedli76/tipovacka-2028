export const ADMIN_EMAILS = [
  'romanjedlicka@gmail.com',
  'petrschimon@gmail.com',
]

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}
