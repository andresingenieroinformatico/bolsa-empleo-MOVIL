# language: es
Característica: Exportación de reportes administrativos
  Como administrador de la bolsa de empleo
  Quiero exportar reportes a Excel
  Para analizar y compartir la información de gestión

  Escenario: Administrador exporta un reporte con resultados
    Dado que soy un administrador autenticado y hay datos para reportar
    Cuando solicito exportar el reporte
    Entonces recibo un archivo Excel válido con los datos autorizados
    Y el archivo incluye encabezados comprensibles

  Escenario: Administrador exporta un reporte sin resultados
    Dado que soy un administrador autenticado y no hay datos para los filtros seleccionados
    Cuando solicito exportar el reporte
    Entonces el sistema informa que no hay resultados para exportar
    Y no genera un archivo con datos incorrectos

  Escenario: Usuario sin rol administrativo intenta exportar
    Dado que estoy autenticado como estudiante o empresa
    Cuando intento solicitar un reporte administrativo
    Entonces el sistema deniega el acceso
    Y no entrega información administrativa
