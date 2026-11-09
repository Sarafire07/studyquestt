import { useEffect, useRef, useState } from "react";
// Importamos el motor heurístico desde el archivo del mismo nivel
import { PSOGWOOptimizer } from "./optimizer";

type View = "missions" | "new-task" | "focus" | "loading" | "loaded";

type Mission = {
  id: string;
  title: string;
  time: string;
  score: string;
  group?: boolean;
  bonus?: boolean;
};

const A = "/assets";

const icons = {
  trophy: `${A}/a9468.svg`,
  list: `${A}/60217.svg`,
  listMuted: `${A}/81597.svg`,
  plusSquare: `${A}/81127.svg`,
  plusSquareMuted: `${A}/1ce66.svg`,
  timer: `${A}/d088e.svg`,
  timerMuted: `${A}/5c285.svg`,
  rotate: `${A}/cbbeb.svg`,
  crown: `${A}/54edb.svg`,
  clock: `${A}/23f65.svg`,
  users: `${A}/3babe.svg`,
  usersForm: `${A}/816a6.svg`,
  zap: `${A}/be79e.svg`,
  zapForm: `${A}/0eb38.svg`,
  play: `${A}/52845.svg`,
  check: `${A}/a96be.svg`,
  checkDark: `${A}/5c3e2.svg`,
  plus: `${A}/c532b.svg`,
  chevron: `${A}/e3d96.svg`,
  calculator: `${A}/97397.svg`,
  calculatorSuccess: `${A}/c6b36.svg`,
  target: `${A}/8764f.svg`,
  restart: `${A}/d9aff.svg`,
  ring: `${A}/4cdae.svg`,
  runningRing: `${A}/51e20.png`,
  loading: `${A}/2c490.png`,
};

const initialMissions: Mission[] = [
  {
    id: "T1",
    title: "Informe de Física",
    time: "2h restantes",
    score: "112.5",
    group: true,
    bonus: true,
  },
  {
    id: "T3",
    title: "Ejercicios de Algoritmos",
    time: "3h restantes",
    score: "40",
    bonus: true,
  },
  { id: "T2", title: "Control de Lectura", time: "10h restantes", score: "5" },
];

