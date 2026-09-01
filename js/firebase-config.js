// ===== Configuração e inicialização do Firebase =====
// Projeto Firestore compartilhado entre todos os aparelhos que usam o app.

const firebaseConfig = {
  apiKey: "AIzaSyAh8K__XIRxuBcylcHm-uPHvfuUQNHeaZI",
  authDomain: "brag-truck.firebaseapp.com",
  projectId: "brag-truck",
  storageBucket: "brag-truck.firebasestorage.app",
  messagingSenderId: "866919088429",
  appId: "1:866919088429:web:8f52c7df8e2d5283fe53a4"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
