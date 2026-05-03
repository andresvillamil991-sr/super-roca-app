'use client'

import { useEffect, useMemo, useState } from 'react'


type Product = { id:number; name:string; base_price:number; presentation:string | null }
type Seller = { id:number; name:string }
type Customer = { id:number; business_name:string; address:string | null; city:string | null; seller_id:number | null }
type Driver = { id:number; name:string; plate:string }
type Order = { id:number; seller_id:number; customer_id:number; product_id:number; quantity:number; base_price:number; sale_price:number; total:number; status:string; driver_id:number | null; plate:string | null; route:string | null; payment_method:string | null }

const money = (v:number) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(v || 0)

export default function Home(){
  const [products,setProducts]=useState<Product[]>([])
  const [sellers,setSellers]=useState<Seller[]>([])
  const [customers,setCustomers]=useState<Customer[]>([])
  const [drivers,setDrivers]=useState<Driver[]>([])
  const [orders,setOrders]=useState<Order[]>([])
  const [productId,setProductId]=useState<number>(0)
  const [sellerId,setSellerId]=useState<number>(0)
  const [customerId,setCustomerId]=useState<number>(0)
  const [quantity,setQuantity]=useState<number>(1)
  const [salePrice,setSalePrice]=useState<number>(0)
  const [driverId,setDriverId]=useState<number>(0)
  const [route,setRoute]=useState<string>('Ruta norte')

  async function load(){
    const [p,s,c,d,o] = await Promise.all([
      supabase.from('products').select('*').eq('active',true).order('id'),
      supabase.from('sellers').select('*').eq('active',true).order('id'),
      supabase.from('customers').select('*').eq('active',true).order('id'),
      supabase.from('drivers').select('*').eq('active',true).order('id'),
      supabase.from('orders').select('*').order('id',{ascending:false}).limit(100)
    ])
    setProducts(p.data || []); setSellers(s.data || []); setCustomers(c.data || []); setDrivers(d.data || []); setOrders(o.data || [])
    if((p.data||[])[0]){ setProductId(p.data![0].id); setSalePrice(Number(p.data![0].base_price)) }
    if((s.data||[])[0]) setSellerId(s.data![0].id)
    if((c.data||[])[0]) setCustomerId(c.data![0].id)
    if((d.data||[])[0]) setDriverId(d.data![0].id)
  }

  useEffect(()=>{ load() },[])

  const product = products.find(p=>p.id===productId)
  const validPrice = product ? salePrice >= Number(product.base_price) : false

  async function createOrder(){
    if(!product || !validPrice) return alert('Revise precio y producto')
    const { error } = await supabase.from('orders').insert({ seller_id:sellerId, customer_id:customerId, product_id:productId, quantity, base_price:product.base_price, sale_price:salePrice, delivery_type:'Entrega' })
    if(error) alert(error.message); else load()
  }

  async function setRouteStatus(order:Order){
    const driver = drivers.find(d=>d.id===driverId)
    await supabase.from('orders').update({ status:'en_ruta', driver_id:driverId, plate:driver?.plate, route }).eq('id', order.id)
    load()
  }

  async function closeOrder(order:Order, status:'entregado'|'devuelto'){
    const payment_method = prompt('Forma de pago: efectivo, bancos, mixto o credito', 'efectivo') || 'efectivo'
    const driver_note = prompt('Nota / queja del cliente', '') || ''
    await supabase.from('orders').update({ status, payment_method, driver_note, delivered_at:new Date().toISOString() }).eq('id', order.id)
    load()
  }

  const admin = useMemo(()=>{
    const delivered = orders.filter(o=>o.status==='entregado')
    return {
      sales: delivered.reduce((s,o)=>s+Number(o.total),0),
      cash: delivered.filter(o=>o.payment_method==='efectivo').reduce((s,o)=>s+Number(o.total),0),
      credit: delivered.filter(o=>o.payment_method==='credito').reduce((s,o)=>s+Number(o.total),0),
      bags: delivered.reduce((s,o)=>s+Number(o.quantity),0)
    }
  },[orders])

  return <main style={{fontFamily:'Arial', padding:20}}>
    <h1>Súper Roca — App real base</h1>
    <section style={card}>
      <h2>Panel administrador</h2>
      <p>Ventas entregadas: <b>{money(admin.sales)}</b></p>
      <p>Efectivo: <b>{money(admin.cash)}</b> · Crédito: <b>{money(admin.credit)}</b> · Bultos: <b>{admin.bags}</b></p>
    </section>

    <section style={card}>
      <h2>Nuevo pedido</h2>
      <select value={sellerId} onChange={e=>setSellerId(Number(e.target.value))}>{sellers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>{' '}
      <select value={customerId} onChange={e=>setCustomerId(Number(e.target.value))}>{customers.map(c=><option key={c.id} value={c.id}>{c.business_name}</option>)}</select>{' '}
      <select value={productId} onChange={e=>{ const p=products.find(x=>x.id===Number(e.target.value)); setProductId(Number(e.target.value)); setSalePrice(Number(p?.base_price || 0)) }}>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <p>Precio base: {money(Number(product?.base_price || 0))}</p>
      <input type="number" value={salePrice} onChange={e=>setSalePrice(Number(e.target.value))}/>{!validPrice && <b style={{color:'red'}}> No puede bajar del precio base</b>}
      <input type="number" value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/>
      <button onClick={createOrder}>Guardar pedido</button>
    </section>

    <section style={card}>
      <h2>Facturación, despacho y conductores</h2>
      <select value={driverId} onChange={e=>setDriverId(Number(e.target.value))}>{drivers.map(d=><option key={d.id} value={d.id}>{d.name} — {d.plate}</option>)}</select>{' '}
      <select value={route} onChange={e=>setRoute(e.target.value)}><option>Ruta norte</option><option>Ruta sur</option><option>Ruta occidente</option><option>Ruta centro</option><option>Ruta fuera de Bogotá</option></select>
      <table style={{width:'100%', marginTop:15}}><thead><tr><th>#</th><th>Cantidad</th><th>Total</th><th>Estado</th><th>Placa</th><th>Ruta</th><th>Acciones</th></tr></thead><tbody>
        {orders.map(o=><tr key={o.id} style={{background: o.status==='pendiente'?'#fff':o.status==='en_ruta'?'#fff3cd':o.status==='entregado'?'#d4edda':o.status==='devuelto'?'#ffe5b4':'#f8d7da'}}>
          <td>{o.id}</td><td>{o.quantity}</td><td>{money(Number(o.total))}</td><td>{o.status}</td><td>{o.plate || '-'}</td><td>{o.route || '-'}</td>
          <td><button onClick={()=>setRouteStatus(o)}>En ruta</button><button onClick={()=>closeOrder(o,'entregado')}>Entregado</button><button onClick={()=>closeOrder(o,'devuelto')}>Devuelto</button></td>
        </tr>)}
      </tbody></table>
    </section>
  </main>
}

const card:React.CSSProperties = {background:'#fff', padding:16, border:'1px solid #ddd', borderRadius:12, marginBottom:16}
