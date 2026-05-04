import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Item = {
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

export default function Home() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);

  const agregarProducto = () => {
    if (!producto || !cantidad || !precio) {
      alert("Completa producto, cantidad y precio");
      return;
    }

    const nuevo: Item = {
      producto,
      cantidad: Number(cantidad),
      precio: Number(precio),
      subtotal: Number(cantidad) * Number(precio),
    };

    setItems([...items, nuevo]);
    setProducto("");
    setCantidad("");
    setPrecio("");
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

  const guardarPedido = async () => {
    if (!cliente || items.length === 0) {
      alert("Ingrese cliente y agregue productos");
      return;
    }

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente,
        total,
      })
      .select()
      .single();

    if (errorPedido) {
      alert("Error creando pedido");
      return;
    }

    const detalles = items.map((item) => ({
      pedido_id: pedido.id,
      producto: item.producto,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.subtotal,
    }));

    const { error: errorDetalle } = await supabase
      .from("detalle_pedidos")
      .insert(detalles);

    if (errorDetalle) {
      alert("Error guardando productos");
      return;
    }

    alert("Pedido completo guardado");
    setCliente("");
    setItems([]);
    cargarPedidos();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Sistema Super Roca</h1>

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />
      <br /><br />

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
      <br /><br />

      <button onClick={agregarProducto}>Agregar producto</button>
      <br /><br />

      <h2>Productos del pedido</h2>

      {items.map((item, index) => (
        <div key={index}>
          {item.producto} - {item.cantidad} x {item.precio} = {item.subtotal}
        </div>
      ))}

      <br />

      <button onClick={guardarPedido}>Guardar pedido completo</button>

      <h2>Pedidos registrados</h2>

      {pedidos.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", marginTop: 10, padding: 10 }}
        >
          <p><b>Cliente:</b> {p.cliente}</p>
          <p><b>Total:</b> {p.total}</p>
        </div>
      ))}
    </div>
  );
}
