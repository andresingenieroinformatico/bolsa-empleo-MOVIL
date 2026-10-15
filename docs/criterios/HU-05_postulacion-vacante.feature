# language: es
Característica: Postulación a vacantes
  Como estudiante de UNIPAZ
  Quiero postularme a vacantes disponibles adjuntando mi hoja de vida
  Para que las empresas evalúen mi perfil

  Escenario: Estudiante se postula exitosamente a una vacante sin CV obligatorio
    Dado que soy un estudiante autenticado y hay una vacante activa disponible
    Cuando hago clic en "Postularme" en el detalle de la vacante
    Entonces mi postulación se registra en estado "pending"
    Y la empresa recibe una notificación por email y en la plataforma

  Escenario: Estudiante se postula adjuntando CV cuando es obligatorio
    Dado que la vacante requiere CV para postularse
    Cuando completo la postulación y adjunto mi hoja de vida (PDF o DOCX)
    Entonces el archivo se almacena en disco privado del servidor
    Y la postulación queda registrada en estado "pending"

  Escenario: Estudiante intenta postularse a la misma vacante dos veces
    Dado que ya me postulé a una vacante específica
    Cuando intento postularme nuevamente a la misma vacante
    Entonces el sistema muestra un mensaje indicando que ya me postulé
    Y no se crea una postulación duplicada

  Escenario: Estudiante usa el CV de su perfil al postularse
    Dado que tengo una hoja de vida subida en mi perfil
    Cuando me postulo a una vacante que requiere CV
    Entonces puedo seleccionar "Usar el CV de mi perfil" sin adjuntar un archivo nuevo

  Escenario: Estudiante intenta descargar el CV de otro estudiante directamente
    Dado que existo como usuario del sistema
    Cuando intento acceder al CV de otro estudiante por URL directa
    Entonces el sistema deniega el acceso (401 o 403)
    Y el archivo no es descargable sin autenticación apropiada
