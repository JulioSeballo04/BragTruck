function calcularTotal(){
  let soma = 0;
  document.querySelectorAll('[id$="-valor"]').forEach(inp => {
    const n = parseFloat(inp.value);
    if(!isNaN(n)) soma += n;
  });
  document.getElementById('total').value = soma.toFixed(2);
  atualizarRestante();
}

function atualizarRestante(){
  const total = parseFloat(document.getElementById('total').value) || 0;
  const sinal = parseFloat(document.getElementById('sinal').value) || 0;
  const restante = total - sinal;
  document.getElementById('restante').value = restante > 0 ? restante.toFixed(2) : '0.00';
}
document.getElementById('sinal').addEventListener('input', atualizarRestante);

function onPagamentoChange(){
  const forma = document.getElementById('pagamento').value;
  const creditoDiv = document.getElementById('credito-opcoes');
  const parcelasDiv = document.getElementById('parcelas-opcoes');
  if(forma === 'Crédito'){
    creditoDiv.style.display = 'block';
    onCreditoTipoChange();
  }else{
    creditoDiv.style.display = 'none';
    parcelasDiv.style.display = 'none';
  }
}

function onCreditoTipoChange(){
  const tipo = document.getElementById('credito-tipo').value;
  const parcelasDiv = document.getElementById('parcelas-opcoes');
  parcelasDiv.style.display = (tipo === 'parcelado') ? 'block' : 'none';
}

function formaPagamentoTexto(){
  const forma = document.getElementById('pagamento').value;
  if(!forma) return '';
  if(forma === 'Crédito'){
    const tipo = document.getElementById('credito-tipo').value;
    if(tipo === 'parcelado'){
      const parcelas = document.getElementById('parcelas').value || '?';
      return `Crédito - Parcelado em ${parcelas}x`;
    }
    return 'Crédito - À vista';
  }
  return forma;
}

