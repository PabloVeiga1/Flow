import { useEffect, useState } from "react"
import { tarefasApi } from "./services/api"

const STATUS_OPTIONS = ["Pendente", "Em andamento", "Concluída"]

function formatStatus(status) {
  return String(status || "Pendente")
}

function normalizeStatus(status) {
  return formatStatus(status).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function App() {
  const [activePage, setActivePage] = useState("overview")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [search, setSearch] = useState("")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isComposerOpen, setIsComposerOpen] = useState(false)

  async function loadTasks() {
    setLoading(true)
    setError("")
    try {
      const data = await tarefasApi.listar()
      setTasks(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function saveTask(formData) {
    setActionLoading(true)
    setError("")
    setNotice("")
    try {
      if (editingTask) {
        await tarefasApi.editar(editingTask.id, formData)
        setNotice("Tarefa atualizada.")
      } else {
        await tarefasApi.criar(formData)
        setNotice("Tarefa adicionada.")
      }
      await loadTasks()
      setEditingTask(null)
      setIsComposerOpen(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function changeStatus(task, status) {
    setActionLoading(true)
    setError("")
    setNotice("")
    try {
      await tarefasApi.atualizar(task.id, { status })
      await loadTasks()
      setNotice("Status atualizado.")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Excluir a tarefa "${task.nomTarefa}"?`)) return

    setActionLoading(true)
    setError("")
    setNotice("")
    try {
      await tarefasApi.remover(task.id)
      await loadTasks()
      setNotice("Tarefa excluida.")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const visibleTasks = tasks.filter((task) =>
    String(task.nomTarefa || "").toLowerCase().includes(search.toLowerCase())
  )
  const completedCount = tasks.filter((task) => normalizeStatus(task.status) === "concluida").length
  const inProgressCount = tasks.filter((task) => normalizeStatus(task.status) === "em andamento").length

  function selectPage(page) {
    setActivePage(page)
    setMobileNavOpen(false)
  }

  function openNewTask() {
    setEditingTask(null)
    setIsComposerOpen(true)
  }

  function openEditTask(task) {
    setEditingTask(task)
    setIsComposerOpen(true)
  }

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-button"
        type="button"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        aria-label="Abrir menu"
      >
        <span />
        <span />
        <span />
      </button>
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
        </div>
        <div className="workspace-switcher">
          <span className="workspace-avatar">P</span>
          <span>Meu workspace</span>
          <span className="muted-chevron">⌄</span>
        </div>
        <nav className="sidebar-nav" aria-label="Navegacao principal">
          <p className="nav-label">Workspace</p>
          <button className={`nav-item ${activePage === "overview" ? "active" : ""}`} onClick={() => selectPage("overview")} type="button">
            <span className="nav-icon">⌂</span> Visao geral
          </button>
          <button className={`nav-item ${activePage === "tasks" ? "active" : ""}`} onClick={() => selectPage("tasks")} type="button">
            <span className="nav-icon">☷</span> Tarefas <span className="nav-count">{tasks.length}</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Meu workspace</span><b>/</b><strong>{activePage === "tasks" ? "Tarefas" : "Visao geral"}</strong></div>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div>
              <p className="eyebrow">{activePage === "tasks" ? "Organizacao" : "Bom dia, Pablo"}</p>
              <h1>{activePage === "tasks" ? "Tarefas" : "Visao geral"}</h1>
              <p className="page-description">{activePage === "tasks" ? "Acompanhe o que precisa da sua atencao." : "Um resumo simples para manter o ritmo do seu dia."}</p>
            </div>
            <button className="primary-button" type="button" onClick={openNewTask}><span>+</span> Nova tarefa</button>
          </section>

          {error && <div className="feedback error-feedback" role="alert"><span>!</span>{error}<button type="button" onClick={() => setError("")}>Fechar</button></div>}
          {notice && <div className="feedback success-feedback" role="status"><span>✓</span>{notice}<button type="button" onClick={() => setNotice("")}>Fechar</button></div>}

          {activePage === "overview" && (
            <section className="overview-grid">
              <article className="stat-card stat-card-accent"><span className="stat-label">Total de tarefas</span><strong>{tasks.length}</strong><small>Itens no workspace</small></article>
              <article className="stat-card"><span className="stat-label">Em andamento</span><strong>{inProgressCount}</strong><small>Pedem sua atencao agora</small></article>
              <article className="stat-card"><span className="stat-label">Concluidas</span><strong>{completedCount}</strong><small>Um passo de cada vez</small></article>
            </section>
          )}

          <section className="tasks-section">
            <div className="section-heading">
              <div><h2>{activePage === "overview" ? "Suas tarefas" : "Todas as tarefas"}</h2><p>{visibleTasks.length} {visibleTasks.length === 1 ? "item" : "itens"}</p></div>
              <div className="list-actions"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarefas" /></label><button className="filter-button" type="button" onClick={loadTasks} disabled={loading || actionLoading}>↻ <span>Atualizar</span></button></div>
            </div>

            {loading ? <div className="state-box"><div className="spinner" />Carregando tarefas...</div> : visibleTasks.length === 0 ? <div className="state-box empty-state"><div className="empty-icon">□</div><h3>{search ? "Nenhuma tarefa encontrada" : "Seu espaco esta livre"}</h3><p>{search ? "Tente buscar por outro termo." : "Adicione uma tarefa para comecar a organizar seu dia."}</p>{!search && <button className="secondary-button" type="button" onClick={openNewTask}>Criar primeira tarefa</button>}</div> : <div className="task-list">{visibleTasks.map((task) => <TaskRow key={task.id} task={task} disabled={actionLoading} onEdit={openEditTask} onDelete={deleteTask} onStatusChange={changeStatus} />)}</div>}
          </section>
        </div>
      </main>

      {isComposerOpen && <TaskModal task={editingTask} loading={actionLoading} onClose={() => { setIsComposerOpen(false); setEditingTask(null) }} onSubmit={saveTask} />}
    </div>
  )
}

function TaskRow({ task, disabled, onEdit, onDelete, onStatusChange }) {
  const status = formatStatus(task.status)
  return <article className="task-row">
    <button className={`status-check ${normalizeStatus(status) === "concluida" ? "checked" : ""}`} type="button" disabled={disabled} onClick={() => onStatusChange(task, normalizeStatus(status) === "concluida" ? "Pendente" : "Concluída")} aria-label={`Marcar ${task.nomTarefa} como concluida`}>{normalizeStatus(status) === "concluida" ? "✓" : ""}</button>
    <div className="task-main"><h3>{task.nomTarefa || "Tarefa sem nome"}</h3><span className={`status-pill status-${normalizeStatus(status).replaceAll(" ", "-")}`}>{status}</span></div>
    <div className="task-actions"><select value={status} onChange={(event) => onStatusChange(task, event.target.value)} disabled={disabled} aria-label={`Status de ${task.nomTarefa}`}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}{!STATUS_OPTIONS.includes(status) && <option value={status}>{status}</option>}</select><button type="button" onClick={() => onEdit(task)} disabled={disabled}>Editar</button><button className="delete-button" type="button" onClick={() => onDelete(task)} disabled={disabled} aria-label={`Excluir ${task.nomTarefa}`}>×</button></div>
  </article>
}

function TaskModal({ task, loading, onClose, onSubmit }) {
  const [name, setName] = useState(task?.nomTarefa || "")
  const [status, setStatus] = useState(task?.status || STATUS_OPTIONS[0])
  const [validationError, setValidationError] = useState("")

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setValidationError("Informe um nome para a tarefa.")
      return
    }
    onSubmit({ nomTarefa: name.trim(), status })
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><p className="eyebrow">{task ? "Editar item" : "Novo item"}</p><h2 id="modal-title">{task ? "Editar tarefa" : "Criar tarefa"}</h2></div><button type="button" className="close-button" onClick={onClose} aria-label="Fechar">×</button></div>
      <form onSubmit={handleSubmit}><label>Nome da tarefa<input autoFocus value={name} onChange={(event) => { setName(event.target.value); setValidationError("") }} placeholder="Ex.: Revisar planejamento da semana" /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>{validationError && <p className="validation-error">{validationError}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose} disabled={loading}>Cancelar</button><button className="primary-button" type="submit" disabled={loading}>{loading ? "Salvando..." : task ? "Salvar alteracoes" : "Criar tarefa"}</button></div></form>
    </div>
  </div>
}

export default App