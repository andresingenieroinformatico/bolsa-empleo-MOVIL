export type UserRole = 'student' | 'company' | 'admin';

export type JobModality = 'Presencial' | 'Remoto' | 'Híbrido';
export type ContractType = 'Medio tiempo' | 'Por horas' | 'Prácticas' | 'Tiempo completo';

export type ApplicationStatus = 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
export type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  semester: number;
  avatarUrl?: string;
  availability: {
    [day: string]: string[]; // 'Lunes': ['Tarde', 'Noche']
  };
  cvFile?: {
    name: string;
    sizeMb: number;
    uploadDate: string;
  };
}

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  nit: string;
  sector: string;
  description: string;
  status: CompanyStatus;
  rejectionReason?: string;
  logo?: string;
}

export interface JobOffer {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  area: string;
  program: string;
  modality: JobModality;
  contractType: ContractType;
  deadline: string;
  location: string;
  status: 'active' | 'paused' | 'closed';
  vacanciesCount: number;
  requiresCv: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentProgram: string;
  studentEmail: string;
  appliedAt: string;
  status: ApplicationStatus;
  cvFileName: string;
  interviewNote?: string;
  companyNotes?: string; // Solo visible para la empresa (HU-06 y HU-07)
}

export interface AdminKPIs {
  totalStudents: number;
  approvedCompanies: number;
  pendingCompanies: number;
  activeJobs: number;
  totalApplications: number;
  monthlyStats: { month: string; applications: number }[];
}

export const INITIAL_STUDENT: StudentProfile = {
  id: 'std-1',
  name: 'Carlos Andrés Mendoza',
  email: 'carlos.mendoza@unipaz.edu.co',
  phone: '+57 314 589 1234',
  program: 'Ingeniería de Sistemas',
  semester: 6,
  availability: {
    Lunes: ['Tarde', 'Noche'],
    Martes: ['Noche'],
    Miércoles: ['Tarde', 'Noche'],
    Jueves: ['Tarde'],
    Viernes: ['Mañana', 'Tarde'],
    Sábado: ['Mañana', 'Tarde', 'Noche'],
  },
  cvFile: {
    name: 'CV_Carlos_Mendoza_UNIPAZ.pdf',
    sizeMb: 1.8,
    uploadDate: '2026-10-18',
  },
};

export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-1',
    name: 'Ecopetrol Digital Hub',
    email: 'talento@ecopetrol.com.co',
    nit: '899.999.068-1',
    sector: 'Tecnología y Energía',
    description: 'Centro de innovación digital y operaciones tecnológicas en Barrancabermeja.',
    status: 'approved',
  },
  {
    id: 'comp-2',
    name: 'Palmas del César S.A.',
    email: 'gestionhumana@palmasdelcesar.com',
    nit: '890.205.412-4',
    sector: 'Agroindustria',
    description: 'Empresa líder en producción agroindustrial sostenible en el Magdalena Medio.',
    status: 'approved',
  },
  {
    id: 'comp-3',
    name: 'Logística y Servicios del Río S.A.S.',
    email: 'contacto@logisticadelrio.co',
    nit: '901.442.115-0',
    sector: 'Logística y Transporte',
    description: 'Operador fluvial y de transporte de carga multimodal.',
    status: 'pending',
  },
  {
    id: 'comp-4',
    name: 'Comercializadora Yariguíes',
    email: 'rrhh@yariguies.com',
    nit: '900.871.223-9',
    sector: 'Comercio',
    description: 'Cadena de suministro y comercio de bienes y servicios.',
    status: 'rejected',
    rejectionReason: 'NIT no verificado en RUES y documentación de registro incompleta.',
  },
];

