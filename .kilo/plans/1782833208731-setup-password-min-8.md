# Setup: Password minimum 8 characters

## Context
The `/setup` form currently enforces a minimum of 6 characters for the admin password. The requirement is to increase this to 8 characters.

## Changes required in `components/setup/setup-form.tsx`

1. **`getPasswordStrength` function (line 11):** Change `if (password.length >= 6) score++;` to `if (password.length >= 8) score++;`

2. **Password field validation rule (line 238):** Change `{ min: 6, message: "Mot de passe minimum 6 caractères" }` to `{ min: 8, message: "Mot de passe minimum 8 caractères" }`

3. **`PasswordStrength` hint text (line 46):** Change `Min. 6 caractères` to `Min. 8 caractères`

## Validation
- Submit the form with a 7-character password and confirm validation error appears
- Submit with 8+ characters and confirm it passes
