# language: es
Característica: Activación y desactivación de cuentas
  Como administrador del sistema
  Quiero activar o desactivar cuentas de usuario
  Para controlar su acceso a la plataforma

  Escenario: Admin desactiva una cuenta de estudiante
    Dado que soy administrador y la cuenta del estudiante está activa
    Cuando desactivo la cuenta
    Entonces su estado cambia a inactivo
    Y el estudiante no puede iniciar sesión
    Y la acción queda registrada en el historial administrativo

  Escenario: Admin reactiva una cuenta desactivada
    Dado que soy administrador y la cuenta está inactiva
    Cuando activo la cuenta
    Entonces su estado cambia a activo
    Y su titular puede iniciar sesión nuevamente
    Y la acción queda registrada en el historial administrativo

  Escenario: Admin no puede desactivar otra cuenta administrativa
    Dado que soy administrador y consulto otra cuenta administrativa
    Cuando intento desactivarla
    Entonces el sistema rechaza la operación
    Y la cuenta permanece activa

  Escenario: Usuario no administrativo intenta cambiar el estado de una cuenta
    Dado que inicié sesión como estudiante o empresa
    Cuando intento activar o desactivar una cuenta
    Entonces el sistema deniega la operación
    Y no modifica el estado de la cuenta