function montarPDF(dadosProntos){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const dados = dadosProntos || coletarDados();
  const marginX = 40;
  let y = 40;

  doc.setFillColor(15,92,102);
  doc.rect(0,0,595,60,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(16);
  doc.text('BRAG TRUCK', marginX, 28);
  doc.setFontSize(8);
  doc.text('J. A. dos Reis e Cia. Ltda  ·  CNPJ 43.184.411/0001-97', marginX, 42);
  doc.text('Rua Josephina Lossaso Pereira da Silva, 84 - Jardim Sao Miguel, Braganca Paulista/SP', marginX, 53);
  doc.setTextColor(0,0,0);
  y = 78;

  doc.setFontSize(11);
  doc.setFont(undefined,'bold');
  doc.text('ORDEM DE SERVICO', marginX, y);
  doc.setFont(undefined,'normal');
  doc.setFontSize(9);
  doc.text('Garantia de mao de obra: 90 dias', 400, y);
  y += 16;

  const c = dados.cliente;
  const linhasCliente = [
    [`Cliente: ${c.cliente}`, `Data: ${c.data}`],
    [`CNPJ/CPF: ${c.cnpjcpf}`, `Telefone: ${c.telefone}`],
    [`Endereco: ${c.endereco}, ${c.numero}`, `Bairro: ${c.bairro}`],
    [`Cidade: ${c.cidade}`, `UF: ${c.uf}`],
    [`Veiculo: ${c.veiculo}`, `Cor: ${c.cor}`],
    [`Ano: ${c.ano}`, `Placa: ${c.placa}`],
    [`Previsao de entrega: ${c.previsao}`, ``],
  ];
  doc.setFontSize(9);
  linhasCliente.forEach(par => {
    doc.text(par[0], marginX, y);
    doc.text(par[1], 320, y);
    y += 14;
  });
  y += 6;

  dados.setoresData.forEach(setor => {
    const body = setor.itens.map(it => [
      it.nome, it.qtd || '-', it.autorizado ? it.autorizado.toUpperCase() : '-',
      it.valor ? `R$ ${it.valor}` : '-'
    ]);
    doc.autoTable({
      startY: y,
      head: [[setor.nome, 'Qtd', 'Autorizado', 'Valor']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [27,127,140], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      margin: { left: marginX, right: marginX },
      columnStyles: { 0:{cellWidth:270}, 1:{cellWidth:50}, 2:{cellWidth:80}, 3:{cellWidth:80} }
    });
    y = doc.lastAutoTable.finalY + 14;
    if(y > 700){ doc.addPage(); y = 40; }
  });

  if(y > 680){ doc.addPage(); y = 40; }
  doc.setFillColor(255,244,243);
  doc.rect(marginX, y, 515, 24, 'F');
  doc.setTextColor(138,46,38);
  doc.setFontSize(8);
  doc.text('SERVICOS NAO AUTORIZADOS: GEOMETRIA COMPLETA DO VEICULO NAO TEM GARANTIA', marginX+8, y+15);
  doc.setTextColor(0,0,0);
  y += 40;

  const f = dados.fechamento;
  doc.setFontSize(10);
  doc.text(`Total: R$ ${f.total || '-'}`, marginX, y);
  doc.text(`Forma de pagamento: ${f.pagamento || '-'}`, 300, y);
  y += 16;
  doc.text(`Sinal: R$ ${f.sinal || '-'}`, marginX, y);
  doc.text(`Restante: R$ ${f.restante || '-'}`, 300, y);
  y += 50;

  doc.line(marginX, y, 260, y);
  doc.line(320, y, 540, y);
  doc.setFontSize(8);
  doc.text('Assinatura do Cliente', marginX, y+12);
  doc.text('Assinatura do Profissional', 320, y+12);

  const nomeArquivo = `OS_${(c.cliente||'cliente').replace(/\s+/g,'_')}_${c.data||''}.pdf`;
  return { doc, dados, nomeArquivo };
}

function telefoneParaWa(tel){
  // Deixa só dígitos e garante código do país (55 = Brasil) se não informado
  let digits = (tel || '').replace(/\D/g, '');
  if(!digits) return null;
  if(digits.length <= 11) digits = '55' + digits; // DDD + número sem código do país
  return digits;
}

async function gerarPDF(){
  const { doc, dados, nomeArquivo } = montarPDF();

  // Salva/atualiza o cliente e o veículo cadastrados
  await upsertCliente(dados.cliente);
  await upsertVeiculo(dados.cliente);

  // Salva a OS no histórico (guarda os dados completos p/ reimpressão depois)
  try{
    await db.collection('ordens').add({
      dados: dados,
      cliente: dados.cliente.cliente || '',
      veiculo: dados.cliente.veiculo || '',
      placa: dados.cliente.placa || '',
      data: dados.cliente.data || '',
      total: dados.fechamento.total || '',
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  }catch(e){ console.error('Erro ao salvar histórico no Firestore:', e); }

  // 1) Sempre baixa o PDF no aparelho
  doc.save(nomeArquivo);

  // 2) Já abre o WhatsApp do cliente para encaminhar
  const telWa = telefoneParaWa(dados.cliente.telefone);
  const mensagem = `Segue ordem de serviço do trabalho.`;
  const blob = doc.output('blob');
  const arquivo = new File([blob], nomeArquivo, { type: 'application/pdf' });

  // Tenta compartilhamento nativo (anexa o PDF direto, se o telefone suportar)
  if(navigator.canShare && navigator.canShare({ files: [arquivo] })){
    try{
      await navigator.share({
        files: [arquivo],
        title: 'Ordem de Serviço BRAG TRUCK',
        text: mensagem
      });
      return;
    }catch(e){
      // usuário cancelou o compartilhamento nativo ou não deu certo; cai no fallback abaixo
    }
  }

  // Fallback: abre a conversa do WhatsApp do cliente com a mensagem pronta.
  // O PDF já foi baixado (passo 1) — é só anexar manualmente pela pasta de Downloads.
  const url = telWa
    ? `https://wa.me/${telWa}?text=${encodeURIComponent(mensagem)}`
    : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}
