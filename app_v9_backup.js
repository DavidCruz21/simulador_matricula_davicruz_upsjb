const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

const STUDENT = {
  code: '181140418U',
  name: 'DAVID CRUZ FELIPA',
  institution: 'UNIV. PRIV. SAN JUAN BAUTISTA',
  career: 'PREGRADO',
  program: 'INGENIERÍA DE SISTEMAS',
  term: '2026-2'
};

const TARGET_ID = 'M_R_SIS2202020101';
const FAILED_IDS = ['M_R_SIS2201010301','M_R_SIS2201010601'];

const initialCourses = [
  {id:TARGET_ID, name:'PROGRAMACIÓN ORIENTADA A OBJETOS', credits:4, cycle:'02', status:'none'},

  // Cuatro cursos del primer ciclo ya aprobados.
  {id:'M_R_SIS2201010101', name:'MATEMÁTICA I', credits:4, cycle:'01', status:'done', grade:'15'},
  {id:'M_R_SIS2201010201', name:'INTRODUCCIÓN A LA INGENIERÍA DE SISTEMAS', credits:3, cycle:'01', status:'done', grade:'16'},
  {id:'M_R_SIS2201010401', name:'COMUNICACIÓN Y REDACCIÓN ACADÉMICA', credits:3, cycle:'01', status:'done', grade:'14'},
  {id:'M_R_SIS2201010501', name:'LÓGICA Y ALGORITMOS', credits:4, cycle:'01', status:'done', grade:'17'},

  // Escenario de regularización: dos asignaturas desaprobadas de un ciclo inferior.
  {id:'M_R_SIS2201010301', name:'FUNDAMENTOS DE PROGRAMACIÓN', credits:4, cycle:'01', status:'failed', grade:'', repeat:true},
  {id:'M_R_SIS2201010601', name:'MATEMÁTICA DISCRETA I', credits:4, cycle:'01', status:'failed', grade:'', repeat:true},

  {id:'M_R_SIS2202020201', name:'ESTRUCTURAS DISCRETAS', credits:4, cycle:'02', status:'none'},
  {id:'M_R_SIS2202020301', name:'ARQUITECTURA DE COMPUTADORAS', credits:4, cycle:'02', status:'none'},
  {id:'M_R_SIS2202020401', name:'BASES DE DATOS I', credits:4, cycle:'02', status:'none'},
  {id:'M_R_SIS2202030101', name:'ESTRUCTURAS DE DATOS Y ALGORITMOS', credits:4, cycle:'03', status:'none'},
  {id:'M_R_SIS2202030201', name:'REDES DE COMPUTADORAS I', credits:4, cycle:'03', status:'none'}
];
function buildCoursesForScenario(scenario){
  const base=initialCourses.map(c=>({...c}));
  if(scenario==='clean') return base.filter(c=>!c.repeat);
  return base;
}
let courses = buildCoursesForScenario('failed');

const sections = [
  {id:'0001-TEO', classNo:'2101', campus:'FILIAL ICA', room:'LAB. CÓMPUTO B-201', day:'Lun', start:'7:00PM', end:'8:30PM', teacher:'CARLOS RAMÍREZ', open:true},
  {id:'0002-TEO', classNo:'2102', campus:'FILIAL ICA', room:'LAB. CÓMPUTO B-204', day:'Mié', start:'5:30PM', end:'7:00PM', teacher:'ANA TORRES', open:true},
  {id:'0003-TEO', classNo:'2103', campus:'FILIAL ICA', room:'AULA B-207', day:'Sáb', start:'9:00AM', end:'10:30AM', teacher:'LUIS PAREDES', open:false}
];

