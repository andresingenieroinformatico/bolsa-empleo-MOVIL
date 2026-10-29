# language: es
Característica: Gráfico mensual de postulaciones
  Como administrador del sistema
  Quiero consultar un gráfico mensual de postulaciones del año en curso
  Para observar su evolución

  Escenario: Admin consulta las postulaciones por mes
    Dado que soy un administrador autenticado
    Cuando consulto el gráfico de postulaciones
    Entonces veo las cantidades agrupadas por mes del año en curso
    Y los meses aparecen en orden cronológico

  Escenario: El gráfico incluye meses sin postulaciones
    Dado que hay meses del año en curso sin postulaciones
    Cuando consulto el gráfico de postulaciones
    Entonces esos meses aparecen con valor cero

  Escenario: El gráfico no incluye postulaciones de otros años
    Dado que existen postulaciones de años anteriores
    Cuando consulto el gráfico del año en curso
    Entonces los datos mostrados pertenecen únicamente al año en curso
