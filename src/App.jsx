import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc
} from "firebase/firestore";

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [ativoNome, setAtivoNome] = useState("");

  async function carregar() {
    const c = await getDocs(collection(db, "chamados"));
    const a = await getDocs(collection(db, "ativos"));
    setChamados(c.docs.map(d => ({ id: d.id, ...d.data() })));
    setAtivos(a.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function novoChamado() {
    await addDoc(collection(db, "chamados"), {
      titulo,
      status: "Aberto"
    });
    setTitulo("");
    carregar();
  }

  async function finalizar(id) {
    await updateDoc(doc(db, "chamados", id), {
      status: "Finalizado"
    });
    carregar();
  }

  async function novoAtivo() {
    await addDoc(collection(db, "ativos"), {
      nome: ativoNome
    });
    setAtivoNome("");
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Figueira Help</h2>

      <h3>Chamados</h3>
      <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Novo chamado"/>
      <button onClick={novoChamado}>Criar</button>

      {chamados.map(c => (
        <div key={c.id}>
          {c.titulo} - {c.status}
          {c.status !== "Finalizado" && (
            <button onClick={() => finalizar(c.id)}>Finalizar</button>
          )}
        </div>
      ))}

      <h3>Ativos</h3>
      <input value={ativoNome} onChange={e => setAtivoNome(e.target.value)} placeholder="Novo ativo"/>
      <button onClick={novoAtivo}>Adicionar</button>

      {ativos.map(a => (
        <div key={a.id}>{a.nome}</div>
      ))}
    </div>
  );
}
