SIMULADOR DE MATRÍCULA - V14

Cambios principales:
- El periodo académico se calcula automáticamente con la fecha del equipo:
  * enero a junio: AAAA-1
  * julio a diciembre: AAAA-2
  Ejemplo: enero de 2027 -> 2027-1; julio de 2027 -> 2027-2.
- En el caso "Llevo cursos de diferentes ciclos", el simulador obliga a comenzar por BASES DE DATOS I (ciclo 02) antes de INGENIERÍA DE SOFTWARE I (ciclo 04).
- Una vez planificado el curso de ciclo inferior, los horarios del curso de ciclo mayor se comparan automáticamente.
- Los horarios con cruce quedan bloqueados y muestran "No disponible".
- Todos los horarios abiertos que NO tienen cruce mantienen su botón "Selección", por lo que el alumno puede escoger cualquiera de esas alternativas.
- Los casos de cursos jalados, clases cerradas, prerrequisitos y validación de requisitos continúan funcionando.

Abrir index.html en un navegador moderno.

V15 - Protección de interfaz:
- F12 bloqueado.
- Ctrl/Cmd+Shift+I, J, C, K bloqueados.
- Ctrl/Cmd+U bloqueado.
- Clic derecho bloqueado.
- Consola neutralizada y detección básica de DevTools con pantalla de protección.
Nota: al ser un proyecto HTML/JS que se ejecuta en el navegador, ninguna protección del lado del cliente puede impedir al 100% que alguien con acceso físico a los archivos los abra o modifique fuera del navegador. Para protección real, la lógica crítica debe ejecutarse en un servidor.
