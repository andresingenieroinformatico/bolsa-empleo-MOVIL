# language: es
Característica: Perfil público de empresa
  Como representante de una empresa aprobada
  Quiero actualizar el perfil de mi organización
  Para mantener vigente la información que consultan los estudiantes

  Escenario: Empresa aprobada actualiza su información
    Dado que soy representante de una empresa aprobada
    Cuando actualizo el sector o la descripción de mi empresa con datos válidos
    Entonces los cambios quedan guardados
    Y el perfil público muestra la información actualizada

  Escenario: Empresa actualiza su logo
    Dado que soy representante de una empresa aprobada
    Cuando subo un logo válido que no supera 2 MB
    Entonces el logo queda asociado al perfil de mi empresa
    Y se muestra en el perfil público

  Escenario: Empresa intenta subir un logo que supera el límite
    Dado que soy representante de una empresa aprobada
    Cuando intento subir un logo mayor de 2 MB
    Entonces el sistema informa el límite permitido
    Y conserva el logo anterior

  Escenario: Empresa no puede modificar el perfil de otra empresa
    Dado que estoy autenticado como representante de una empresa
    Cuando intento modificar el perfil de otra empresa
    Entonces el sistema deniega la operación
    Y no modifica la información existente
