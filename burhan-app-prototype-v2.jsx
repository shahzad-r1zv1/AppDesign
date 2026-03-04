import { useState } from "react";

const COLORS = {
  bg: "#0F1117",
  surface: "#1A1D27",
  card: "#21253A",
  accent: "#F59E0B",
  accentDim: "#92400E",
  green: "#10B981",
  red: "#EF4444",
  blue: "#3B82F6",
  orange: "#F97316",
  text: "#F1F5F9",
  muted: "#64748B",
  border: "#2D3248",
};

// Canadian vendor config
const VENDORS = {
  manual:    { id: "manual",    label: "Manual",          flag: "✏️",  color: COLORS.muted,   currency: "CAD" },
  hd_ca:     { id: "hd_ca",    label: "Home Depot CA",   flag: "🟠",  color: "#F97316",      currency: "CAD", api: "SerpApi",  note: "country=ca via SerpApi" },
  rona:      { id: "rona",     label: "RONA / RONA+",    flag: "🔴",  color: "#EF4444",      currency: "CAD", api: "Apify",    note: "rona.ca via Apify scraper" },
  kent:      { id: "kent",     label: "Kent Building",   flag: "🟢",  color: "#10B981",      currency: "CAD", api: "ScraperAPI", note: "kent.ca (Atlantic CA)" },
};

// Simulated live prices in CAD — in prod these come from the APIs
const LIVE_PRICES_CAD = {
  hd_ca: {
    "Hardwood Flooring":        { price: 5.49,  unit: "sq ft",  sku: "1001234567" },
    "Laminate Flooring":        { price: 3.19,  unit: "sq ft",  sku: "1000987654" },
    "Vinyl Plank (LVP)":        { price: 3.79,  unit: "sq ft",  sku: "1001122334" },
    "Ceramic Tile":             { price: 2.89,  unit: "sq ft",  sku: "1000556677" },
    "Drywall Sheet (4x8)":      { price: 17.49, unit: "sheet",  sku: "1000112233" },
    "Drywall Compound":         { price: 26.49, unit: "bucket", sku: "1000445566" },
    "Interior Paint (1 gal)":   { price: 44.98, unit: "gallon", sku: "1001778899" },
    "Primer (1 gal)":           { price: 34.98, unit: "gallon", sku: "1001001122" },
    "Baseboard (8ft)":          { price: 9.98,  unit: "piece",  sku: "1000334455" },
    "Quarter Round (8ft)":      { price: 5.98,  unit: "piece",  sku: "1000667788" },
  },
  rona: {
    "Hardwood Flooring":        { price: 5.29,  unit: "sq ft",  sku: "RON-FL-001" },
    "Laminate Flooring":        { price: 2.99,  unit: "sq ft",  sku: "RON-FL-002" },
    "Vinyl Plank (LVP)":        { price: 3.59,  unit: "sq ft",  sku: "RON-FL-003" },
    "Ceramic Tile":             { price: 2.69,  unit: "sq ft",  sku: "RON-TL-001" },
    "Drywall Sheet (4x8)":      { price: 16.99, unit: "sheet",  sku: "RON-DW-001" },
    "Drywall Compound":         { price: 24.99, unit: "bucket", sku: "RON-DW-002" },
    "Interior Paint (1 gal)":   { price: 42.49, unit: "gallon", sku: "RON-PT-001" },
    "Primer (1 gal)":           { price: 32.49, unit: "gallon", sku: "RON-PT-002" },
    "Baseboard (8ft)":          { price: 8.99,  unit: "piece",  sku: "RON-BB-001" },
    "Quarter Round (8ft)":      { price: 5.49,  unit: "piece",  sku: "RON-BB-002" },
  },
  kent: {
    "Hardwood Flooring":        { price: 5.19,  unit: "sq ft",  sku: "KNT-FL-001" },
    "Laminate Flooring":        { price: 2.89,  unit: "sq ft",  sku: "KNT-FL-002" },
    "Vinyl Plank (LVP)":        { price: 3.49,  unit: "sq ft",  sku: "KNT-FL-003" },
    "Ceramic Tile":             { price: 2.59,  unit: "sq ft",  sku: "KNT-TL-001" },
    "Drywall Sheet (4x8)":      { price: 15.99, unit: "sheet",  sku: "KNT-DW-001" },
    "Drywall Compound":         { price: 23.49, unit: "bucket", sku: "KNT-DW-002" },
    "Interior Paint (1 gal)":   { price: 40.99, unit: "gallon", sku: "KNT-PT-001" },
    "Primer (1 gal)":           { price: 30.99, unit: "gallon", sku: "KNT-PT-002" },
    "Baseboard (8ft)":          { price: 8.49,  unit: "piece",  sku: "KNT-BB-001" },
    "Quarter Round (8ft)":      { price: 5.19,  unit: "piece",  sku: "KNT-BB-002" },
  },
};

