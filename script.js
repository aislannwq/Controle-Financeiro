

// ==========================
// ELEMENTOS DO HTML
// ==========================

const form = document.getElementById("form-transacao");

const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const tipoInput = document.getElementById("tipo");
const categoriaInput = document.getElementById("categoria");
const mesFiltroInput = document.getElementById("mes-filtro");

const saldoElemento = document.getElementById("saldo");
const receitasElemento = document.getElementById("receitas");
const despesasElemento = document.getElementById("despesas");

const saldoMesElemento = document.getElementById("saldo-mes");
const receitasMesElemento = document.getElementById("receitas-mes");
const despesasMesElemento = document.getElementById("despesas-mes");

const tituloHistoricoElemento =
  document.getElementById("titulo-historico");

const listaElemento = document.getElementById("lista-transacoes");
const listaCategoriasElemento =
  document.getElementById("lista-categorias");

let graficoFinanceiro = null;
let graficoCategorias = null;

// ==========================
// CATEGORIAS FINANCEIRAS
// ==========================

const categorias = {
  receita: [
    "Salário",
    "Freelance",
    "Investimentos",
    "Vendas",
    "Presente",
    "Outros"
  ],

  despesa: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Contas",
    "Assinaturas",
    "Outros"
  ]
};

// ==========================
// CORES DO GRÁFICO
// ==========================

const coresCategorias = [
  "#60a5fa",
  "#a78bfa",
  "#f59e0b",
  "#4ade80",
  "#f87171",
  "#22d3ee",
  "#fb923c",
  "#e879f9",
  "#a3e635",
  "#94a3b8"
];

// ==========================
// ATUALIZAR CATEGORIAS
// ==========================

function atualizarCategorias() {
  const tipoSelecionado = tipoInput.value;
  const listaCategorias = categorias[tipoSelecionado] || [];

  categoriaInput.replaceChildren();

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = "Selecione uma categoria";

  categoriaInput.appendChild(opcaoInicial);

  listaCategorias.forEach(categoria => {
    const opcao = document.createElement("option");

    opcao.value = categoria;
    opcao.textContent = categoria;

    categoriaInput.appendChild(opcao);
  });
}

// ==========================
// UTILITÁRIOS DE DATA
// ==========================

function obterDataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return "Data não informada";
  }

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarMes(mes) {
  if (!/^\d{4}-\d{2}$/.test(mes)) {
    return "Todos os períodos";
  }

  const [ano, numeroMes] = mes.split("-");

  const data = new Date(
    Number(ano),
    Number(numeroMes) - 1,
    1
  );

  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });
}

// ==========================
// CARREGAR TRANSAÇÕES
// ==========================

function carregarTransacoes() {
  try {
    const dados = localStorage.getItem("transacoes");
    const dadosConvertidos = dados ? JSON.parse(dados) : [];

    if (!Array.isArray(dadosConvertidos)) {
      return [];
    }

    return dadosConvertidos
      .filter(item =>
        item &&
        typeof item.descricao === "string" &&
        Number.isFinite(Number(item.valor)) &&
        Number(item.valor) > 0 &&
        ["receita", "despesa"].includes(item.tipo)
      )
      .map(item => ({
        ...item,
        valor: Number(item.valor),
        id: item.id ?? `${Date.now()}-${Math.random()}`,
        data: item.data || obterDataHoje(),
        categoria:
          typeof item.categoria === "string" && item.categoria.trim()
            ? item.categoria
            : "Não categorizado"
      }));
  } catch (erro) {
    console.error("Erro ao carregar as transações:", erro);
    return [];
  }
}

let transacoes = carregarTransacoes();

// ==========================
// SALVAR TRANSAÇÕES
// ==========================

function salvarTransacoes() {
  try {
    localStorage.setItem(
      "transacoes",
      JSON.stringify(transacoes)
    );

    return true;
  } catch (erro) {
    console.error("Erro ao salvar as transações:", erro);
    alert("Não foi possível salvar os dados neste navegador.");
    return false;
  }
}

// ==========================
// FORMATAR VALORES EM REAIS
// ==========================

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// ==========================
// CALCULAR TOTAIS
// ==========================

function calcularTotais(lista) {
  const receitas = lista
    .filter(item => item.tipo === "receita")
    .reduce((total, item) => total + item.valor, 0);

  const despesas = lista
    .filter(item => item.tipo === "despesa")
    .reduce((total, item) => total + item.valor, 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas
  };
}

// ==========================
// ATUALIZAR RESUMO GERAL
// ==========================

function atualizarResumoGeral() {
  const totais = calcularTotais(transacoes);

  receitasElemento.textContent = formatarMoeda(totais.receitas);
  despesasElemento.textContent = formatarMoeda(totais.despesas);
  saldoElemento.textContent = formatarMoeda(totais.saldo);

  saldoElemento.style.color =
    totais.saldo < 0 ? "#f87171" :
    totais.saldo > 0 ? "#4ade80" :
    "#f1f5f9";
}

