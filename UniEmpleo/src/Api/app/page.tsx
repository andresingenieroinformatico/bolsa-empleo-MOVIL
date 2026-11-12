export default function HomePage() {
  return (
    <main style={{ padding: "3rem", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
      <h1>Bolsa de Empleo UNIPAZ - Backend API REST</h1>
      <p>Servidor activo en <strong>Next.js 14 (App Router)</strong> con <strong>Prisma ORM</strong> y <strong>MySQL</strong>.</p>
      <h2>Endpoints Base de la API v1:</h2>
      <ul>
        <li><code>GET /api/v1</code> - Estado y módulos de la API</li>
        <li><code>POST /api/v1/auth/login</code> - Autenticación JWT</li>
        <li><code>POST /api/v1/auth/register/student</code> - Registro de Estudiantes</li>
        <li><code>POST /api/v1/auth/register/company</code> - Registro de Empresas</li>
        <li><code>GET /api/v1/jobs</code> - Catálogo de Vacantes</li>
        <li><code>GET /api/v1/applications/student</code> - Postulaciones del Estudiante</li>
        <li><code>GET /api/v1/admin/companies/pending</code> - Gestión Administrativa</li>
      </ul>
      <p>Consulte la documentación completa en <code>docs/API_DOCUMENTATION.md</code> y <code>docs/ARQUITECTURA_API.md</code>.</p>
    </main>
  );
}
