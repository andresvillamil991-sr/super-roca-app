import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [pedidos, setPedidos] = useState<any[]>([]);

  const guardarPedido = async () => {
    if (!cliente || !producto || !cantidad || !precio) {
      alert("Por favor completa todos los campos");
      return;
    }

    const { error } = await supabase.from("pedidos").insert({
      cliente,
      producto,
      cantidad: Number(cantidad),
      precio: Number(precio),
    });

    if (error) {
      alert("Error al guardar");
    } else {
      alert("Pedido guardado");
      setCliente("");
      setProducto("");
      setCantidad("");
      setPrecio("");
      cargarPedidos();
    }
  };

  const cargarPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setPedidos(data);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Sistema Super Roca</h1>

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />
      <br />
      <input
        placeholder="Producto"
        value={producto}
        onChange={(e) => setProducto(e.target.value)}
      />
      <br />
      <input
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
      />
      <br />
      <input
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <br />
      <button onClick={guardarPedido}>Guardar Pedido</button>

      <h2>Pedidos registrados</h2>

      {pedidos.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", marginTop: 10, padding: 10 }}>
          <p><b>Cliente:</b> {p.cliente}</p>
          <p><b>Producto:</b> {p.producto}</p>
          <p><b>Cantidad:</b> {p.cantidad}</p>
          <p><b>Precio:</b> {p.precio}</p>
        </div>
      ))}
    </div>
  );
}
