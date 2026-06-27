# Plan: Install Ant Design & Configure AntdRegistry

## Context
- Project: Next.js 16 app (`app/layout.tsx`)
- No antd packages currently installed

## Steps

### 1. Install npm packages
```bash
npm install antd
npm install @ant-design/icons@6.x
npm install @ant-design/nextjs-registry
```

### 2. Edit `app/layout.tsx`
- Add import: `import { AntdRegistry } from '@ant-design/nextjs-registry';`
- Change `<body>` content from:
  ```tsx
  <body className="min-h-full flex flex-col">{children}</body>
  ```
  to:
  ```tsx
  <body className="min-h-full flex flex-col">
    <AntdRegistry>{children}</AntdRegistry>
  </body>
  ```

## Validation
- Run `npm run build` to verify no type/build errors
- Verify `@ant-design/nextjs-registry` is compatible with Next.js 16
