import { useState } from "react";
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

  const guardarPedido = async () => {
    const { error } = await supabase.from("pedidos").insert([
      {
        cliente,
        producto,
        cantidad: Number(cantidad),
        precio: Number(precio),
      },
    ]);

    if (error) {
      alert("Error al guardar");
      console.log(error);
    } else {
      alert("Pedido guardado");
      setCliente("");
      setProducto("");
      setCantidad("");
      setPrecio("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Sistema Super Roca</h1>

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      /><br /><br />

      <input
        placeholder="Producto"
        value={producto}
        onChange={(e) => setProducto(e.target.value)}
      /><br /><br />

      <input
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
      /><br /><br />

      <input
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      /><br /><br />

      <button onClick={guardarPedido}>
        Guardar Pedido
      </button>
    </div>
  );
}