const MANUAL_PRICES = {
  "Hardwood Flooring":      { unit: "sq ft",  price: 4.50 },
  "Laminate Flooring":      { unit: "sq ft",  price: 2.80 },
  "Vinyl Plank (LVP)":      { unit: "sq ft",  price: 3.20 },
  "Ceramic Tile":           { unit: "sq ft",  price: 2.50 },
  "Drywall Sheet (4x8)":    { unit: "sheet",  price: 14.99 },
  "Drywall Compound":       { unit: "bucket", price: 22.00 },
  "Interior Paint (1 gal)": { unit: "gallon", price: 38.00 },
  "Primer (1 gal)":         { unit: "gallon", price: 29.00 },
  "Baseboard (8ft)":        { unit: "piece",  price: 8.50 },
  "Quarter Round (8ft)":    { unit: "piece",  price: 5.00 },
};

const BATHROOM_PACKAGES = {
  "2pc": { label: "2-Piece (Toilet + Sink)",  labor: 2200,  materials: 1450 },
  "3pc": { label: "3-Piece (+ Shower/Tub)",   labor: 3900,  materials: 3400 },
  "4pc": { label: "4-Piece (+ Bathtub)",       labor: 5400,  materials: 5100 },
};

const COMMERCIAL_ITEMS = [
  { id: "plumbing",   label: "Plumbing",            icon: "🔧" },
  { id: "hvac",       label: "HVAC",                icon: "❄️" },
  { id: "hood",       label: "Kitchen Hood",        icon: "🍳" },
  { id: "tiling",     label: "Tiling",              icon: "⬜" },
  { id: "inspection", label: "City Inspection Fee", icon: "🏛️" },
  { id: "architect",  label: "Architect Fee",       icon: "📐" },
];

const CREW = [
  { id: 1, name: "Marco S.", pin: "1234", avatar: "MS" },
  { id: 2, name: "Dev P.",   pin: "5678", avatar: "DP" },
  { id: 3, name: "Ali R.",   pin: "9012", avatar: "AR" },
];

const SAMPLE_TASKS = [
  { id: 1, project: "Elm Street Reno",    crew: 1, task: "Install hardwood — living room", status: "in_progress", photos: 2 },
  { id: 2, project: "Elm Street Reno",    crew: 2, task: "Drywall — master bedroom",       status: "done",        photos: 4 },
  { id: 3, project: "Commercial Unit 4B", crew: 3, task: "Tile kitchen floor",             status: "not_started", photos: 0 },
  { id: 4, project: "Commercial Unit 4B", crew: 1, task: "Paint hallways",                 status: "not_started", photos: 0 },
  { id: 5, project: "Elm Street Reno",    crew: 3, task: "Baseboard installation",         status: "in_progress", photos: 1 },
];

