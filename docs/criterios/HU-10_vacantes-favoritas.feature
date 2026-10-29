# language: es
Característica: Vacantes favoritas
  Como estudiante de UNIPAZ
  Quiero guardar vacantes favoritas
  Para volver a consultarlas fácilmente

  Escenario: Estudiante guarda una vacante activa como favorita
    Dado que soy un estudiante autenticado y consulto una vacante activa
    Cuando selecciono la acción "Guardar en favoritos"
    Entonces la vacante queda asociada a mis favoritos
    Y la aplicación confirma que fue guardada

  Escenario: Estudiante consulta sus vacantes favoritas
    Dado que tengo vacantes guardadas como favoritas
    Cuando accedo a la sección "Favoritos"
    Entonces veo las vacantes guardadas
    Y puedo abrir el detalle de cada vacante

  Escenario: Estudiante elimina una vacante de favoritos
    Dado que una vacante está guardada en mis favoritos
    Cuando selecciono la acción "Quitar de favoritos"
    Entonces la vacante deja de aparecer en mi lista de favoritos

  Escenario: Estudiante consulta favoritos sin elementos
    Dado que no he guardado vacantes como favoritas
    Cuando accedo a la sección "Favoritos"
    Entonces veo un estado vacío que explica cómo guardar una vacante
