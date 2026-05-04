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
  if (!cliente) {
    alert("Ingrese cliente");
    return;
  }

  // 1. Guardar pedido principal
  const { data: pedidoGuardado, error: errorPedido } = await supabase
    .from("pedidos")
    .insert([{ cliente }])
    .select()
    .single();

  if (errorPedido) {
    alert("Error creando pedido");
    return;
  }

  const pedidoId = pedidoGuardado.id;

  // 2. Guardar productos (ejemplo con uno por ahora)
  const { error: errorDetalle } = await supabase
    .from("detalle_pedidos")
    .insert([
      {
        pedido_id: pedidoId,
        producto,
        cantidad: Number(cantidad),
        precio: Number(precio),
        subtotal: Number(cantidad) * Number(precio),
      },
    ]);

  if (errorDetalle) {
    alert("Error guardando productos");
  } else {
    alert("Pedido completo guardado");
  }
};
}
