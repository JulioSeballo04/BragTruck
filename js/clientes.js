let clientesCache = [];
function chaveCliente(c){
  const base = (c.cnpjcpf || c.cliente || '').toLowerCase().replace(/\D/g,'') || (c.cliente || '').toLowerCase();
  return base.replace(/[\/\.\s]/g,'_').slice(0,120) || null;
}
function preencherCamposCliente(c){
  document.getElementById('cliente').value = c.cliente || '';
  document.getElementById('cnpjcpf').value = c.cnpjcpf || '';
  document.getElementById('telefone').value = c.telefone || '';
  document.getElementById('endereco').value = c.endereco || '';
  document.getElementById('numero').value = c.numero || '';
  document.getElementById('bairro').value = c.bairro || '';
  document.getElementById('cidade').value = c.cidade || '';
  document.getElementById('uf').value = c.uf || '';
  document.getElementById('cliente-busca').value = c.cliente || '';
  document.getElementById('cliente-busca-lista').style.display = 'none';
}

function renderClienteBusca(){
  const termo = document.getElementById('cliente-busca').value.trim().toLowerCase();
  const lista = document.getElementById('cliente-busca-lista');
  if(!termo){ lista.style.display = 'none'; lista.innerHTML = ''; return; }
  const resultados = clientesCache.filter(c =>
    (c.cliente||'').toLowerCase().includes(termo) ||
    (c.telefone||'').includes(termo) ||
    (c.cnpjcpf||'').includes(termo)
  ).slice(0,8);
  lista.innerHTML = resultados.length
    ? resultados.map(c => `<div class="geo-item" onclick="selecionarClienteBusca('${chaveCliente(c)}')">${c.cliente}${c.telefone ? ' — ' + c.telefone : ''}</div>`).join('')
    : '<div class="empty-state" style="padding:12px;">Nenhum cadastro encontrado — continue preenchendo os campos abaixo para cadastrar um novo cliente.</div>';
  lista.style.display = 'block';
}

function selecionarClienteBusca(chave){
  const c = clientesCache.find(x => chaveCliente(x) === chave);
  if(c) preencherCamposCliente(c);
}
async function upsertCliente(dadosCliente){
  if(!dadosCliente.cliente) return;
  const novo = {
    cliente: dadosCliente.cliente, cnpjcpf: dadosCliente.cnpjcpf, telefone: dadosCliente.telefone,
    endereco: dadosCliente.endereco, numero: dadosCliente.numero,
    bairro: dadosCliente.bairro, cidade: dadosCliente.cidade, uf: dadosCliente.uf,
    placaVeiculo: dadosCliente.placa || ''
  };
  const chave = chaveCliente(novo);
  if(!chave) return;
  try{ await db.collection('clientes').doc(chave).set(novo); }
  catch(e){ console.error('Erro ao salvar cliente no Firestore:', e); }
}
// Mantém o cadastro de clientes sincronizado em tempo real com o Firestore
db.collection('clientes').onSnapshot(snap => {
  clientesCache = snap.docs.map(d => d.data());
}, err => console.error('Erro ao ler clientes do Firestore:', err));
// ===== Clientes Cadastrados (tela de consulta) =====
function abrirClientes(){ showScreen('screen-clientes'); renderClientesList(); }

function renderClientesList(){
  const el = document.getElementById('lista-clientes');
  if(!el) return;
  if(!clientesCache.length){ el.innerHTML = '<div class="empty-state">Nenhum cliente cadastrado ainda.</div>'; return; }
  el.innerHTML = clientesCache.map(c => `
    <div class="list-card">
      <strong>${c.cliente}</strong>
      <div class="sub">${c.telefone || 'Sem telefone'}${c.cnpjcpf ? ' · ' + c.cnpjcpf : ''}</div>
      <div class="sub">${[c.endereco, c.numero, c.bairro, c.cidade && (c.cidade + (c.uf ? '/' + c.uf : ''))].filter(Boolean).join(', ')}</div>
      <div class="row">
        <button class="use-btn" onclick="usarCliente('${chaveCliente(c)}')">Usar em nova OS</button>
        <button class="delete-btn" onclick="excluirCliente('${chaveCliente(c)}')">Excluir dados</button>
      </div>
    </div>
  `).join('');
}

function usarCliente(chave){
  const c = clientesCache.find(x => chaveCliente(x) === chave);
  showScreen('screen-os');
  if(c) preencherCamposCliente(c);
}

async function excluirCliente(chave){
  const c = clientesCache.find(x => chaveCliente(x) === chave);
  if(!c) return;
  if(!confirm(`Excluir os dados de "${c.cliente}"? Essa ação não pode ser desfeita.`)) return;
  try{ await db.collection('clientes').doc(chave).delete(); }
  catch(e){ console.error('Erro ao excluir cliente no Firestore:', e); alert('Não foi possível excluir. Tente novamente.'); }
}
