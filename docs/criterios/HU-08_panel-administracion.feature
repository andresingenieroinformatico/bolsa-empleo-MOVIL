# language: es
Característica: Panel de administración
  Como administrador del sistema
  Quiero tener un panel centralizado con KPIs y gestión de usuarios
  Para monitorear y controlar el funcionamiento de la plataforma

  Escenario: Admin ve el dashboard con KPIs
    Dado que soy administrador autenticado
    Cuando accedo al panel de administración
    Entonces veo las siguientes métricas en tiempo real:
      | Métrica                    |
      | Total de estudiantes       |
      | Empresas aprobadas         |
      | Empresas pendientes        |
      | Vacantes activas           |
      | Total de postulaciones     |

  Escenario: Admin ve el gráfico mensual de postulaciones
    Dado que estoy en el dashboard de administración
    Cuando visualizo la sección de gráficos
    Entonces veo un gráfico de barras con las postulaciones mes a mes del año en curso

  Escenario: Admin gestiona usuarios - desactiva un estudiante
    Dado que estoy en la sección de gestión de usuarios
    Cuando desactivo un estudiante
    Entonces ese estudiante no puede iniciar sesión
    Y su estado se refleja como inactivo en el listado

  Escenario: Admin no puede desactivar a otro administrador
    Dado que estoy en la sección de gestión de usuarios
    Cuando intento desactivar una cuenta de administrador
    Entonces el sistema no permite la acción
    Y muestra un mensaje informativo

  Escenario: Admin filtra usuarios por rol
    Dado que estoy en la sección de gestión de usuarios
    Cuando selecciono el filtro "Empresas"
    Entonces veo únicamente los usuarios con rol empresa

  Escenario: Admin busca un usuario específico
    Dado que estoy en el listado de usuarios
    Cuando escribo un nombre o email en el buscador
    Entonces el sistema filtra y muestra solo los usuarios que coinciden
