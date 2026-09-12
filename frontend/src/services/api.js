const API_BASE = "/api"

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  })

  const contentType = response.headers.get("content-type") || ""
  const data = contentType.includes("application/json")
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(data?.message || "Nao foi possivel concluir a solicitacao.")
  }

  return data
}

export const tarefasApi = {
  listar: () => request("/tarefas"),
  criar: (tarefa) => request("/nova", {
    method: "POST",
    body: JSON.stringify(tarefa)
  }),
  editar: (id, tarefa) => request(`/alterar/${id}`, {
    method: "PUT",
    body: JSON.stringify(tarefa)
  }),
  atualizar: (id, campos) => request(`/alterar/${id}`, {
    method: "PATCH",
    body: JSON.stringify(campos)
  }),
  remover: (id) => request(`/tarefas/${id}`, { method: "DELETE" })
}