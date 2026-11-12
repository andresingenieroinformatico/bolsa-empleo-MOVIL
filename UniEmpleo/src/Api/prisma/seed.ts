import { PrismaClient, Role, JobStatus, ApplicationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seeder de la base de datos...");

  // Limpiar datos previos en orden de dependencias
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobOffer.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hashes de contraseñas
  const adminPassword = await bcrypt.hash("AdminUNIPAZ2024*", 10);
  const companyPassword = await bcrypt.hash("EmpresaUNIPAZ2024*", 10);
  const studentPassword = await bcrypt.hash("EstudianteUNIPAZ2024*", 10);

  // 1. Crear Administrador
  const admin = await prisma.user.create({
    data: {
      name: "Administrador UNIPAZ",
      email: "admin@unipaz.edu.co",
      password: adminPassword,
      role: Role.admin,
      notifications: {
        create: [
          {
            titulo: "Bienvenido al Panel de Control",
            mensaje: "Sistema de Bolsa de Empleo UNIPAZ configurado correctamente.",
            leida: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Administrador creado: ${admin.email}`);

  // 2. Crear Empresa (Aprobada)
  const companyUser = await prisma.user.create({
    data: {
      name: "Contacto TecnoSoluciones",
      email: "info@tecnosoluciones.edu.co",
      password: companyPassword,
      role: Role.company,
      company_profile: {
        create: {
          nombre_empresa: "TecnoSoluciones S.A.S.",
          nit: "901.234.567-8",
          aprobada: true,
        },
      },
    },
    include: {
      company_profile: true,
    },
  });
  console.log(`✅ Empresa creada y aprobada: ${companyUser.email}`);

  // Empresa pendiente para pruebas de aprobación
  const pendingCompanyUser = await prisma.user.create({
    data: {
      name: "Contacto InnovaTech",
      email: "contacto@innovatech.com.co",
      password: companyPassword,
      role: Role.company,
      company_profile: {
        create: {
          nombre_empresa: "InnovaTech Colombia",
          nit: "900.876.543-1",
          aprobada: false, // Pendiente de aprobación
        },
      },
    },
  });
  console.log(`✅ Empresa pendiente creada: ${pendingCompanyUser.email}`);

  // 3. Crear Estudiante
  const studentUser = await prisma.user.create({
    data: {
      name: "Carlos López",
      email: "carlos.lopez@unipaz.edu.co",
      password: studentPassword,
      role: Role.student,
      student_profile: {
        create: {
          carrera: "Ingeniería Informática",
          semestre: 8,
          documento: "1098765432",
          telefono: "3101234567",
          descripcion: "Estudiante de 8vo semestre con sólida experiencia en React Native, TypeScript y desarrollo fullstack.",
          cv_url: "/uploads/cvs/cv-carlos-lopez.pdf",
        },
      },
      notifications: {
        create: [
          {
            titulo: "Bienvenido a UniEmpleo",
            mensaje: "Completa tu perfil y sube tu hoja de vida para postularte a las mejores vacantes.",
            leida: false,
          },
        ],
      },
    },
    include: {
      student_profile: true,
    },
  });
  console.log(`✅ Estudiante creado: ${studentUser.email}`);

  // 4. Crear Ofertas Laborales para la empresa aprobada
  const companyProfileId = companyUser.company_profile!.id;

  const job1 = await prisma.jobOffer.create({
    data: {
      company_id: companyProfileId,
      titulo: "Desarrollador React Native Junior",
      descripcion: "Buscamos estudiante de últimos semestres o egresado con conocimientos en Expo, TypeScript y consumo de APIs REST.",
      ubicacion: "Barrancabermeja",
      salario: "$ 2.200.000 COP",
      modalidad: "Híbrido",
      estado: JobStatus.activa,
    },
  });

  const job2 = await prisma.jobOffer.create({
    data: {
      company_id: companyProfileId,
      titulo: "Practicante de Soporte de Sistemas e Infraestructura",
      descripcion: "Apoyo a la gestión de redes locales, mantenimiento preventivo y atención a usuarios internos.",
      ubicacion: "Barrancabermeja",
      salario: "$ 1.300.000 COP (Auxilio legal)",
      modalidad: "Presencial",
      estado: JobStatus.activa,
    },
  });

  const job3 = await prisma.jobOffer.create({
    data: {
      company_id: companyProfileId,
      titulo: "Desarrollador Frontend Web (Next.js)",
      descripcion: "Desarrollo de interfaces modernas y optimizadas para plataformas corporativas con Next.js y TailwindCSS.",
      ubicacion: "Remoto (Colombia)",
      salario: "$ 2.800.000 COP",
      modalidad: "Remoto",
      estado: JobStatus.activa,
    },
  });
  console.log(`✅ 3 Vacantes creadas para ${companyUser.company_profile!.nombre_empresa}`);

  // 5. Crear postulación de prueba (Sprint 3)
  const studentProfileId = studentUser.student_profile!.id;

  const application = await prisma.application.create({
    data: {
      job_offer_id: job1.id,
      student_id: studentProfileId,
      cv_url: studentUser.student_profile!.cv_url,
      estado: ApplicationStatus.pending,
      company_notes: "Candidato con excelente perfil académico en tecnologías móviles.",
    },
  });
  console.log(`✅ Postulación de prueba creada para ${job1.titulo}`);

  console.log("🚀 Base de datos poblada exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
