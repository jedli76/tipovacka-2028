export const ADMIN_EMAILS = [
  'romanjedlicka@gmail.com',
  // Přidej emaily dalších adminů sem:
  // 'kolega@gmail.com',
]

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}