const practicalSections = [
  {id:'0001-PRA', classNo:'3101', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-101', day:'Mar', start:'7:00PM', end:'8:30PM', teacher:'MARIO VEGA', open:true},
  {id:'0002-PRA', classNo:'3102', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-103', day:'Jue', start:'5:30PM', end:'7:00PM', teacher:'SOFÍA NÚÑEZ', open:true},
  {id:'0003-PRA', classNo:'3103', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-105', day:'Sáb', start:'10:45AM', end:'12:15PM', teacher:'DIEGO LEÓN', open:false}
];

const state = {
  screen: 'dashboard',
  scenario: null,
  navOpen: false,
  navExpanded: false,
  navLevel: 'root',
  guided: true,
  selectedCourse: null,
  selectedSection: null,
  selectedPractical: null,
  planner: [],
  schedules: {},
  justEnrolled: null,
  attemptedTargetBlocked: false,
  requirementsUploaded: null,
  assistantNotice: null
};

function icon(name, cls='') {
  const icons = {
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.7v-6.1H9.2V21H3.5a.5.5 0 0 1-.5-.5z"/><path d="M8.2 21v-7.1h7.6V21"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5z"/><circle cx="12" cy="12" r="1.2"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4"/><path d="M5 5c4-3 7 3 12 0v9c-5 3-8-3-12 0"/></svg>`,
    dots: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5 21 12l-1.6-1.5.3-2.1-2.1-.7L16.3 6l-2 .8L12.8 5h-1.6L9.7 6.8 7.7 6l-1.3 1.7-2.1.7.3 2.1L3 12l1.6 1.5-.3 2.1 2.1.7L7.7 18l2-.8 1.5 1.8h1.6l1.5-1.8 2 .8 1.3-1.7 2.1-.7z"/></svg>`,
    person: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="20" r="11"/><path d="M14 54c1.8-13 8.5-20 18-20s16.2 7 18 20z"/><path d="m18 16 14-8 14 8-14 8z"/><path d="M44 17v10"/></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`
  };
  return `<span class="svg-icon ${cls}">${icons[name] || ''}</span>`;
}

function targetCourse(){ return courses.find(c=>c.id===TARGET_ID); }
function failedCourses(){ return FAILED_IDS.map(id=>courses.find(c=>c.id===id)).filter(Boolean); }
function pendingFailedCourses(){ return failedCourses().filter(c=>c.status!=='enrolled'); }
function failedPlannedCourses(){ return failedCourses().filter(c=>c.status==='planned'); }
function failedUnplannedCourses(){ return failedCourses().filter(c=>c.status==='failed'); }
function regularizationComplete(){ return pendingFailedCourses().length===0; }
function plannerHas(id){ return state.planner.some(c=>c.id===id); }
function safeId(id){ return id.replace(/[^a-zA-Z0-9_-]/g,'_'); }

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  state.assistantNotice = msg;
  const assistantText = document.getElementById('assistantMessage');
  if(assistantText) assistantText.textContent = msg;
  setTimeout(()=>toastEl.classList.remove('show'),1900);
}
function clearAssistantNotice(){ state.assistantNotice=null; }

// La guía V7 no muestra mensajes ni paneles: solo ilumina el siguiente control útil.
function advance(){ /* compatibilidad con llamadas de versiones anteriores */ }

function resetGame(){
  state.scenario=null;
  courses = buildCoursesForScenario('failed');
  Object.assign(state,{
    screen:'dashboard', navOpen:false, navExpanded:false, navLevel:'root', guided:true,
    selectedCourse:null, selectedSection:null, selectedPractical:null, planner:[], schedules:{}, justEnrolled:null, attemptedTargetBlocked:false,
    requirementsUploaded:null, assistantNotice:null
  });
  render();
}

function chooseScenario(type){
  state.scenario=type;
  courses=buildCoursesForScenario(type);
  Object.assign(state,{
    screen:'dashboard', navOpen:false, navExpanded:false, navLevel:'root',
    selectedCourse:null, selectedSection:null, selectedPractical:null,
    planner:[], schedules:{}, justEnrolled:null, attemptedTargetBlocked:false,
    requirementsUploaded:null, assistantNotice:null
  });
  render();
}

function chooseRequirements(uploaded){
  state.requirementsUploaded=uploaded;
  state.assistantNotice=null;
  state.screen='dashboard';
  state.navOpen=false;
  state.navExpanded=false;
  state.navLevel='root';
  render();
}

function topActions(includeIds=true){
  return `<div class="top-actions">
    <button class="icon-btn" title="Inicio" aria-label="Inicio" onclick="goDashboard()">${icon('home')}</button>
    <button class="icon-btn" title="Bandera" aria-label="Bandera">${icon('flag')}</button>
    <button class="icon-btn" title="Más opciones" aria-label="Más opciones">${icon('dots')}</button>
    <button ${includeIds?'id="compassBtn"':''} class="icon-btn compass" title="NavBar" aria-label="Abrir NavBar" onclick="openNavigator()">${icon('compass')}</button>
  </div>`;
}

function topBar(){
  return `<header class="topbar">
    <div class="brand">ORACLE<span class="brand-mark">®</span></div>
    <div class="module-name">▼ Alumnos</div>
    ${topActions(true)}
  </header>`;
}

function dashboard(){
  return `<div class="app-shell">
    ${topBar()}
    <main class="dashboard">
      ${tile('Registros Académicos','assets/tile_academics.svg','',``)}
      ${tile('Cuenta Financiera','assets/tile_finance.svg','<span class="mark">!</span>Vencimiento Pago','')}
      ${tile('Encuesta','assets/tile_survey.svg','',``)}
    </main>
    <div class="dashboard-dot">•</div>
    ${navigatorDrawer()}
    ${assistantWidget()}
  </div>`;
}

function assistantContext(){
  if(state.assistantNotice) return {title:'David · SAE', message:state.assistantNotice, actions:''};

  if(state.screen==='dashboard' && !state.scenario){
    return {
      title:'Hola, soy David Cruz de SAE',
      message:'Te voy a enseñar el proceso de tu matrícula. Antes de empezar, dime: ¿jalaste algún curso el ciclo pasado?',
      actions:`<button id="scenarioYes" class="assistant-btn warning-choice" onclick="chooseScenario('failed')">Sí, jalé cursos</button><button id="scenarioNo" class="assistant-btn" onclick="chooseScenario('clean')">No, aprobé todo</button>`
    };
  }
  if(state.screen==='dashboard' && state.scenario && state.requirementsUploaded===null){
    return {
      title:'Antes de continuar',
      message:'¿Ya subiste tus requisitos al Intranet? Esta validación define si el sistema te mostrará la opción “Selección” al elegir tus horarios.',
      actions:`<button id="requirementsYes" class="assistant-btn" onclick="chooseRequirements(true)">Sí, ya los subí</button><button id="requirementsNo" class="assistant-btn warning-choice" onclick="chooseRequirements(false)">No, todavía no</button>`
    };
  }
  if(state.navOpen && !state.navExpanded) return {title:'David · SAE',message:'Ahora selecciona “Navegador” en la barra lateral.',actions:''};
  if(state.navOpen && state.navLevel==='root') return {title:'David · SAE',message:'En el Navegador, entra a “Autoservicio”.',actions:''};
  if(state.navOpen && state.navLevel==='autoservicio') return {title:'David · SAE',message:'Dentro de Autoservicio, selecciona “Progreso Académico/Graduación”.',actions:''};
  if(state.navOpen && state.navLevel==='progress') return {title:'David · SAE',message:'Ahora selecciona “Inicio Proceso Matrícula”. Este paso es el mismo tanto si jalaste cursos como si aprobaste todo.',actions:''};
  if(state.screen==='dashboard'){
    return {
      title:'Empecemos el recorrido',
      message:state.requirementsUploaded
        ? 'Ahora abre la brújula de la esquina superior derecha. El recorrido será: Navegador → Autoservicio → Progreso Académico/Graduación → Inicio Proceso Matrícula.'
        : 'Puedes recorrer el sistema, pero al llegar a las secciones no aparecerá el botón “Selección” porque aún no has subido tus requisitos al Intranet. Primero debes cargarlos para poder elegir un horario.',
      actions:''
    };
  }

  if(state.screen==='conditions') return {
    title:'David · SAE',
    message:'Aquí empiezas la matrícula. Pulsa “Cursos Disponibles” para revisar tu malla y los cursos que puedes planificar.',
    actions:''
  };
  if(state.screen==='courses'){
    if(state.scenario==='failed' && !regularizationComplete()){
      return {title:'David · SAE',message:'Veo cursos de ciclos inferiores sin nota ni símbolo. Puedes planificar tus cursos, pero al intentar inscribir uno de ciclo superior el sistema te pedirá inscribir primero esos cursos pendientes.',actions:''};
    }
    return {title:'David · SAE',message:'Inscríbete siguiendo tu malla curricular y de acuerdo con los créditos otorgados. Elige primero el curso que deseas llevar y revisa sus horarios.',actions:''};
  }
  if(state.screen==='course') return {
    title:'David · SAE',
    message:state.requirementsUploaded
      ? 'Revisa el detalle del curso. Primero selecciona una clase teórica y luego una clase práctica obligatoria; recién después podrás añadir el curso al Planificador.'
      : 'Puedes revisar el detalle, pero no podrás seleccionar una sección porque tus requisitos aún no figuran cargados en el Intranet.',
    actions:''
  };
  if(state.screen==='sections') return {
    title:'David · SAE',
    message:state.requirementsUploaded
      ? 'Selecciona una sección teórica que esté abierta. Después el sistema te pedirá escoger la clase práctica.'
      : 'No aparece el botón “Selección” porque aún no has subido tus requisitos al Intranet. Primero debes cargarlos; por eso el sistema no te permite escoger este horario.',
    actions:''
  };
  if(state.screen==='practical') return {title:'David · SAE',message:'Ahora selecciona la clase práctica obligatoria que mejor se acomode a tu horario y pulsa “Sig”.',actions:''};
  if(state.screen==='enrollBlocked') return {title:'David · SAE',message:'Este aviso aparece porque tienes cursos pendientes de ciclos inferiores. Debes planificarlos e inscribirlos primero; luego podrás inscribir el curso del ciclo superior que ya dejaste en tu Planificador.',actions:''};
  if(state.screen==='enroll') return {
    title:'David · SAE · Recomendación',
    message:'Inscríbete según tu malla curricular y los créditos otorgados. Si no sabes cuántos créditos tienes, comunícate con SAE o revisa tu malla curricular. Los créditos se asignan según el ciclo en el que te encuentras y los cursos de ciclos inferiores que tengas pendientes. Si te sobran créditos o un curso está lleno, se recomienda escoger cursos electivos.',
    actions:''
  };
  return {title:'David · SAE',message:'Estoy contigo durante todo el proceso de matrícula.',actions:''};
}

function assistantWidget(){
  const info=assistantContext();
  return `<section class="sae-assistant ${state.navOpen?'nav-open':''}" aria-live="polite">
    <div class="sae-photo-wrap"><img class="sae-photo" src="assets/david_sae.png" alt="David Cruz de SAE"></div>
    <div class="sae-bubble">
      <div class="sae-title">${info.title}</div>
      <div id="assistantMessage" class="sae-message">${info.message}</div>
      ${info.actions?`<div class="assistant-actions">${info.actions}</div>`:''}
    </div>
  </section>`;
}

function tile(title,iconPath,warning,onclick){
  return `<section class="tile" ${onclick?`onclick="${onclick}" role="button" tabindex="0"`:''}>
    <h3>${title}</h3>
    <div class="tile-icon"><img src="${iconPath}" alt=""></div>
    ${warning?`<div class="warning">${warning}</div>`:''}
  </section>`;
}

function railIcon(type){
  const files = {
    recent:'assets/nav_recent.svg', favorite:'assets/nav_favorite.svg',
    navigator:'assets/nav_navigator.svg', classic:'assets/nav_classic.svg'
  };
  return `<img src="${files[type]}" alt="">`;
}

function navigatorDrawer(){
  const openCls = state.navOpen ? 'open' : '';
  const sizeCls = state.navExpanded ? 'expanded' : 'compact';
  const title = state.navExpanded ? 'NavBar: Navegador' : 'NavBar';
  return `<div class="nav-scrim ${openCls}" onclick="closeNavigator(event)">
    <aside class="nav-drawer ${sizeCls}" onclick="event.stopPropagation()">
      <div class="nav-title"><span>${title}</span><button class="nav-gear" aria-label="Configuración">${icon('gear')}</button></div>
      <nav class="nav-rail">
        <button class="rail-item"><span class="rail-icon">${railIcon('recent')}</span><span>Lugares<br>Recientes</span></button>
        <button class="rail-item"><span class="rail-icon">${railIcon('favorite')}</span><span>Mis Favoritos</span></button>
        <button id="railNavigator" class="rail-item ${state.navExpanded?'active':''}" onclick="enterNavigator()"><span class="rail-icon">${railIcon('navigator')}</span><span>Navegador</span></button>
        <button class="rail-item" onclick="showClassic()"><span class="rail-icon">${railIcon('classic')}</span><span>Inicio Clásico</span></button>
      </nav>
      <div class="nav-content">${state.navExpanded?navContent():''}</div>
    </aside>
  </div>`;
}

function navRow(id, label, onclick='', hasChevron=true, current=false){
  return `<li ${id?`id="${id}"`:''} class="nav-row ${current?'current':''}" ${onclick?`onclick="${onclick}"`:''}>
    <span>${label}</span>${hasChevron?icon('chevron','chev'):''}
  </li>`;
}

function navContent(){
  if(state.navLevel==='root'){
    return `<ul class="nav-list">
      ${navRow('navAutoservicio','Autoservicio','openAutoService()')}
      ${navRow('', 'Registros e Inscripciones')}
      ${navRow('', 'Localización Interna UPSJB')}
      ${navRow('', 'Encuesta')}
      ${navRow('', 'Mis Preferencias')}
      ${navRow('', 'Mi Perfil de Sistema')}
    </ul>`;
  }
  if(state.navLevel==='autoservicio'){
    return `<div class="nav-breadcrumb"><button class="back-btn" onclick="state.navLevel='root';render()">${icon('arrowLeft')}</button><span>Autoservicio</span><button class="nav-home-mini" onclick="state.navLevel='root';render()">${icon('home')}</button></div>
      <ul class="nav-list">
        ${navRow('', 'Búsqueda Clases/Expl Catálogo')}
        ${navRow('', 'Planificación Académica')}
        ${navRow('', 'Inscripciones')}
        ${navRow('', 'Finanzas del Campus')}
        ${navRow('', 'Datos Personales en Campus')}
        ${navRow('', 'Registros Académicos')}
        ${navRow('navProgreso','Progreso Académico/Graduación','openProgress()',true,true)}
        ${navRow('', 'Convalidaciones')}
        ${navRow('', 'Admisión de Alumnos')}
        ${navRow('', 'Actividades de Doctorado')}
        ${navRow('', 'Inscripción en Programas')}
        ${navRow('', 'Centro de Notificaciones')}
      </ul>`;
  }
  return `<div class="nav-breadcrumb"><button class="back-btn" onclick="state.navLevel='autoservicio';render()">${icon('arrowLeft')}</button><span>Progreso Académico/Graduación</span><button class="nav-home-mini" onclick="state.navLevel='root';render()">${icon('home')}</button></div>
    <ul class="nav-list">
      ${navRow('navInicioMatricula','Inicio Proceso Matrícula','openEnrollmentHome()',false,true)}
      ${navRow('', 'Mis Condiciones Académicas','showConditions()',false)}
      ${navRow('', 'Consulta Informe Progreso Acad','',false)}
      ${navRow('', 'Consulta Informe de Simulación','',false)}
      ${navRow('', 'Solicitudes de Graduación','',false)}
      ${navRow('', 'Solicitud de Graduación','',false)}
      ${navRow('', 'Consulta Estado de Graduación','',false)}
    </ul>`;
}

function leftMenu(active='inicio'){
  const link = (key,label)=>`<a class="tree-link ${active===key?'active':''}" href="javascript:void(0)" ${key==='inicio'?`onclick="openEnrollmentHome()"`:key==='cond'?`onclick="showConditions()"`:''}>${label}</a>`;
  return `<aside class="left-menu">
    <div class="menu-head">Menú <span class="menu-collapse">−</span></div>
    <div class="menu-search"><b>Buscar:</b><div><input><button>»</button></div></div>
    <div class="tree-section">
      <div class="tree-title">▼ Autoservicio</div>
      <div class="tree-child">▸ Búsqueda Clases/Expl Catálogo</div>
      <div class="tree-child">▸ Planificación Académica</div>
      <div class="tree-child">▸ Inscripciones</div>
      <div class="tree-child">▸ Finanzas del Campus</div>
      <div class="tree-child">▸ Datos Personales en Campus</div>
      <div class="tree-child">▸ Registros Académicos</div>
      <div class="tree-title tree-indent">▼ Progreso Académico/Graduación</div>
      ${link('inicio','Inicio Proceso Matrícula')}
      ${link('cond','Mis Condiciones Académicas')}
      <a class="tree-link" href="javascript:void(0)">Consulta Informe Progreso Acad</a>
      <a class="tree-link" href="javascript:void(0)">Consulta Informe de Simulación</a>
      <a class="tree-link" href="javascript:void(0)">Solicitudes de Graduación</a>
      <a class="tree-link" href="javascript:void(0)">Solicitud de Graduación</a>
      <a class="tree-link" href="javascript:void(0)">Consulta Estado de Graduación</a>
    </div>
    ${['Convalidaciones','Admisión de Alumnos','Actividades de Doctorado','Inscripción en Programas','Centro de Notificaciones','Registros e Inscripciones','Localización Interna UPSJB','Encuesta','Mis Preferencias','Mi Perfil de Sistema'].map(x=>`<div class="tree-title">▸ ${x}</div>`).join('')}
  </aside>`;
}

function classicHeader(title='Mis Condiciones Académicas'){
  return `<header class="classic-topbar">
    <button class="classic-back" onclick="goDashboard()">‹ Alumnos</button>
    <div class="classic-title">${title}</div>
    ${topActions(false)}
  </header>`;
}

function classicFrame(content, title='Mis Condiciones Académicas', active='inicio'){
  return `<div class="classic-shell">
    ${classicHeader(title)}
    <div class="classic-layout">${leftMenu(active)}<main class="classic-main">${content}</main></div>
    ${navigatorDrawer()}
    ${assistantWidget()}
  </div>`;
}

function studentTabs(active='data'){
  const tab = (id,label)=>`<button ${id==='enroll'?'id="enrollTab"':''} class="tab ${active===id?'active':''}" ${id==='enroll'?`onclick="openEnrollStep()"`:''}>${label}</button>`;
  return `<div class="student-line"><span>${STUDENT.code}</span><span>${STUDENT.name}</span></div>
    <div class="tabbar">${tab('search','Búsqueda')}${tab('plan','Plan')}${tab('enroll','Inscribir')}${tab('data','Mis Datos Acad')}</div>`;
}

function conditionsPage(){
  return classicFrame(`${studentTabs('data')}
    <h1 class="section-title compact-title">Mis Condiciones Académicas</h1>
    <p class="last-run"><b>Fecha Última Ejecución Informe</b> &nbsp;&nbsp;30/08/2026&nbsp;&nbsp;11:59AM</p>
    <p>Aquí encontrarás la lista de cursos programados para matricularte. Haz clic en “Cursos Disponibles”.</p>
    <button id="coursesBtn" class="action-button primary small-action" onclick="showCourses()">Cursos Disponibles</button>
    ${statusLegend()}
  `, 'Mis Condiciones Académicas', 'inicio');
}

function statusLegend(){
  return `<div class="academic-legend">
    <span class="legend-item"><span class="status-check">✓</span>Realizado</span>
    <span class="legend-item"><span class="status-diamond"></span>Inscrito</span>
    <span class="legend-item"><span class="status-star">★</span>Planificado</span>
  </div>`;
}

function statusMark(status){
  if(status==='planned') return `<span class="status-star" title="Planificado">★</span>`;
  if(status==='enrolled') return `<span class="status-diamond" title="Inscrito"></span>`;
  if(status==='done') return `<span class="status-check" title="Realizado">✓</span>`;
  if(status==='failed') return `<span class="status-empty" title="Sin estado"></span>`;
  return `<span class="status-empty" title="No inscrito"></span>`;
}

function coursesPage(){
  const grouped = {
    '01': courses.filter(c=>c.cycle==='01'),
    '02': courses.filter(c=>c.cycle==='02'),
    '03': courses.filter(c=>c.cycle==='03')
  };
  let success='';
  if(state.justEnrolled==='repeats'){
    success=`<div class="enrolled-banner">✓ Regularización completada. Los dos cursos desaprobados ya están inscritos con rombo. Ahora puedes continuar con <b>${targetCourse().name}</b>.</div>`;
  } else if(state.justEnrolled==='target'){
    success=`<div class="enrolled-banner">✓ Inscripción realizada correctamente. <b>${targetCourse().name}</b> ahora aparece con el rombo de Inscrito.</div>`;
  }
  const regularizationNote = '';
  return classicFrame(`${studentTabs('data')}
    <h1 class="section-title compact-title">Mis Condiciones Académicas</h1>
    <button class="action-button small-action" onclick="showCourses()">Cursos Disponibles</button>
    ${statusLegend()}
    ${success}
    ${regularizationNote}
    <div class="plan-box"><div class="plan-head">PLAN DE ESTUDIO 20201</div>
      ${cycleBlock('CICLO 01 PLAN DE ESTUDIO 20201',grouped['01'])}
      ${cycleBlock('CICLO 02 PLAN DE ESTUDIO 20201',grouped['02'])}
      ${cycleBlock('CICLO 03 PLAN DE ESTUDIO 20201',grouped['03'])}
    </div>
  `, 'Mis Condiciones Académicas', 'inicio');
}

function cycleBlock(title,items){
  return `<section class="cycle"><div class="cycle-head">▼ ${title}</div>
    <div class="table-tools">Personalizar | Ver Todo | <span>▧</span>&nbsp;&nbsp;&nbsp; Primero ◀ &nbsp;1-${items.length} de ${items.length}&nbsp; ▶ Último</div>
    <table class="course-table"><thead><tr><th>Curso</th><th>Descripción</th><th>Unidades</th><th>Cuándo</th><th>Calif</th><th>Estado</th></tr></thead><tbody>
    ${items.map(c=>{
      const cid=c.id===TARGET_ID?'courseTarget':`course_${safeId(c.id)}`;
      const classes=[c.id===TARGET_ID?'target-row':''].filter(Boolean).join(' ');
      const note='';
      return `<tr class="${classes}"><td>${c.id}</td><td><span id="${cid}" class="course-link" onclick="openCourse('${c.id}')">${c.name}</span>${note}</td><td>${c.credits.toFixed(2)}</td><td>${c.status==='enrolled'?STUDENT.term:''}</td><td>${c.grade||''}</td><td class="status-cell">${statusMark(c.status)}</td></tr>`;
    }).join('')}
    </tbody></table></section>`;
}

function courseModal(){
  const c=state.selectedCourse || targetCourse();
  const isPlanned = c.status==='planned';
  const isClosedState = c.status==='done' || c.status==='enrolled';
  const blockedTarget = false;
  const theory = state.selectedSection;
  const practical = state.selectedPractical;
  const scheduleSummary = (theory || practical) ? `<div class="selected-schedule">
      <div class="selected-schedule-title">Horarios seleccionados ✓</div>
      ${theory?`<div><b>Teoría:</b> ${theory.id} · ${theory.day} ${theory.start} - ${theory.end} · ${theory.room} · ${theory.teacher}</div>`:''}
      ${practical?`<div><b>Práctica:</b> ${practical.id} · ${practical.day} ${practical.start} - ${practical.end} · ${practical.room} · ${practical.teacher}</div>`:'<div><b>Práctica:</b> pendiente de seleccionar</div>'}
    </div>` : `<div class="schedule-required">Selecciona primero la clase teórica y luego la clase práctica.</div>`;
  const repeatNotice = '';
  return `<div class="modal-overlay"><div class="modal-card course-detail-card">
    <div class="modal-head">Detalles de Oferta de Curso <button class="close-x" onclick="backFromCourse()">×</button></div>
    <div class="modal-body">${studentTabs('data')}
      <h2 class="section-title compact-title">Mis Condiciones Académicas</h2>
      <h2 class="detail-title">Detalle Curso</h2>
      <a id="backConditionsLink" class="back-link" href="javascript:void(0)" onclick="backFromCourse()">Volver a Mis Condiciones Académicas</a>
      <div class="detail-name">${c.id} - ${c.name}</div>
      ${repeatNotice}
      <div class="detail-grid no-callout">
        <div class="info-block"><div class="info-head">Detalle Curso</div><div class="detail-text">
          <div class="k">Grado</div><div>PREGRADO</div>
          <div class="k">Unidades</div><div>${c.credits.toFixed(2)}</div>
          <div class="k">Sistema Calif</div><div>Calificado</div>
          <div class="k">Componentes Curso</div><div>CLASE PRÁCTICA &nbsp; Obligatoria<br>CLASE TEÓRICA &nbsp; Obligatoria</div>
          <div class="k">Grupo Académico</div><div>INGENIERÍA Y TECNOLOGÍA</div>
          <div class="k">Organización Académica</div><div>EP. INGENIERÍA DE SISTEMAS</div>
        </div></div>
        <div class="detail-actions clean-actions">
          ${blockedTarget?`<div class="schedule-required blocked-course-note"><b>Matrícula condicionada.</b><br>Antes de seleccionar horarios para este curso debes inscribirte en las asignaturas desaprobadas de ciclos inferiores.</div>`:scheduleSummary}
          <button id="viewSectionsBtn" class="action-button" ${isClosedState?'disabled':''} onclick="showSections()">${theory?'Cambiar Teoría / Horario':'Ver Secciones Clase'}</button>
          ${theory && !practical && !blockedTarget?`<button id="selectPracticalBtn" class="action-button" onclick="showPracticals()">Seleccionar Clase Práctica</button>`:''}
          <button id="addPlannerBtn" class="action-button primary" ${isPlanned || isClosedState || blockedTarget || !theory || !practical?'disabled':''} onclick="planSelectedCourse()">${isPlanned?'Añadido al Planificador ✓':blockedTarget?'Regulariza primero los cursos desaprobados':(theory&&practical)?'Añadir a Planificador':'Selecciona teoría y práctica primero'}</button>
        </div>
      </div>
    </div></div></div>`;
}

function prerequisiteWarning(){
  const pending=pendingFailedCourses();
  if(!pending.length) return '';
  return `<div class="prereq-warning">
    <div class="prereq-warning-title">⚠ Antes de inscribir este curso debes regularizar cursos de ciclos inferiores.</div>
    <div>Estos cursos aparecen sin nota y sin símbolo porque están pendientes del ciclo anterior. Primero debes <b>planificarlos e inscribirlos</b>:</div>
    <ul>${pending.map(c=>`<li><b>${c.id}</b> · ${c.name} ${c.status==='planned'?'<span class="mini-planned">★ Planificado</span>':'<span class="mini-pending">Pendiente</span>'}</li>`).join('')}</ul>
    <div>Tu curso actual puede quedarse en el Planificador. Cuando estos cursos queden inscritos con rombo ◆, podrás inscribirlo.</div>
  </div>`;
}

function sectionsModal(){
  const c=state.selectedCourse || targetCourse();
  const blockedTarget = false;
  return `<div class="modal-overlay"><div class="modal-card sections-card">
    <div class="modal-head">Detalles de Oferta de Curso <button class="close-x" onclick="openCourse('${c.id}')">×</button></div>
    <div class="modal-body sections-body">
      <div class="availability-legend modal-availability"><span><i class="seat open"></i>Abierta</span><span><i class="seat closed"></i>Cerrada</span></div>
      <p class="detail-name"><b>${c.id} · CLASE TEÓRICA · secciones para ${STUDENT.term}</b></p>
      <p class="section-instruction">Primero selecciona una sección teórica abierta. Después elegirás la clase práctica obligatoria.</p>
      ${state.requirementsUploaded===false?`<div class="requirements-warning"><b>Validación de requisitos pendiente.</b> Las secciones abiertas se muestran para consulta, pero la opción “Selección” permanecerá oculta hasta que tus requisitos estén cargados en el Intranet.</div>`:''}
      ${sections.map((s,i)=>`<div class="section-block"><div class="section-row ${state.selectedSection && state.selectedSection.id===s.id?'selected':''}"><table class="section-table"><thead><tr><th>Sección</th><th>Campus</th><th>Ubicación</th><th>Estado</th><th></th></tr></thead><tbody><tr><td>${s.id}<br>(${s.classNo})</td><td>${s.campus}</td><td>${s.room}</td><td class="state-cell">${s.open?'<i class="seat open"></i>':'<i class="seat closed"></i>'}</td><td>${s.open?(state.requirementsUploaded?`<button ${i===0?'id="sectionSelect2101"':''} class="section-select-btn" onclick="selectSection('${s.id}')">${state.selectedSection && state.selectedSection.id===s.id?'Seleccionado ✓':'Selección'}</button>`:''):'<span class="closed-label">Cerrada</span>'}</td></tr></tbody></table>
      <table class="detail-subtable"><thead><tr><th>Días</th><th>Inicio</th><th>Fin</th><th>Aula</th><th>Profesor</th><th>Fechas</th></tr></thead><tbody><tr><td>${s.day}</td><td>${s.start}</td><td>${s.end}</td><td>${s.room}</td><td>${s.teacher}</td><td>31/08/2026 - 20/12/2026</td></tr></tbody></table></div></div>`).join('')}
      <a class="back-link" href="javascript:void(0)" onclick="openCourse('${c.id}')">Volver al detalle del curso</a>
    </div></div></div>`;
}

function practicalModal(){
  const c=state.selectedCourse || targetCourse();
  const theory=state.selectedSection;
  return `<div class="modal-overlay"><div class="modal-card sections-card">
    <div class="modal-head">Carrito Compra de Inscripción <button class="close-x" onclick="openCourse('${c.id}')">×</button></div>
    <div class="modal-body sections-body">
      <h2 class="related-title">Añadir a Carrito - Secciones de Clase Relacionadas</h2>
      <p><b>${STUDENT.term} | ${STUDENT.career} | ${STUDENT.institution}</b></p>
      <p class="detail-name"><b>${c.id} - ${c.name}</b></p>
      <div class="selected-summary"><b>TEORÍA seleccionada</b><span>${theory?`Sección ${theory.id}<br>${theory.day} ${theory.start} - ${theory.end} &nbsp; ${theory.room}<br>${theory.teacher}`:'—'}</span></div>
      <div class="availability-legend modal-availability"><span><i class="seat open"></i>Abierta</span><span><i class="seat closed"></i>Cerrada</span></div>
      <div class="info-head related-head">Selección Sección CLASE PRÁCTICA (Obligatoria)</div>
      <table class="related-table"><thead><tr><th></th><th>N° Clase</th><th>Sección</th><th>Horario</th><th>Aula</th><th>Instructor</th><th>Estado</th></tr></thead><tbody>
      ${practicalSections.map((p,i)=>`<tr ${i===0?'id="practicalSelect3101"':''} class="${state.selectedPractical && state.selectedPractical.id===p.id?'chosen':''} ${p.open?'selectable-practical':''}" ${p.open?`onclick="selectPractical('${p.id}')"`:''}><td><input class="radio-big" type="radio" name="practical" ${state.selectedPractical && state.selectedPractical.id===p.id?'checked':''} ${p.open?'': 'disabled'} onclick="event.stopPropagation();selectPractical('${p.id}')"></td><td>${p.classNo}</td><td>${p.id}</td><td>${p.day} ${p.start} - ${p.end}</td><td>${p.room}</td><td>${p.teacher}</td><td>${p.open?'<i class="seat open"></i>':'<i class="seat closed"></i>'}</td></tr>`).join('')}
      </tbody></table>
      <div class="footer-actions"><button class="action-button" onclick="showSections()">Atrás</button><button id="practicalNextBtn" class="action-button primary" ${state.selectedPractical?'':'disabled'} onclick="confirmPractical()">Sig</button></div>
    </div></div></div>`;
}

function enrollBlockedPage(){
  const unplanned=failedUnplannedCourses();
  const planned=failedPlannedCourses();
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><b>Añadir</b><span>|</span><span>Baja</span><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <h1 class="section-title compact-title">Inscribir Clases</h1>
    <section class="enrollment-panel enroll-confirm-panel">
      <h2>Inscripción condicionada</h2>
      ${prerequisiteWarning()}
      <div class="regularization-cards">
        ${failedCourses().map(c=>`<div class="regularization-card ${c.status}"><div><b>${c.id}</b><br>${c.name}</div><div>${c.status==='planned'?'<span class="status-star">★</span> Planificado':c.status==='enrolled'?'<span class="status-diamond"></span> Inscrito':'Pendiente'}</div></div>`).join('')}
      </div>
      ${planned.length?`<p><b>${planned.length}</b> de ${FAILED_IDS.length} curso${FAILED_IDS.length===1?'':'s'} pendiente${FAILED_IDS.length===1?'':'s'} ya está${planned.length===1?'':'n'} en el Planificador.</p>`:''}
      <div class="footer-actions"><button id="regularizeBtn" class="action-button primary" onclick="showCourses()">Volver a Mis Condiciones Académicas</button></div>
    </section>
  `, 'Introducción de Clase', 'inicio');
}

function enrollPage(){
  const pendingRepeats=pendingFailedCourses();
  const regularizationMode = state.scenario==='failed' && pendingRepeats.length>0;
  const planned = regularizationMode
    ? state.planner.filter(c=>c.status==='planned' && c.repeat)
    : state.planner.filter(c=>c.status==='planned' && !c.repeat);
  const rows = planned.map(c=>{
    const sch=state.schedules[c.id]||{};
    const sec=sch.theory, practical=sch.practical;
    return `<tr><td>${c.id}</td><td>${c.name}</td><td>${sec?`${sec.day} ${sec.start} - ${sec.end} · ${sec.room}`:'—'}</td><td>${practical?`${practical.day} ${practical.start} - ${practical.end} · ${practical.room}`:'—'}</td><td>${c.credits.toFixed(2)}</td><td><span class="status-star">★</span> Planificado</td></tr>`;
  }).join('');
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><b>Añadir</b><span>|</span><span>Baja</span><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <div class="page-heading-row"><h1 class="section-title compact-title">Inscribir Clases</h1><div class="step-indicator"><span class="step">1</span><span class="step active">2</span><span class="step">3</span></div></div>
    <section class="enrollment-panel enroll-confirm-panel">
      <h2>2. Confirmación de clases</h2>
      <p>${regularizationMode?'Confirma primero la inscripción de los cursos pendientes de ciclos inferiores. El curso de ciclo superior que ya planificaste permanecerá en tu Planificador.':'El curso está en tu Planificador. Confirma la inscripción para registrarlo en el ciclo '+STUDENT.term+'.'}</p>
      <p class="term-line"><b>${STUDENT.term} | ${STUDENT.career} | ${STUDENT.institution}</b></p>
      <div class="mini-box"><table class="course-table"><thead><tr><th>Curso</th><th>Descripción</th><th>Teoría</th><th>Práctica</th><th>Unidades</th><th>Estado actual</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="footer-actions"><button class="action-button" onclick="showCourses()">Anterior</button><button id="enrollConfirmBtn" class="action-button primary" onclick="finishEnrollment()">Inscribir</button></div>
    </section>
  `, 'Introducción de Clase', 'inicio');
}

function gamePanel(){ return ''; }

function render(){
  clearHighlights();
  switch(state.screen){
    case 'dashboard': app.innerHTML=dashboard(); break;
    case 'conditions': app.innerHTML=conditionsPage(); break;
    case 'courses': app.innerHTML=coursesPage(); break;
    case 'course': app.innerHTML=coursesPage()+courseModal(); break;
    case 'sections': app.innerHTML=coursesPage()+sectionsModal(); break;
    case 'practical': app.innerHTML=coursesPage()+practicalModal(); break;
    case 'enrollBlocked': app.innerHTML=enrollBlockedPage(); break;
    case 'enroll': app.innerHTML=enrollPage(); break;
    default: app.innerHTML=dashboard();
  }
  setTimeout(applyGuide,40);
}

function clearHighlights(){
  document.querySelectorAll('.highlight-target').forEach(x=>x.classList.remove('highlight-target'));
}

function nextGuideTarget(){
  if(!state.guided) return null;
  if(state.screen==='dashboard'){
    if(!state.scenario || state.requirementsUploaded===null) return null;
    if(!state.navOpen) return 'compassBtn';
  }
  if(state.navOpen){
    if(!state.navExpanded) return 'railNavigator';
    if(state.navLevel==='root') return 'navAutoservicio';
    if(state.navLevel==='autoservicio') return 'navProgreso';
    if(state.navLevel==='progress') return 'navInicioMatricula';
  }
  if(state.screen==='conditions') return 'coursesBtn';
  if(state.screen==='courses'){
    if(state.scenario==='failed' && !regularizationComplete()){
      if(targetCourse().status==='none') return 'courseTarget';
      if(targetCourse().status==='planned' && !state.attemptedTargetBlocked) return 'enrollTab';
      const nextFailed=failedUnplannedCourses()[0];
      if(nextFailed) return `course_${safeId(nextFailed.id)}`;
      return 'enrollTab';
    }
    if(targetCourse()?.status==='none') return 'courseTarget';
    if(targetCourse()?.status==='planned') return 'enrollTab';
    return null;
  }
  if(state.screen==='course'){
    const c=state.selectedCourse;
    if(!c) return null;
    if(c.status==='planned') return 'backConditionsLink';
    if(!state.selectedSection) return 'viewSectionsBtn';
    if(state.selectedSection && !state.selectedPractical) return 'selectPracticalBtn';
    if(state.selectedSection && state.selectedPractical) return 'addPlannerBtn';
  }
  if(state.screen==='sections') return state.requirementsUploaded?'sectionSelect2101':null;
  if(state.screen==='practical') return state.selectedPractical?'practicalNextBtn':'practicalSelect3101';
  if(state.screen==='enrollBlocked') return 'regularizeBtn';
  if(state.screen==='enroll') return 'enrollConfirmBtn';
  return null;
}

function applyGuide(){
  const targetId=nextGuideTarget();
  if(!targetId) return;
  const target=document.getElementById(targetId);
  if(!target || target.disabled) return;
  target.classList.add('highlight-target');
  target.scrollIntoView?.({behavior:'smooth',block:'nearest',inline:'nearest'});
}

function openNavigator(){
  if(!state.scenario || state.requirementsUploaded===null){ toast('Responde primero las dos preguntas de David para iniciar el recorrido'); return; }
  clearAssistantNotice();
  state.navOpen=true; state.navExpanded=false; state.navLevel='root'; render();
}
function closeNavigator(e){ if(e.target===e.currentTarget){ state.navOpen=false; state.navExpanded=false; render(); } }
function enterNavigator(){ clearAssistantNotice(); state.navExpanded=true; state.navLevel='root'; render(); }
function openAutoService(){ clearAssistantNotice(); state.navExpanded=true; state.navLevel='autoservicio'; render(); }
function openProgress(){ clearAssistantNotice(); state.navLevel='progress'; render(); }
function openEnrollmentHome(){ clearAssistantNotice(); if(!state.scenario || state.requirementsUploaded===null){ state.screen='dashboard'; state.navOpen=false; state.navExpanded=false; render(); return; } state.navOpen=false; state.navExpanded=false; state.screen='conditions'; render(); }
function showConditions(){ clearAssistantNotice(); if(!state.scenario || state.requirementsUploaded===null){ state.screen='dashboard'; state.navOpen=false; state.navExpanded=false; render(); return; } state.navOpen=false; state.navExpanded=false; state.screen='conditions'; render(); }
function showClassic(){ clearAssistantNotice(); state.navOpen=false; state.navExpanded=false; state.screen='conditions'; render(); }
function goDashboard(){ clearAssistantNotice(); state.screen='dashboard'; state.navOpen=false; state.navExpanded=false; state.navLevel='root'; render(); }
function showCourses(){ clearAssistantNotice(); state.screen='courses'; render(); }

function openCourse(id){
  clearAssistantNotice();
  state.justEnrolled=null;
  const c=courses.find(x=>x.id===id);
  if(!c) return;
  state.selectedCourse=c;
  const saved=state.schedules[id];
  state.selectedSection=saved?.theory?{...saved.theory}:null;
  state.selectedPractical=saved?.practical?{...saved.practical}:null;
  state.screen='course'; render();
}

function planSelectedCourse(){
  clearAssistantNotice();
  const c=state.selectedCourse || targetCourse();
  if(c.status==='done' || c.status==='enrolled'){
    toast('Este curso ya no requiere planificación'); return;
  }
  if(!state.selectedSection){ toast('Primero selecciona una clase teórica'); return; }
  if(!state.selectedPractical){ toast('Ahora selecciona la clase práctica obligatoria'); return; }
  c.status='planned';
  state.schedules[c.id]={theory:{...state.selectedSection},practical:{...state.selectedPractical}};
  if(!plannerHas(c.id)) state.planner.push(c);
  toast(`${c.name} añadido al Planificador ★`);
  state.screen='course'; render();
}

function backFromCourse(){ clearAssistantNotice(); state.screen='courses'; render(); }
function backToConditionsAfterPlan(){ backFromCourse(); }

function showSections(){
  clearAssistantNotice();
  const c=state.selectedCourse || targetCourse();
  if(c.status==='done' || c.status==='enrolled') return;
  state.screen='sections'; render();
}

function selectSection(id){
  clearAssistantNotice();
  if(state.requirementsUploaded!==true){ toast('No puedes seleccionar una sección: primero debes subir tus requisitos al Intranet'); return; }
  const c=state.selectedCourse || targetCourse();
  const sec=sections.find(s=>s.id===id);
  if(!sec || !sec.open){ toast('Esta sección está cerrada'); return; }
  state.selectedSection={...sec};
  state.selectedPractical=null;
  toast(`Teoría seleccionada: ${sec.day} ${sec.start} - ${sec.end}`);
  state.screen='practical'; render();
}

function showPracticals(){
  clearAssistantNotice();
  if(state.requirementsUploaded!==true){ toast('Primero debes subir tus requisitos al Intranet para seleccionar horarios'); return; }
  if(!state.selectedSection){ toast('Primero selecciona la clase teórica'); return; }
  state.screen='practical'; render();
}

function selectPractical(id){
  clearAssistantNotice();
  const p=practicalSections.find(x=>x.id===id);
  if(!p || !p.open){ toast('Esta clase práctica está cerrada'); return; }
  state.selectedPractical={...p}; render();
}

function confirmPractical(){
  clearAssistantNotice();
  if(!state.selectedPractical){ toast('Selecciona una clase práctica'); return; }
  state.screen='course'; render();
}

function openEnrollStep(){
  clearAssistantNotice();
  if(state.requirementsUploaded!==true){ toast('La inscripción no está disponible hasta que tus requisitos estén cargados en el Intranet'); return; }
  if(state.scenario==='failed' && pendingFailedCourses().length){
    // El curso superior sí puede estar planificado. La restricción se aplica recién al inscribir.
    if(targetCourse()?.status==='planned') state.attemptedTargetBlocked=true;
    const unplanned=failedUnplannedCourses();
    if(unplanned.length){
      state.screen='enrollBlocked'; render();
      return;
    }
    // Los dos cursos pendientes ya están planificados: se inscriben primero.
    state.screen='enroll'; render();
    return;
  }
  if(!targetCourse() || targetCourse().status!=='planned' || !plannerHas(TARGET_ID)){
    toast('Primero selecciona horarios y añade el curso al Planificador'); return;
  }
  state.screen='enroll'; render();
}

function finishEnrollment(){
  clearAssistantNotice();
  if(state.requirementsUploaded!==true){ toast('Primero debes subir tus requisitos al Intranet'); return; }
  if(state.scenario==='failed' && pendingFailedCourses().length){
    const unplanned=failedUnplannedCourses();
    if(unplanned.length){ state.screen='enrollBlocked'; render(); return; }
    const repeatBatch=state.planner.filter(c=>c.status==='planned' && c.repeat);
    if(repeatBatch.length!==FAILED_IDS.length){ state.screen='enrollBlocked'; render(); return; }
    repeatBatch.forEach(c=>{ c.status='enrolled'; });
    state.planner=state.planner.filter(c=>!c.repeat);
    state.selectedCourse=null; state.selectedSection=null; state.selectedPractical=null;
    state.justEnrolled='repeats';
    state.screen='courses'; render();
    toast('Cursos pendientes inscritos ◆ · ya puedes inscribir el curso planificado');
    return;
  }

  const target=targetCourse();
  if(!target || target.status!=='planned' || !plannerHas(TARGET_ID)){
    toast('No hay un curso listo para inscribir'); return;
  }
  target.status='enrolled';
  state.planner=state.planner.filter(c=>c.id!==TARGET_ID);
  state.selectedCourse=null; state.selectedSection=null; state.selectedPractical=null;
  state.justEnrolled='target';
  state.screen='courses'; render();
  toast('Inscripción completada ◆');
}

function toggleGuide(){ state.guided=!state.guided; render(); }

window.addEventListener('resize',()=>setTimeout(applyGuide,50));
render();