export default function App() {
  const [view, setView]               = useState("home");
  const [quoteTab, setQuoteTab]       = useState("residential");
  const [floorSqft, setFloorSqft]     = useState("");
  const [floorMat, setFloorMat]       = useState("Hardwood Flooring");
  const [drywallSqft, setDrywallSqft] = useState("");
  const [paintSqft, setPaintSqft]     = useState("");
  const [baseboardLf, setBaseboardLf] = useState("");
  const [bathrooms, setBathrooms]     = useState({ "2pc": 0, "3pc": 0, "4pc": 0 });
  const [commercial, setCommercial]   = useState({});
  const [tasks, setTasks]             = useState(SAMPLE_TASKS);
  const [crewPin, setCrewPin]         = useState("");
  const [loggedCrew, setLoggedCrew]   = useState(null);
  const [pinError, setPinError]       = useState(false);

  // Per-category vendor selection — each category can have a different vendor
  const [vendors, setVendors] = useState({
    flooring:  "manual",
    drywall:   "manual",
    paint:     "manual",
    baseboard: "manual",
  });
  const [fetchingPrice, setFetchingPrice] = useState({});
  const [fetchedPrices, setFetchedPrices] = useState({}); // cache of fetched results

  const setVendor = (cat, v) => setVendors(prev => ({ ...prev, [cat]: v }));

  const getPrice = (material, category) => {
    const v = vendors[category];
    if (v === "manual") return MANUAL_PRICES[material]?.price || 0;
    const cached = fetchedPrices[`${v}_${material}`];
    if (cached) return cached.price;
    return LIVE_PRICES_CAD[v]?.[material]?.price || MANUAL_PRICES[material]?.price || 0;
  };

  const simulateFetch = async (category, material, vendor) => {
    const key = `${vendor}_${material}`;
    setFetchingPrice(prev => ({ ...prev, [key]: true }));
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const result = LIVE_PRICES_CAD[vendor]?.[material];
    if (result) {
      setFetchedPrices(prev => ({ ...prev, [key]: { ...result, fetchedAt: new Date().toLocaleTimeString() } }));
    }
    setFetchingPrice(prev => ({ ...prev, [key]: false }));
  };

  const currency = (n) => `$${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} CAD`;

  const calcFloor    = () => (parseFloat(floorSqft) || 0) * getPrice(floorMat, "flooring");
  const calcDrywall  = () => { const s = parseFloat(drywallSqft) || 0; const sheets = Math.ceil(s / 32); return sheets * getPrice("Drywall Sheet (4x8)", "drywall") + Math.ceil(sheets / 5) * getPrice("Drywall Compound", "drywall"); };
  const calcPaint    = () => { const s = parseFloat(paintSqft) || 0; const gal = Math.ceil(s / 400); return gal * getPrice("Interior Paint (1 gal)", "paint") + Math.ceil(gal / 2) * getPrice("Primer (1 gal)", "paint"); };
  const calcBaseboard= () => Math.ceil((parseFloat(baseboardLf) || 0) / 8) * getPrice("Baseboard (8ft)", "baseboard");
  const calcBaths    = () => Object.entries(bathrooms).reduce((s, [t, q]) => s + q * (BATHROOM_PACKAGES[t].labor + BATHROOM_PACKAGES[t].materials), 0);
  const calcComm     = () => Object.values(commercial).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const materialTotal = calcFloor() + calcDrywall() + calcPaint() + calcBaseboard() + calcBaths() + calcComm();
  const laborTotal    = materialTotal * 0.35;
  const grandTotal    = materialTotal + laborTotal;

  const completedTasks = tasks.filter(t => t.status === "done").length;
  const pct = Math.round((completedTasks / tasks.length) * 100);

  const crewLogin = (pin) => {
    const found = CREW.find(c => c.pin === pin);
    if (found) { setLoggedCrew(found); setPinError(false); setCrewPin(""); }
    else { setPinError(true); setCrewPin(""); }
  };
  const updateTask = (id, status) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  const statusColor = (s) => s === "done" ? COLORS.green : s === "in_progress" ? COLORS.accent : COLORS.muted;
  const statusLabel = (s) => s === "done" ? "Done" : s === "in_progress" ? "In Progress" : "Not Started";

  const inputStyle = { background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, padding: "10px 14px", width: "100%", fontSize: 14, boxSizing: "border-box" };
  const labelStyle = { color: COLORS.muted, fontSize: 11, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" };
  const cardStyle  = { background: COLORS.card, borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${COLORS.border}` };
  const rowStyle   = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };

  // ── VENDOR SELECTOR WIDGET ──────────────────────────────────────────────────
  const VendorSelector = ({ category, materials }) => {
    const v = vendors[category];
    const vendor = VENDORS[v];
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Pricing Source</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.values(VENDORS).map(vnd => (
            <button key={vnd.id} onClick={() => {
              setVendor(category, vnd.id);
              if (vnd.id !== "manual" && materials) {
                materials.forEach(m => {
                  const key = `${vnd.id}_${m}`;
                  if (!fetchedPrices[key]) simulateFetch(category, m, vnd.id);
                });
              }
            }} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: v === vnd.id ? 700 : 400,
              background: v === vnd.id ? vnd.color + "22" : "transparent",
              border: `1px solid ${v === vnd.id ? vnd.color : COLORS.border}`,
              color: v === vnd.id ? vnd.color : COLORS.muted,
              transition: "all 0.15s"
            }}>{vnd.flag} {vnd.label}</button>
          ))}
        </div>
        {v !== "manual" && (
          <div style={{ marginTop: 8, fontSize: 11, color: vendor.color, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: vendor.color, display: "inline-block" }} />
            Live CAD pricing · {vendor.note}
            {materials && materials.some(m => fetchingPrice[`${v}_${m}`]) && (
              <span style={{ color: COLORS.muted, marginLeft: 4 }}>⟳ Fetching…</span>
            )}
            {materials && materials.every(m => fetchedPrices[`${v}_${m}`]) && (
              <span style={{ color: COLORS.muted, marginLeft: 4 }}>
                Updated {fetchedPrices[`${v}_${materials[0]}`]?.fetchedAt}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── PRICE BADGE ─────────────────────────────────────────────────────────────
  const PriceBadge = ({ material, category }) => {
    const v = vendors[category];
    if (v === "manual") return null;
    const key = `${v}_${material}`;
    const isFetching = fetchingPrice[key];
    const fetched = fetchedPrices[key] || LIVE_PRICES_CAD[v]?.[material];
    const vendor = VENDORS[v];
    return (
      <span style={{ fontSize: 11, marginLeft: 8, padding: "2px 7px", borderRadius: 10, background: vendor.color + "22", color: vendor.color, fontWeight: 600 }}>
        {isFetching ? "⟳" : fetched ? `${vendor.flag} $${fetched.price} CAD` : "—"}
      </span>
    );
  };

  // ── PRICE COMPARE TABLE ─────────────────────────────────────────────────────
  const PriceCompare = ({ material }) => {
    const vendors_to_show = ["hd_ca", "rona", "kent"];
    const prices = vendors_to_show.map(v => ({ v, p: LIVE_PRICES_CAD[v]?.[material]?.price || null })).filter(x => x.p);
    if (!prices.length) return null;
    const min = Math.min(...prices.map(x => x.p));
    return (
      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {prices.map(({ v, p }) => (
          <span key={v} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: p === min ? COLORS.green + "22" : COLORS.card, border: `1px solid ${p === min ? COLORS.green : COLORS.border}`, color: p === min ? COLORS.green : COLORS.muted, fontWeight: p === min ? 700 : 400 }}>
            {VENDORS[v].flag} {VENDORS[v].label}: ${p.toFixed(2)}  {p === min ? "✓ Best" : ""}
          </span>
        ))}
      </div>
    );
  };

  const globalStyles = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Grotesk:wght@600;700&display=swap'); * { box-sizing: border-box; } input:focus, select:focus { outline: 2px solid ${COLORS.accent}; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }`;

  // ── HOME ────────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
      <style>{globalStyles}</style>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🏗️</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text, fontSize: 32, margin: 0, fontWeight: 700 }}>BuildQuote</h1>
          <p style={{ color: COLORS.muted, marginTop: 8 }}>Renovation quoting & crew management</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
            {[
              { f: "🟠", l: "Home Depot CA" },
              { f: "🔴", l: "RONA / RONA+" },
              { f: "🟢", l: "Kent Building" },
            ].map(v => (
              <span key={v.l} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted }}>{v.f} {v.l}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {[
            { icon: "📋", title: "Quote Builder", sub: "Residential & commercial — live CAD pricing", view: "quote", color: COLORS.accent },
            { icon: "👷", title: "Field Ops",     sub: "Assign & track crew tasks",                 view: "field", color: COLORS.blue },
            { icon: "📱", title: "Crew Login",    sub: "Worker task view (PIN login)",              view: "crew",  color: COLORS.green },
          ].map(item => (
            <button key={item.view} onClick={() => setView(item.view)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.2s", color: COLORS.text }}
              onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div><div style={{ fontWeight: 700, fontSize: 16, color: item.color }}>{item.title}</div><div style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{item.sub}</div></div>
              <span style={{ marginLeft: "auto", color: COLORS.muted }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── QUOTE BUILDER ───────────────────────────────────────────────────────────
  if (view === "quote") return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <style>{globalStyles}</style>
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>📋 Quote Builder</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setQuoteTab("residential")} style={{ background: quoteTab === "residential" ? COLORS.accent + "22" : "transparent", border: `1px solid ${quoteTab === "residential" ? COLORS.accent : COLORS.border}`, color: quoteTab === "residential" ? COLORS.accent : COLORS.muted, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: quoteTab === "residential" ? 700 : 400, fontSize: 13 }}>Residential</button>
          <button onClick={() => setQuoteTab("commercial")} style={{ background: quoteTab === "commercial" ? COLORS.blue + "22" : "transparent", border: `1px solid ${quoteTab === "commercial" ? COLORS.blue : COLORS.border}`, color: quoteTab === "commercial" ? COLORS.blue : COLORS.muted, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: quoteTab === "commercial" ? 700 : 400, fontSize: 13 }}>Commercial</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <div style={{ flex: 1, marginRight: 24 }}>

          {quoteTab === "residential" && (<>

            {/* FLOORING */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🪵 Flooring</div>
              <VendorSelector category="flooring" materials={[floorMat]} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Square Footage</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 450" value={floorSqft} onChange={e => setFloorSqft(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Material</label>
                  <select style={inputStyle} value={floorMat} onChange={e => { setFloorMat(e.target.value); if (vendors.flooring !== "manual") simulateFetch("flooring", e.target.value, vendors.flooring); }}>
                    {["Hardwood Flooring", "Laminate Flooring", "Vinyl Plank (LVP)", "Ceramic Tile"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {floorSqft && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: COLORS.muted, fontSize: 13 }}>${getPrice(floorMat, "flooring").toFixed(2)}/sq ft · </span>
                    <span style={{ color: COLORS.accent, fontWeight: 700, marginLeft: 4 }}>{currency(calcFloor())}</span>
                    <PriceBadge material={floorMat} category="flooring" />
                  </div>
                  <PriceCompare material={floorMat} />
                </div>
              )}
            </div>

            {/* DRYWALL */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🧱 Drywall</div>
              <VendorSelector category="drywall" materials={["Drywall Sheet (4x8)", "Drywall Compound"]} />
              <div>
                <label style={labelStyle}>Total Wall Area (sq ft)</label>
                <input style={inputStyle} type="number" placeholder="e.g. 1200" value={drywallSqft} onChange={e => setDrywallSqft(e.target.value)} />
              </div>
              {drywallSqft && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: COLORS.muted, fontSize: 13 }}>{Math.ceil(parseFloat(drywallSqft) / 32)} sheets · </span>
                    <span style={{ color: COLORS.accent, fontWeight: 700, marginLeft: 4 }}>{currency(calcDrywall())}</span>
                  </div>
                  <PriceCompare material="Drywall Sheet (4x8)" />
                </div>
              )}
            </div>

            {/* PAINT */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🎨 Paint</div>
              <VendorSelector category="paint" materials={["Interior Paint (1 gal)", "Primer (1 gal)"]} />
              <div>
                <label style={labelStyle}>House Square Footage</label>
                <input style={inputStyle} type="number" placeholder="e.g. 1800" value={paintSqft} onChange={e => setPaintSqft(e.target.value)} />
              </div>
              {paintSqft && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: COLORS.muted, fontSize: 13 }}>{Math.ceil(parseFloat(paintSqft) / 400)} gal paint + primer · </span>
                    <span style={{ color: COLORS.accent, fontWeight: 700, marginLeft: 4 }}>{currency(calcPaint())}</span>
                  </div>
                  <PriceCompare material="Interior Paint (1 gal)" />
                </div>
              )}
            </div>

            {/* BASEBOARD */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>📏 Baseboards</div>
              <VendorSelector category="baseboard" materials={["Baseboard (8ft)"]} />
              <div>
                <label style={labelStyle}>Linear Footage</label>
                <input style={inputStyle} type="number" placeholder="e.g. 320" value={baseboardLf} onChange={e => setBaseboardLf(e.target.value)} />
              </div>
              {baseboardLf && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: COLORS.muted, fontSize: 13 }}>{Math.ceil(parseFloat(baseboardLf) / 8)} pieces · </span>
                    <span style={{ color: COLORS.accent, fontWeight: 700, marginLeft: 4 }}>{currency(calcBaseboard())}</span>
                  </div>
                  <PriceCompare material="Baseboard (8ft)" />
                </div>
              )}
            </div>

            {/* BATHROOMS */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🚿 Bathroom Renovations</div>
              {Object.entries(BATHROOM_PACKAGES).map(([type, pkg]) => (
                <div key={type} style={{ ...rowStyle, marginBottom: 10, padding: "12px 14px", background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{pkg.label}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>Labor: {currency(pkg.labor)} + Materials: {currency(pkg.materials)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setBathrooms(b => ({ ...b, [type]: Math.max(0, b[type] - 1) }))} style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, cursor: "pointer", fontSize: 16 }}>−</button>
                    <span style={{ fontWeight: 700, width: 20, textAlign: "center" }}>{bathrooms[type]}</span>
                    <button onClick={() => setBathrooms(b => ({ ...b, [type]: b[type] + 1 }))} style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.accent, border: "none", color: "#000", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>+</button>
                  </div>
                </div>
              ))}
              {calcBaths() > 0 && <div style={{ color: COLORS.accent, fontWeight: 700, marginTop: 6 }}>Subtotal: {currency(calcBaths())}</div>}
            </div>
          </>)}

          {quoteTab === "commercial" && (
            <div>
              <div style={{ ...cardStyle, background: COLORS.surface, marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Enter lump-sum estimates for each commercial scope. These are typically quoted by sub-trades and entered manually.</div>
              </div>
              {COMMERCIAL_ITEMS.map(item => (
                <div key={item.id} style={cardStyle}>
                  <div style={rowStyle}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.icon} {item.label}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: COLORS.muted, fontSize: 13 }}>CAD $</span>
                      <input style={{ ...inputStyle, width: 160 }} type="number" placeholder="0.00" value={commercial[item.id] || ""} onChange={e => setCommercial(prev => ({ ...prev, [item.id]: e.target.value }))} />
                    </div>
                  </div>
                </div>
              ))}
              {calcComm() > 0 && <div style={{ ...cardStyle, background: COLORS.surface }}><div style={rowStyle}><span style={{ fontWeight: 600 }}>Commercial Subtotal</span><span style={{ color: COLORS.blue, fontWeight: 700, fontSize: 18 }}>{currency(calcComm())}</span></div></div>}
            </div>
          )}
        </div>

        {/* RIGHT: Summary */}
        <div style={{ width: 300 }}>
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ ...cardStyle, background: COLORS.surface, border: `1px solid ${COLORS.accent}30` }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Quote Summary</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 16 }}>All amounts in Canadian Dollars (CAD)</div>

              {/* Vendor legend */}
              <div style={{ marginBottom: 14, padding: "10px 12px", background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Sources</div>
                {Object.entries(vendors).map(([cat, v]) => (
                  <div key={cat} style={{ fontSize: 11, color: VENDORS[v].color, marginBottom: 2 }}>
                    {VENDORS[v].flag} {cat.charAt(0).toUpperCase() + cat.slice(1)}: {VENDORS[v].label}
                  </div>
                ))}
              </div>

              {[
                { label: "Flooring",   val: calcFloor() },
                { label: "Drywall",    val: calcDrywall() },
                { label: "Paint",      val: calcPaint() },
                { label: "Baseboards", val: calcBaseboard() },
                { label: "Bathrooms",  val: calcBaths() },
                { label: "Commercial", val: calcComm() },
              ].map(({ label, val }) => val > 0 && (
                <div key={label} style={{ ...rowStyle, marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: COLORS.muted }}>{label}</span>
                  <span>{currency(val)}</span>
                </div>
              ))}

              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, marginTop: 8 }}>
                <div style={{ ...rowStyle, fontSize: 14, marginBottom: 6 }}>
                  <span style={{ color: COLORS.muted }}>Materials</span><span>{currency(materialTotal)}</span>
                </div>
                <div style={{ ...rowStyle, fontSize: 14, marginBottom: 6 }}>
                  <span style={{ color: COLORS.muted }}>Labour (35%)</span><span>{currency(laborTotal)}</span>
                </div>
                <div style={{ ...rowStyle, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Total (CAD)</span>
                  <span style={{ color: COLORS.accent, fontWeight: 700, fontSize: 22 }}>{currency(grandTotal)}</span>
                </div>
              </div>

              <button style={{ width: "100%", marginTop: 18, background: COLORS.accent, color: "#000", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Export PDF Quote</button>
              <button style={{ width: "100%", marginTop: 8, background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 0", fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save Quote</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── FIELD OPS ───────────────────────────────────────────────────────────────
  if (view === "field") return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <style>{globalStyles}</style>
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>👷 Field Ops</span>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <div style={{ ...cardStyle, background: COLORS.surface }}>
          <div style={rowStyle}>
            <div><div style={{ fontWeight: 700, fontSize: 18 }}>Overall Completion</div><div style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{completedTasks} of {tasks.length} tasks done</div></div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: COLORS.green }}>{pct}%</div>
          </div>
          <div style={{ marginTop: 14, background: COLORS.bg, borderRadius: 99, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.blue})`, borderRadius: 99, transition: "width 0.5s" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {CREW.map(c => {
            const my = tasks.filter(t => t.crew === c.id), done = my.filter(t => t.status === "done").length;
            return (
              <div key={c.id} style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.blue + "33", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: COLORS.blue }}>{c.avatar}</div>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div><div style={{ color: COLORS.muted, fontSize: 12 }}>{done}/{my.length} done</div></div>
                </div>
                <div style={{ background: COLORS.bg, borderRadius: 99, height: 6 }}>
                  <div style={{ width: my.length ? `${(done / my.length) * 100}%` : "0%", height: "100%", background: COLORS.blue, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>All Tasks</div>
        {tasks.map(task => {
          const cm = CREW.find(c => c.id === task.crew);
          return (
            <div key={task.id} style={cardStyle}>
              <div style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 99, background: statusColor(task.status) + "22", color: statusColor(task.status), fontWeight: 600 }}>{statusLabel(task.status)}</span>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>{task.project}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{task.task}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>👤 {cm?.name}</span>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>📷 {task.photos} photos</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {task.status === "not_started" && <button onClick={() => updateTask(task.id, "in_progress")} style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}`, color: COLORS.accent, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Start</button>}
                  {task.status !== "done" && <button onClick={() => updateTask(task.id, "done")} style={{ background: COLORS.green + "22", border: `1px solid ${COLORS.green}`, color: COLORS.green, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Done</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── CREW LOGIN ──────────────────────────────────────────────────────────────
  if (view === "crew") {
    if (!loggedCrew) return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{globalStyles}</style>
        <button onClick={() => setView("home")} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👷</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text }}>Worker Login</div>
          <div style={{ color: COLORS.muted, marginTop: 6, fontSize: 15 }}>Enter your 4-digit PIN</div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 52, height: 52, borderRadius: 12, background: COLORS.card, border: `2px solid ${crewPin.length > i ? COLORS.green : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {crewPin.length > i && <div style={{ width: 14, height: 14, borderRadius: "50%", background: COLORS.green }} />}
            </div>
          ))}
        </div>
        {pinError && <div style={{ color: COLORS.red, marginBottom: 16, fontSize: 14 }}>❌ Incorrect PIN — try again</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: 220 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✓"].map(k => (
            <button key={k} onClick={() => {
              if (k === "⌫") setCrewPin(p => p.slice(0, -1));
              else if (k === "✓") crewLogin(crewPin);
              else if (crewPin.length < 4) { const next = crewPin + k; setCrewPin(next); if (next.length === 4) setTimeout(() => crewLogin(next), 300); }
            }} style={{ height: 60, borderRadius: 12, background: k === "✓" ? COLORS.green : COLORS.card, border: `1px solid ${COLORS.border}`, color: k === "✓" ? "#000" : COLORS.text, fontSize: k === "✓" || k === "⌫" ? 20 : 22, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{k}</button>
          ))}
        </div>
        <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 24 }}>Demo PINs: 1234 · 5678 · 9012</div>
      </div>
    );

    const myTasks = tasks.filter(t => t.crew === loggedCrew.id);
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: COLORS.text, maxWidth: 480, margin: "0 auto" }}>
        <style>{globalStyles}</style>
        <div style={{ background: COLORS.surface, padding: "20px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={rowStyle}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20 }}>Hey, {loggedCrew.name.split(" ")[0]} 👋</div>
              <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{myTasks.filter(t => t.status !== "done").length} tasks remaining today</div>
            </div>
            <button onClick={() => setLoggedCrew(null)} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>Log out</button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {myTasks.map(task => (
            <div key={task.id} style={{ background: COLORS.card, borderRadius: 14, padding: 18, marginBottom: 14, border: `2px solid ${task.status === "done" ? COLORS.green + "44" : COLORS.border}` }}>
              <div style={{ fontSize: 12, color: statusColor(task.status), fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{statusLabel(task.status)}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{task.task}</div>
              <div style={{ color: COLORS.muted, fontSize: 13, marginBottom: 14 }}>📍 {task.project}</div>
              {task.status !== "done" && (
                <div style={{ display: "flex", gap: 10 }}>
                  {task.status === "not_started" && <button onClick={() => updateTask(task.id, "in_progress")} style={{ flex: 1, padding: "14px 0", background: COLORS.accent, border: "none", borderRadius: 10, color: "#000", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>▶ Start</button>}
                  {task.status === "in_progress" && (<>
                    <button style={{ flex: 1, padding: "14px 0", background: COLORS.blue + "22", border: `1px solid ${COLORS.blue}`, borderRadius: 10, color: COLORS.blue, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>📷 Add Photo</button>
                    <button onClick={() => updateTask(task.id, "done")} style={{ flex: 1, padding: "14px 0", background: COLORS.green, border: "none", borderRadius: 10, color: "#000", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✓ Done</button>
                  </>)}
                </div>
              )}
              {task.status === "done" && <div style={{ color: COLORS.green, fontWeight: 600, fontSize: 14 }}>✅ Completed · {task.photos} photos uploaded</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
