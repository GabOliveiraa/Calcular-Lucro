const form = document.getElementById('formProduto');
const tabelaBody = document.querySelector('#tabelaProdutos tbody');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = document.getElementById('nomeProduto').value.trim();
  const custo = parseFloat(document.getElementById('valorCusto').value);
  const venda = parseFloat(document.getElementById('valorVenda').value);

  if(nome === '' || isNaN(custo) || isNaN(venda)) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  adicionarProduto(nome, custo, venda);
  form.reset();
});

function adicionarProduto(nome, custo, venda) {
  const lucro = (venda - custo).toFixed(2);
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="nome">${nome}</td>
    <td class="custo">R$ ${custo.toFixed(2)}</td>
    <td class="venda">R$ ${venda.toFixed(2)}</td>
    <td class="lucro" style="color:${lucro >= 0 ? 'green' : 'red'};">R$ ${lucro}</td>
    <td class="acoes">
      <button class="btn btn-editar">Editar</button>
      <button class="btn btn-excluir">Excluir</button>
    </td>
  `;

  const btnEditar = tr.querySelector('.btn-editar');
  const btnExcluir = tr.querySelector('.btn-excluir');

  btnExcluir.addEventListener('click', () => {
    tr.remove();
  });

  btnEditar.addEventListener('click', () => {
    if (btnEditar.textContent === 'Editar') {
      // Troca texto por inputs
      const nomeTD = tr.querySelector('.nome');
      const custoTD = tr.querySelector('.custo');
      const vendaTD = tr.querySelector('.venda');

      const nome = nomeTD.textContent;
      const custo = parseFloat(custoTD.textContent.replace('R$', '').trim());
      const venda = parseFloat(vendaTD.textContent.replace('R$', '').trim());

      nomeTD.innerHTML = `<input type="text" value="${nome}" class="edit-nome" />`;
      custoTD.innerHTML = `<input type="number" value="${custo}" step="0.01" class="edit-custo" />`;
      vendaTD.innerHTML = `<input type="number" value="${venda}" step="0.01" class="edit-venda" />`;

      btnEditar.textContent = 'Salvar';
      btnEditar.classList.remove('btn-editar');
      btnEditar.classList.add('btn-salvar');
    } else {
      // Salva valores e volta para modo visual
      const novoNome = tr.querySelector('.edit-nome').value.trim();
      const novoCusto = parseFloat(tr.querySelector('.edit-custo').value);
      const novoVenda = parseFloat(tr.querySelector('.edit-venda').value);
      const novoLucro = (novoVenda - novoCusto).toFixed(2);

      tr.querySelector('.nome').textContent = novoNome;
      tr.querySelector('.custo').textContent = `R$ ${novoCusto.toFixed(2)}`;
      tr.querySelector('.venda').textContent = `R$ ${novoVenda.toFixed(2)}`;
      const lucroEl = tr.querySelector('.lucro');
      lucroEl.textContent = `R$ ${novoLucro}`;
      lucroEl.style.color = novoLucro >= 0 ? 'green' : 'red';

      btnEditar.textContent = 'Editar';
      btnEditar.classList.remove('btn-salvar');
      btnEditar.classList.add('btn-editar');
    }
  });

  tabelaBody.appendChild(tr);
}
document.getElementById('btnCalcularLucro').addEventListener('click', () => {
  let total = 0;
  document.querySelectorAll('#tabelaProdutos tbody tr').forEach(row => {
    const lucroTexto = row.querySelector('.lucro').textContent.replace('R$', '').trim();
    total += parseFloat(lucroTexto);
  });

  document.getElementById('totalLucro').textContent = `Total de Lucro: R$ ${total.toFixed(2)}`;
});
document.getElementById('btnSalvarPDF').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Pega os dados da tabela
  const rows = [];
  let totalLucro = 0;
  document.querySelectorAll('#tabelaProdutos tbody tr').forEach(row => {
    const nome = row.querySelector('.nome').textContent.trim();
    const custo = row.querySelector('.custo').textContent.trim();
    const venda = row.querySelector('.venda').textContent.trim();
    const lucroTexto = row.querySelector('.lucro').textContent.trim();
    
    // Remover R$ e converter para número para somar
    const lucroNumero = parseFloat(lucroTexto.replace('R$', '').replace(',', '.'));
    totalLucro += isNaN(lucroNumero) ? 0 : lucroNumero;

    rows.push([nome, custo, venda, lucroTexto]);
  });

  // Cabeçalho da tabela no PDF
  const headers = [['Produto', 'Custo', 'Venda', 'Lucro']];

  // Título no PDF
  doc.setFontSize(18);
  doc.text('Planilha de Lucros', 14, 22);

  // Adiciona a tabela no PDF
  doc.autoTable({
    head: headers,
    body: rows,
    startY: 30,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [0, 123, 255] },
    theme: 'grid',
  });

  // Adiciona o total após a tabela
  const finalY = doc.lastAutoTable.finalY || 40; // posição vertical após a tabela
  doc.setFontSize(14);
  doc.text(`Total de Lucro: R$ ${totalLucro.toFixed(2)}`, 14, finalY + 10);

  // Salva e baixa o PDF
  doc.save('planilha_lucro.pdf');
});

