const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

function currentAcademicTerm(date=new Date()){
  const year=date.getFullYear();
  // Enero-junio = periodo 1 / julio-diciembre = periodo 2.
  const period=date.getMonth()<6 ? 1 : 2;
  return `${year}-${period}`;
}
function academicTermDates(date=new Date()){
  const year=date.getFullYear();
  const period=date.getMonth()<6 ? 1 : 2;
  return period===1
    ? `01/03/${year} - 30/06/${year}`
    : `01/08/${year} - 20/12/${year}`;
}
function currentRunStamp(date=new Date()){
  const dd=String(date.getDate()).padStart(2,'0');
  const mm=String(date.getMonth()+1).padStart(2,'0');
  const yyyy=date.getFullYear();
  const hh=String(date.getHours()).padStart(2,'0');
  const min=String(date.getMinutes()).padStart(2,'0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

const STUDENT = {
  code: '181140418U',
  name: 'DAVID CRUZ FELIPA',
  institution: 'UNIV. PRIV. SAN JUAN BAUTISTA',
  career: 'PREGRADO',
  program: 'INGENIERÍA DE SISTEMAS',
  get term(){ return currentAcademicTerm(); }
};

const TARGET_ID = 'M_R_SIS2202020101';
const FAILED_IDS = ['M_R_SIS2201010301','M_R_SIS2201010601'];
const MIXED_COURSE_ID = 'M_R_SIS2202040101';
const PREREQ_TARGET_ID = 'M_R_SIS2202030101';
const MIXED_BASE_ID = 'M_R_SIS2202020401';

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
  {id:'M_R_SIS2202020401', name:'BASES DE DATOS I', credits:4, cycle:'02', status:'none', previouslyFailed:true},
  {id:'M_R_SIS2202030101', name:'ESTRUCTURAS DE DATOS Y ALGORITMOS', credits:4, cycle:'03', status:'none', prereqId:TARGET_ID},
  {id:'M_R_SIS2202030201', name:'REDES DE COMPUTADORAS I', credits:4, cycle:'03', status:'none'},
  {id:MIXED_COURSE_ID, name:'INGENIERÍA DE SOFTWARE I', credits:4, cycle:'04', status:'none', mixedExample:true}
];
function buildCoursesForScenario(scenario){
  let base=initialCourses.map(c=>({...c}));
  if(scenario==='clean') return base.filter(c=>!c.repeat && !c.mixedExample);
  if(scenario==='mixed'){
    // En el caso de ciclos mezclados el alumno debe escoger primero el curso
    // del ciclo inferior. No lo preinscribimos: se planifica antes de pasar
    // al curso de cuarto ciclo para poder detectar cruces reales de horario.
    base=base.filter(c=>!c.repeat);
    const lower=base.find(c=>c.id===MIXED_BASE_ID);
    if(lower) lower.status='none';
    return base;
  }
  if(scenario==='change'){
    // Caso especial: el alumno ya está inscrito y quiere cambiar de turno.
    // Mostramos algunos cursos como inscritos; BASES DE DATOS I simula un
    // curso que el alumno jaló anteriormente y que ahora está repitiendo.
    base=base.filter(c=>!c.repeat && !c.mixedExample);
    const enrolledIds=[TARGET_ID, MIXED_BASE_ID, 'M_R_SIS2202030201'];
    base.forEach(c=>{ c.status=enrolledIds.includes(c.id)?'enrolled':(c.status==='done'?'done':'none'); });
    return base;
  }
  return base.filter(c=>!c.mixedExample);
}
let courses = buildCoursesForScenario('failed');

const sections = [
  {id:'0001-TEO', classNo:'2101', campus:'FILIAL ICA', room:'LAB. CÓMPUTO B-201', day:'Lun', start:'7:00PM', end:'8:30PM', teacher:'CARLOS RAMÍREZ', open:true, modality:'PRESENCIAL'},
  {id:'0002-TEO', classNo:'2102', campus:'FILIAL ICA', room:'LAB. CÓMPUTO B-204', day:'Mié', start:'5:30PM', end:'7:00PM', teacher:'ANA TORRES', open:true, modality:'PRESENCIAL'},
  {id:'0003-TEO', classNo:'2103', campus:'FILIAL ICA', room:'AULA B-207', day:'Sáb', start:'9:00AM', end:'10:30AM', teacher:'LUIS PAREDES', open:false, modality:'PRESENCIAL'}
];

const practicalSections = [
  {id:'0001-PRA', classNo:'3101', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-101', day:'Mar', start:'7:00PM', end:'8:30PM', teacher:'MARIO VEGA', open:true},
  {id:'0002-PRA', classNo:'3102', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-103', day:'Jue', start:'5:30PM', end:'7:00PM', teacher:'SOFÍA NÚÑEZ', open:true},
  {id:'0003-PRA', classNo:'3103', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-105', day:'Sáb', start:'10:45AM', end:'12:15PM', teacher:'DIEGO LEÓN', open:false}
];

const mixedTheorySections = [
  {id:'ISW-P01', classNo:'4101', campus:'FILIAL ICA', room:'AULA B-202', day:'Lun', start:'7:00PM', end:'8:30PM', teacher:'CARLOS RUIZ', open:true, modality:'PRESENCIAL'},
  {id:'ISW-V01', classNo:'4102', campus:'SEDE LIMA NORTE', room:'AULA VIRTUAL', day:'Lun', start:'7:00PM', end:'8:30PM', teacher:'ANA VEGA', open:true, modality:'VIRTUAL'},
  {id:'ISW-V02', classNo:'4103', campus:'SEDE CHINCHA', room:'AULA VIRTUAL', day:'Mar', start:'8:00PM', end:'9:30PM', teacher:'LUIS RÍOS', open:true, modality:'VIRTUAL'},
  {id:'ISW-V03', classNo:'4104', campus:'SEDE LIMA SUR', room:'AULA VIRTUAL', day:'Jue', start:'6:00PM', end:'7:30PM', teacher:'PAOLA MORA', open:true, modality:'VIRTUAL'}
];
const mixedPracticalSections = [
  {id:'ISW-PRA1', classNo:'5101', campus:'SEDE CHINCHA', room:'LAB. VIRTUAL 01', day:'Jue', start:'8:00PM', end:'9:30PM', teacher:'MARIO SOLÍS', open:true},
  {id:'ISW-PRA2', classNo:'5102', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-106', day:'Sáb', start:'11:00AM', end:'12:30PM', teacher:'SOFÍA LEÓN', open:true}
];
const failedClosedTheorySections = [
  {id:'REG-C01', classNo:'6101', campus:'FILIAL ICA', room:'LAB. CÓMPUTO A-101', day:'Lun', start:'6:00PM', end:'7:30PM', teacher:'JULIO MORA', open:false, modality:'PRESENCIAL'},
  {id:'REG-C02', classNo:'6102', campus:'FILIAL ICA', room:'LAB. CÓMPUTO A-103', day:'Mié', start:'7:30PM', end:'9:00PM', teacher:'PAULA LEÓN', open:false, modality:'PRESENCIAL'},
  {id:'REG-C03', classNo:'6103', campus:'SEDE CHINCHA', room:'AULA VIRTUAL', day:'Sáb', start:'9:00AM', end:'10:30AM', teacher:'MARCO RÍOS', open:false, modality:'VIRTUAL'}
];
const failedClosedPracticalSections = [
  {id:'REG-P01', classNo:'7101', campus:'FILIAL ICA', room:'LAB. CÓMPUTO C-110', day:'Mar', start:'6:00PM', end:'7:30PM', teacher:'ELENA VEGA', open:false},
  {id:'REG-P02', classNo:'7102', campus:'SEDE CHINCHA', room:'LAB. VIRTUAL 02', day:'Jue', start:'7:30PM', end:'9:00PM', teacher:'DARIO CRUZ', open:false}
];
function isFailedClosedCase(course){ return state.scenario==='failed' && state.failedScheduleMode==='closed' && !!course?.repeat; }
function theorySectionsFor(course){
  if(course?.id===MIXED_COURSE_ID) return mixedTheorySections;
  if(isFailedClosedCase(course)) return failedClosedTheorySections;
  return sections;
}
function practicalSectionsFor(course){
  if(course?.id===MIXED_COURSE_ID) return mixedPracticalSections;
  if(isFailedClosedCase(course)) return failedClosedPracticalSections;
  return practicalSections;
}

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
  assistantNotice: null,
  mixedConflictSeen: false,
  mixedVirtualConflictSeen: false,
  blockedCourseId: null,
  enrollmentFilter: null,
  failedScheduleMode: null,
  assistantHidden: false,
  dropSelection: [],
  dropBlockedCourseId: null
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
    chevron: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/></svg>`
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
    requirementsUploaded:null, assistantNotice:null, mixedConflictSeen:false, mixedVirtualConflictSeen:false, blockedCourseId:null, enrollmentFilter:null, failedScheduleMode:null, assistantHidden:false, dropSelection:[], dropBlockedCourseId:null
  });
  render();
}

function chooseScenario(type){
  state.scenario=type;
  courses=buildCoursesForScenario(type);
  const presetSchedules={};
  if(type==='change'){
    // Horarios ya inscritos para practicar Baja / cambio de turno.
    presetSchedules[TARGET_ID]={theory:{...sections[1]},practical:{...practicalSections[1]}};
    presetSchedules[MIXED_BASE_ID]={
      theory:{id:'BD-TEO1',classNo:'4201',campus:'FILIAL ICA',room:'LAB. CÓMPUTO B-202',day:'Mar',start:'6:00PM',end:'7:30PM',teacher:'JOSÉ VEGA',open:true,modality:'PRESENCIAL'},
      practical:{id:'BD-PRA1',classNo:'5201',campus:'FILIAL ICA',room:'LAB. CÓMPUTO B-204',day:'Jue',start:'6:00PM',end:'7:30PM',teacher:'ANA RÍOS',open:true}
    };
    presetSchedules['M_R_SIS2202030201']={
      theory:{id:'RED-TEO1',classNo:'4301',campus:'FILIAL ICA',room:'AULA B-205',day:'Sáb',start:'9:00AM',end:'10:30AM',teacher:'LUIS MORA',open:true,modality:'PRESENCIAL'},
      practical:{id:'RED-PRA1',classNo:'5301',campus:'FILIAL ICA',room:'LAB. REDES C-201',day:'Sáb',start:'10:45AM',end:'12:15PM',teacher:'SOFÍA LEÓN',open:true}
    };
  }
  Object.assign(state,{
    screen:'dashboard', navOpen:false, navExpanded:false, navLevel:'root',
    selectedCourse:null, selectedSection:null, selectedPractical:null,
    planner:[], schedules:presetSchedules, justEnrolled:null, attemptedTargetBlocked:false,
    requirementsUploaded:type==='change'?true:null, assistantNotice:null, mixedConflictSeen:false, mixedVirtualConflictSeen:false,
    blockedCourseId:null, enrollmentFilter:null, failedScheduleMode:type==='failed'?null:'available', assistantHidden:false,
    dropSelection:[], dropBlockedCourseId:null
  });
  render();
}

function chooseFailedScheduleMode(mode){
  state.failedScheduleMode=mode;
  state.assistantNotice=null;
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
      message:'Te voy a enseñar el proceso de tu matrícula. Antes de empezar, elige el caso que quieres practicar. ¿Ya estás inscrito y quieres cambiarte de un curso seleccionado? Usa la opción de cambio de curso.',
      actions:`<button id="scenarioYes" class="assistant-btn warning-choice" onclick="chooseScenario('failed')">Jalé cursos</button><button id="scenarioNo" class="assistant-btn" onclick="chooseScenario('clean')">Aprobé todo</button><button id="scenarioMixed" class="assistant-btn mixed-choice" onclick="chooseScenario('mixed')">Llevo cursos de diferentes ciclos</button><button id="scenarioChange" class="assistant-btn change-choice" onclick="chooseScenario('change')">Ya estoy inscrito · quiero cambiar un curso</button>`
    };
  }
  if(state.screen==='dashboard' && state.scenario==='failed' && state.failedScheduleMode===null){
    return {
      title:'Caso: cursos jalados',
      message:'Ahora elige qué situación quieres practicar con los cursos pendientes de ciclos inferiores:',
      actions:`<button id="failedAvailable" class="assistant-btn" onclick="chooseFailedScheduleMode('available')">Opción 1 · Sí hay horarios disponibles</button><button id="failedClosed" class="assistant-btn warning-choice" onclick="chooseFailedScheduleMode('closed')">Opción 2 · Las clases están cerradas</button>`
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

  if(state.screen==='conditions') return state.scenario==='change' ? {
    title:'David · SAE',
    message:'Como ya estás inscrito y quieres cambiar un curso, entra a la pestaña “Inscribir” y luego selecciona “Baja”. Ahí verás tus cursos inscritos. Si el curso que quieres cambiar de turno es uno que jalaste anteriormente, comunícate con SAE antes de hacer la baja.',
    actions:''
  } : {
    title:'David · SAE',
    message:'Aquí empiezas la matrícula. Pulsa “Cursos Disponibles” para revisar tu malla y los cursos que puedes planificar.',
    actions:''
  };
  if(state.screen==='courses'){
    if(state.scenario==='failed' && !regularizationComplete()){
      if(state.failedScheduleMode==='closed') return {title:'David · SAE',message:'Tienes cursos pendientes de ciclos inferiores. En este ejemplo, sus clases regulares están cerradas. Puedes revisar el curso, pero si no aparece ninguna sección abierta tendrás que comunicarte con tu coordinación para solicitar una matrícula administrativa.',actions:''};
      return {title:'David · SAE',message:'Veo cursos de ciclos inferiores sin nota ni símbolo. Puedes planificar tus cursos, pero al intentar inscribir uno de ciclo superior el sistema te pedirá inscribir primero esos cursos pendientes.',actions:''};
    }
    if(state.scenario==='mixed'){
      const lower=courses.find(c=>c.id===MIXED_BASE_ID);
      const mixed=courses.find(c=>c.id===MIXED_COURSE_ID);
      if(lower && lower.status==='none') return {title:'David · SAE',message:'Cuando llevas cursos de diferentes ciclos, debes comenzar por los cursos del ciclo inferior. Primero selecciona BASES DE DATOS I (ciclo 02), elige un horario y añádelo al Planificador.',actions:''};
      if(lower && lower.status==='planned' && mixed && mixed.status==='none') return {title:'David · SAE',message:'BASES DE DATOS I ya está planificado. Ahora puedes revisar INGENIERÍA DE SOFTWARE I (ciclo 04). Si un horario cruza, no podrás elegirlo, pero sí podrás seleccionar cualquier otro horario disponible sin cruce.',actions:''};
      const prereq=courses.find(c=>c.id===PREREQ_TARGET_ID);
      if(mixed && mixed.status==='enrolled' && prereq && prereq.status==='none') return {title:'David · SAE',message:'Cruce de horario resuelto. Ahora abre ESTRUCTURAS DE DATOS Y ALGORITMOS para practicar el caso de un curso que tiene prerrequisito.',actions:''};
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
  if(state.screen==='sections'){
    if(isFailedClosedCase(state.selectedCourse)){
      return {title:'David · SAE',message:`Las secciones de ${state.selectedCourse?.name||'este curso'} están cerradas y por eso no aparece “Selección”. Comunícate con tu coordinación académica para solicitar una matrícula administrativa; ellos podrán inscribirte en la sección disponible que corresponda y ayudarte a regularizar el curso pendiente.`,actions:''};
    }
    if(state.scenario==='mixed' && state.selectedCourse?.id===MIXED_COURSE_ID){
      return {title:'David · SAE',message:'El sistema compara estos horarios con BASES DE DATOS I, que ya planificaste por ser de un ciclo inferior. Los horarios que cruzan quedan bloqueados; los que no cruzan conservan el botón “Selección”. Elige cualquiera de las alternativas disponibles sin cruce para continuar.',actions:''};
    }
    return {
      title:'David · SAE',
      message:state.requirementsUploaded
        ? 'Selecciona una sección teórica que esté abierta. Después el sistema te pedirá escoger la clase práctica.'
        : 'No aparece el botón “Selección” porque aún no has subido tus requisitos al Intranet. Primero debes cargarlos; por eso el sistema no te permite escoger este horario.',
      actions:''
    };
  }
  if(state.screen==='practical') return {title:'David · SAE',message:'Ahora selecciona la clase práctica obligatoria que mejor se acomode a tu horario y pulsa “Sig”.',actions:''};
  if(state.screen==='enrollBlocked') return state.failedScheduleMode==='closed'
    ? {title:'David · SAE',message:'Este aviso aparece porque tienes cursos pendientes de ciclos inferiores y sus clases regulares están cerradas. Comunícate con tu coordinación para solicitar una matrícula administrativa; coordinación podrá inscribirte en la sección disponible que corresponda. Después podrás continuar con los cursos de ciclos superiores.',actions:''}
    : {title:'David · SAE',message:'Este aviso aparece porque tienes cursos pendientes de ciclos inferiores. Debes planificarlos e inscribirlos primero; luego podrás inscribir el curso del ciclo superior que ya dejaste en tu Planificador.',actions:''};
  if(state.screen==='prereqBlocked'){ const c=courses.find(x=>x.id===state.blockedCourseId); const pCourse=courses.find(x=>x.id===c?.prereqId); return {title:'David · SAE',message:`${c?.name||'Este curso'} tiene un prerrequisito. Primero debes inscribirte en ${pCourse?.name||'el curso prerrequisito'} para poder llevarlo.`,actions:''}; }
  if(state.screen==='enrollHome') return {
    title:'David · SAE',
    message:'Ya estás inscrito. Para cambiarte de turno, primero entra a “Baja”. Selecciona el curso que deseas retirar y continúa. Si ese curso lo jalaste anteriormente y ahora lo estás repitiendo, no cambies el turno por tu cuenta: comunícate con SAE.',
    actions:''
  };
  if(state.screen==='drop') return {
    title:'David · SAE',
    message:'Marca el curso que deseas cambiar y pulsa “Baja Clases Seleccionadas”. Recuerda: si el curso fue jalado anteriormente, comunícate con SAE para que te orienten con el cambio de turno.',
    actions:''
  };
  if(state.screen==='dropConfirm') return {
    title:'David · SAE',
    message:'Revisa la clase seleccionada para baja. Si todo es correcto, pulsa “Finalizar Baja”. Después podrás volver a seleccionar el curso y elegir otro horario disponible.',
    actions:''
  };
  if(state.screen==='dropBlocked') return {
    title:'David · SAE',
    message:'Este curso fue jalado anteriormente y ahora lo estás repitiendo. Si deseas cambiarte de turno, comunícate con el área de SAE para que revisen tu caso antes de realizar una baja.',
    actions:''
  };
  if(state.screen==='enrollReview') return {
    title:'David · SAE',
    message:'Antes de continuar puedes revisar los cursos planificados. Si ya no deseas llevar alguno, usa el icono del tacho para eliminarlo del Planificador. Luego pulsa “Continuar paso 2 de 3”.',
    actions:''
  };
  if(state.screen==='enroll') return {
    title:'David · SAE · Recomendación',
    message:'Inscríbete según tu malla curricular y los créditos otorgados. Si no sabes cuántos créditos tienes, comunícate con SAE o revisa tu malla curricular. Los créditos se asignan según el ciclo en el que te encuentras y los cursos de ciclos inferiores que tengas pendientes. Si te sobran créditos o un curso está lleno, se recomienda escoger cursos electivos.',
    actions:''
  };
  return {title:'David · SAE',message:'Estoy contigo durante todo el proceso de matrícula.',actions:''};
}

function assistantWidget(){
  const info=assistantContext();
  return `<section class="sae-assistant ${state.navOpen?'nav-open':''} ${state.assistantHidden?'assistant-hidden':''}" aria-live="polite">
    <div class="sae-photo-wrap"><img class="sae-photo" src="assets/david_sae.png" alt="David Cruz de SAE"></div>
    <div class="sae-bubble">
      <button class="sae-close" aria-label="Cerrar asistente" title="Cerrar por un momento" onclick="hideAssistant(event)">×</button>
      <div class="sae-title">${info.title}</div>
      <div id="assistantMessage" class="sae-message">${info.message}</div>
      ${info.actions?`<div class="assistant-actions">${info.actions}</div>`:''}
    </div>
  </section>`;
}

function hideAssistant(event){
  event?.stopPropagation();
  state.assistantHidden=true;
  document.querySelector('.sae-assistant')?.classList.add('assistant-hidden');
}
function restoreAssistant(){
  if(!state.assistantHidden) return;
  state.assistantHidden=false;
  document.querySelector('.sae-assistant')?.classList.remove('assistant-hidden');
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
    <p class="last-run"><b>Fecha Última Ejecución Informe</b> &nbsp;&nbsp;${currentRunStamp()}</p>
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
    '03': courses.filter(c=>c.cycle==='03'),
    '04': courses.filter(c=>c.cycle==='04')
  };
  if(state.scenario==='mixed'){
    // En el ejemplo de ciclos diferentes, BASES DE DATOS I se muestra primero
    // dentro del ciclo 02 para reforzar que se debe priorizar el ciclo inferior.
    grouped['02'].sort((a,b)=>Number(b.id===MIXED_BASE_ID)-Number(a.id===MIXED_BASE_ID));
  }
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
      ${grouped['04'].length?cycleBlock('CICLO 04 PLAN DE ESTUDIO 20201',grouped['04']):''}
    </div>
  `, 'Mis Condiciones Académicas', 'inicio');
}

function cycleBlock(title,items){
  return `<section class="cycle"><div class="cycle-head">▼ ${title}</div>
    <div class="table-tools">Personalizar | Ver Todo | <span>▧</span>&nbsp;&nbsp;&nbsp; Primero ◀ &nbsp;1-${items.length} de ${items.length}&nbsp; ▶ Último</div>
    <table class="course-table"><thead><tr><th>Curso</th><th>Descripción</th><th>Unidades</th><th>Cuándo</th><th>Calif</th><th>Estado</th></tr></thead><tbody>
    ${items.map(c=>{
      const cid=c.id===TARGET_ID?'courseTarget':c.id===MIXED_BASE_ID?'courseMixedBase':c.id===MIXED_COURSE_ID?'courseMixed':c.id===PREREQ_TARGET_ID?'coursePrereq':`course_${safeId(c.id)}`;
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
  if(state.failedScheduleMode==='closed') return `<div class="prereq-warning administrative-warning">
    <div class="prereq-warning-title">⚠ Cursos pendientes con clases cerradas.</div>
    <div>Estos cursos aparecen sin nota y sin símbolo porque están pendientes de un ciclo inferior:</div>
    <ul>${pending.map(c=>`<li><b>${c.id}</b> · ${c.name}</li>`).join('')}</ul>
    <div>No hay secciones regulares abiertas para completar la regularización desde este simulador. <b>Comunícate con tu coordinación académica y solicita una matrícula administrativa</b> para que te inscriban en la sección disponible que corresponda. Luego podrás continuar con los cursos de ciclos superiores.</div>
  </div>`;
  return `<div class="prereq-warning">
    <div class="prereq-warning-title">⚠ Antes de inscribir este curso debes regularizar cursos de ciclos inferiores.</div>
    <div>Estos cursos aparecen sin nota y sin símbolo porque están pendientes del ciclo anterior. Primero debes <b>planificarlos e inscribirlos</b>:</div>
    <ul>${pending.map(c=>`<li><b>${c.id}</b> · ${c.name} ${c.status==='planned'?'<span class="mini-planned">★ Planificado</span>':'<span class="mini-pending">Pendiente</span>'}</li>`).join('')}</ul>
    <div>Tu curso actual puede quedarse en el Planificador. Cuando estos cursos queden inscritos con rombo ◆, podrás inscribirlo.</div>
  </div>`;
}

function sectionActionFor(c,s,i){
  if(!s.open) return '<span class="closed-label">Cerrada</span>';
  if(!state.requirementsUploaded) return '';
  if(c.id===MIXED_COURSE_ID){
    const conflict=findScheduleConflict(s,c.id);
    const buttonId=`mixedOption_${safeId(s.id)}`;
    if(conflict){
      const msg=s.modality==='VIRTUAL'?'Cruce de horario · elige otra sede/horario':'Cruce de horario · prioriza ciclo inferior';
      return `<div class="available-choice conflict-choice"><span class="conflict-label ${s.modality==='VIRTUAL'?'virtual':'presencial'}">${msg}</span><button id="${buttonId}" class="section-select-btn conflict-disabled" disabled>No disponible</button></div>`;
    }
    return `<div class="available-choice"><span class="available-label">Disponible sin cruce</span><button id="${buttonId}" class="section-select-btn" onclick="selectSection('${s.id}')">${state.selectedSection && state.selectedSection.id===s.id?'Seleccionado ✓':'Selección'}</button></div>`;
  }
  return `<button ${i===0?'id="sectionSelect2101"':''} class="section-select-btn" onclick="selectSection('${s.id}')">${state.selectedSection && state.selectedSection.id===s.id?'Seleccionado ✓':'Selección'}</button>`;
}

function sectionsModal(){
  const c=state.selectedCourse || targetCourse();
  const list=theorySectionsFor(c);
  return `<div class="modal-overlay"><div class="modal-card sections-card">
    <div class="modal-head">Detalles de Oferta de Curso <button class="close-x" onclick="openCourse('${c.id}')">×</button></div>
    <div class="modal-body sections-body">
      <div class="availability-legend modal-availability"><span><i class="seat open"></i>Abierta</span><span><i class="seat closed"></i>Cerrada</span></div>
      <p class="detail-name"><b>${c.id} · CLASE TEÓRICA · secciones para ${STUDENT.term}</b></p>
      <p class="section-instruction">${isFailedClosedCase(c)?'Revisa el estado de las secciones del curso pendiente.':'Primero selecciona una sección teórica abierta. Después elegirás la clase práctica obligatoria.'}</p>
      ${isFailedClosedCase(c)?`<div class="requirements-warning administrative-warning"><b>No hay secciones regulares abiertas.</b> Este es el caso de un curso jalado cuyas clases están cerradas. Debes comunicarte con tu coordinación académica para solicitar una <b>matrícula administrativa</b> y ser inscrito en la sección disponible que corresponda.</div>`:''}
      ${state.requirementsUploaded===false?`<div class="requirements-warning"><b>Validación de requisitos pendiente.</b> Las secciones abiertas se muestran para consulta, pero la opción “Selección” permanecerá oculta hasta que tus requisitos estén cargados en el Intranet.</div>`:''}
      ${list.map((s,i)=>`<div class="section-block"><div class="section-row ${state.selectedSection && state.selectedSection.id===s.id?'selected':''}"><table class="section-table"><thead><tr><th>Sección</th><th>Campus</th><th>Ubicación</th><th>Modalidad</th><th>Estado</th><th></th></tr></thead><tbody><tr><td>${s.id}<br>(${s.classNo})</td><td>${s.campus}</td><td>${s.room}</td><td>${s.modality||'PRESENCIAL'}</td><td class="state-cell">${s.open?'<i class="seat open"></i>':'<i class="seat closed"></i>'}</td><td>${sectionActionFor(c,s,i)}</td></tr></tbody></table>
      <table class="detail-subtable"><thead><tr><th>Días</th><th>Inicio</th><th>Fin</th><th>Aula</th><th>Profesor</th><th>Fechas</th></tr></thead><tbody><tr><td>${s.day}</td><td>${s.start}</td><td>${s.end}</td><td>${s.room}</td><td>${s.teacher}</td><td>${academicTermDates()}</td></tr></tbody></table></div></div>`).join('')}
      <a class="back-link" href="javascript:void(0)" onclick="openCourse('${c.id}')">Volver al detalle del curso</a>
    </div></div></div>`;
}

function practicalModal(){
  const c=state.selectedCourse || targetCourse();
  const theory=state.selectedSection;
  const pList=practicalSectionsFor(c);
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
      ${pList.map((p,i)=>`<tr ${i===0?'id="practicalSelect3101"':''} class="${state.selectedPractical && state.selectedPractical.id===p.id?'chosen':''} ${p.open?'selectable-practical':''}" ${p.open?`onclick="selectPractical('${p.id}')"`:''}><td><input class="radio-big" type="radio" name="practical" ${state.selectedPractical && state.selectedPractical.id===p.id?'checked':''} ${p.open?'': 'disabled'} onclick="event.stopPropagation();selectPractical('${p.id}')"></td><td>${p.classNo}</td><td>${p.id}</td><td>${p.day} ${p.start} - ${p.end}</td><td>${p.room}</td><td>${p.teacher}</td><td>${p.open?'<i class="seat open"></i>':'<i class="seat closed"></i>'}</td></tr>`).join('')}
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

function prerequisiteBlockedPage(){
  const c=courses.find(x=>x.id===state.blockedCourseId);
  const pCourse=courses.find(x=>x.id===c?.prereqId);
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><b>Añadir</b><span>|</span><span>Baja</span><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <h1 class="section-title compact-title">Inscribir Clases</h1>
    <section class="enrollment-panel enroll-confirm-panel">
      <h2>Prerrequisito pendiente</h2>
      <div class="requirements-warning"><b>${c?.name||'Este curso'} no puede inscribirse todavía.</b><br>Primero debes inscribirte en <b>${pCourse?.name||'el curso prerrequisito'}</b> (${pCourse?.id||''}) para poder llevar este curso.</div>
      <div class="footer-actions"><button id="prereqBackBtn" class="action-button primary" onclick="showCourses()">Volver a Mis Condiciones Académicas</button></div>
    </section>
  `, 'Introducción de Clase', 'inicio');
}

function enrolledCourses(){ return courses.filter(c=>c.status==='enrolled'); }

function enrollHomePage(){
  const rows=enrolledCourses().map(c=>{
    const sch=state.schedules[c.id]||{};
    const t=sch.theory, p=sch.practical;
    return `<tr><td>${c.id}</td><td>${c.name}</td><td>${t?`${t.day} ${t.start} - ${t.end}`:'—'}${p?`<br>${p.day} ${p.start} - ${p.end}`:''}</td><td>${t?.room||'—'}${p?`<br>${p.room}`:''}</td><td>${t?.teacher||'—'}${p?`<br>${p.teacher}`:''}</td><td>${c.credits.toFixed(2)}</td><td><span class="status-check">✓</span></td></tr>`;
  }).join('');
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><b>Añadir</b><span>|</span><button id="bajaNav" class="subnav-link" onclick="openDropStep()">Baja</button><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <div class="page-heading-row"><h1 class="section-title compact-title">Introducción de Clase</h1><div class="step-indicator"><span class="step active">1</span><span class="step">2</span><span class="step">3</span></div></div>
    <section class="enrollment-panel">
      <h2>1. Selección de Clases para Añadir</h2>
      <p>Ya tienes clases inscritas en el ciclo ${STUDENT.term}. Si deseas cambiarte de turno, utiliza la opción <b>Baja</b> de la barra superior.</p>
      <p class="term-line"><b>${STUDENT.term} | ${STUDENT.career} | ${STUDENT.institution}</b></p>
      <div class="mini-box"><div class="mini-title">Mi Horario de Clases ${STUDENT.term}</div><table class="course-table"><thead><tr><th>Clase</th><th>Descripción</th><th>Días/Horas</th><th>Aula</th><th>Instructor</th><th>Unidades</th><th>Estado</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No hay clases inscritas.</td></tr>'}</tbody></table></div>
    </section>
  `, 'Introducción de Clase', 'inicio');
}

function enrollReviewPage(){
  const pendingRepeats=pendingFailedCourses();
  const regularizationMode=state.scenario==='failed' && pendingRepeats.length>0;
  const planned=state.planner.filter(c=>c.status==='planned');
  const rows=planned.map(c=>{
    const sch=state.schedules[c.id]||{}, t=sch.theory, p=sch.practical;
    const note=regularizationMode && !c.repeat ? '<div class="row-note">Se mantendrá planificado hasta regularizar cursos inferiores.</div>' : '';
    return `<tr><td>${c.id}</td><td>${c.name}${note}</td><td>${t?`${t.day} ${t.start} - ${t.end} · ${t.room}`:'—'}</td><td>${p?`${p.day} ${p.start} - ${p.end} · ${p.room}`:'—'}</td><td>${c.credits.toFixed(2)}</td><td><span class="status-star">★</span> Planificado</td><td class="trash-cell"><button class="trash-btn" title="Eliminar del Planificador" aria-label="Eliminar ${c.name} del Planificador" onclick="removePlannedCourse('${c.id}')">${icon('trash')}</button></td></tr>`;
  }).join('');
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><b>Añadir</b><span>|</span><button class="subnav-link" onclick="openDropStep()">Baja</button><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <div class="page-heading-row"><h1 class="section-title compact-title">Inscribir Clases</h1><div class="step-indicator"><span class="step active">1</span><span class="step">2</span><span class="step">3</span></div></div>
    <section class="enrollment-panel enroll-confirm-panel">
      <h2>1. Selección de clases para inscribir</h2>
      <p>Revisa tus cursos planificados. Puedes eliminar cualquiera antes de continuar.</p>
      <p class="term-line"><b>${STUDENT.term} | ${STUDENT.career} | ${STUDENT.institution}</b></p>
      <div class="mini-box"><table class="course-table"><thead><tr><th>Curso</th><th>Descripción</th><th>Teoría</th><th>Práctica</th><th>Unidades</th><th>Estado</th><th>Eliminar</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No hay cursos planificados.</td></tr>'}</tbody></table></div>
      <div class="footer-actions"><button class="action-button" onclick="showCourses()">Volver</button><button id="continueEnrollBtn" class="action-button primary" ${planned.length?'':'disabled'} onclick="continueEnrollment()">Continuar paso 2 de 3</button></div>
    </section>
  `, 'Introducción de Clase', 'inicio');
}

function dropPage(){
  const enrolled=enrolledCourses();
  const rows=enrolled.map(c=>{
    const sch=state.schedules[c.id]||{}, t=sch.theory, p=sch.practical;
    const checked=state.dropSelection.includes(c.id)?'checked':'';
    return `<tr class="drop-course-row"><td class="drop-check"><input id="dropCheck_${safeId(c.id)}" type="checkbox" ${checked} onchange="toggleDropCourse('${c.id}',this.checked)"></td><td>${c.id}</td><td>${c.name}</td><td>${t?`${t.day} ${t.start} - ${t.end}`:'—'}${p?`<br>${p.day} ${p.start} - ${p.end}`:''}</td><td>${t?.room||'—'}${p?`<br>${p.room}`:''}</td><td>${t?.teacher||'—'}${p?`<br>${p.teacher}`:''}</td><td>${c.credits.toFixed(2)}</td><td><span class="status-check">✓</span></td></tr>`;
  }).join('');
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><span>Añadir</span><span>|</span><b>Baja</b><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <div class="page-heading-row"><h1 class="section-title compact-title">Baja de Clase</h1><div class="step-indicator"><span class="step active">1</span><span class="step">2</span><span class="step">3</span></div></div>
    <section class="enrollment-panel">
      <h2>1. Clases para Baja</h2>
      <p>Selecciona las clases en las que deseas causar baja y pulsa “Baja Clases Seleccionadas”.</p>
      <p class="term-line"><b>${STUDENT.term} | ${STUDENT.career} | ${STUDENT.institution}</b></p>
      <div class="mini-box"><table class="course-table drop-table"><thead><tr><th>Selección</th><th>Clase</th><th>Descripción</th><th>Días/Horas</th><th>Aula</th><th>Instructor</th><th>Unidades</th><th>Estado</th></tr></thead><tbody>${rows||'<tr><td colspan="8">No hay clases inscritas.</td></tr>'}</tbody></table></div>
      <div class="footer-actions"><button class="action-button" onclick="openEnrollStep()">Volver</button><button id="dropSelectedBtn" class="action-button primary" ${state.dropSelection.length?'':'disabled'} onclick="prepareDrop()">Baja Clases Seleccionadas</button></div>
    </section>
  `, 'Baja de Clase', 'inicio');
}

function dropConfirmPage(){
  const selected=state.dropSelection.map(id=>courses.find(c=>c.id===id)).filter(Boolean);
  const rows=selected.map(c=>{
    const sch=state.schedules[c.id]||{}, t=sch.theory, p=sch.practical;
    return `<tr><td>${c.id}</td><td>${c.name}</td><td>${t?`${t.day} ${t.start} - ${t.end} · ${t.room}`:'—'}</td><td>${p?`${p.day} ${p.start} - ${p.end} · ${p.room}`:'—'}</td><td>${c.credits.toFixed(2)}</td></tr>`;
  }).join('');
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><span>Añadir</span><span>|</span><b>Baja</b><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <div class="page-heading-row"><h1 class="section-title compact-title">Baja de Clase</h1><div class="step-indicator"><span class="step">1</span><span class="step active">2</span><span class="step">3</span></div></div>
    <section class="enrollment-panel enroll-confirm-panel">
      <h2>2. Confirmación de clases para baja</h2>
      <p>Revisa las clases seleccionadas. La baja se aplicará cuando pulses “Finalizar Baja”.</p>
      <div class="mini-box"><table class="course-table"><thead><tr><th>Curso</th><th>Descripción</th><th>Teoría</th><th>Práctica</th><th>Unidades</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="footer-actions"><button class="action-button" onclick="openDropStep()">Anterior</button><button id="finalDropBtn" class="action-button primary" onclick="finalizeDrop()">Finalizar Baja</button></div>
    </section>
  `, 'Baja de Clase', 'inicio');
}

