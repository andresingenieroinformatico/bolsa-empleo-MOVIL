# language: es
Característica: Consulta del listado de usuarios
  Como administrador del sistema
  Quiero buscar, filtrar y recorrer la lista de usuarios
  Para encontrar la cuenta que necesito gestionar

  Escenario: Admin filtra usuarios por rol
    Dado que estoy en el listado de usuarios
    Cuando selecciono el filtro "Empresas"
    Entonces veo únicamente usuarios con rol empresa

  Escenario: Admin busca un usuario específico
    Dado que estoy en el listado de usuarios
    Cuando escribo un nombre o email en el buscador
    Entonces veo únicamente usuarios que coinciden con la búsqueda

  Escenario: Admin consulta usuarios con paginación
    Dado que existen más usuarios que los que caben en una página
    Cuando avanzo a la página siguiente del listado
    Entonces veo el siguiente grupo de usuarios sin duplicar registros
    Y se conservan los filtros y la búsqueda activos

  Escenario: No hay usuarios para la búsqueda o filtro
    Dado que estoy en el listado de usuarios
    Cuando la búsqueda o el filtro no coincide con ningún usuario
    Entonces veo un estado vacío que informa que no hay resultados
    Y puedo limpiar los criterios para consultar de nuevo
