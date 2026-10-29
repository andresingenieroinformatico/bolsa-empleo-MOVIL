# language: es
Característica: Seguimiento del estado de postulaciones
  Como estudiante de UNIPAZ
  Quiero ver el estado actualizado de mis postulaciones
  Para saber en qué etapa del proceso de selección me encuentro

  Escenario: Estudiante ve su historial de postulaciones
    Dado que soy un estudiante autenticado con postulaciones realizadas
    Cuando accedo a "Mis postulaciones"
    Entonces veo un listado de todas mis postulaciones con su estado actual
    Y veo: nombre de la empresa, título de la vacante y estado de mi postulación

  Escenario: Estudiante recibe notificación cuando su estado cambia a "reviewed"
    Dado que mi postulación está en estado "pending"
    Cuando la empresa revisa mi postulación
    Entonces recibo una notificación push si tengo habilitados los permisos
    Y puedo consultar el cambio de estado en la aplicación
    Y mi postulación ahora muestra estado "reviewed"

  Escenario: Estudiante recibe notificación de entrevista
    Dado que mi postulación está en estado "reviewed"
    Cuando la empresa actualiza mi estado a "interview"
    Entonces recibo una notificación push indicando que fui citado a entrevista

  Escenario: Estudiante recibe notificación de aceptación
    Dado que participé en una entrevista
    Cuando la empresa actualiza mi estado a "accepted"
    Entonces recibo una notificación push de aceptación

  Escenario: Estudiante recibe notificación de rechazo
    Dado que participé en el proceso de selección
    Cuando la empresa actualiza mi estado a "rejected"
    Entonces recibo una notificación push de rechazo

  Escenario: Estudiante consulta el estado sin permiso para notificaciones push
    Dado que desactivé el permiso de notificaciones push en el dispositivo
    Cuando la empresa actualiza el estado de mi postulación
    Entonces el nuevo estado queda disponible en "Mis postulaciones"
    Y la aplicación no afirma que se entregó una notificación push

  Escenario: Estudiante NO puede ver las notas internas de la empresa
    Dado que la empresa escribió notas en el campo "company_notes" de mi postulación
    Cuando reviso el detalle de mi postulación
    Entonces el campo "company_notes" no es visible para mí
    Y no aparece en ninguna vista ni respuesta del sistema
