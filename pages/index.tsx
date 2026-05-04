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

  const cargarPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) setPedidos(data);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Sistema Super Roca</h1>

      <input placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
      <br /><br />

      <input placeholder="Producto" value={producto} onChange={(e) => setProducto(e.target.value)} />
      <br /><br />

      <input placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
      <br /><br />

      <input placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
      <br /><br />

      <button onClick={guardarPedido}>Guardar Pedido</button>

      <h2>Pedidos registrados</h2>

      {pedidos.map((pedido) => (
        <div key={pedido.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <p><strong>Cliente:</strong> {pedido.cliente}</p>
          <p><strong>Producto:</strong> {pedido.producto}</p>
          <p><strong>Cantidad:</strong> {pedido.cantidad}</p>
          <p><strong>Precio:</strong> {pedido.precio}</p>
        </div>
      ))}
    </div>
  );
}
