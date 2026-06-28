# Replace deprecated Select.Option in /setup page

## Context
`Select.Option` is deprecated in the project's Ant Design type definitions. The `/setup` page (`app/setup/page.tsx`) uses it for the currency selector.

## Changes

### `app/setup/page.tsx`

1. **Delete** line 10: `const { Option } = Select;`
2. **Replace** lines 104–107:
   ```tsx
   // FROM:
   <Select placeholder="Sélectionner une devise">
     <Option value="USD">USD</Option>
     <Option value="CDF">CDF</Option>
   </Select>

   // TO:
   <Select
     placeholder="Sélectionner une devise"
     options={[{ value: "USD", label: "USD" }, { value: "CDF", label: "CDF" }]}
   />
   ```

## Validation
- Run `npx tsc --noEmit` — confirm no TS6385 deprecation warning for `Option`.
