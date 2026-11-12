# language: es
Característica: Indicadores principales de administración
  Como administrador del sistema
  Quiero consultar los indicadores principales de la plataforma
  Para supervisar su funcionamiento

  Escenario: Admin consulta los indicadores principales
    Dado que soy administrador autenticado
    Cuando accedo al panel de administración
    Entonces veo el total de estudiantes
    Y veo las empresas aprobadas y pendientes
    Y veo las vacantes activas y el total de postulaciones

  Escenario: Usuario sin rol administrativo intenta consultar los indicadores
    Dado que inicié sesión como estudiante o empresa
    Cuando intento consultar el panel de administración
    Entonces el sistema deniega el acceso
    Y no revela datos administrativos
