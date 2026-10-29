
const form = document.getElementById("form-transacao");
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const tipoInput = document.getElementById("tipo");

const saldoElemento = document.getElementById("saldo");
const receitasElemento = document.getElementById("receitas");
const despesasElemento = document.getElementById("despesas");
const listaElemento = document.getElementById("lista-transacoes");

let transacoes = [];

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function atualizarResumo() {
  const receitas = transacoes
    .filter(item => item.tipo === "receita")
    .reduce((total, item) => total + item.valor, 0);

  const despesas = transacoes
    .filter(item => item.tipo === "despesa")
    .reduce((total, item) => total + item.valor, 0);

  const saldo = receitas - despesas;

  receitasElemento.textContent = formatarMoeda(receitas);
  despesasElemento.textContent = formatarMoeda(despesas);
  saldoElemento.textContent = formatarMoeda(saldo);

  saldoElemento.style.color =
    saldo < 0 ? "#f87171" : "#60a5fa";
}

function renderizarTransacoes() {
  listaElemento.replaceChildren();

  if (transacoes.length === 0) {
    const mensagem = document.createElement("li");
    mensagem.className = "vazio";
    mensagem.textContent = "Nenhuma movimentação cadastrada.";
    listaElemento.appendChild(mensagem);
    return;
  }

  transacoes.forEach(item => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "transacao-info";

    const descricao = document.createElement("strong");
    descricao.textContent = item.descricao;

    const tipo = document.createElement("small");
    tipo.textContent =
      item.tipo === "receita" ? "Receita" : "Despesa";

    info.append(descricao, tipo);

    const valor = document.createElement("span");
    valor.className =
      item.tipo === "receita"
        ? "valor-receita"
        : "valor-despesa";

    const sinal = item.tipo === "receita" ? "+" : "-";
    valor.textContent = `${sinal} ${formatarMoeda(item.valor)}`;

    const excluir = document.createElement("button");
    excluir.className = "botao-excluir";
    excluir.textContent = "Excluir";
    excluir.setAttribute(
      "aria-label",
      `Excluir ${item.descricao}`
    );

    excluir.addEventListener("click", () => {
      transacoes = transacoes.filter(
        transacao => transacao.id !== item.id
      );

      atualizarResumo();
      renderizarTransacoes();
    });

    li.append(info, valor, excluir);
    listaElemento.appendChild(li);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const descricao = descricaoInput.value.trim();
  const valor = Number(valorInput.value);
  const tipo = tipoInput.value;

  if (!descricao || !Number.isFinite(valor) || valor <= 0) {
    alert("Informe uma descrição e um valor maior que zero.");
    return;
  }

  transacoes.push({
    id: crypto.randomUUID(),
    descricao,
    valor,
    tipo
  });

  atualizarResumo();
  renderizarTransacoes();

  form.reset();
  descricaoInput.focus();
});

atualizarResumo();
renderizarTransacoes();

localStorage.setItem("teste", "Olá, mundo!");

console.log(localStorage.getItem("teste"));