// ==========================
// FILTRAR TRANSAÇÕES POR MÊS
// ==========================

function obterTransacoesDoPeriodo() {
  const mesSelecionado = mesFiltroInput.value;

  if (!mesSelecionado) {
    return transacoes;
  }

  return transacoes.filter(item =>
    typeof item.data === "string" &&
    item.data.startsWith(`${mesSelecionado}-`)
  );
}

// ==========================
// ATUALIZAR RESUMO MENSAL
// ==========================

function atualizarResumoMensal() {
  const transacoesDoPeriodo = obterTransacoesDoPeriodo();
  const totais = calcularTotais(transacoesDoPeriodo);

  receitasMesElemento.textContent = formatarMoeda(totais.receitas);
  despesasMesElemento.textContent = formatarMoeda(totais.despesas);
  saldoMesElemento.textContent = formatarMoeda(totais.saldo);

  saldoMesElemento.style.color =
    totais.saldo < 0 ? "#f87171" :
    totais.saldo > 0 ? "#4ade80" :
    "#f1f5f9";

  const mesSelecionado = mesFiltroInput.value;

  tituloHistoricoElemento.textContent = mesSelecionado
    ? `Movimentações de ${formatarMes(mesSelecionado)}`
    : "Todas as movimentações";
}

// ==========================
// ATUALIZAR GRÁFICO FINANCEIRO
// ==========================

function atualizarGrafico() {
  const canvas = document.getElementById("grafico-financeiro");

  if (!canvas || typeof Chart === "undefined") {
    console.error("Gráfico financeiro não encontrado ou Chart.js indisponível.");
    return;
  }

  const totais = calcularTotais(obterTransacoesDoPeriodo());

  const dados = {
    labels: ["Receitas", "Despesas"],
    datasets: [{
      label: "Valor em reais",
      data: [totais.receitas, totais.despesas],
      backgroundColor: ["#4ade80", "#f87171"],
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 65
    }]
  };

  const configuracoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: contexto =>
            `${contexto.label}: ${formatarMoeda(contexto.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#cbd5e1"
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#94a3b8",
          callback: valor =>
            valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0
            })
        },
        grid: {
          color: "rgba(148, 163, 184, 0.12)"
        }
      }
    }
  };

  if (graficoFinanceiro) {
    graficoFinanceiro.data = dados;
    graficoFinanceiro.update();
  } else {
    graficoFinanceiro = new Chart(canvas, {
      type: "bar",
      data: dados,
      options: configuracoes
    });
  }
}

// ==========================
// AGRUPAR DESPESAS POR CATEGORIA
// ==========================

function obterDespesasPorCategoria() {
  const despesas = obterTransacoesDoPeriodo().filter(item =>
    item.tipo === "despesa"
  );

  const agrupamento = {};

  despesas.forEach(item => {
    const categoria = item.categoria || "Não categorizado";

    agrupamento[categoria] =
      (agrupamento[categoria] || 0) + item.valor;
  });

  return Object.entries(agrupamento)
    .map(([categoria, valor]) => ({
      categoria,
      valor
    }))
    .sort((a, b) => b.valor - a.valor);
}

// ==========================
// ATUALIZAR GRÁFICO DE CATEGORIAS
// ==========================

function atualizarGraficoCategorias() {
  const canvas = document.getElementById("grafico-categorias");

  if (!canvas || typeof Chart === "undefined") {
    console.error("Gráfico de categorias não encontrado ou Chart.js indisponível.");
    return;
  }

  const despesas = obterDespesasPorCategoria();

  const labels = despesas.map(item => item.categoria);
  const valores = despesas.map(item => item.valor);

  const cores = despesas.map((item, indice) =>
    coresCategorias[indice % coresCategorias.length]
  );

  const dados = {
    labels,
    datasets: [{
      data: valores,
      backgroundColor: cores,
      borderColor: "#172337",
      borderWidth: 3,
      hoverOffset: 8
    }]
  };

  const configuracoes = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5e1",
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle"
        }
      },
      tooltip: {
        callbacks: {
          label: contexto => {
            const total = valores.reduce(
              (soma, valor) => soma + valor,
              0
            );

            const percentual = total > 0
              ? (contexto.raw / total) * 100
              : 0;

            return `${contexto.label}: ${formatarMoeda(contexto.raw)} (${percentual.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  if (graficoCategorias) {
    graficoCategorias.data = dados;
    graficoCategorias.update();
  } else {
    graficoCategorias = new Chart(canvas, {
      type: "doughnut",
      data: dados,
      options: configuracoes
    });
  }
}

// ==========================
// ATUALIZAR RANKING DE DESPESAS
// ==========================

function atualizarRankingCategorias() {
  listaCategoriasElemento.replaceChildren();

  const despesas = obterDespesasPorCategoria();

  if (despesas.length === 0) {
    const mensagem = document.createElement("li");

    mensagem.className = "vazio";
    mensagem.textContent =
      "Nenhuma despesa cadastrada neste período.";

    listaCategoriasElemento.appendChild(mensagem);
    return;
  }

  const totalDespesas = despesas.reduce(
    (total, item) => total + item.valor,
    0
  );

  despesas.forEach((item, indice) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "categoria-info";

    const nome = document.createElement("strong");
    nome.textContent = `${indice + 1}º lugar — ${item.categoria}`;

    const percentual = document.createElement("small");

    const porcentagem = totalDespesas > 0
      ? (item.valor / totalDespesas) * 100
      : 0;

    percentual.textContent = `${porcentagem.toFixed(1).replace(".", ",")}% das despesas`;

    const valor = document.createElement("span");
    valor.className = "categoria-valor";
    valor.textContent = formatarMoeda(item.valor);

    info.append(nome, percentual);
    li.append(info, valor);

    listaCategoriasElemento.appendChild(li);
  });
}

// ==========================
// EXIBIR HISTÓRICO
// ==========================

function renderizarTransacoes() {
  listaElemento.replaceChildren();

  const transacoesDoPeriodo = obterTransacoesDoPeriodo();

  if (transacoesDoPeriodo.length === 0) {
    const mensagem = document.createElement("li");

    mensagem.className = "vazio";
    mensagem.textContent = mesFiltroInput.value
      ? "Nenhuma movimentação encontrada neste mês."
      : "Nenhuma movimentação cadastrada.";

    listaElemento.appendChild(mensagem);
    return;
  }

  const transacoesOrdenadas = [...transacoesDoPeriodo].sort((a, b) =>
    (b.data || "").localeCompare(a.data || "")
  );

  transacoesOrdenadas.forEach(item => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "transacao-info";

    const descricao = document.createElement("strong");
    descricao.textContent = item.descricao;

    const tipo = document.createElement("small");
    tipo.textContent =
      `${item.tipo === "receita" ? "Receita" : "Despesa"} • ${formatarData(item.data)}`;

    const categoria = document.createElement("small");
    categoria.textContent = `Categoria: ${item.categoria}`;

    info.append(descricao, tipo, categoria);

    const valor = document.createElement("span");

    valor.className =
      item.tipo === "receita"
        ? "valor-receita"
        : "valor-despesa";

    const sinal = item.tipo === "receita" ? "+" : "-";
    valor.textContent = `${sinal} ${formatarMoeda(item.valor)}`;

    const excluir = document.createElement("button");

    excluir.type = "button";
    excluir.className = "botao-excluir";
    excluir.textContent = "Excluir";

    excluir.setAttribute(
      "aria-label",
      `Excluir ${item.descricao}`
    );

    excluir.addEventListener("click", () => {
      const transacoesAnteriores = transacoes;

      transacoes = transacoes.filter(
        transacao => transacao.id !== item.id
      );

      if (!salvarTransacoes()) {
        transacoes = transacoesAnteriores;
        return;
      }

      atualizarTudo();
    });

    li.append(info, valor, excluir);
    listaElemento.appendChild(li);
  });
}

