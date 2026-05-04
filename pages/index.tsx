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
  }
};
