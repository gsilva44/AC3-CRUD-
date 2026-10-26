const API = '/alunos';
const form = document.getElementById('form');
const lista = document.getElementById('lista');
const mensagem = document.getElementById('mensagem');
const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoCurso = document.getElementById('curso');
const cancelar = document.getElementById('cancelar');
const botaoSalvar = document.getElementById('salvar');
let alunos = [];

function aviso(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'erro' : 'sucesso';
}
async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.erro || 'Falha na solicitação.');
  return body;
}
function resetarForm() {
  form.reset();
  campoId.value = '';
  botaoSalvar.textContent = 'Cadastrar aluno';
  document.getElementById('titulo-form').textContent = 'Novo aluno';
  cancelar.hidden = true;
}
function celula(tr, value) {
  const td = document.createElement('td');
  td.textContent = String(value);
  tr.appendChild(td);
  return td;
}
async function carregar() {
  try {
    alunos = await request(API);
    lista.replaceChildren();
    if (!alunos.length) {
      const tr = document.createElement('tr');
      const td = celula(tr, 'Nenhum aluno cadastrado.');
      td.colSpan = 5;
      lista.appendChild(tr);
      return;
    }
    for (const aluno of alunos) {
      const tr = document.createElement('tr');
      for (const atributo of ['id', 'nome', 'email', 'curso']) celula(tr, aluno[atributo]);
      const acoes = document.createElement('td');
      const editar = document.createElement('button');
      editar.className = 'secondary';
      editar.textContent = 'Editar';
      editar.addEventListener('click', () => {
        campoId.value = aluno.id;
        campoNome.value = aluno.nome;
        campoEmail.value = aluno.email;
        campoCurso.value = aluno.curso;
        botaoSalvar.textContent = 'Salvar alterações';
        document.getElementById('titulo-form').textContent = 'Editar aluno';
        cancelar.hidden = false;
        campoNome.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      const excluir = document.createElement('button');
      excluir.className = 'danger';
      excluir.textContent = 'Excluir';
      excluir.addEventListener('click', async () => {
        if (!confirm(`Excluir o cadastro de ${aluno.nome}?`)) return;
        try {
          await request(`${API}/${aluno.id}`, { method: 'DELETE' });
          if (campoId.value === String(aluno.id)) resetarForm();
          await carregar();
          aviso('Aluno excluído com sucesso.');
        } catch (err) { aviso(err.message, true); }
      });
      acoes.append(editar, excluir);
      tr.appendChild(acoes);
      lista.appendChild(tr);
    }
  } catch (err) { aviso(`Erro ao carregar alunos: ${err.message}`, true); }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const editando = Boolean(campoId.value);
  const dados = { nome: campoNome.value.trim(), email: campoEmail.value.trim(), curso: campoCurso.value.trim() };
  try {
    await request(editando ? `${API}/${campoId.value}` : API, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    resetarForm();
    await carregar();
    aviso(editando ? 'Aluno atualizado com sucesso.' : 'Aluno cadastrado com sucesso.');
  } catch (err) { aviso(err.message, true); }
});
cancelar.addEventListener('click', resetarForm);
document.getElementById('atualizar').addEventListener('click', carregar);
carregar();