export const INITIAL_JOBS: JobOffer[] = [
  {
    id: 'job-1',
    companyId: 'comp-1',
    companyName: 'Ecopetrol Digital Hub',
    title: 'Desarrollador Junior / Prácticas Móviles',
    description: 'Buscamos estudiante de últimos semestres para apoyar el desarrollo de herramientas móviles internas y APIs en React Native y Node.js. Excelente oportunidad de aprendizaje en proyectos de alta escalabilidad.',
    requirements: ['React Native o React', 'TypeScript básico', 'Manejo de Git', 'Disponibilidad de 20h semanales'],
    area: 'Tecnología',
    program: 'Ingeniería de Sistemas',
    modality: 'Híbrido',
    contractType: 'Prácticas',
    deadline: '2026-11-15',
    location: 'Barrancabermeja · Edificio Telecom',
    status: 'active',
    vacanciesCount: 2,
    requiresCv: true,
  },
  {
    id: 'job-2',
    companyId: 'comp-2',
    companyName: 'Palmas del César S.A.',
    title: 'Asistente de Producción y Control de Calidad',
    description: 'Apoyo en la toma de muestras, trazabilidad de procesos de planta de beneficio y elaboración de reportes de control operativo bajo normas ISO.',
    requirements: ['Estudiante de 5° semestre en adelante', 'Manejo de Excel intermedio', 'Disponibilidad mañanas'],
    area: 'Producción',
    program: 'Ingeniería de Producción',
    modality: 'Presencial',
    contractType: 'Medio tiempo',
    deadline: '2026-11-20',
    location: 'Zona Industrial · Barrancabermeja',
    status: 'active',
    vacanciesCount: 1,
    requiresCv: true,
  },
  {
    id: 'job-3',
    companyId: 'comp-1',
    companyName: 'Ecopetrol Digital Hub',
    title: 'Auxiliar de Soporte de Redes y Telecomunicaciones',
    description: 'Soporte a usuarios en campus, configuración de equipos de cómputo, diagnóstico de conectividad y gestión de inventario tecnológico.',
    requirements: ['Conocimientos en redes TCP/IP', 'Proactividad y servicio al cliente', 'Horario flexible'],
    area: 'Tecnología',
    program: 'Ingeniería de Sistemas',
    modality: 'Presencial',
    contractType: 'Por horas',
    deadline: '2026-11-10',
    location: 'Campus UNIPAZ / Sede Ecopetrol',
    status: 'active',
    vacanciesCount: 3,
    requiresCv: false,
  },
  {
    id: 'job-4',
    companyId: 'comp-2',
    companyName: 'Palmas del César S.A.',
    title: 'Monitor Técnico Agronómico de Campo',
    description: 'Monitoreo de sanidad vegetal, censo de plagas y registro georreferenciado en predios de cultivo en el corregimiento El Centro.',
    requirements: ['Estudiante de Agronomía', 'Ganas de aprender en campo', 'Disponibilidad fines de semana'],
    area: 'Agronomía',
    program: 'Ingeniería Agronómica',
    modality: 'Presencial',
    contractType: 'Medio tiempo',
    deadline: '2026-11-05',
    location: 'El Centro · Barrancabermeja',
    status: 'active',
    vacanciesCount: 2,
    requiresCv: true,
  },
  {
    id: 'job-5',
    companyId: 'comp-1',
    companyName: 'Ecopetrol Digital Hub',
    title: 'Analista de Datos y Automatización (Remoto)',
    description: 'Procesamiento de datos operativos con Python/Pandas y creación de dashboards de seguimiento para optimización energética.',
    requirements: ['Python o R básico', 'Visualización de datos', 'Trabajo autónomo'],
    area: 'Tecnología',
    program: 'Ingeniería de Sistemas',
    modality: 'Remoto',
    contractType: 'Medio tiempo',
    deadline: '2026-11-30',
    location: 'Remoto · Barrancabermeja',
    status: 'active',
    vacanciesCount: 1,
    requiresCv: true,
  },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Desarrollador Junior / Prácticas Móviles',
    companyName: 'Ecopetrol Digital Hub',
    studentId: 'std-1',
    studentName: 'Carlos Andrés Mendoza',
    studentProgram: 'Ingeniería de Sistemas',
    studentEmail: 'carlos.mendoza@unipaz.edu.co',
    appliedAt: '2026-10-19',
    status: 'interview',
    cvFileName: 'CV_Carlos_Mendoza_UNIPAZ.pdf',
    interviewNote: 'Citado a entrevista técnica presencial el viernes 24 de Octubre a las 3:00 PM.',
    companyNotes: 'Candidato con buen perfil en React Native. Cumple disponibilidad de tardes.',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Asistente de Producción y Control de Calidad',
    companyName: 'Palmas del César S.A.',
    studentId: 'std-1',
    studentName: 'Carlos Andrés Mendoza',
    studentProgram: 'Ingeniería de Sistemas',
    studentEmail: 'carlos.mendoza@unipaz.edu.co',
    appliedAt: '2026-10-16',
    status: 'reviewed',
    cvFileName: 'CV_Carlos_Mendoza_UNIPAZ.pdf',
    companyNotes: 'Hoja de vida revisada. El perfil es más afín a sistemas que a planta, pendiente evaluar.',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    jobTitle: 'Auxiliar de Soporte de Redes y Telecomunicaciones',
    companyName: 'Ecopetrol Digital Hub',
    studentId: 'std-1',
    studentName: 'Carlos Andrés Mendoza',
    studentProgram: 'Ingeniería de Sistemas',
    studentEmail: 'carlos.mendoza@unipaz.edu.co',
    appliedAt: '2026-10-20',
    status: 'pending',
    cvFileName: 'CV_Carlos_Mendoza_UNIPAZ.pdf',
  },
];

export const INITIAL_ADMIN_KPIS: AdminKPIs = {
  totalStudents: 485,
  approvedCompanies: 32,
  pendingCompanies: 4,
  activeJobs: 18,
  totalApplications: 156,
  monthlyStats: [
    { month: 'Mayo', applications: 18 },
    { month: 'Junio', applications: 24 },
    { month: 'Julio', applications: 12 },
    { month: 'Agosto', applications: 35 },
    { month: 'Septiembre', applications: 42 },
    { month: 'Octubre', applications: 25 },
  ],
};

export const INITIAL_USERS_MANAGEMENT = [
  { id: 'usr-1', name: 'Carlos Andrés Mendoza', email: 'carlos.mendoza@unipaz.edu.co', role: 'student', active: true },
  { id: 'usr-2', name: 'Laura Marcela Rueda', email: 'laura.rueda@unipaz.edu.co', role: 'student', active: true },
  { id: 'usr-3', name: 'Ecopetrol Digital Hub', email: 'talento@ecopetrol.com.co', role: 'company', active: true },
  { id: 'usr-4', name: 'Palmas del César S.A.', email: 'gestionhumana@palmasdelcesar.com', role: 'company', active: true },
  { id: 'usr-5', name: 'Logística y Servicios del Río', email: 'contacto@logisticadelrio.co', role: 'company', active: false },
  { id: 'usr-6', name: 'Juan José Figueroa (Admin)', email: 'admin.bolsa@unipaz.edu.co', role: 'admin', active: true },
];
