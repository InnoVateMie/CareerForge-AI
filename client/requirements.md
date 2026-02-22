## Packages
three | Required for the 3D particle background on the landing page
@react-three/fiber | React renderer for Three.js
@react-three/drei | Useful helpers for react-three-fiber
framer-motion | For fluid animations and page transitions
@tiptap/react | Core rich text editor for editing generated resumes
@tiptap/starter-kit | Essential extensions for the Tiptap editor
html2pdf.js | To export the beautifully rendered HTML resumes to PDF
marked | To convert AI-generated Markdown into HTML for the rich text editor
react-hook-form | For robust form state management
@hookform/resolvers | Zod validation integration for forms

## Notes
- `html2pdf.js` is used directly in the browser to snapshot the DOM for PDF export.
- AI responses for resumes/cover letters are returned as Markdown; `marked` converts them to HTML before inserting into `@tiptap/react`.
- Replit Auth provides the authentication state via `useAuth()`. Users are redirected to `/api/login` instead of a custom sign-in page.
