# language: es
Característica: Gestión de candidatos por empresa
  Como representante de una empresa aprobada
  Quiero ver y gestionar los candidatos que se postulan a mis vacantes
  Para llevar a cabo mi proceso de selección

  Escenario: Empresa ve los candidatos de una vacante
    Dado que soy empresa aprobada con una vacante publicada
    Cuando accedo a la sección de postulaciones de esa vacante
    Entonces veo el listado de estudiantes que se postularon
    Y puedo ver el nombre, perfil y estado de cada candidato

  Escenario: Empresa descarga la hoja de vida de un candidato
    Dado que un estudiante adjuntó CV en su postulación
    Cuando el representante solicita ver la hoja de vida
    Entonces el archivo se descarga a través de una ruta autenticada
    Y no es accesible por URL directa

  Escenario: Empresa actualiza el estado de un candidato a "reviewed"
    Dado que tengo una postulación en estado "pending"
    Cuando actualizo el estado a "reviewed"
    Entonces el estudiante recibe una notificación de actualización
    Y el estado se refleja inmediatamente en el sistema

  Escenario: Empresa actualiza el estado a "interview"
    Dado que un candidato está en estado "reviewed"
    Cuando actualizo su estado a "interview"
    Entonces el estudiante es notificado que fue seleccionado para entrevista

  Escenario: Empresa acepta a un candidato
    Dado que un candidato está en estado "interview"
    Cuando actualizo su estado a "accepted"
    Entonces el estudiante recibe notificación de aceptación

  Escenario: Empresa rechaza a un candidato
    Dado que un candidato está en cualquier estado del proceso
    Cuando actualizo su estado a "rejected"
    Entonces el estudiante recibe notificación de rechazo

  Escenario: Empresa intenta ver candidatos de vacante ajena
    Dado que soy empresa aprobada
    Cuando intento acceder a los candidatos de una vacante de otra empresa
    Entonces el sistema retorna error 403
    Y no puedo ver la información de esa empresa
