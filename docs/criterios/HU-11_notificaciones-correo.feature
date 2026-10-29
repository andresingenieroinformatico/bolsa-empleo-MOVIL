# language: es
Característica: Notificaciones adicionales por correo
  Como usuario de la bolsa de empleo
  Quiero recibir por correo avisos de eventos relevantes
  Para mantenerme informado fuera de la aplicación

  Escenario: Empresa recibe correo cuando llega una postulación
    Dado que una empresa aprobada tiene una vacante publicada
    Cuando un estudiante completa una postulación a esa vacante
    Entonces el correo registrado de la empresa recibe un aviso
    Y el aviso identifica la vacante sin exponer datos de otros candidatos

  Escenario: Estudiante recibe correo cuando cambia el estado de su postulación
    Dado que un estudiante tiene una postulación registrada
    Cuando la empresa cambia el estado de esa postulación
    Entonces el correo del estudiante recibe el aviso correspondiente
    Y el estado actualizado también se consulta en la aplicación

  Escenario: Falla el proveedor de correo
    Dado que ocurre un evento que debe notificarse por correo
    Cuando el proveedor de correo no está disponible
    Entonces el fallo queda registrado para su seguimiento
    Y el evento principal se conserva en la aplicación
