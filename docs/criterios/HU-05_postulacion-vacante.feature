# language: es
Característica: Postulación a vacantes
  Como estudiante de UNIPAZ
  Quiero postularme a vacantes disponibles adjuntando mi hoja de vida
  Para que las empresas evalúen mi perfil

  Escenario: Estudiante se postula usando una hoja de vida PDF
    Dado que soy un estudiante autenticado y hay una vacante activa disponible
    Cuando adjunto mi hoja de vida en formato PDF de hasta 5 MB y confirmo la postulación
    Entonces mi postulación se registra en estado "pending"
    Y el archivo queda almacenado de forma privada
    Y la empresa recibe una notificación de nueva postulación

  Escenario: El archivo adjunto no cumple el formato o tamaño permitido
    Dado que estoy preparando una postulación
    Cuando selecciono un archivo que no es PDF o supera 5 MB
    Entonces la aplicación explica el formato y tamaño permitidos
    Y no envía el archivo ni crea la postulación

  Escenario: Estudiante intenta postularse a la misma vacante dos veces
    Dado que ya me postulé a una vacante específica
    Cuando intento postularme nuevamente a la misma vacante
    Entonces el sistema muestra un mensaje indicando que ya me postulé
    Y no se crea una postulación duplicada

  Escenario: Estudiante usa el CV de su perfil al postularse
    Dado que tengo una hoja de vida subida en mi perfil
    Cuando me postulo a una vacante que requiere CV
    Entonces puedo seleccionar "Usar el CV de mi perfil" sin adjuntar un archivo nuevo
    Y la postulación conserva el estado del formulario si la aplicación pasa a segundo plano

  Escenario: Estudiante intenta descargar el CV de otro estudiante directamente
    Dado que existo como usuario del sistema
    Cuando intento acceder al CV de otro estudiante por URL directa
    Entonces el sistema deniega el acceso (401 o 403)
    Y el archivo no es descargable sin autenticación apropiada
