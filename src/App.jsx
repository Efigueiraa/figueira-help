import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc
} from "firebase/firestore";

export default function App() {
  const [tab, setTab] = useState("dashboard");
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
      status: "Aberto",
      data: new Date()
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
      nome: ativoNome,
      status: "Ativo"
    });
    setAtivoNome("");
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ background: "#0b0b0b", color: "#fff", minHeight: "100vh", paddingBottom: 70 }}>
      
      {/* HEADER */}
      <div style={{ textAlign: "center", padding: 20 }}>
        <img src="/logo.png" width="70" />
        <h2>Figueira Help</h2>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div style={{ padding: 20 }}>
          <h3>Dashboard</h3>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={card}>Chamados<br /><b>{chamados.length}</b></div>
            <div style={card}>Ativos<br /><b>{ativos.length}</b></div>
          </div>
        </div>
      )}

      {/* CHAMADOS */}
      {tab === "chamados" && (
        <div style={{ padding: 20 }}>
          <h3>Chamados</h3>

          <input
            placeholder="Novo chamado"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            style={input}
          />
          <button onClick={novoChamado} style={btn}>Criar</button>

          {chamados.map(c => (
            <div key={c.id} style={card}>
              {c.titulo}
              <br />
              <small>{c.status}</small>
              {c.status !== "Finalizado" && (
                <button onClick={() => finalizar(c.id)} style={btnSmall}>Finalizar</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ATIVOS */}
      {tab === "ativos" && (
        <div style={{ padding: 20 }}>
          <h3>Ativos</h3>

          <input
            placeholder="Novo ativo"
            value={ativoNome}
            onChange={e => setAtivoNome(e.target.value)}
            style={input}
          />
          <button onClick={novoAtivo} style={btn}>Adicionar</button>

          {ativos.map(a => (
            <div key={a.id} style={card}>{a.nome}</div>
          ))}
        </div>
      )}

      {/* MENU */}
      <div style={menu}>
        <button onClick={() => setTab("dashboard")} style={menuBtn}>🏠</button>
        <button onClick={() => setTab("chamados")} style={menuBtn}>🎫</button>
        <button onClick={() => setTab("ativos")} style={menuBtn}>💻</button>
      </div>
    </div>
  );
}

const card = {
  background: "#1a1a1a",
  padding: 15,
  borderRadius: 10,
  marginTop: 10
};

const input = {
  padding: 10,
  width: "100%",
  marginTop: 10,
  borderRadius: 5,
  border: "none"
};

const btn = {
  marginTop: 10,
  padding: 10,
  width: "100%",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 5
};

const btnSmall = {
  marginTop: 10,
  padding: 5,
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 5
};

const menu = {
  position: "fixed",
  bottom: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-around",
  background: "#111",
  padding: 10
};

const menuBtn = {
  background: "none",
  color: "#fff",
  border: "none",
  fontSize: 20
};
