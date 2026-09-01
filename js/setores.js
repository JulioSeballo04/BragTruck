const SETORES = [
  { nome: "Eixo Dianteiro", itens: [
    "Embuchamento manga de eixo","Cambagem de eixo","Caster de eixo","Set back de eixo",
    "Convergência de eixo","Balanceamento de roda dianteira","Troca de lona"
  ]},
  { nome: "Eixo Traseiro", itens: [
    "Ângulo de impulso eixo carcaça","Ângulo de impulso eixo Truck","Cambagem eixo Truck",
    "Revisão braço tirante eixo carcaça","Revisão braço tirante eixo Truck",
    "Troca de Lona Carcaça","Troca de Lona Truck"
  ]},
  { nome: "Cardans", itens: [
    "Trocar Cruzeta primeiro cardan","Trocar Cruzeta segundo cardan","Trocar Cruzeta terceiro cardan",
    "Trocar Cruzeta quarto cardan","Trocar luva de cardan","Trocar ponteira do primeiro cardan",
    "Trocar garfo de solda cardan","Fazer alinhamento em cardan"
  ]},
  { nome: "Geometria", itens: [
    "Serviço de Geometria - TruckCenter"
  ]},
  { nome: "Compra de Peças", itens: [
    "Reparo Mangas de Eixo","Barra de Direção Pequena","Barra de Direção Grande","Terminais de Barra",
    "Retentor de Rodas","Rolamento Pequeno de Roda","Rolamento Grande de Roda","Graxa"
  ]}
];

const setoresDiv = document.getElementById('setores');
SETORES.forEach((setor, sIdx) => {
  const wrap = document.createElement('div');
  wrap.className = 'setor';
  wrap.innerHTML = `<div class="setor-title">${setor.nome}</div>
    <div class="col-head"><span>Serviço/Peça</span><span>Qtd</span><span>Autorizado</span><span>Valor</span></div>`;
  setor.itens.forEach((item, iIdx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    const id = `s${sIdx}i${iIdx}`;
    row.innerHTML = `
      <span class="item-name">${item}</span>
      <input type="number" min="0" id="${id}-qtd" placeholder="0">
      <div class="toggle" id="${id}-toggle">
        <button type="button" class="sim" onclick="setAut('${id}','sim')">SIM</button>
        <button type="button" class="nao" onclick="setAut('${id}','nao')">NÃO</button>
      </div>
      <input type="number" min="0" id="${id}-valor" placeholder="R$">
    `;
    wrap.appendChild(row);
  });
  setoresDiv.appendChild(wrap);
});

// Recalcula o total automaticamente sempre que um valor for digitado
setoresDiv.addEventListener('input', (e) => {
  if(e.target.id && e.target.id.endsWith('-valor')){
    calcularTotal();
  }
});

function setAut(id, val){
  const toggle = document.getElementById(id+'-toggle');
  toggle.dataset.aut = val;
  toggle.querySelector('.sim').classList.toggle('active', val==='sim');
  toggle.querySelector('.nao').classList.toggle('active', val==='nao');
}

function coletarDados(){
  const cliente = {
    cliente: v('cliente'), cnpjcpf: v('cnpjcpf'), telefone: v('telefone'),
    data: v('data'), endereco: v('endereco'), numero: v('numero'), bairro: v('bairro'),
    cidade: v('cidade'), uf: v('uf'), veiculo: v('veiculo'), cor: v('cor'), ano: v('ano'),
    placa: v('placa'), previsao: v('previsao')
  };
  const fechamento = {
    total: v('total'), pagamento: formaPagamentoTexto(), sinal: v('sinal'), restante: v('restante')
  };
  const setoresData = SETORES.map((setor, sIdx) => ({
    nome: setor.nome,
    itens: setor.itens.map((item, iIdx) => {
      const id = `s${sIdx}i${iIdx}`;
      const toggle = document.getElementById(id+'-toggle');
      return {
        nome: item,
        qtd: v(id+'-qtd'),
        autorizado: toggle.dataset.aut || '',
        valor: v(id+'-valor')
      };
    }).filter(it => it.qtd || it.autorizado || it.valor)
  })).filter(s => s.itens.length>0);
  return { cliente, fechamento, setoresData };
}

function v(id){ return document.getElementById(id).value.trim(); }
