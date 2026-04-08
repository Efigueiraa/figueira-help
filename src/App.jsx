import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection, addDoc, onSnapshot
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

const ADMIN = "efigueira@mesquitaconstrucoes.com.br";

export default function App() {
  const [user, setUser] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [titulo, setTitulo] = useState("");

  async function login() {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "chamados"), (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (user.email !== ADMIN) {
        data = data.filter(c => c.usuario === user.email);
      }
      setChamados(data);
    });

    return () => unsub();
  }, [user]);

  async function novoChamado() {
    await addDoc(collection(db, "chamados"), {
      titulo,
      usuario: user.email,
      status: "Aberto",
      createdAt: new Date()
    });
    setTitulo("");
  }

  if (!user) {
    return (
      <div style={{padding:20}}>
        <h2>Figueira Help PRO</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h2>Painel</h2>

      <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Novo chamado"/>
      <button onClick={novoChamado}>Criar</button>

      {chamados.map(c => (
        <div key={c.id} style={{marginTop:10, border:'1px solid #ccc', padding:10}}>
          <b>{c.titulo}</b><br/>
          {c.status}<br/>
          <small>{c.usuario}</small>
        </div>
      ))}
    </div>
  );
}
