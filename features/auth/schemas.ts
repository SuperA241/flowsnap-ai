export interface AuthFields {
  email: string;
  password: string;
}

export interface AuthValidationError {
  email?: string;
  password?: string;
}

export function validateAuthFields(fields: AuthFields): AuthValidationError | null {
  const errors: AuthValidationError = {};

  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "A valid email address is required.";
  }

  if (!fields.password || fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
