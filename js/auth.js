// ===== Login / logout (usuário único do dono da Brag Truck) =====
firebase.auth().onAuthStateChanged(function(user){
  showScreen(user ? 'screen-home' : 'screen-login');
});

async function fazerLogin(){
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  const erroEl = document.getElementById('login-erro');
  erroEl.style.display = 'none';
  try{
    await firebase.auth().signInWithEmailAndPassword(email, senha);
    // Recarrega para que as listas (clientes/veículos/histórico) sejam
    // buscadas do Firestore já com o usuário autenticado.
    location.reload();
  }catch(e){
    erroEl.textContent = 'E-mail ou senha inválidos.';
    erroEl.style.display = 'block';
  }
}

function fazerLogout(){
  firebase.auth().signOut();
}
