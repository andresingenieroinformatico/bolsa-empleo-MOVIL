# language: es
Característica: Historial de acciones administrativas
  Como administrador del sistema
  Quiero consultar un historial de acciones administrativas
  Para dar seguimiento a los cambios realizados

  Escenario: Admin consulta acciones administrativas registradas
    Dado que se han realizado cambios administrativos
    Cuando consulto el historial
    Entonces veo el actor, la fecha y hora, la acción y el registro afectado

  Escenario: Los cambios administrativos se registran
    Dado que soy administrador y realizo un cambio en una cuenta, empresa o vacante
    Cuando el cambio se guarda correctamente
    Entonces el historial registra quién lo realizó, cuándo, qué acción ejecutó y qué registro modificó

  Escenario: El historial no expone información sensible
    Dado que consulto el historial de acciones administrativas
    Cuando reviso sus registros
    Entonces no veo contraseñas, tokens ni contenido de hojas de vida

  Escenario: Usuario sin rol administrativo intenta consultar el historial
    Dado que inicié sesión como estudiante o empresa
    Cuando intento consultar el historial administrativo
    Entonces el sistema deniega el acceso
    Y no revela información de auditoría