function dropBlockedPage(){
  const c=courses.find(x=>x.id===state.dropBlockedCourseId);
  return classicFrame(`${studentTabs('enroll')}
    <div class="enroll-subnav"><span>Añadir</span><span>|</span><b>Baja</b><span>|</span><span>Cambiar</span><span>|</span><span>Editar</span><span>|</span><span>Información Ciclo</span></div>
    <h1 class="section-title compact-title">Cambio de turno</h1>
    <section class="enrollment-panel enroll-confirm-panel">
      <h2>Atención SAE</h2>
      <div class="requirements-warning"><b>${c?.name||'Este curso'} fue jalado anteriormente.</b><br>Si deseas cambiar el turno de este curso mientras lo estás repitiendo, comunícate con el área de <b>SAE</b> para que revisen tu caso y te indiquen el procedimiento correcto.</div>
      <div class="footer-actions"><button id="dropBlockedBackBtn" class="action-button primary" onclick="openDropStep()">Volver a Baja</button></div>
    </section>
  `, 'Baja de Clase', 'inicio');
}

function enrollPage(){
  const pendingRepeats=pendingFailedCourses();
  const regularizationMode = state.scenario==='failed' && pendingRepeats.length>0;
  const planned = regularizationMode
    ? state.planner.filter(c=>c.status==='planned' && c.repeat)
    : state.planner.filter(c=>c.status==='planned' && !c.repeat && (!state.enrollmentFilter || state.enrollmentFilter.includes(c.id)));
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
      <p>${regularizationMode?'Confirma primero la inscripción de los cursos pendientes de ciclos inferiores. El curso de ciclo superior que ya planificaste permanecerá en tu Planificador.':state.enrollmentFilter?'Este curso debe inscribirse primero porque es prerrequisito de otra asignatura que dejaste en el Planificador.':'Los cursos están en tu Planificador. Confirma la inscripción para registrarlos en el ciclo '+STUDENT.term+'.'}</p>
      <p class="term-line"><b>${STUDENT.term} | ${STUDENT.career} | ${STUDENT.institution}</b></p>
      <div class="mini-box"><table class="course-table"><thead><tr><th>Curso</th><th>Descripción</th><th>Teoría</th><th>Práctica</th><th>Unidades</th><th>Estado actual</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="footer-actions"><button class="action-button" onclick="showCourses()">Anterior</button><button id="enrollConfirmBtn" class="action-button primary" onclick="finishEnrollment()">Finalizar inscripción</button></div>
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
    case 'prereqBlocked': app.innerHTML=prerequisiteBlockedPage(); break;
    case 'enrollHome': app.innerHTML=enrollHomePage(); break;
    case 'enrollReview': app.innerHTML=enrollReviewPage(); break;
    case 'enroll': app.innerHTML=enrollPage(); break;
    case 'drop': app.innerHTML=dropPage(); break;
    case 'dropConfirm': app.innerHTML=dropConfirmPage(); break;
    case 'dropBlocked': app.innerHTML=dropBlockedPage(); break;
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
  if(state.screen==='conditions') return state.scenario==='change'?'enrollTab':'coursesBtn';
  if(state.screen==='courses'){
    if(state.scenario==='mixed'){
      const lower=courses.find(c=>c.id===MIXED_BASE_ID);
      const mixed=courses.find(c=>c.id===MIXED_COURSE_ID);
      const prereq=courses.find(c=>c.id===PREREQ_TARGET_ID);
      // Primero se planifica el curso de ciclo inferior; luego el de ciclo mayor.
      if(lower?.status==='none') return 'courseMixedBase';
      if(lower?.status==='planned' && mixed?.status==='none') return 'courseMixed';
      if(mixed?.status==='planned') return 'enrollTab';
      if(mixed?.status==='enrolled' && prereq?.status==='none') return 'coursePrereq';
      if(prereq?.status==='planned'){
        const needed=courses.find(c=>c.id===prereq.prereqId);
        if(needed?.status==='none') return 'courseTarget';
        if(needed?.status==='planned') return 'enrollTab';
        return 'enrollTab';
      }
    }
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
  if(state.screen==='sections'){
    if(state.requirementsUploaded!==true) return null;
    if(isFailedClosedCase(state.selectedCourse)) return null;
    if(state.scenario==='mixed' && state.selectedCourse?.id===MIXED_COURSE_ID){
      const available=mixedTheorySections.find(sec=>sec.open && !findScheduleConflict(sec,MIXED_COURSE_ID));
      return available?`mixedOption_${safeId(available.id)}`:null;
    }
    return 'sectionSelect2101';
  }
  if(state.screen==='practical') return state.selectedPractical?'practicalNextBtn':'practicalSelect3101';
  if(state.screen==='enrollBlocked') return 'regularizeBtn';
  if(state.screen==='prereqBlocked') return 'prereqBackBtn';
  if(state.screen==='enrollHome') return 'bajaNav';
  if(state.screen==='enrollReview') return 'continueEnrollBtn';
  if(state.screen==='drop'){ const first=enrolledCourses().find(c=>!c.previouslyFailed)||enrolledCourses()[0]; return state.dropSelection.length?'dropSelectedBtn':(first?`dropCheck_${safeId(first.id)}`:null); }
  if(state.screen==='dropConfirm') return 'finalDropBtn';
  if(state.screen==='dropBlocked') return 'dropBlockedBackBtn';
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
  if(!state.scenario || state.requirementsUploaded===null){ toast('Responde primero las preguntas de David para iniciar el recorrido'); return; }
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
  if(state.scenario==='mixed' && c.id===MIXED_COURSE_ID){
    const lower=courses.find(x=>x.id===MIXED_BASE_ID);
    if(lower && lower.status==='none'){
      state.assistantNotice=`Primero debes seleccionar ${lower.name}, porque es de un ciclo inferior. Elige su horario y añádelo al Planificador antes de continuar con ${c.name}.`;
      toast(state.assistantNotice);
      render();
      return;
    }
  }
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

function parseMinutes(t){
  const m=t.match(/(\d+):(\d+)(AM|PM)/i); if(!m) return 0;
  let h=Number(m[1])%12, min=Number(m[2]); if(m[3].toUpperCase()==='PM') h+=12; return h*60+min;
}
function schedulesOverlap(a,b){
  if(!a||!b||a.day!==b.day) return false;
  return parseMinutes(a.start)<parseMinutes(b.end) && parseMinutes(b.start)<parseMinutes(a.end);
}
function findScheduleConflict(sec,currentId){
  for(const c of courses){
    if(c.id===currentId || !['planned','enrolled'].includes(c.status)) continue;
    const sch=state.schedules[c.id]; if(!sch) continue;
    if(schedulesOverlap(sec,sch.theory)||schedulesOverlap(sec,sch.practical)) return c;
  }
  return null;
}

function selectSection(id){
  clearAssistantNotice();
  if(state.requirementsUploaded!==true){ toast('No puedes seleccionar una sección: primero debes subir tus requisitos al Intranet'); return; }
  const c=state.selectedCourse || targetCourse();
  const sec=theorySectionsFor(c).find(s=>s.id===id);
  if(!sec || !sec.open){ toast('Esta sección está cerrada'); return; }
  const conflict=findScheduleConflict(sec,c.id);
  if(conflict){
    if(sec.modality==='VIRTUAL'){
      state.mixedVirtualConflictSeen=true;
      state.assistantNotice=`Este horario virtual cruza con ${conflict.name}. Como la clase es virtual, escoge otro horario disponible, incluso de otra sede.`;
      toast(state.assistantNotice); render(); return;
    }
    state.mixedConflictSeen=true;
    state.assistantNotice=`Hay cruce con ${conflict.name}, que es de un ciclo inferior. Como esta sección es presencial, debes dejar el curso de mayor ciclo y priorizar el de ciclo inferior.`;
    toast(state.assistantNotice); render(); return;
  }
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
  const c=state.selectedCourse || targetCourse();
  const p=practicalSectionsFor(c).find(x=>x.id===id);
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
  state.enrollmentFilter=null;
  const planned=state.planner.filter(c=>c.status==='planned');
  if(state.scenario==='change' && !planned.length){
    state.screen='enrollHome'; render(); return;
  }
  if(state.requirementsUploaded!==true){ toast('La inscripción no está disponible hasta que tus requisitos estén cargados en el Intranet'); return; }
  if(!planned.length && enrolledCourses().length){ state.screen='enrollHome'; render(); return; }
  if(!planned.length){ toast('Primero selecciona horarios y añade al menos un curso al Planificador'); return; }
  state.screen='enrollReview'; render();
}

function removePlannedCourse(id){
  clearAssistantNotice();
  const c=courses.find(x=>x.id===id); if(!c) return;
  c.status=c.repeat?'failed':'none';
  state.planner=state.planner.filter(x=>x.id!==id);
  delete state.schedules[id];
  if(state.selectedCourse?.id===id){ state.selectedCourse=null; state.selectedSection=null; state.selectedPractical=null; }
  toast(`${c.name} eliminado del Planificador`);
  state.screen='enrollReview'; render();
}

function continueEnrollment(){
  clearAssistantNotice();
  if(state.requirementsUploaded!==true){ toast('Primero debes subir tus requisitos al Intranet'); return; }
  const planned=state.planner.filter(c=>c.status==='planned');
  if(!planned.length){ toast('No hay cursos planificados para continuar'); return; }
  state.enrollmentFilter=null;
  if(state.scenario==='failed' && pendingFailedCourses().length){
    if(targetCourse()?.status==='planned') state.attemptedTargetBlocked=true;
    const unplanned=failedUnplannedCourses();
    if(unplanned.length){ state.screen='enrollBlocked'; render(); return; }
    state.enrollmentFilter=FAILED_IDS.slice();
    state.screen='enroll'; render(); return;
  }
  const blocked=planned.find(c=>c.prereqId && courses.find(p=>p.id===c.prereqId)?.status!=='enrolled');
  if(blocked){
    const prereq=courses.find(p=>p.id===blocked.prereqId);
    if(prereq?.status==='planned' && plannerHas(prereq.id)){
      state.enrollmentFilter=[prereq.id];
      state.assistantNotice=`Primero inscribe ${prereq.name}. ${blocked.name} permanecerá en el Planificador hasta que cumplas el prerrequisito.`;
      state.screen='enroll'; render(); return;
    }
    state.blockedCourseId=blocked.id; state.screen='prereqBlocked'; render(); return;
  }
  state.screen='enroll'; render();
}

function openDropStep(){
  clearAssistantNotice();
  if(!enrolledCourses().length){ toast('No tienes cursos inscritos para dar de baja'); return; }
  state.dropSelection=[];
  state.dropBlockedCourseId=null;
  state.screen='drop'; render();
}
function toggleDropCourse(id,checked){
  if(checked){ if(!state.dropSelection.includes(id)) state.dropSelection.push(id); }
  else state.dropSelection=state.dropSelection.filter(x=>x!==id);
  const btn=document.getElementById('dropSelectedBtn'); if(btn) btn.disabled=!state.dropSelection.length;
  clearHighlights();
  setTimeout(applyGuide,0);
}
function prepareDrop(){
  clearAssistantNotice();
  if(!state.dropSelection.length){ toast('Selecciona al menos un curso para la baja'); return; }
  const protectedCourse=state.dropSelection.map(id=>courses.find(c=>c.id===id)).find(c=>c?.previouslyFailed);
  if(protectedCourse){
    state.dropBlockedCourseId=protectedCourse.id;
    state.screen='dropBlocked'; render(); return;
  }
  state.screen='dropConfirm'; render();
}
function finalizeDrop(){
  clearAssistantNotice();
  const ids=new Set(state.dropSelection);
  ids.forEach(id=>{
    const c=courses.find(x=>x.id===id);
    if(c){ c.status='none'; delete state.schedules[id]; }
  });
  state.dropSelection=[];
  state.dropBlockedCourseId=null;
  state.assistantNotice='Baja finalizada. Ahora puedes volver a seleccionar el curso y escoger otro horario disponible para completar el cambio de turno.';
  state.screen='courses'; render();
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

  const planned=state.planner.filter(c=>c.status==='planned' && !c.repeat && (!state.enrollmentFilter || state.enrollmentFilter.includes(c.id)));
  if(!planned.length){ toast('No hay cursos listos para inscribir'); return; }
  const blocked=planned.find(c=>c.prereqId && courses.find(p=>p.id===c.prereqId)?.status!=='enrolled');
  if(blocked){ state.blockedCourseId=blocked.id; state.screen='prereqBlocked'; render(); return; }
  const ids=new Set(planned.map(c=>c.id));
  planned.forEach(c=>{ c.status='enrolled'; });
  state.planner=state.planner.filter(c=>!ids.has(c.id));
  state.selectedCourse=null; state.selectedSection=null; state.selectedPractical=null;
  state.justEnrolled=ids.has(TARGET_ID)?'target':null;
  state.enrollmentFilter=null; state.blockedCourseId=null;
  state.screen='courses'; render();
  toast('Inscripción completada ◆');
}

function toggleGuide(){ state.guided=!state.guided; render(); }

// Si David se cerró porque tapaba un control, reaparece automáticamente al
// pulsar el siguiente botón/enlace/opción del simulador.
document.addEventListener('click',(event)=>{
  if(!state.assistantHidden) return;
  if(event.target.closest('.sae-close')) return;
  const interactive=event.target.closest('button,a,input,.course-link,.select-link,.rail-item,.nav-row,.action-button');
  if(interactive) restoreAssistant();
},true);

window.addEventListener('resize',()=>setTimeout(applyGuide,50));
render();
