let veiculosCache = [];
function chaveVeiculo(vc){
  const base = (vc.placa || '').toUpperCase().replace(/\s/g,'');
  return base.replace(/[\/\.]/g,'_') || null;
}
function preencherCamposVeiculo(vc){
  document.getElementById('veiculo').value = vc.veiculo || '';
  document.getElementById('cor').value = vc.cor || '';
  document.getElementById('ano').value = vc.ano || '';
  document.getElementById('placa').value = vc.placa || '';
  document.getElementById('veiculo-busca').value = vc.veiculo ? `${vc.veiculo} — ${vc.placa || ''}` : '';
  document.getElementById('veiculo-busca-lista').style.display = 'none';
}

function renderVeiculoBusca(){
  const termo = document.getElementById('veiculo-busca').value.trim().toLowerCase();
  const lista = document.getElementById('veiculo-busca-lista');
  if(!termo){ lista.style.display = 'none'; lista.innerHTML = ''; return; }
  const resultados = veiculosCache.filter(vc =>
    (vc.veiculo||'').toLowerCase().includes(termo) ||
    (vc.placa||'').toLowerCase().includes(termo)
  ).slice(0,8);
  lista.innerHTML = resultados.length
    ? resultados.map(vc => `<div class="geo-item" onclick="selecionarVeiculoBusca('${chaveVeiculo(vc)}')">${vc.veiculo} — ${vc.placa}</div>`).join('')
    : '<div class="empty-state" style="padding:12px;">Nenhum cadastro encontrado — continue preenchendo os campos abaixo para cadastrar um novo veículo.</div>';
  lista.style.display = 'block';
}

function selecionarVeiculoBusca(chave){
  const vc = veiculosCache.find(x => chaveVeiculo(x) === chave);
  if(vc) preencherCamposVeiculo(vc);
}
async function upsertVeiculo(dadosCliente){
  if(!dadosCliente.veiculo || !dadosCliente.placa) return;
  const novo = { veiculo: dadosCliente.veiculo, cor: dadosCliente.cor, ano: dadosCliente.ano, placa: dadosCliente.placa };
  const chave = chaveVeiculo(novo);
  if(!chave) return;
  try{ await db.collection('veiculos').doc(chave).set(novo); }
  catch(e){ console.error('Erro ao salvar veículo no Firestore:', e); }
}
// Mantém o cadastro de veículos sincronizado em tempo real com o Firestore
db.collection('veiculos').onSnapshot(snap => {
  veiculosCache = snap.docs.map(d => d.data());
}, err => console.error('Erro ao ler veículos do Firestore:', err));
// ===== Veículos Cadastrados (tela de consulta) =====
function abrirVeiculos(){ showScreen('screen-veiculos'); renderVeiculosList(); }

function renderVeiculosList(){
  const el = document.getElementById('lista-veiculos');
  if(!el) return;
  if(!veiculosCache.length){ el.innerHTML = '<div class="empty-state">Nenhum veículo cadastrado ainda.</div>'; return; }
  el.innerHTML = veiculosCache.map(vc => `
    <div class="list-card">
      <strong>${vc.veiculo}</strong>
      <div class="sub">Placa: ${vc.placa || '-'}${vc.cor ? ' · Cor: ' + vc.cor : ''}${vc.ano ? ' · Ano: ' + vc.ano : ''}</div>
      <div class="row">
        <button class="use-btn" onclick="usarVeiculo('${chaveVeiculo(vc)}')">Usar em nova OS</button>
        <button class="delete-btn" onclick="excluirVeiculo('${chaveVeiculo(vc)}')">Excluir dados</button>
      </div>
    </div>
  `).join('');
}

function usarVeiculo(chave){
  const vc = veiculosCache.find(x => chaveVeiculo(x) === chave);
  showScreen('screen-os');
  if(vc) preencherCamposVeiculo(vc);
}

async function excluirVeiculo(chave){
  const vc = veiculosCache.find(x => chaveVeiculo(x) === chave);
  if(!vc) return;
  if(!confirm(`Excluir os dados do veículo "${vc.veiculo} — ${vc.placa}"? Essa ação não pode ser desfeita.`)) return;
  try{ await db.collection('veiculos').doc(chave).delete(); }
  catch(e){ console.error('Erro ao excluir veículo no Firestore:', e); alert('Não foi possível excluir. Tente novamente.'); }
}
