import { useEffect, useState } from "react";
import { db, auth, storage } from "./firebase";
import {
  collection, addDoc, onSnapshot, updateDoc, doc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  ref, uploadBytes, getDownloadURL
} from "firebase/storage";

export default function App() {
  const [user, setUser] = useState(null);
  const [chamados, setChamados] = useState([]);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [titulo, setTitulo] = useState("");
  const [arquivo, setArquivo] = useState(null);

  // LOGIN
  async function login() {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  function logout() {
    signOut(auth);
  }

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // TEMPO REAL
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "chamados"), (snapshot) => {
      setChamados(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  // NOVO CHAMADO COM IMAGEM
  async function novoChamado() {
    let url = "";

    if (arquivo) {
      const storageRef = ref(storage, "chamados/" + arquivo.name);
      await uploadBytes(storageRef, arquivo);
      url = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "chamados"), {
      titulo,
      status: "Aberto",
      usuario: user.email,
      imagem: url,
      data: new Date()
    });

    setTitulo("");
    setArquivo(null);
  }

  async function atualizarStatus(id, status) {
    await updateDoc(doc(db, "chamados", id), { status });
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={center}>
        <div style={card}>
          <h2>Figueira Help</h2>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
          <button onClick={login}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={bg}>

      <div style={header}>
        <h3>Figueira Help</h3>
        <button onClick={logout}>Sair</button>
      </div>

      <div style={content}>
        <h2>Chamados</h2>

        <input
          placeholder="Título"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />

        <input type="file" onChange={e => setArquivo(e.target.files[0])} />

        <button onClick={novoChamado}>Criar</button>

        {chamados.map(c => (
          <div key={c.id} style={card}>
            <b>{c.titulo}</b>
            <br />
            {c.status}
            <br />
            <small>{c.usuario}</small>

            {c.imagem && (
              <img src={c.imagem} width="100%" />
            )}

            <div>
              <button onClick={() => atualizarStatus(c.id, "Andamento")}>▶</button>
              <button onClick={() => atualizarStatus(c.id, "Finalizado")}>✔</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// STYLE
const bg = { background: "#0a0a0a", color: "#fff", minHeight: "100vh" };
const header = { display: "flex", justifyContent: "space-between", padding: 15 };
const content = { padding: 20 };
const card = { background: "#1a1a1a", padding: 15, marginTop: 10 };
const center = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };