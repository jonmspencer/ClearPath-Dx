When modifying middleware or any file imported by middleware:
- NEVER import Node.js packages (nodemailer, postmark, prisma, bcryptjs, fs, etc.)
- Middleware runs in Vercel Edge Runtime — only Web APIs are available
- Auth middleware must import from `@clearpath/auth/edge`, NOT `@clearpath/auth`
- If adding a new auth provider, ensure it doesn't pull Node.js deps into the edge bundle