function Header({
  level,
  xp,
  progress,
  compact = false,
}: {
  level: number;
  xp: number;
  progress: number;
  compact?: boolean;
}) {
  return (
    <header className={`header ${compact ? "header--compact" : ""}`}>
      <div className="header__row">
        <div className="brand">
          <span className="brand__mark">SQ</span>
          <span className="brand__copy">
            <strong>StudyQuest</strong>
            <small>Motor Heurístico V1.5</small>
          </span>
        </div>
        <div className="level-pill">
          <img src={icons.trophy} alt="" />
          {!compact && <strong>Nivel {level}</strong>}
          <span>|</span>
          {!compact && <b>{xp} XP</b>}
        </div>
      </div>
      {!compact && (
        <div className="progress">
          <div className="progress__track">
            <div
              className={`progress__value ${level >= 17 ? "progress__value--green" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress__labels">
            <span>Progreso Nivel {level}</span>
            <span>
              {progress} / 100 XP para Nivel {level + 1}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

function BottomNav({ active, go }: { active: View; go: (view: View) => void }) {
  const item = (target: View, label: string, icon: string, selectedIcon: string = icon) => (
    <button
      type="button"
      className={`nav__item ${active === target ? "nav__item--active" : ""}`}
      onClick={() => go(target)}
      aria-current={active === target ? "page" : undefined}
    >
      <img src={active === target ? selectedIcon : icon} alt="" />
      <span>{label}</span>
    </button>
  );

  return (
    <nav className="nav">
      {item("missions", "Misiones", icons.listMuted, icons.list)}
      {item("new-task", "Nueva Tarea", icons.plusSquareMuted, icons.plusSquare)}
      {item("focus", "Enfoque", icons.timerMuted, icons.timer)}
    </nav>
  );
}

function MissionCard({
  mission,
  priority,
  completing,
  onFocus,
  onComplete,
}: {
  mission: Mission;
  priority?: boolean;
  completing?: boolean;
  onFocus: () => void;
  onComplete: () => void;
}) {
  return (
    <article className="mission">
      {priority && (
        <div className="priority">
          <img src={icons.crown} alt="" />
          PRIORIDAD #1
        </div>
      )}
      <div className="mission__identity">
        <span>Misión {mission.id}</span>
        <h2>{mission.title}</h2>
      </div>
      <div className="tags">
        <span className="tag">
          <img src={icons.clock} alt="" />
          {mission.time}
        </span>
        <span className="tag">
          {mission.group && <img src={icons.users} alt="" />}
          {mission.group ? "Grupal (1.5x)" : "Individual"}
        </span>
        {mission.bonus && (
          <span className="tag tag--strong">
            <img src={icons.zap} alt="" />
            Bono Activo (1.5x)
          </span>
        )}
      </div>
      <div className="mission__footer">
        <div className="score">
          <span>PUNTAJE CALCULADO</span>
          <strong>
            {mission.score} <small>pts</small>
          </strong>
        </div>
        <div className="mission__actions">
          <button type="button" className="focus-button" onClick={onFocus}>
            <img src={icons.play} alt="" />
            Enfoque
          </button>
          <button
            type="button"
            className={`complete-button ${completing ? "complete-button--done" : ""}`}
            onClick={onComplete}
            aria-label={`Completar ${mission.title}`}
          >
            <img src={completing ? icons.checkDark : icons.check} alt="" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Missions({
  missions,
  completed,
  go,
  upload,
}: {
  missions: Mission[];
  completed: number;
  go: (view: View) => void;
  upload: () => void;
}) {
  const level = completed === 0 ? 15 : completed === 1 ? 16 : 17;
  const xp = completed === 0 ? 1450 : completed === 1 ? 1562 : 1602;
  const progress = completed === 0 ? 50 : completed === 1 ? 62.5 : 2.5;

  return (
    <>
      <Header level={level} xp={xp} progress={progress} />
      <main className="content missions-content">
        <div className="section-title">
          <div>
            <strong>ORDEN DE MISIONES</strong>
            <span>{missions.length}</span>
          </div>
          <button type="button" className="upload-button" onClick={upload}>
            <img src={icons.rotate} alt="" />
            Cargar Caso PDF
          </button>
        </div>
        <div className="mission-list">
          {missions.map((mission, index) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              priority={index === 0}
              completing={completed > 1 && index === 0}
              onFocus={() => go("focus")}
              onComplete={() => {
                if (index === 0) {
                  const event = new CustomEvent("complete-mission", { detail: mission.id });
                  window.dispatchEvent(event);
                }
              }}
            />
          ))}
        </div>
      </main>
      <BottomNav active="missions" go={go} />
    </>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
  icon: string;
}) {
  return (
    <button type="button" className="multiplier" onClick={onChange}>
      <img src={icon} alt="" />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <i className={`switch ${checked ? "switch--on" : ""}`} aria-hidden="true">
        <b />
      </i>
    </button>
  );
}

interface NewTaskPayload {
  name: string;
  available: number;
  execution: number;
  score: number;
  group: boolean;
  bonus: boolean;
}

function NewTask({ go, onCreated }: { go: (view: View) => void; onCreated: (payload: NewTaskPayload) => void }) {
  const [name, setName] = useState("");
  const [available, setAvailable] = useState("10");
  const [execution, setExecution] = useState("8");
  const [score, setScore] = useState("100");
  const [group, setGroup] = useState(true);
  const [bonus, setBonus] = useState(true);
  const [success, setSuccess] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      document.getElementById("task-name")?.focus();
      return;
    }
    setSuccess(true);
    
    window.setTimeout(() => {
      onCreated({
        name,
        available: Number(available),
        execution: Number(execution),
        score: Number(score),
        group,
        bonus,
      });
    }, 800);
  };

  return (
    <>
      <main className="content task-content">
        <Header level={15} xp={1450} progress={50} compact />
        <form className={`task-card ${success ? "task-card--success" : ""}`} onSubmit={submit}>
          <div className="task-card__title">
            <span>
              <img src={icons.plus} alt="" />
            </span>
            <div>
              <h1>Nueva Misión Académica</h1>
              <p>Ingresa los datos para calcular su índice de prioridad</p>
            </div>
          </div>
          <label className="field">
            <span>
              NOMBRE DE LA ACTIVIDAD <b>*</b>
            </span>
            <input
              id="task-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Informe de Física, Examen de Cálculo..."
              required
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span>TIEMPO DISP. (HRS)</span>
              <input
                type="number"
                min="1"
                value={available}
                onChange={(event) => setAvailable(event.target.value)}
              />
            </label>
            <label className="field">
              <span>TIEMPO EJEC. (HRS)</span>
              <input
                type="number"
                min="1"
                value={execution}
                onChange={(event) => setExecution(event.target.value)}
              />
            </label>
          </div>
          <label className="field field--select">
            <span>PUNTAJE BASE DE LA TAREA (PTS)</span>
            <select value={score} onChange={(event) => setScore(event.target.value)}>
              <option value="100">100 pts - Proyecto / Informe Final</option>
              <option value="150">150 pts - Proyecto / Informe Final</option>
              <option value="50">50 pts - Examen / Prueba</option>
            </select>
            <img src={icons.chevron} alt="" />
          </label>
          <div className="multipliers">
            <Toggle
              checked={group}
              onChange={() => setGroup((value) => !value)}
              label="¿Es Actividad Grupal?"
              description="Multiplicador x1.5 por consumo de recursos"
              icon={icons.usersForm}
            />
            <Toggle
              checked={bonus}
              onChange={() => setBonus((value) => !value)}
              label="Activar Bono Desafío"
              description="Multiplicador x1.5 por bonus de preguntas"
              icon={icons.zapForm}
            />
          </div>
          <button type="submit" className="submit-task">
            <img src={success ? icons.calculatorSuccess : icons.calculator} alt="" />
            Calcular y Registrar Tarea
          </button>
        </form>
      </main>
      <BottomNav active="new-task" go={go} />
    </>
  );
}

function Focus({ go }: { go: (view: View) => void }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <main className="content focus-content">
        <Header level={15} xp={1450} progress={50} compact />
        <section className="focus-card">
          <div className="session-label">
            <img src={icons.target} alt="" />
            Sesión de Productividad
          </div>
          <div className="focus-copy">
            <h1>
              {running
                ? "“La forma más rápida de hacer muchas cosas es hacer solo una a la vez.”"
                : "Selecciona una misión para iniciar"}
            </h1>
            <p>Completa tus sesiones de estudio para ganar XP extra</p>
          </div>
          <div className={`timer-face ${running ? "timer-face--running" : ""}`}>
            <img src={running ? icons.runningRing : icons.ring} alt="" />
            <div className="timer-face__readout">
              <strong>
                {minutes}:{remainder}
              </strong>
              {!running && <span>POMODORO</span>}
            </div>
          </div>
          <div className="focus-controls">
            <button type="button" onClick={() => setRunning((value) => !value)}>
              {running ? "Detener" : "Iniciar"}
            </button>
            <button
              type="button"
              aria-label="Reiniciar temporizador"
              onClick={() => {
                setSeconds(25 * 60);
                setRunning(false);
              }}
            >
              <img src={icons.restart} alt="" />
            </button>
          </div>
        </section>
      </main>
      <BottomNav active="focus" go={go} />
    </>
  );
}

function FileStatus({ loaded, go }: { loaded: boolean; go: (view: View) => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => go(loaded ? "missions" : "loaded"), loaded ? 700 : 800);
    return () => window.clearTimeout(id);
  }, [go, loaded]);

  return (
    <>
      <Header level={15} xp={1450} progress={50} />
      <main className="content file-content">
        <div className="section-title">
          <strong>ORDEN DE MISIONES</strong>
        </div>
        <section className="file-card">
          {!loaded && <h1>Cargando tu archivo...</h1>}
          {loaded ? <strong>¡Cargado!</strong> : <img src={icons.loading} alt="" />}
        </section>
      </main>
      <BottomNav active="missions" go={go} />
    </>
  );
}

export default function App() {
  const [view, setView] = useState<View>("missions");
  const [missions, setMissions] = useState(initialMissions);
  const [completed, setCompleted] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const complete = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      setCompleted((value) => value + 1);
      window.setTimeout(() => {
        setMissions((items) => items.filter((item) => item.id !== id));
      }, 350);
    };
    window.addEventListener("complete-mission", complete);
    return () => window.removeEventListener("complete-mission", complete);
  }, []);

  const go = (next: View) => setView(next);

  return (
    <div className="app">
      <input
        ref={fileRef}
        className="file-input"
        type="file"
        accept=".pdf,application/pdf"
        onChange={(event) => {
          if (event.target.files?.length) setView("loading");
          event.target.value = "";
        }}
      />
      {view === "missions" && (
        <Missions
          missions={missions}
          completed={completed}
          go={go}
          upload={() => fileRef.current?.click()}
        />
      )}
      {view === "new-task" && (
        <NewTask
          go={go}
          onCreated={(payload) => {
            const resultadoHeuristico = PSOGWOOptimizer.calcularPrioridadYRecompensa({
              tiempoDisponible: payload.available,
              tiempoEjecucion: payload.execution,
              puntajeBase: payload.score,
              esGrupal: payload.group,
              tieneBonus: payload.bonus,
            });

            setMissions((items) => [
              {
                id: `T${items.length + 1}`,
                title: payload.name,
                time: `${payload.available}h restantes`,
                score: resultadoHeuristico.puntajeFinal,
                group: payload.group,
                bonus: payload.bonus,
              },
              ...items,
            ]);
            setView("missions");
          }}
        />
      )}
      {view === "focus" && <Focus go={go} />}
      {view === "loading" && <FileStatus loaded={false} go={go} />}
      {view === "loaded" && <FileStatus loaded go={go} />}
    </div>
  );
}
