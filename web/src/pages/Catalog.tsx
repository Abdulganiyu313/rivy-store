import { useEffect, useState } from "react";
import { getProducts } from "../api";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SidebarFilters from "../components/SidebarFilters";
import ViewToggle from "../components/ViewToggle";

export default function Catalog() {
  const [data, setData] = useState<any>({
    data: [],
    page: 1,
    total: 0,
    limit: 12,
  });
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getProducts({
        search,
        minPrice,
        maxPrice,
        categoryId: categoryId || undefined,
        page,
        limit: 12,
      });
      setData(res);
      setErr("");
    } catch (e: any) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setCategoryId("");
    load(1);
  };

  useEffect(() => {
    load(1); /* eslint-disable-next-line */
  }, []);

  return (
    <div className="layout">
      <SidebarFilters
        {...{
          search,
          setSearch,
          minPrice,
          setMinPrice,
          maxPrice,
          setMaxPrice,
          categoryId,
          setCategoryId,
        }}
        onApply={() => load(1)}
        onClear={clear}
      />

      <section className="content">
        <div className="toolbar">
          <h1>Storefront</h1>
          <div className="right">
            <div className="searchbar">
              <input
                aria-label="Search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(1)}
              />
              <button onClick={() => load(1)}>Search</button>
            </div>
            <ViewToggle view={view} setView={setView} />
            <Link to="/cart" className="cart-link">
              Cart
            </Link>
          </div>
        </div>

        {loading && <p>Loading…</p>}
        {err && <p role="alert">Error: {err}</p>}
        {!loading && !err && (
          <>
            <ul
              className={
                view === "grid" ? "grid list-reset" : "list list-reset"
              }
            >
              {data.data.map((p: any) =>
                view === "grid" ? (
                  <ProductCard key={p.id} p={p} />
                ) : (
                  <li key={p.id} className="row">
                    <img
                      src={p.imageUrl || "https://via.placeholder.com/200x140"}
                      alt={p.name}
                    />
                    <div className="row-main">
                      <h3>{p.name}</h3>
                      <p>
                        {(p.description || "").slice(0, 140)}
                        {(p.description || "").length > 140 ? "…" : ""}
                      </p>
                    </div>
                    <div className="row-price">
                      ₦{(p.price / 100).toLocaleString()}
                    </div>
                    <Link to={`/product/${p.id}`} className="row-cta">
                      View
                    </Link>
                  </li>
                )
              )}
            </ul>

            <div className="pager">
              <button
                onClick={() => load(Math.max(1, data.page - 1))}
                disabled={data.page <= 1}
              >
                Prev
              </button>
              <span>Page {data.page}</span>
              <button
                onClick={() => load(data.page + 1)}
                disabled={data.page * data.limit >= data.total}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
