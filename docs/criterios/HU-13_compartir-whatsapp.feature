# language: es
Característica: Compartir vacantes por WhatsApp
  Como estudiante de UNIPAZ
  Quiero compartir una vacante por WhatsApp
  Para hacer llegar la oportunidad a una persona interesada

  Escenario: Estudiante comparte una vacante activa
    Dado que consulto el detalle de una vacante activa
    Cuando selecciono "Compartir por WhatsApp"
    Entonces se abre WhatsApp con el enlace y el título de la vacante preparados
    Y puedo confirmar o cancelar el envío desde WhatsApp

  Escenario: La vacante ya no está disponible
    Dado que consulto una vacante cerrada o expirada
    Cuando intento compartirla
    Entonces la aplicación informa que la vacante ya no está disponible
    Y no presenta el enlace como una oportunidad activa

  Escenario: WhatsApp no está disponible en el dispositivo
    Dado que consulto una vacante activa en un dispositivo sin WhatsApp instalado
    Cuando selecciono "Compartir por WhatsApp"
    Entonces la aplicación informa que no puede abrir WhatsApp
    Y conserva abierta la vacante consultada
