Berry Recipes backend (minimal)

Run locally:

1. cd Backend/server
2. copy .env.example to .env and edit
3. npm install
4. npm run dev

Endpoints:
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password }
- GET  /api/recipes
- POST /api/recipes (protected)
- DELETE /api/recipes/:id (protected, owner only)
