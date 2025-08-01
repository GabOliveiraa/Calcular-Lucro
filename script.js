document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formProduto');
  const tabelaBody = document.querySelector('#tabelaProdutos tbody');
  let produtos = [];

  // Carrega dados do localStorage ao iniciar
  carregarDoLocalStorage();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = document.getElementById('nomeProduto').value.trim();
    const custo = parseFloat(document.getElementById('valorCusto').value);
    const venda = parseFloat(document.getElementById('valorVenda').value);

    if (nome === '' || isNaN(custo) || isNaN(venda)) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    produtos.push({ nome, custo, venda });
    salvarNoLocalStorage();
    atualizarTabela();
    form.reset();
  });

  function atualizarTabela() {
    tabelaBody.innerHTML = '';
    produtos.forEach((produto, index) => {
      const lucro = (produto.venda - produto.custo).toFixed(2);
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="nome">${produto.nome}</td>
        <td class="custo">R$ ${produto.custo.toFixed(2)}</td>
        <td class="venda">R$ ${produto.venda.toFixed(2)}</td>
        <td class="lucro" style="color:${lucro >= 0 ? 'green' : 'red'};">R$ ${lucro}</td>
        <td class="acoes">
          <button class="btn btn-editar">Editar</button>
          <button class="btn btn-excluir">Excluir</button>
        </td>
      `;

      // Excluir produto
      tr.querySelector('.btn-excluir').addEventListener('click', () => {
        produtos.splice(index, 1);
        salvarNoLocalStorage();
        atualizarTabela();
      });

      // Editar produto
      tr.querySelector('.btn-editar').addEventListener('click', function () {
        if (this.textContent === 'Editar') {
          const nomeTD = tr.querySelector('.nome');
          const custoTD = tr.querySelector('.custo');
          const vendaTD = tr.querySelector('.venda');

          nomeTD.innerHTML = `<input type="text" value="${produto.nome}" class="edit-nome" />`;
          custoTD.innerHTML = `<input type="number" value="${produto.custo}" step="0.01" class="edit-custo" />`;
          vendaTD.innerHTML = `<input type="number" value="${produto.venda}" step="0.01" class="edit-venda" />`;

          this.textContent = 'Salvar';
        } else {
          const novoNome = tr.querySelector('.edit-nome').value.trim();
          const novoCusto = parseFloat(tr.querySelector('.edit-custo').value);
          const novoVenda = parseFloat(tr.querySelector('.edit-venda').value);

          if(novoNome === '' || isNaN(novoCusto) || isNaN(novoVenda)) {
            alert('Preencha todos os campos corretamente!');
            return;
          }

          produtos[index] = { nome: novoNome, custo: novoCusto, venda: novoVenda };
          salvarNoLocalStorage();
          atualizarTabela();
        }
      });

      tabelaBody.appendChild(tr);
    });
  }

  document.getElementById('btnCalcularLucro').addEventListener('click', () => {
    let total = 0;
    produtos.forEach(p => {
      total += p.venda - p.custo;
    });

    document.getElementById('totalLucro').textContent = `Total de Lucro: R$ ${total.toFixed(2)}`;
  });

  document.getElementById('btnSalvarPDF').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const rows = [];
    let totalLucro = 0;

    produtos.forEach(p => {
      const lucro = p.venda - p.custo;
      totalLucro += lucro;
      rows.push([p.nome, `R$ ${p.custo.toFixed(2)}`, `R$ ${p.venda.toFixed(2)}`, `R$ ${lucro.toFixed(2)}`]);
    });

    const headers = [['Produto', 'Custo', 'Venda', 'Lucro']];
    doc.setFontSize(18);
    doc.text('Planilha de Lucros', 14, 22);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 30,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [0, 123, 255] },
      theme: 'grid',
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(14);
    doc.text(`Total de Lucro: R$ ${totalLucro.toFixed(2)}`, 14, finalY + 10);

    doc.save('planilha_lucro.pdf');
  });

  // Exportar JSON
  window.exportarDados = function() {
    const dados = JSON.stringify(produtos, null, 2);
    const blob = new Blob([dados], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "planilha-lucro.json";
    document.body.appendChild(link); // necessário para alguns navegadores
    link.click();
    document.body.removeChild(link);
  }

  // Importar JSON
  window.importarDados = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const dadosImportados = JSON.parse(e.target.result);
        if (Array.isArray(dadosImportados)) {
          produtos = dadosImportados;
          salvarNoLocalStorage();
          atualizarTabela();
          alert("Importação concluída!");
        } else {
          alert("Arquivo inválido.");
        }
      } catch (err) {
        alert("Erro ao importar o arquivo.");
      }
    };
    reader.readAsText(file);
  }

  function salvarNoLocalStorage() {
    localStorage.setItem('planilhaLucro', JSON.stringify(produtos));
  }

  function carregarDoLocalStorage() {
    const dados = localStorage.getItem('planilhaLucro');
    if (dados) {
      produtos = JSON.parse(dados);
      atualizarTabela();
    }
  }
});
