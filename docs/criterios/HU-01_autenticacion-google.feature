# language: es
Característica: Autenticación de estudiante con Google OAuth
  Como estudiante de UNIPAZ
  Quiero iniciar sesión con mi cuenta Google universitaria
  Para acceder a la bolsa de empleo sin necesidad de recordar contraseñas

  Escenario: Estudiante inicia sesión por primera vez con Google
    Dado que soy un estudiante con cuenta Google de UNIPAZ
    Cuando accedo a la pantalla de inicio y selecciono "Iniciar con Google"
    Y autorizo el acceso con mis credenciales de Google
    Entonces el sistema crea mi perfil automáticamente
    Y soy redirigido al panel de estudiante

  Escenario: Estudiante ya registrado inicia sesión con Google
    Dado que ya tengo un perfil creado en el sistema
    Cuando inicio sesión con Google OAuth
    Entonces accedo directamente a mi panel sin creación de perfil duplicado

  Escenario: Fallo al autenticarse - permisos denegados en Google
    Dado que accedo a la pantalla de inicio
    Cuando selecciono "Iniciar con Google" pero cancelo el permiso
    Entonces permanezco en la pantalla de inicio
    Y veo un mensaje informando que la autenticación fue cancelada
