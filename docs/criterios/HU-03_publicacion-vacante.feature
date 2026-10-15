# language: es
Característica: Publicación de vacantes por empresa
  Como empresa aprobada
  Quiero publicar ofertas de empleo
  Para encontrar estudiantes de UNIPAZ que se ajusten a mis necesidades

  Escenario: Empresa aprobada publica una vacante exitosamente
    Dado que soy una empresa en estado "approved"
    Cuando completo el formulario de vacante con título, descripción, requisitos, tipo de contrato, modalidad y fecha límite
    Entonces la vacante se crea en estado "active"
    Y es visible para los estudiantes en la búsqueda

  Escenario: Empresa no aprobada intenta publicar vacante
    Dado que soy una empresa en estado "pending"
    Cuando intento acceder al formulario de publicar vacante
    Entonces el sistema me deniega el acceso
    Y veo un mensaje indicando que debo ser aprobada primero

  Escenario: Empresa edita su propia vacante
    Dado que soy empresa aprobada y tengo una vacante publicada
    Cuando modifico el título o la descripción de mi vacante
    Entonces los cambios se guardan correctamente
    Y la vacante actualizada es visible para los estudiantes

  Escenario: Empresa intenta editar vacante de otra empresa
    Dado que soy empresa aprobada
    Cuando intento editar una vacante que no me pertenece
    Entonces el sistema retorna un error 403
    Y no se realizan cambios

  Escenario: Vacante supera su fecha límite
    Dado que existe una vacante activa cuya fecha límite ya pasó
    Cuando un estudiante busca vacantes
    Entonces la vacante no aparece en los resultados activos
    Y se considera expirada aunque su estado sea "active"

  Escenario: Admin pausa una vacante activa
    Dado que soy administrador
    Cuando pauso una vacante desde el panel de administración
    Entonces la vacante cambia a estado "paused"
    Y deja de ser visible para los estudiantes
