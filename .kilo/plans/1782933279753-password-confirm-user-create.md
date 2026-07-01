# Add password confirmation & strength indicator to user-create-drawer

## Context
`components/settings/user-create-drawer.tsx` has a single password field with no confirmation and no strength indicator. The setup form (`components/setup/setup-form.tsx`) already has the full UX: `PasswordStrength` component, `getPasswordStrength` scoring, `Input.Password` with `onChange` tracking, and a confirmation field with match validation.

## Task
Replicate the same password UX from `setup-form.tsx` into `user-create-drawer.tsx` by duplicating the relevant code inline (per user preference — no shared extraction).

### Changes to `components/settings/user-create-drawer.tsx`

1. **Add `passwordValue` state** — `const [passwordValue, setPasswordValue] = useState("");`

2. **Add `getPasswordStrength` function** (copy from `setup-form.tsx:9-17`) — scores 0-5 based on: length ≥ 8, uppercase, lowercase, digit, special char.

3. **Add `PasswordStrength` component** (copy from `setup-form.tsx:19-50`) — renders progress bar, strength label, and hint text. Uses same French labels ("Très faible", "Faible", etc.).

4. **Update the password `Form.Item`** — add `onChange` to `<Input.Password>`:
   ```tsx
   <Input.Password
     placeholder="Mot de passe"
     onChange={(e) => setPasswordValue(e.target.value)}
   />
   ```

5. **Add `PasswordStrength` render** after the password `Form.Item`:
   ```tsx
   <PasswordStrength password={passwordValue} />
   ```

6. **Add confirmation field** after `PasswordStrength`, before the role field:
   ```tsx
   <Form.Item
     name="confirmPassword"
     label="Confirmer le mot de passe"
     dependencies={["password"]}
     rules={[
       { required: true, message: "Confirmation requise" },
       ({ getFieldValue }) => ({
         validator(_, value) {
           if (!value || getFieldValue("password") === value) {
             return Promise.resolve();
           }
           return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
         },
       }),
     ]}
   >
     <Input.Password placeholder="Confirmer le mot de passe" />
   </Form.Item>
   ```

7. **Update `handleSubmit` type** — add `confirmPassword: string` to the values type (even if not sent to API, it satisfies TypeScript).

8. **Reset `passwordValue`** in `form.resetFields()` calls — add `setPasswordValue("")` next to both `form.resetFields()` calls (line 35 and implicit in onClose).

## No other changes needed
- `Input.Password` is already used; `Input` is already imported.
- No schema/API changes — `authClient.admin.createUser` doesn't send `confirmPassword`.
- `user-edit-drawer.tsx` doesn't have a password field, so it's unaffected.

## Validation
- Verify the drawer opens, shows password strength bar updating as user types
- Verify confirmation field rejects mismatched passwords
- Verify form submits successfully when passwords match
- Verify drawer reset clears password state
