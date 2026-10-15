# language: es
Característica: Búsqueda y consulta de vacantes
  Como estudiante de UNIPAZ
  Quiero buscar y filtrar vacantes disponibles
  Para encontrar ofertas que se adapten a mi horario y programa académico

  Escenario: Estudiante ve listado de vacantes activas
    Dado que soy un estudiante autenticado
    Cuando accedo a la sección de vacantes
    Entonces veo un listado paginado de vacantes activas (con deadline vigente)
    Y no veo vacantes pausadas, cerradas o expiradas

  Escenario: Estudiante filtra vacantes por área
    Dado que estoy en el listado de vacantes
    Cuando selecciono un área específica en el filtro
    Entonces solo se muestran vacantes de esa área

  Escenario: Estudiante filtra vacantes por modalidad
    Dado que estoy en el listado de vacantes
    Cuando selecciono "Remoto" como modalidad
    Entonces solo se muestran vacantes con modalidad remota

  Escenario: Estudiante filtra vacantes por programa académico
    Dado que estoy en el listado de vacantes
    Cuando selecciono mi programa académico en el filtro
    Entonces solo se muestran vacantes relevantes para mi programa

  Escenario: No hay vacantes disponibles con los filtros aplicados
    Dado que aplico filtros muy específicos
    Cuando no existen vacantes que coincidan
    Entonces veo un mensaje amigable indicando que no hay resultados
    Y puedo limpiar los filtros para ver todas las vacantes

  Escenario: Estudiante ve el detalle de una vacante
    Dado que estoy en el listado de vacantes
    Cuando selecciono una vacante específica
    Entonces veo el detalle completo: título, descripción, requisitos, modalidad, tipo de contrato y fecha límite
    Y veo el perfil de la empresa que la publica