// ==========================
// ATUALIZAR TODA A INTERFACE
// ==========================

function atualizarTudo() {
  atualizarResumoGeral();
  atualizarResumoMensal();
  renderizarTransacoes();
  atualizarGrafico();
  atualizarGraficoCategorias();
  atualizarRankingCategorias();
}

// ==========================
// CADASTRAR TRANSAÇÕES
// ==========================

form.addEventListener("submit", event => {
  event.preventDefault();

  const descricao = descricaoInput.value.trim();
  const valor = Number(valorInput.value);
  const data = dataInput.value;
  const tipo = tipoInput.value;
  const categoria = categoriaInput.value;

  if (
    !descricao ||
    !Number.isFinite(valor) ||
    valor <= 0 ||
    !data ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    !["receita", "despesa"].includes(tipo) ||
    !categorias[tipo]?.includes(categoria)
  ) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const novaTransacao = {
    id: `${Date.now()}-${Math.random()}`,
    descricao,
    valor,
    data,
    tipo,
    categoria
  };

  transacoes.push(novaTransacao);

  if (!salvarTransacoes()) {
    transacoes.pop();
    return;
  }

  atualizarTudo();

  form.reset();
  dataInput.value = obterDataHoje();
  atualizarCategorias();
  descricaoInput.focus();
});

// ==========================
// EVENTOS
// ==========================

tipoInput.addEventListener("change", atualizarCategorias);

mesFiltroInput.addEventListener("change", atualizarTudo);

// ==========================
// INICIALIZAR A APLICAÇÃO
// ==========================

dataInput.value = obterDataHoje();

atualizarCategorias();
atualizarTudo();
