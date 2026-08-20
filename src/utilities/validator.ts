export function validateEmail(email: string): string | null {
  if (!email) return 'Invalid details';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Invalid details';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return 'Invalid details';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validateRequired(value: string, field: string): string | null {
  if (!value || !value.trim()) return `${field} is required`;
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  const re = /^[+]?[\d\s()-]{7,}$/;
  if (!re.test(phone)) return 'Invalid details';
  return null;
}

export function validateUrl(url: string): string | null {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
}
