# language: es
Característica: Perfil del estudiante
  Como estudiante de UNIPAZ
  Quiero gestionar mi perfil con mis datos personales, disponibilidad horaria y hoja de vida
  Para facilitar mi proceso de postulación a vacantes

  Escenario: Estudiante completa su perfil por primera vez
    Dado que inicié sesión con Google por primera vez
    Cuando accedo a mi perfil
    Entonces el sistema muestra mi nombre y correo tomados de Google
    Y puedo completar información adicional: programa académico, semestre y teléfono

  Escenario: Estudiante registra su disponibilidad horaria
    Dado que estoy en la sección de mi perfil
    Cuando registro mis horas disponibles por día de la semana
    Entonces mi disponibilidad queda guardada
    Y las empresas pueden considerar este dato al evaluarme

  Escenario: Estudiante sube su hoja de vida al perfil
    Dado que estoy en la sección de mi perfil
    Cuando subo un archivo PDF de hasta 5 MB como hoja de vida
    Entonces el archivo se almacena en disco privado del servidor
    Y puedo reutilizarlo al postularme a vacantes futuras

  Escenario: Estudiante actualiza su hoja de vida
    Dado que ya tengo una hoja de vida subida en mi perfil
    Cuando subo una versión nueva del archivo
    Entonces la versión anterior es reemplazada
    Y la nueva versión es la que se usará en futuras postulaciones

  Escenario: Tamaño de archivo excede el límite permitido
    Dado que intento subir un archivo de hoja de vida mayor al límite establecido
    Cuando selecciono el archivo y confirmo la subida
    Entonces el sistema muestra un mensaje indicando el límite de 5 MB
    Y el archivo no se sube

  Escenario: Estudiante intenta subir un archivo que no es PDF
    Dado que estoy en la sección de mi perfil
    Cuando selecciono un archivo que no tiene formato PDF
    Entonces la aplicación indica que solo se aceptan archivos PDF
    Y no inicia la subida
