### Task 1: Bootstrap Next.js & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js` (standard Next.js setup)
- Modify: None (clean setup)
- Test: Build and run the app

**Interfaces:**
- Consumes: None
- Produces: Working Next.js project skeleton with standard dependencies installed.

- [ ] **Step 1: Bootstrap Next.js 15 app**
Initialize the workspace with Next.js 15 template.
Run: `npx create-next-app@15.0.0-rc.0 . --ts --eslint --tailwind --app --src-dir --import-alias "@/*"`

- [ ] **Step 2: Add essential dependencies**
Install database ORM, crypto, mail, PDF, icon, and animation libraries.
Run: `npm install better-sqlite3 drizzle-orm bcryptjs nodemailer @react-pdf/renderer lucide-react framer-motion clsx tailwind-merge canvas-confetti gsap tsparticles tsparticles-slim @tsparticles/react react-spring`
Run: `npm install -D drizzle-kit @types/better-sqlite3 @types/bcryptjs @types/nodemailer @types/canvas-confetti @types/gsap tsx`

- [ ] **Step 3: Run dev server to verify bootstrap**
Run: `npm run dev`
Expected: Server starts on port 3000. Verify by hitting `http://localhost:3000` via curl or checking output.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: bootstrap nextjs project and install dependencies"
```
