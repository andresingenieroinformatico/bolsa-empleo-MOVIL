# language: es
Característica: Registro y aprobación de empresa
  Como representante de una empresa
  Quiero registrarme en la plataforma
  Para publicar vacantes dirigidas a estudiantes de UNIPAZ

  Escenario: Empresa se registra exitosamente
    Dado que soy representante de una empresa
    Cuando completo el formulario de registro con email único, contraseña y NIT opcional
    Entonces mi cuenta se crea en estado "pending"
    Y no puedo publicar vacantes hasta ser aprobado
    Y recibo un mensaje indicando que mi solicitud está en revisión

  Escenario: Registro con email ya existente
    Dado que intento registrarme con un email que ya existe en el sistema
    Cuando envío el formulario de registro
    Entonces el sistema muestra un error indicando que el email ya está en uso

  Escenario: Admin aprueba una empresa
    Dado que soy administrador y hay una empresa en estado "pending"
    Cuando apruebo la empresa desde el panel de administración
    Entonces la empresa pasa a estado "approved"
    Y el representante recibe una notificación por email y en la plataforma
    Y la empresa puede ahora publicar vacantes

  Escenario: Admin rechaza una empresa
    Dado que soy administrador y hay una empresa en estado "pending"
    Cuando rechazo la empresa con un motivo
    Entonces la empresa recibe notificación de rechazo por email
    Y no puede publicar vacantes

  Escenario: Empresa inactiva intenta iniciar sesión
    Dado que mi cuenta de empresa está marcada como inactiva
    Cuando intento iniciar sesión con mis credenciales
    Entonces el sistema bloquea el acceso
    Y veo un mensaje indicando que mi cuenta está desactivada
