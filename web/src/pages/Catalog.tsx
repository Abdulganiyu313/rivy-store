import { useEffect, useState } from "react";
import { getProducts } from "../api";
import { Link } from "react-router-dom";

export default function Catalog() {
  const [data, setData] = useState<any>({ data: [], page: 1, total: 0, limit: 12 });
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (page=1) => {
    try {
      setLoading(true);
      const res = await getProducts({ search, minPrice, maxPrice, page, limit: 12 });
      setData(res);
      setErr("");
    } catch (e:any) { setErr(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  if (loading) return <p>Loading…</p>;
  if (err) return <p role="alert">Error: {err}</p>;
  if (!data.data.length) return (
    <div>
      <h1>Catalog</h1>
      <Filters {...{search,setSearch,minPrice,setMinPrice,maxPrice,setMaxPrice, onApply:()=>load(1)}} />
      <p>No products found.</p>
    </div>
  );

  return (
    <div>
      <h1>Catalog</h1>
      <Filters {...{search,setSearch,minPrice,setMinPrice,maxPrice,setMaxPrice, onApply:()=>load(1)}} />
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {data.data.map((p:any)=>(
          <li key={p.id} style={{ border:"1px solid #ddd", padding:12 }}>
            <img src={p.imageUrl || "https://via.placeholder.com/300x200"} alt={p.name} style={{ width:"100%", height:140, objectFit:"cover" }}/>
            <h3>{p.name}</h3>
            <p>₦{(p.price/100).toLocaleString()}</p>
            <Link to={`/product/${p.id}`}>View</Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop:16 }}>
        <button onClick={()=>load(Math.max(1, data.page-1))} disabled={data.page<=1}>Prev</button>
        <span style={{ margin:"0 8px" }}>Page {data.page}</span>
        <button onClick={()=>load(data.page+1)} disabled={(data.page*data.limit)>=data.total}>Next</button>
      </div>
    </div>
  );
}

function Filters({search,setSearch,minPrice,setMinPrice,maxPrice,setMaxPrice,onApply}:{search:string,setSearch:any,minPrice:string,setMinPrice:any,maxPrice:string,setMaxPrice:any,onApply:()=>void}) {
  return (
    <fieldset style={{ marginBottom:16 }}>
      <legend>Filters</legend>
      <label>Search <input value={search} onChange={e=>setSearch(e.target.value)} /></label>{" "}
      <label>Min ₦ <input value={minPrice} onChange={e=>setMinPrice(e.target.value)} /></label>{" "}
      <label>Max ₦ <input value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} /></label>{" "}
      <button onClick={onApply}>Apply</button>
    </fieldset>
  );
}
