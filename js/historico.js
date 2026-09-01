// ===== Histórico de Ordens de Serviço =====
let ordensCache = [];
db.collection('ordens').orderBy('criadoEm','desc').onSnapshot(snap => {
  ordensCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderHistorico();
}, err => console.error('Erro ao ler histórico do Firestore:', err));

function abrirHistorico(){ showScreen('screen-historico'); renderHistorico(); }

function renderHistorico(){
  const el = document.getElementById('lista-historico');
  if(!el) return;
  if(!ordensCache.length){ el.innerHTML = '<div class="empty-state">Nenhuma ordem de serviço emitida ainda.</div>'; return; }
  el.innerHTML = ordensCache.map(o => `
    <div class="list-card">
      <strong>${o.cliente || 'Sem nome'}</strong>
      <div class="sub">${o.veiculo || ''}${o.placa ? ' — ' + o.placa : ''}</div>
      <div class="sub">Data: ${o.data || '-'} · Total: R$ ${o.total || '0,00'}</div>
      <div class="row">
        <button class="use-btn" onclick="baixarPdfHistorico('${o.id}')">Baixar PDF novamente</button>
      </div>
    </div>
  `).join('');
}

function baixarPdfHistorico(id){
  const o = ordensCache.find(x => x.id === id);
  if(!o) return;
  const { doc, nomeArquivo } = montarPDF(o.dados);
  doc.save(nomeArquivo);
}
