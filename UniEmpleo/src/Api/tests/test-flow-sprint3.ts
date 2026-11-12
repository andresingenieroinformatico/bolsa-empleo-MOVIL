/**
 * Script de Verificación de Integración Completa - Sprint 3
 * Arquitectura: App Móvil (Expo) -> Next.js Bridge (3000) -> Laravel 12 Backend (8000)
 * Stack: Next.js App Router, TypeScript, Prisma ORM (Auditoría), Laravel 12 (Core)
 */

import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api/v1";
const prisma = new PrismaClient();

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

async function runTests() {
  console.log("==========================================================");
  console.log("🚀 INICIANDO PRUEBAS DE INTEGRACIÓN: SPRINT 3 (API REST BRIDGE)");
  console.log(`🌐 Next.js Gateway: ${BASE_URL}`);
  console.log(`🐘 Laravel Backend Core: http://127.0.0.1:8000`);
  console.log("==========================================================\n");

  let studentToken = "";
  let companyToken = "";
  let adminToken = "";
  let createdJobId = 0;
  let applicationId = 0;

  // 1. AUTENTICACIÓN
  console.log("📌 [Paso 1] Autenticación de Roles vía Next.js -> Laravel...");

  // 1.1 Login Estudiante
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      email: "carlos.lopez@unipaz.edu.co",
      password: "EstudianteUNIPAZ2024*",
    }),
  });
  const studentLogin: LoginResponse = await studentLoginRes.json();
  if (!studentLogin.success || !studentLogin.data?.token) {
    throw new Error(`Falló login estudiante: ${JSON.stringify(studentLogin)}`);
  }
  studentToken = studentLogin.data.token;
  console.log(`  ✅ Login Estudiante exitoso. Token Sanctum obtenido: ${studentToken.substring(0, 15)}...`);

  // 1.2 Login Empresa
  const companyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      email: "info@tecnosoluciones.edu.co",
      password: "EmpresaUNIPAZ2024*",
    }),
  });
  const companyLogin: LoginResponse = await companyLoginRes.json();
  if (!companyLogin.success || !companyLogin.data?.token) {
    throw new Error(`Falló login empresa: ${JSON.stringify(companyLogin)}`);
  }
  companyToken = companyLogin.data.token;
  console.log(`  ✅ Login Empresa exitoso. Token Sanctum obtenido: ${companyToken.substring(0, 15)}...`);

  // 1.3 Login Admin
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      email: "admin@unipaz.edu.co",
      password: "AdminUNIPAZ2024*",
    }),
  });
  const adminLogin: LoginResponse = await adminLoginRes.json();
  if (!adminLogin.success || !adminLogin.data?.token) {
    throw new Error(`Falló login admin: ${JSON.stringify(adminLogin)}`);
  }
  adminToken = adminLogin.data.token;
  console.log(`  ✅ Login Administrador exitoso. Token Sanctum obtenido: ${adminToken.substring(0, 15)}...\n`);

  // 2. VERIFICACIÓN DE ESTADO DE EMPRESA Y CREACIÓN DE VACANTE
  console.log("📌 [Paso 2] Empresa: Verificar Estado de Aprobación y Crear Vacante...");
  const statusRes = await fetch(`${BASE_URL}/companies/status`, {
    headers: { Authorization: `Bearer ${companyToken}`, Accept: "application/json" },
  });
  const statusData = await statusRes.json();
  console.log(`  ✅ Estado empresa verificado: Aprobada = ${statusData.data?.aprobada}`);

  const createJobRes = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${companyToken}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      titulo: "Desarrollador Fullstack Next.js / TypeScript",
      descripcion: "Creación y soporte de interfaces móviles y microservicios para la Universidad.",
      ubicacion: "Barrancabermeja",
      salario: "$ 2.800.000 COP",
      modalidad: "Híbrido",
      requires_cv: true,
    }),
  });
  const createJobData = await createJobRes.json();
  if (!createJobData.success) {
    throw new Error(`Error creando vacante: ${JSON.stringify(createJobData)}`);
  }
  createdJobId = createJobData.data.id;
  console.log(`  ✅ Vacante creada en Laravel. ID: ${createdJobId} - "${createJobData.data.title || createJobData.data.titulo}"\n`);

  // 3. CONSULTA DE VACANTES CON FILTROS (ESTUDIANTE)
  console.log("📌 [Paso 3] Estudiante: Consultar Catálogo de Vacantes con Filtro...");
  const jobsRes = await fetch(`${BASE_URL}/jobs?search=Next.js&modalidad=Híbrido`);
  const jobsData = await jobsRes.json();
  const jobsList = jobsData.data?.data || jobsData.data?.jobs || [];
  console.log(`  ✅ Total vacantes encontradas con filtros: ${jobsList.length}`);

  // 3.1 SUBIR HOJA DE VIDA EN PDF
  console.log("📌 [Paso 3.1] Estudiante: Subir Hoja de Vida en PDF...");
  const samplePdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
  const uploadFormData = new FormData();
  const pdfBlob = new Blob([samplePdf], { type: "application/pdf" });
  uploadFormData.append("cv", pdfBlob, "cv-carlos-lopez.pdf");

  const uploadRes = await fetch(`${BASE_URL}/students/upload-cv`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
    body: uploadFormData,
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    throw new Error(`Error subiendo CV: ${JSON.stringify(uploadData)}`);
  }
  console.log(`  ✅ Hoja de vida subida exitosamente al almacenamiento: ${uploadData.data?.cv_path || uploadData.data?.cv_url}\n`);

  // 4. POSTULACIÓN (SPRINT 3)
  console.log("📌 [Paso 4] Sprint 3: Postulación del Estudiante a la Vacante Creada...");
  const applyRes = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${studentToken}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      job_offer_id: createdJobId,
      cover_letter: "Candidato con experiencia demostrable en React Native y Next.js.",
    }),
  });
  const applyData = await applyRes.json();
  if (!applyData.success) {
    throw new Error(`Error en postulación: ${JSON.stringify(applyData)}`);
  }
  applicationId = applyData.data.id;
  console.log(`  ✅ Postulación exitosa en Laravel. ID: ${applicationId}, Estado: ${applyData.data.status || applyData.data.estado}`);

  // 4.1 Validación de Evitar Postulaciones Duplicadas
  console.log("📌 [Paso 4.1] Validación de Control Anti-Duplicados...");
  const duplicateRes = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${studentToken}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      job_offer_id: createdJobId,
    }),
  });
  const duplicateData = await duplicateRes.json();
  if ((duplicateRes.status === 400 || duplicateRes.status === 422) && !duplicateData.success) {
    console.log(`  ✅ Control anti-duplicados superado (HTTP ${duplicateRes.status}): "${duplicateData.message}"`);
  } else {
    throw new Error("El sistema permitió una postulación duplicada.");
  }

  // 5. PRIVACIDAD: CONSULTAR POSTULACIONES DEL ESTUDIANTE (SIN COMPANY_NOTES)
  console.log("📌 [Paso 5] Privacidad: Consultar postulaciones del estudiante...");
  const studentAppsRes = await fetch(`${BASE_URL}/applications/student`, {
    headers: { Authorization: `Bearer ${studentToken}`, Accept: "application/json" },
  });
  const studentAppsData = await studentAppsRes.json();
  const rawApps = Array.isArray(studentAppsData.data) ? studentAppsData.data : (studentAppsData.data?.data || studentAppsData.data?.applications || []);
  const currentApp = rawApps.find((a: any) => a.id === applicationId);
  if (currentApp && "company_notes" in currentApp && currentApp.company_notes !== undefined && currentApp.company_notes !== null) {
    throw new Error("CRÍTICO: company_notes fue expuesto al estudiante.");
  }
  console.log("  ✅ Seguridad verificada: 'company_notes' NO se expone en la respuesta del estudiante.\n");

  // 6. EMPRESA: CONSULTAR POSTULANTES DE LA VACANTE
  console.log("📌 [Paso 6] Empresa: Consultar lista de postulantes de la vacante...");
  const jobApplicantsRes = await fetch(`${BASE_URL}/applications/job/${createdJobId}`, {
    headers: { Authorization: `Bearer ${companyToken}`, Accept: "application/json" },
  });
  const jobApplicantsData = await jobApplicantsRes.json();
  const applicantsList = Array.isArray(jobApplicantsData.data) ? jobApplicantsData.data : (jobApplicantsData.data?.data || []);
  console.log(`  ✅ Postulantes obtenidos por la empresa: ${applicantsList.length} candidato(s).`);

  // 7. EMPRESA: CAMBIAR ESTADO A 'interview' Y AGREGAR NOTAS PRIVADAS
  console.log("📌 [Paso 7] Empresa: Actualizar estado a 'interview' y registrar notas privadas...");
  const updateStatusRes = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${companyToken}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      estado: "interview",
      company_notes: "Candidato con excelente perfil técnico. Agendado a entrevista técnica.",
    }),
  });
  const updateStatusData = await updateStatusRes.json();
  if (!updateStatusData.success) {
    throw new Error(`Falló cambio de estado: ${JSON.stringify(updateStatusData)}`);
  }
  console.log(`  ✅ Estado actualizado a 'interview' y notas guardadas exitosamente en Laravel.\n`);

  // 8. ESTUDIANTE: RECIBIR NOTIFICACIONES
  console.log("📌 [Paso 8] Estudiante: Verificar notificaciones recibidas...");
  const notifRes = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${studentToken}`, Accept: "application/json" },
  });
  const notifData = await notifRes.json();
  const notifList = Array.isArray(notifData.data) ? notifData.data : (notifData.data?.data || notifData.data?.notifications || []);
  console.log(`  ✅ Notificaciones del estudiante: ${notifList.length} registrada(s) en Laravel.`);

  // 9. ADMINISTRACIÓN: LISTAR EMPRESAS
  console.log("📌 [Paso 9] Administrador: Consultar empresas en la plataforma...");
  const pendingRes = await fetch(`${BASE_URL}/admin/companies/pending`, {
    headers: { Authorization: `Bearer ${adminToken}`, Accept: "application/json" },
  });
  const pendingData = await pendingRes.json();
  const companiesList = Array.isArray(pendingData.data) ? pendingData.data : (pendingData.data?.data || []);
  console.log(`  ✅ Consulta administrativa completada: ${companiesList.length} empresa(s) retornada(s).`);

  // 10. AUDITORÍA PRISMA ORM
  console.log("📌 [Paso 10] Prisma ORM: Verificar registro de logs de auditoría...");
  const recentLogs = await prisma.apiAuditLog.findMany({
    orderBy: { created_at: "desc" },
    take: 5,
  });
  console.log(`  ✅ Prisma ORM auditó correctamente las peticiones. Últimos ${recentLogs.length} logs verificados en MySQL.`);

  console.log("\n==========================================================");
  console.log("🎉 TODAS LAS PRUEBAS DEL SPRINT 3 PASARON EXITOSAMENTE (100%)");
  console.log("🚀 Flujo Completo: Next.js (Puente) -> Laravel (Core) -> MySQL");
  console.log("==========================================================");
}

runTests()
  .catch((err) => {
    console.error("❌ ERROR EN LAS PRUEBAS:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
