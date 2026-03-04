import { useState, useRef, useCallback } from "react";
import {
  FileText, HardHat, Smartphone, ChevronLeft,
  RefreshCw, Check, AlertCircle, Camera, LogOut, Minus, Plus,
  Save, User, MapPin, Phone, Mail, Hash,
  Calendar, StickyNote, Layers, Paintbrush, RulerIcon,
  ShowerHead, Building2,
  CircleDot, ChevronDown, ChevronUp, Printer,
  ChevronRight, Hammer, X,
} from "lucide-react";
import "./App.css";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const VENDORS = {
  manual: { id:"manual", label:"Manual",        emoji:"✏️",  color:"#64748B", api:null,          note:"Your price list" },
  hd_ca:  { id:"hd_ca",  label:"Home Depot CA", emoji:"🟠",  color:"#F97316", api:"SerpApi",     note:"country=ca via SerpApi" },
  rona:   { id:"rona",   label:"RONA / RONA+",  emoji:"🔴",  color:"#EF4444", api:"Apify",       note:"rona.ca via Apify" },
  kent:   { id:"kent",   label:"Kent Building", emoji:"🟢",  color:"#10B981", api:"ScraperAPI",  note:"kent.ca — Atlantic CA" },
};

const LIVE_PRICES_CAD = {
  hd_ca: {
    "Hardwood Flooring":      { price:5.49,  unit:"sq ft",  sku:"1001234567" },
    "Laminate Flooring":      { price:3.19,  unit:"sq ft",  sku:"1000987654" },
    "Vinyl Plank (LVP)":      { price:3.79,  unit:"sq ft",  sku:"1001122334" },
    "Ceramic Tile":           { price:2.89,  unit:"sq ft",  sku:"1000556677" },
    "Drywall Sheet (4x8)":    { price:17.49, unit:"sheet",  sku:"1000112233" },
    "Drywall Compound":       { price:26.49, unit:"bucket", sku:"1000445566" },
    "Interior Paint (1 gal)": { price:44.98, unit:"gallon", sku:"1001778899" },
    "Primer (1 gal)":         { price:34.98, unit:"gallon", sku:"1001001122" },
    "Baseboard (8 ft)":       { price:9.98,  unit:"piece",  sku:"1000334455" },
    "Quarter Round (8 ft)":   { price:5.98,  unit:"piece",  sku:"1000667788" },
  },
  rona: {
    "Hardwood Flooring":      { price:5.29,  unit:"sq ft",  sku:"RON-FL-001" },
    "Laminate Flooring":      { price:2.99,  unit:"sq ft",  sku:"RON-FL-002" },
    "Vinyl Plank (LVP)":      { price:3.59,  unit:"sq ft",  sku:"RON-FL-003" },
    "Ceramic Tile":           { price:2.69,  unit:"sq ft",  sku:"RON-TL-001" },
    "Drywall Sheet (4x8)":    { price:16.99, unit:"sheet",  sku:"RON-DW-001" },
    "Drywall Compound":       { price:24.99, unit:"bucket", sku:"RON-DW-002" },
    "Interior Paint (1 gal)": { price:42.49, unit:"gallon", sku:"RON-PT-001" },
    "Primer (1 gal)":         { price:32.49, unit:"gallon", sku:"RON-PT-002" },
    "Baseboard (8 ft)":       { price:8.99,  unit:"piece",  sku:"RON-BB-001" },
    "Quarter Round (8 ft)":   { price:5.49,  unit:"piece",  sku:"RON-BB-002" },
  },
  kent: {
    "Hardwood Flooring":      { price:5.19,  unit:"sq ft",  sku:"KNT-FL-001" },
    "Laminate Flooring":      { price:2.89,  unit:"sq ft",  sku:"KNT-FL-002" },
    "Vinyl Plank (LVP)":      { price:3.49,  unit:"sq ft",  sku:"KNT-FL-003" },
    "Ceramic Tile":           { price:2.59,  unit:"sq ft",  sku:"KNT-TL-001" },
    "Drywall Sheet (4x8)":    { price:15.99, unit:"sheet",  sku:"KNT-DW-001" },
    "Drywall Compound":       { price:23.49, unit:"bucket", sku:"KNT-DW-002" },
    "Interior Paint (1 gal)": { price:40.99, unit:"gallon", sku:"KNT-PT-001" },
    "Primer (1 gal)":         { price:30.99, unit:"gallon", sku:"KNT-PT-002" },
    "Baseboard (8 ft)":       { price:8.49,  unit:"piece",  sku:"KNT-BB-001" },
    "Quarter Round (8 ft)":   { price:5.19,  unit:"piece",  sku:"KNT-BB-002" },
  },
};

const MANUAL_PRICES = {
  "Hardwood Flooring":      { unit:"sq ft",  price:4.50 },
  "Laminate Flooring":      { unit:"sq ft",  price:2.80 },
  "Vinyl Plank (LVP)":      { unit:"sq ft",  price:3.20 },
  "Ceramic Tile":           { unit:"sq ft",  price:2.50 },
  "Drywall Sheet (4x8)":    { unit:"sheet",  price:14.99 },
  "Drywall Compound":       { unit:"bucket", price:22.00 },
  "Interior Paint (1 gal)": { unit:"gallon", price:38.00 },
  "Primer (1 gal)":         { unit:"gallon", price:29.00 },
  "Baseboard (8 ft)":       { unit:"piece",  price:8.50 },
  "Quarter Round (8 ft)":   { unit:"piece",  price:5.00 },
};

const BATHROOM_PACKAGES = {
  "2pc": { label:"2-Piece", sub:"Toilet + Sink",          labor:2200, materials:1450 },
  "3pc": { label:"3-Piece", sub:"+ Shower / Tub",         labor:3900, materials:3400 },
  "4pc": { label:"4-Piece", sub:"+ Bathtub (full reno)",  labor:5400, materials:5100 },
};

const COMMERCIAL_ITEMS = [
  { id:"plumbing",    label:"Plumbing",            icon:"🔧" },
  { id:"hvac",        label:"HVAC",                icon:"❄️" },
  { id:"hood",        label:"Kitchen Hood",        icon:"🍳" },
  { id:"tiling",      label:"Tiling",              icon:"⬜" },
  { id:"inspection",  label:"City Inspection Fee", icon:"🏛️" },
  { id:"architect",   label:"Architect Fee",       icon:"📐" },
];

const CREW = [
  { id:1, name:"Marco S.", pin:"1234", avatar:"MS", role:"Lead Installer",   color:"#3B82F6" },
  { id:2, name:"Dev P.",   pin:"5678", avatar:"DP", role:"Drywaller",        color:"#8B5CF6" },
  { id:3, name:"Ali R.",   pin:"9012", avatar:"AR", role:"Tile & Flooring",  color:"#10B981" },
];

const INITIAL_TASKS = [
  { id:1, project:"Elm Street Reno",    crew:1, task:"Install hardwood — living room", status:"in_progress", photos:2 },
  { id:2, project:"Elm Street Reno",    crew:2, task:"Drywall — master bedroom",       status:"done",        photos:4 },
  { id:3, project:"Commercial Unit 4B", crew:3, task:"Tile kitchen floor",             status:"not_started", photos:0 },
  { id:4, project:"Commercial Unit 4B", crew:1, task:"Paint hallways",                 status:"not_started", photos:0 },
  { id:5, project:"Elm Street Reno",    crew:3, task:"Baseboard installation",         status:"in_progress", photos:1 },
];

const FLOORING_MATERIALS = [
  "Hardwood Flooring","Laminate Flooring","Vinyl Plank (LVP)","Ceramic Tile",
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt  = (n) => `$${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")} CAD`;
const fmtN = (n) => `$${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
const genQuoteNum = () => `BQ-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`;
const today    = () => new Date().toISOString().slice(0,10);
const addDays  = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };
const statusMeta = {
  done:        { label:"Done",        color:"#10B981" },
  in_progress: { label:"In Progress", color:"#F59E0B" },
  not_started: { label:"Not Started", color:"#64748B" },
};

/* ─── Style constants ─────────────────────────────────────────────────────── */
const S = {
  card: {
    background:"var(--card)",
    border:"1px solid var(--border)",
    borderRadius:"var(--radius-lg)",
    padding:"20px 22px",
    marginBottom:16,
  },
  input: {
    background:"var(--surface)",
    border:"1px solid var(--border-soft)",
    borderRadius:"var(--radius)",
    color:"var(--text)",
    padding:"10px 14px",
    width:"100%",
    fontSize:14,
    boxSizing:"border-box",
  },
  label: {
    color:"var(--muted)",
    fontSize:11,
    marginBottom:5,
    display:"block",
    textTransform:"uppercase",
    letterSpacing:"0.07em",
    fontWeight:600,
  },
  pill: (active, color) => ({
    padding:"5px 13px",
    borderRadius:99,
    fontSize:12,
    cursor:"pointer",
    fontWeight: active ? 700 : 500,
    background: active ? color+"22" : "transparent",
    border:`1px solid ${active ? color : "var(--border-soft)"}`,
    color: active ? color : "var(--muted)",
    transition:"all 0.15s",
  }),
};

/* ─── NavBar ────────────────────────────────────────────────────────────── */
function NavBar({ title, onBack, right }) {
  return (
    <div className="no-print" style={{
      background:"var(--surface)",
      borderBottom:"1px solid var(--border)",
      padding:"0 20px",
      height:56,
      display:"flex",
      alignItems:"center",
      gap:12,
      position:"sticky",
      top:0,
      zIndex:100,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background:"none",border:"none",color:"var(--muted)",
          cursor:"pointer",display:"flex",alignItems:"center",
          gap:4,padding:"6px 0",fontSize:13,fontWeight:600,
        }}>
          <ChevronLeft size={18}/> Back
        </button>
      )}
      <span style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:17,color:"var(--text)" }}>
        {title}
      </span>
      {right && <div style={{ marginLeft:"auto" }}>{right}</div>}
    </div>
  );
}

/* ─── SectionCard ──────────────────────────────────────────────────────── */
function SectionCard({ title, icon: Icon, children, defaultOpen=true }) {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...S.card,padding:0,overflow:"hidden" }}>
      <button onClick={() => setOpen(v=>!v)} style={{
        background:"none",border:"none",cursor:"pointer",
        width:"100%",textAlign:"left",
        padding:"16px 20px",
        display:"flex",alignItems:"center",gap:10,
        color:"var(--text)",
      }}>
        {Icon && <Icon size={16} style={{ color:"var(--accent)" }}/>}
        <span style={{ fontWeight:700,fontSize:15,flex:1 }}>{title}</span>
        {open
          ? <ChevronUp size={16} style={{ color:"var(--muted)" }}/>
          : <ChevronDown size={16} style={{ color:"var(--muted)" }}/>
        }
      </button>
      {open && <div style={{ padding:"0 20px 20px" }}>{children}</div>}
    </div>
  );
}

/* ─── VendorPills ──────────────────────────────────────────────────────── */
function VendorPills({ category, vendors, setVendor, fetchedPrices, fetchingPrice, simulateFetch, materials }) {
  const active = vendors[category];
  return (
    <div style={{ marginBottom:16 }}>
      <label style={S.label}>Pricing Source</label>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
        {Object.values(VENDORS).map(vnd => (
          <button key={vnd.id} onClick={() => {
            setVendor(category,vnd.id);
            if (vnd.id!=="manual" && materials) {
              materials.forEach(m => {
                const key = `${vnd.id}_${m}`;
                if (!fetchedPrices[key]) simulateFetch(category,m,vnd.id);
              });
            }
          }} style={S.pill(active===vnd.id,vnd.color)}>
            {vnd.emoji} {vnd.label}
          </button>
        ))}
      </div>
      {active!=="manual" && (() => {
        const v = VENDORS[active];
        const isFetching = materials && materials.some(m => fetchingPrice[`${active}_${m}`]);
        const allDone    = materials && materials.every(m => fetchedPrices[`${active}_${m}`]);
        return (
          <div style={{ marginTop:8,fontSize:11,color:v.color,display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:v.color,display:"inline-block",flexShrink:0 }}/>
            Live CAD pricing · {v.note}
            {isFetching && <span className="animate-pulse" style={{ color:"var(--muted)" }}>⟳ Fetching…</span>}
            {!isFetching && allDone && materials && (
              <span style={{ color:"var(--muted)" }}>
                Updated {fetchedPrices[`${active}_${materials[0]}`]?.fetchedAt}
              </span>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ─── PriceBadge ───────────────────────────────────────────────────────── */
function PriceBadge({ material, category, vendors, fetchingPrice, fetchedPrices }) {
  const v = vendors[category];
  if (v==="manual") return null;
  const key = `${v}_${material}`;
  const isFetching = fetchingPrice[key];
  const fetched = fetchedPrices[key] || LIVE_PRICES_CAD[v]?.[material];
  const vendor = VENDORS[v];
  return (
    <span style={{
      fontSize:11,marginLeft:8,padding:"2px 8px",borderRadius:8,
      background:vendor.color+"22",color:vendor.color,fontWeight:700,
      display:"inline-flex",alignItems:"center",gap:3,
    }}>
      {isFetching
        ? <RefreshCw size={10} className="animate-spin"/>
        : fetched ? `${vendor.emoji} ${fmtN(fetched.price)}` : "—"
      }
    </span>
  );
}

/* ─── PriceCompare ─────────────────────────────────────────────────────── */
function PriceCompare({ material }) {
  const entries = ["hd_ca","rona","kent"]
    .map(v => ({ v, p: LIVE_PRICES_CAD[v]?.[material]?.price }))
    .filter(x => x.p!=null);
  if (!entries.length) return null;
  const min = Math.min(...entries.map(x=>x.p));
  return (
    <div style={{ marginTop:10,display:"flex",gap:6,flexWrap:"wrap" }}>
      {entries.map(({ v, p }) => (
        <span key={v} style={{
          fontSize:11,padding:"3px 9px",borderRadius:8,
          background: p===min ? "#064E3B" : "var(--surface)",
          border:`1px solid ${p===min ? "var(--green)" : "var(--border)"}`,
          color: p===min ? "var(--green)" : "var(--muted)",
          fontWeight: p===min ? 700 : 400,
          display:"inline-flex",alignItems:"center",gap:4,
        }}>
          {VENDORS[v].emoji} {VENDORS[v].label}: ${p.toFixed(2)}
          {p===min && <span style={{ background:"var(--green)",color:"#000",borderRadius:4,padding:"0 4px",fontSize:10,fontWeight:700 }}>Best</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Toast ────────────────────────────────────────────────────────────── */
function Toast({ msg, type="success", onClose }) {
  const colors = { success:"var(--green)",error:"var(--red)",info:"var(--blue)" };
  return (
    <div className="animate-fade no-print" style={{
      position:"fixed",bottom:24,right:24,zIndex:9999,
      background:"var(--card)",
      border:`1px solid ${colors[type]}`,
      borderRadius:"var(--radius-lg)",
      padding:"12px 20px",
      display:"flex",alignItems:"center",gap:12,
      boxShadow:"0 8px 48px rgba(0,0,0,0.6)",
      maxWidth:360,
    }}>
      <span style={{ color:colors[type],flexShrink:0 }}>
        {type==="success" ? <Check size={18}/> : <AlertCircle size={18}/>}
      </span>
      <span style={{ fontSize:13,color:"var(--text)" }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--muted)",cursor:"pointer",marginLeft:"auto",padding:0 }}>
        <X size={16}/>
      </button>
    </div>
  );
}

/* ─── PrintableQuote ───────────────────────────────────────────────────── */
function PrintableQuote({ client, quoteNum, quoteDate, expiry, notes, quoteTab,
  floorSqft, floorMat, drywallSqft, paintSqft, baseboardLf, bathrooms, commercial,
  calcFloor, calcDrywall, calcPaint, calcBaseboard, calcBaths, calcComm,
  materialTotal, laborTotal, grandTotal }) {
  const lines = [
    { label:"Flooring",   val:calcFloor(),     detail: floorSqft?`${floorSqft} sq ft ${floorMat}`:null },
    { label:"Drywall",    val:calcDrywall(),   detail: drywallSqft?`${drywallSqft} sq ft wall area`:null },
    { label:"Paint",      val:calcPaint(),     detail: paintSqft?`${paintSqft} sq ft house`:null },
    { label:"Baseboards", val:calcBaseboard(), detail: baseboardLf?`${baseboardLf} linear ft`:null },
    { label:"Bathrooms",  val:calcBaths(),     detail: null },
    { label:"Commercial", val:calcComm(),      detail: null },
  ].filter(l=>l.val>0);

  return (
    <div id="printable-quote" style={{
      fontFamily:"Georgia,'Times New Roman',serif",
      color:"#1a1a1a",padding:"40px 48px",
      maxWidth:800,margin:"0 auto",background:"#fff",
    }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,paddingBottom:20,borderBottom:"2px solid #1a1a1a" }}>
        <div>
          <div style={{ fontSize:28,fontWeight:700,fontFamily:"sans-serif",letterSpacing:"-0.5px" }}>🏗️ BuildQuote</div>
          <div style={{ fontSize:13,color:"#555",marginTop:4 }}>Renovation Quoting & Field Operations</div>
          <div style={{ fontSize:11,color:"#888",marginTop:2 }}>All amounts in Canadian Dollars (CAD)</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:20,fontWeight:700,fontFamily:"sans-serif" }}>{quoteNum}</div>
          <div style={{ fontSize:12,color:"#555",marginTop:4 }}>Date: {quoteDate}</div>
          {expiry && <div style={{ fontSize:12,color:"#555" }}>Valid until: {expiry}</div>}
        </div>
      </div>
      {(client.name||client.address||client.email||client.phone) && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",color:"#888",fontFamily:"sans-serif",marginBottom:6 }}>Prepared For</div>
          {client.name    && <div style={{ fontWeight:700,fontSize:16,fontFamily:"sans-serif" }}>{client.name}</div>}
          {client.address && <div style={{ fontSize:13,color:"#444",marginTop:2 }}>{client.address}</div>}
          {client.phone   && <div style={{ fontSize:13,color:"#444" }}>{client.phone}</div>}
          {client.email   && <div style={{ fontSize:13,color:"#444" }}>{client.email}</div>}
        </div>
      )}
      <div style={{ marginBottom:20,fontSize:13,fontFamily:"sans-serif" }}>
        <span style={{ background:"#f0f4ff",border:"1px solid #c7d3f0",padding:"3px 10px",borderRadius:4,fontSize:12,fontWeight:600 }}>
          {quoteTab==="residential" ? "Residential Renovation" : "Commercial Project"}
        </span>
      </div>
      <table style={{ width:"100%",borderCollapse:"collapse",marginBottom:28,fontFamily:"sans-serif" }}>
        <thead>
          <tr style={{ borderBottom:"2px solid #1a1a1a" }}>
            <th style={{ textAlign:"left",padding:"8px 0",fontSize:12,textTransform:"uppercase",letterSpacing:"0.06em",color:"#555" }}>Scope</th>
            <th style={{ textAlign:"left",padding:"8px 0",fontSize:12,textTransform:"uppercase",letterSpacing:"0.06em",color:"#555" }}>Details</th>
            <th style={{ textAlign:"right",padding:"8px 0",fontSize:12,textTransform:"uppercase",letterSpacing:"0.06em",color:"#555" }}>Amount (CAD)</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l,i) => (
            <tr key={l.label} style={{ borderBottom:"1px solid #e8e8e8",background:i%2===0?"#fafafa":"#fff" }}>
              <td style={{ padding:"10px 0",fontWeight:600,fontSize:13 }}>{l.label}</td>
              <td style={{ padding:"10px 8px",color:"#666",fontSize:12 }}>{l.detail||"—"}</td>
              <td style={{ padding:"10px 0",textAlign:"right",fontWeight:600,fontSize:13 }}>{fmtN(l.val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop:"2px solid #1a1a1a",paddingTop:16,maxWidth:320,marginLeft:"auto",fontFamily:"sans-serif" }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6 }}>
          <span style={{ color:"#555" }}>Materials Subtotal</span><span style={{ fontWeight:600 }}>{fmtN(materialTotal)}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:10 }}>
          <span style={{ color:"#555" }}>Labour (35%)</span><span style={{ fontWeight:600 }}>{fmtN(laborTotal)}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:700,borderTop:"2px solid #1a1a1a",paddingTop:12 }}>
          <span>Total</span><span>{fmtN(grandTotal)} CAD</span>
        </div>
      </div>
      {notes && (
        <div style={{ marginTop:32,fontFamily:"sans-serif" }}>
          <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",color:"#888",marginBottom:8 }}>Notes</div>
          <div style={{ fontSize:13,color:"#444",lineHeight:1.6,whiteSpace:"pre-wrap",padding:"12px 16px",background:"#f9f9f9",border:"1px solid #e0e0e0",borderRadius:4 }}>{notes}</div>
        </div>
      )}
      <div style={{ marginTop:40,paddingTop:16,borderTop:"1px solid #ddd",fontSize:11,color:"#aaa",fontFamily:"sans-serif",display:"flex",justifyContent:"space-between" }}>
        <span>BuildQuote · Renovation Quoting & Field Ops · Canadian Market Edition</span>
        <span>Confidential — {quoteDate}</span>
      </div>
    </div>
  );
}

/* ─── HomeView ─────────────────────────────────────────────────────────── */
function HomeView({ setView, totalProjects, completedTasks, totalTasks }) {
  const pct = totalTasks ? Math.round((completedTasks/totalTasks)*100) : 0;
  return (
    <div className="animate-fade" style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,
    }}>
      <div style={{ textAlign:"center",marginBottom:36,maxWidth:440 }}>
        <div style={{ fontSize:58,lineHeight:1,marginBottom:16,filter:"drop-shadow(0 4px 20px #F59E0B55)" }}>🏗️</div>
        <h1 style={{
          fontFamily:"var(--font-display)",fontSize:40,fontWeight:700,
          color:"var(--text)",letterSpacing:"-0.5px",margin:0,lineHeight:1.1,
        }}>BuildQuote</h1>
        <p style={{ color:"var(--muted)",marginTop:10,fontSize:15 }}>
          Renovation quoting & crew management — Canadian market
        </p>
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginTop:14,flexWrap:"wrap" }}>
          {Object.values(VENDORS).filter(v=>v.id!=="manual").map(v => (
            <span key={v.id} style={{
              fontSize:11,padding:"4px 12px",borderRadius:99,
              background:"var(--card)",border:`1px solid ${v.color}44`,
              color:v.color,fontWeight:600,
            }}>{v.emoji} {v.label}</span>
          ))}
          <span style={{ fontSize:11,padding:"4px 12px",borderRadius:99,background:"var(--card)",border:"1px solid var(--border)",color:"var(--muted)" }}>
            ✏️ Manual
          </span>
        </div>
      </div>
      <div style={{ display:"flex",gap:12,marginBottom:28,width:"100%",maxWidth:480 }}>
        {[
          { label:"Active Projects", value:totalProjects,  color:"var(--blue)"   },
          { label:"Tasks Complete",  value:`${completedTasks}/${totalTasks}`, color:"var(--green)"  },
          { label:"Completion",      value:`${pct}%`,       color:"var(--accent)" },
        ].map(s => (
          <div key={s.label} style={{
            flex:1,background:"var(--card)",border:"1px solid var(--border)",
            borderRadius:"var(--radius-lg)",padding:"12px 14px",textAlign:"center",
          }}>
            <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:22,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11,color:"var(--muted)",marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:10 }}>
        {[
          { icon:<FileText size={24}/>, title:"Quote Builder", sub:"Residential & commercial — live CAD pricing", view:"quote", color:"var(--accent)", grad:"linear-gradient(135deg,#F59E0B22,#92400E11)" },
          { icon:<HardHat size={24}/>,  title:"Field Ops",     sub:"Assign and track crew tasks by project",      view:"field", color:"var(--blue)",   grad:"linear-gradient(135deg,#3B82F622,#1E3A8A11)" },
          { icon:<Smartphone size={24}/>,title:"Crew Login",   sub:"Worker task view — PIN login, no friction",   view:"crew",  color:"var(--green)",  grad:"linear-gradient(135deg,#10B98122,#064E3B11)" },
        ].map(item => (
          <button key={item.view} onClick={() => setView(item.view)} style={{
            background:item.grad,
            border:`1px solid ${item.color}33`,
            borderRadius:"var(--radius-xl)",
            padding:"18px 22px",
            cursor:"pointer",
            textAlign:"left",
            display:"flex",alignItems:"center",gap:16,
            color:"var(--text)",
            transition:"transform 0.15s,border-color 0.15s,box-shadow 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=item.color+"88"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 8px 32px ${item.color}22`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=item.color+"33"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <span style={{ color:item.color,flexShrink:0 }}>{item.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,fontSize:16,color:item.color }}>{item.title}</div>
              <div style={{ color:"var(--muted)",fontSize:13,marginTop:3 }}>{item.sub}</div>
            </div>
            <ChevronRight size={18} style={{ color:"var(--muted)",flexShrink:0 }}/>
          </button>
        ))}
      </div>
      <div style={{ marginTop:32,fontSize:11,color:"var(--muted)" }}>
        BuildQuote v2.0 · Canadian Market Edition · March 2026
      </div>
    </div>
  );
}

/* ─── QuoteView ────────────────────────────────────────────────────────── */
function QuoteView({
  quoteTab, setQuoteTab,
  floorSqft, setFloorSqft, floorMat, setFloorMat,
  drywallSqft, setDrywallSqft,
  paintSqft, setPaintSqft,
  baseboardLf, setBaseboardLf,
  bathrooms, setBathrooms,
  commercial, setCommercial,
  vendors, setVendor, fetchingPrice, fetchedPrices, simulateFetch,
  calcFloor, calcDrywall, calcPaint, calcBaseboard, calcBaths, calcComm,
  materialTotal, laborTotal, grandTotal,
  client, setClient,
  quoteNum, quoteDate, setQuoteDate, expiry, setExpiry,
  notes, setNotes,
  setView, showToast,
}) {
  const [laborRate, setLaborRate] = useState(35);
  const laborAmt = materialTotal * (laborRate/100);
  const total    = materialTotal + laborAmt;

  const handlePrint = useCallback(() => {
    showToast("Opening print / save-as-PDF dialog…","info");
    setTimeout(() => window.print(),300);
  },[showToast]);

  const tabBtn = (id, label, color) => (
    <button onClick={() => setQuoteTab(id)} style={{ ...S.pill(quoteTab===id,color),padding:"8px 18px",fontSize:13 }}>
      {label}
    </button>
  );

  const resultRow = (label, val) => val && (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",fontSize:13,borderBottom:"1px solid var(--border)" }}>
      <span style={{ color:"var(--muted)" }}>{label}</span>
      <span style={{ fontWeight:600 }}>{val}</span>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh" }}>
      <NavBar
        title="📋 Quote Builder"
        onBack={() => setView("home")}
        right={<div style={{ display:"flex",gap:8 }}>{tabBtn("residential","Residential","var(--accent)")}{tabBtn("commercial","Commercial","var(--blue)")}</div>}
      />
      <div style={{ display:"flex",maxWidth:1160,margin:"0 auto",padding:"24px 16px",gap:24,alignItems:"flex-start" }}>
        {/* LEFT */}
        <div style={{ flex:1,minWidth:0 }}>

          {/* Client Info */}
          <SectionCard title="Client Information" icon={User}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.label}>Client Name</label>
                <input style={S.input} placeholder="e.g. Burhan Khalid"
                  value={client.name} onChange={e=>setClient(c=>({...c,name:e.target.value}))}/>
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.label}>Project Address</label>
                <input style={S.input} placeholder="123 Main St, Toronto, ON M5V 2T1"
                  value={client.address} onChange={e=>setClient(c=>({...c,address:e.target.value}))}/>
              </div>
              <div>
                <label style={S.label}>Phone</label>
                <input style={S.input} placeholder="(647) 555-0000"
                  value={client.phone} onChange={e=>setClient(c=>({...c,phone:e.target.value}))}/>
              </div>
              <div>
                <label style={S.label}>Email</label>
                <input style={S.input} placeholder="client@email.com"
                  value={client.email} onChange={e=>setClient(c=>({...c,email:e.target.value}))}/>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12 }}>
              <div>
                <label style={S.label}>Quote #</label>
                <input style={{ ...S.input,background:"var(--bg)",fontFamily:"var(--font-display)",fontWeight:700 }} readOnly value={quoteNum}/>
              </div>
              <div>
                <label style={S.label}>Quote Date</label>
                <input style={S.input} type="date" value={quoteDate} onChange={e=>setQuoteDate(e.target.value)}/>
              </div>
              <div>
                <label style={S.label}>Valid Until</label>
                <input style={S.input} type="date" value={expiry} onChange={e=>setExpiry(e.target.value)}/>
              </div>
            </div>
          </SectionCard>

          {quoteTab==="residential" && (<>
            {/* FLOORING */}
            <SectionCard title="🪵 Flooring" icon={Layers}>
              <VendorPills category="flooring" {...{vendors,setVendor,fetchedPrices,fetchingPrice,simulateFetch}} materials={[floorMat]}/>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={S.label}>Square Footage</label>
                  <input style={S.input} type="number" min="0" placeholder="e.g. 450"
                    value={floorSqft} onChange={e=>setFloorSqft(e.target.value)}/>
                </div>
                <div>
                  <label style={S.label}>Material</label>
                  <select style={S.input} value={floorMat} onChange={e=>{
                    setFloorMat(e.target.value);
                    if (vendors.flooring!=="manual") simulateFetch("flooring",e.target.value,vendors.flooring);
                  }}>
                    {FLOORING_MATERIALS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {floorSqft && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"var(--surface)",borderRadius:"var(--radius)",display:"flex",alignItems:"center",flexWrap:"wrap",gap:4 }}>
                  <span style={{ color:"var(--muted)",fontSize:13 }}>${MANUAL_PRICES[floorMat]?.price.toFixed(2)}/sq ft · </span>
                  <span style={{ color:"var(--accent)",fontWeight:700,fontSize:15 }}>{fmt(calcFloor())}</span>
                  <PriceBadge material={floorMat} category="flooring" {...{vendors,fetchingPrice,fetchedPrices}}/>
                  <PriceCompare material={floorMat}/>
                </div>
              )}
            </SectionCard>

            {/* DRYWALL */}
            <SectionCard title="🧱 Drywall" icon={Layers}>
              <VendorPills category="drywall" {...{vendors,setVendor,fetchedPrices,fetchingPrice,simulateFetch}} materials={["Drywall Sheet (4x8)","Drywall Compound"]}/>
              <div>
                <label style={S.label}>Total Wall Area (sq ft)</label>
                <input style={S.input} type="number" min="0" placeholder="e.g. 1200"
                  value={drywallSqft} onChange={e=>setDrywallSqft(e.target.value)}/>
              </div>
              {drywallSqft && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"var(--surface)",borderRadius:"var(--radius)" }}>
                  <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:4 }}>
                    <span style={{ color:"var(--muted)",fontSize:13 }}>{Math.ceil(parseFloat(drywallSqft)/32)} sheets · </span>
                    <span style={{ color:"var(--accent)",fontWeight:700,fontSize:15 }}>{fmt(calcDrywall())}</span>
                  </div>
                  <PriceCompare material="Drywall Sheet (4x8)"/>
                </div>
              )}
            </SectionCard>

            {/* PAINT */}
            <SectionCard title="🎨 Paint" icon={Paintbrush}>
              <VendorPills category="paint" {...{vendors,setVendor,fetchedPrices,fetchingPrice,simulateFetch}} materials={["Interior Paint (1 gal)","Primer (1 gal)"]}/>
              <div>
                <label style={S.label}>House Square Footage</label>
                <input style={S.input} type="number" min="0" placeholder="e.g. 1800"
                  value={paintSqft} onChange={e=>setPaintSqft(e.target.value)}/>
              </div>
              {paintSqft && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"var(--surface)",borderRadius:"var(--radius)" }}>
                  <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:4 }}>
                    <span style={{ color:"var(--muted)",fontSize:13 }}>{Math.ceil(parseFloat(paintSqft)/400)} gal paint + primer · </span>
                    <span style={{ color:"var(--accent)",fontWeight:700,fontSize:15 }}>{fmt(calcPaint())}</span>
                  </div>
                  <PriceCompare material="Interior Paint (1 gal)"/>
                </div>
              )}
            </SectionCard>

            {/* BASEBOARDS */}
            <SectionCard title="📏 Baseboards" icon={RulerIcon}>
              <VendorPills category="baseboard" {...{vendors,setVendor,fetchedPrices,fetchingPrice,simulateFetch}} materials={["Baseboard (8 ft)"]}/>
              <div>
                <label style={S.label}>Linear Footage</label>
                <input style={S.input} type="number" min="0" placeholder="e.g. 320"
                  value={baseboardLf} onChange={e=>setBaseboardLf(e.target.value)}/>
              </div>
              {baseboardLf && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"var(--surface)",borderRadius:"var(--radius)" }}>
                  <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:4 }}>
                    <span style={{ color:"var(--muted)",fontSize:13 }}>{Math.ceil(parseFloat(baseboardLf)/8)} pieces · </span>
                    <span style={{ color:"var(--accent)",fontWeight:700,fontSize:15 }}>{fmt(calcBaseboard())}</span>
                  </div>
                  <PriceCompare material="Baseboard (8 ft)"/>
                </div>
              )}
            </SectionCard>

            {/* BATHROOMS */}
            <SectionCard title="🚿 Bathroom Renovations" icon={ShowerHead}>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {Object.entries(BATHROOM_PACKAGES).map(([type,pkg]) => (
                  <div key={type} style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"14px 16px",background:"var(--surface)",
                    borderRadius:"var(--radius)",border:"1px solid var(--border)",gap:12,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:14 }}>{pkg.label}</div>
                      <div style={{ color:"var(--muted)",fontSize:12,marginTop:2 }}>{pkg.sub}</div>
                      <div style={{ color:"var(--muted)",fontSize:11,marginTop:3 }}>
                        Labour {fmt(pkg.labor)} · Materials {fmt(pkg.materials)}
                      </div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
                      <button onClick={()=>setBathrooms(b=>({...b,[type]:Math.max(0,b[type]-1)}))} style={{
                        width:32,height:32,borderRadius:"var(--radius)",
                        background:"var(--card)",border:"1px solid var(--border-soft)",
                        color:"var(--text)",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}><Minus size={14}/></button>
                      <span style={{ fontWeight:700,fontSize:16,width:24,textAlign:"center",fontFamily:"var(--font-display)" }}>{bathrooms[type]}</span>
                      <button onClick={()=>setBathrooms(b=>({...b,[type]:b[type]+1}))} style={{
                        width:32,height:32,borderRadius:"var(--radius)",
                        background:"var(--accent)",border:"none",
                        color:"#000",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}><Plus size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              {calcBaths()>0 && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"var(--surface)",borderRadius:"var(--radius)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ color:"var(--muted)",fontSize:13 }}>Bathrooms subtotal</span>
                  <span style={{ color:"var(--accent)",fontWeight:700,fontSize:15 }}>{fmt(calcBaths())}</span>
                </div>
              )}
            </SectionCard>
          </>)}

          {quoteTab==="commercial" && (
            <div className="animate-fade">
              <div style={{ ...S.card,background:"var(--surface)",borderLeft:"3px solid var(--blue)" }}>
                <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                  <Building2 size={16} style={{ color:"var(--blue)",flexShrink:0,marginTop:2 }}/>
                  <p style={{ color:"var(--muted)",fontSize:13,lineHeight:1.6 }}>
                    Enter lump-sum estimates for each commercial scope. These are typically quoted by sub-trades and entered manually.
                  </p>
                </div>
              </div>
              {COMMERCIAL_ITEMS.map(item => (
                <div key={item.id} style={S.card}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:16 }}>
                    <div style={{ fontWeight:600,fontSize:15 }}>{item.icon} {item.label}</div>
                    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                      <span style={{ color:"var(--muted)",fontSize:13 }}>CAD $</span>
                      <input style={{ ...S.input,width:160 }} type="number" min="0" placeholder="0.00"
                        value={commercial[item.id]||""} onChange={e=>setCommercial(p=>({...p,[item.id]:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              ))}
              {calcComm()>0 && (
                <div style={{ ...S.card,background:"var(--surface)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontWeight:600 }}>Commercial Subtotal</span>
                  <span style={{ color:"var(--blue)",fontWeight:700,fontSize:18 }}>{fmt(calcComm())}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <SectionCard title="Notes / Terms" icon={StickyNote} defaultOpen={false}>
            <textarea
              style={{ ...S.input,minHeight:100,resize:"vertical",lineHeight:1.6 }}
              placeholder="Payment terms, special conditions, scope exclusions…"
              value={notes} onChange={e=>setNotes(e.target.value)}
            />
          </SectionCard>
        </div>

        {/* RIGHT: sticky summary */}
        <div className="no-print" style={{ width:300,flexShrink:0 }}>
          <div style={{ position:"sticky",top:76 }}>
            <div style={{
              ...S.card,
              background:"var(--surface)",
              border:"1px solid #F59E0B33",
              boxShadow:"0 0 40px #F59E0B22",
            }}>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:16,marginBottom:4 }}>Quote Summary</div>
              <div style={{ fontSize:11,color:"var(--muted)",marginBottom:16 }}>All amounts in Canadian Dollars (CAD)</div>

              {/* Active sources */}
              <div style={{ marginBottom:16,padding:"10px 12px",background:"var(--bg)",borderRadius:"var(--radius)",border:"1px solid var(--border)" }}>
                <div style={{ fontSize:11,color:"var(--muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em" }}>Active Pricing Sources</div>
                {Object.entries(vendors).map(([cat,v]) => (
                  <div key={cat} style={{ fontSize:11,color:VENDORS[v].color,marginBottom:2,display:"flex",gap:4 }}>
                    <span>{VENDORS[v].emoji}</span>
                    <span style={{ color:"var(--muted)",textTransform:"capitalize" }}>{cat}:</span>
                    <span>{VENDORS[v].label}</span>
                  </div>
                ))}
              </div>

              {/* Lines */}
              {[
                { label:"Flooring",   val:calcFloor()   },
                { label:"Drywall",    val:calcDrywall() },
                { label:"Paint",      val:calcPaint()   },
                { label:"Baseboards", val:calcBaseboard()},
                { label:"Bathrooms",  val:calcBaths()   },
                { label:"Commercial", val:calcComm()    },
              ].filter(l=>l.val>0).map(l => resultRow(l.label, fmt(l.val)))}

              {total===0 && (
                <div style={{ padding:"20px 0",textAlign:"center",color:"var(--muted)",fontSize:13 }}>
                  Enter quantities above to build your quote
                </div>
              )}

              {total>0 && (
                <>
                  <div style={{ borderTop:"1px solid var(--border)",paddingTop:12,marginTop:8 }}>
                    {resultRow("Materials",fmt(materialTotal))}
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",fontSize:13,borderBottom:"1px solid var(--border)" }}>
                      <span style={{ color:"var(--muted)" }}>Labour ({laborRate}%)</span>
                      <span style={{ fontWeight:600 }}>{fmt(laborAmt)}</span>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0 6px",borderTop:"1px solid var(--border)",marginTop:8 }}>
                      <span style={{ fontWeight:700,fontSize:16 }}>Total (CAD)</span>
                      <span style={{ color:"var(--accent)",fontWeight:700,fontSize:26,fontFamily:"var(--font-display)" }}>{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Labour rate slider */}
                  <div style={{ marginTop:14,padding:"10px 12px",background:"var(--bg)",borderRadius:"var(--radius)",border:"1px solid var(--border)" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.05em" }}>Labour Rate</span>
                      <span style={{ fontSize:11,fontWeight:700,color:"var(--accent)" }}>{laborRate}%</span>
                    </div>
                    <input type="range" min="20" max="60" value={laborRate}
                      onChange={e=>setLaborRate(Number(e.target.value))}
                      style={{ width:"100%",accentColor:"var(--accent)" }}/>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)" }}>
                      <span>20%</span><span>60%</span>
                    </div>
                  </div>
                </>
              )}

              <div style={{ marginTop:16,display:"flex",flexDirection:"column",gap:8 }}>
                <button onClick={handlePrint} style={{
                  background:"var(--accent)",color:"#000",
                  border:"none",borderRadius:"var(--radius)",
                  padding:"12px 0",fontWeight:700,fontSize:14,
                  cursor:"pointer",display:"flex",alignItems:"center",
                  justifyContent:"center",gap:8,width:"100%",
                }}><Printer size={16}/> Export PDF Quote</button>
                <button onClick={()=>showToast("Quote saved!","success")} style={{
                  background:"transparent",color:"var(--muted)",
                  border:"1px solid var(--border)",borderRadius:"var(--radius)",
                  padding:"10px 0",fontWeight:500,fontSize:13,
                  cursor:"pointer",display:"flex",alignItems:"center",
                  justifyContent:"center",gap:8,width:"100%",
                }}><Save size={15}/> Save Quote</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FieldView ────────────────────────────────────────────────────────── */
function FieldView({ tasks, setTasks, setView }) {
  const [filter,setFilter] = useState("all");
  const done = tasks.filter(t=>t.status==="done").length;
  const pct  = Math.round((done/tasks.length)*100);
  const filtered = filter==="all" ? tasks : tasks.filter(t=>t.status===filter);
  const projects = [...new Set(tasks.map(t=>t.project))];
  const updateTask = (id,status) => setTasks(prev=>prev.map(t=>t.id===id?{...t,status}:t));

  return (
    <div style={{ minHeight:"100vh" }} className="animate-fade">
      <NavBar title="👷 Field Ops" onBack={()=>setView("home")}/>
      <div style={{ maxWidth:960,margin:"0 auto",padding:"24px 16px" }}>

        {/* Progress card */}
        <div style={{ ...S.card,background:"var(--surface)",marginBottom:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:700,fontSize:18 }}>Overall Progress</div>
              <div style={{ color:"var(--muted)",fontSize:13,marginTop:3 }}>{done} of {tasks.length} tasks completed</div>
            </div>
            <div style={{ fontFamily:"var(--font-display)",fontSize:40,fontWeight:700,color:"var(--green)",lineHeight:1 }}>{pct}%</div>
          </div>
          <div style={{ background:"var(--bg)",borderRadius:99,height:10,overflow:"hidden" }}>
            <div style={{ width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,var(--green),var(--blue))",borderRadius:99,transition:"width 0.5s" }}/>
          </div>
        </div>

        {/* Crew cards */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24 }}>
          {CREW.map(c => {
            const mt = tasks.filter(t=>t.crew===c.id);
            const dn = mt.filter(t=>t.status==="done").length;
            const cp = mt.length ? Math.round((dn/mt.length)*100) : 0;
            return (
              <div key={c.id} style={{ ...S.card,marginBottom:0,padding:"16px 18px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                  <div style={{
                    width:38,height:38,borderRadius:"50%",
                    background:c.color+"22",border:`2px solid ${c.color}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:700,fontSize:13,color:c.color,fontFamily:"var(--font-display)",
                    flexShrink:0,
                  }}>{c.avatar}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14 }}>{c.name}</div>
                    <div style={{ color:"var(--muted)",fontSize:12 }}>{c.role}</div>
                  </div>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:11,color:"var(--muted)" }}>{dn}/{mt.length} done</span>
                  <span style={{ fontSize:11,fontWeight:700,color:c.color }}>{cp}%</span>
                </div>
                <div style={{ background:"var(--bg)",borderRadius:99,height:6 }}>
                  <div style={{ width:`${cp}%`,height:"100%",background:c.color,borderRadius:99,transition:"width 0.5s" }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ fontWeight:700,fontSize:16 }}>All Tasks</div>
          <div style={{ display:"flex",gap:6 }}>
            {["all","not_started","in_progress","done"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={S.pill(filter===f,"var(--accent)")}>
                {f==="all" ? "All" : statusMeta[f].label}
              </button>
            ))}
          </div>
        </div>

        {projects.map(project => {
          const pt = filtered.filter(t=>t.project===project);
          if (!pt.length) return null;
          const pd = tasks.filter(t=>t.project===project&&t.status==="done").length;
          const ptt = tasks.filter(t=>t.project===project).length;
          return (
            <div key={project} style={{ marginBottom:24 }}>
              <div style={{
                display:"flex",alignItems:"center",gap:10,marginBottom:10,
                padding:"10px 14px",background:"var(--surface)",
                borderRadius:"var(--radius)",border:"1px solid var(--border)",
              }}>
                <Building2 size={14} style={{ color:"var(--blue)" }}/>
                <span style={{ fontWeight:600,fontSize:14 }}>{project}</span>
                <span style={{ fontSize:11,color:"var(--muted)",marginLeft:"auto" }}>{pd}/{ptt} tasks</span>
              </div>
              {pt.map(task=>{
                const cm = CREW.find(c=>c.id===task.crew);
                const sm = statusMeta[task.status];
                return (
                  <div key={task.id} style={{ ...S.card,marginLeft:16,marginBottom:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                          <span style={{ fontSize:11,padding:"2px 9px",borderRadius:99,background:sm.color+"22",color:sm.color,fontWeight:700 }}>{sm.label}</span>
                          <span style={{ color:"var(--muted)",fontSize:11 }}>👤 {cm?.name}</span>
                          {task.photos>0 && <span style={{ color:"var(--muted)",fontSize:11 }}>📷 {task.photos}</span>}
                        </div>
                        <div style={{ fontWeight:600,fontSize:15 }}>{task.task}</div>
                      </div>
                      <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                        {task.status==="not_started" && (
                          <button onClick={()=>updateTask(task.id,"in_progress")} style={{
                            background:"#92400E",border:"1px solid var(--accent)",
                            color:"var(--accent)",borderRadius:"var(--radius-sm)",
                            padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,
                            display:"flex",alignItems:"center",gap:4,
                          }}><Hammer size={12}/> Start</button>
                        )}
                        {task.status!=="done" && (
                          <button onClick={()=>updateTask(task.id,"done")} style={{
                            background:"#064E3B",border:"1px solid var(--green)",
                            color:"var(--green)",borderRadius:"var(--radius-sm)",
                            padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,
                            display:"flex",alignItems:"center",gap:4,
                          }}><Check size={12}/> Done</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CrewView ─────────────────────────────────────────────────────────── */
function CrewView({ tasks, setTasks, setView }) {
  const [pin,setPin]         = useState("");
  const [logged,setLogged]   = useState(null);
  const [pinErr,setPinErr]   = useState(false);
  const [shake,setShake]     = useState(false);

  const login = (p) => {
    const found = CREW.find(c=>c.pin===p);
    if (found) { setLogged(found); setPinErr(false); setPin(""); }
    else { setPinErr(true); setShake(true); setTimeout(()=>{setShake(false);setPinErr(false);setPin("");},1200); }
  };
  const updateTask = (id,status) => setTasks(prev=>prev.map(t=>t.id===id?{...t,status}:t));

  if (!logged) return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24 }} className="animate-fade">
      <button onClick={()=>setView("home")} style={{ position:"fixed",top:20,left:20,background:"none",border:"none",color:"var(--muted)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:600 }}>
        <ChevronLeft size={18}/> Back
      </button>
      <div style={{ textAlign:"center",marginBottom:32 }}>
        <div style={{ fontSize:52,marginBottom:12,filter:"drop-shadow(0 4px 16px #10B98155)" }}>👷</div>
        <h2 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:28,color:"var(--text)" }}>Worker Login</h2>
        <p style={{ color:"var(--muted)",marginTop:6,fontSize:15 }}>Enter your 4-digit PIN</p>
      </div>
      <div style={{ display:"flex",gap:14,marginBottom:28,animation:shake?"shakePin 0.4s":"none" }}>
        <style>{`@keyframes shakePin{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{
            width:52,height:52,borderRadius:14,background:"var(--card)",
            border:`2px solid ${pin.length>i?(pinErr?"var(--red)":"var(--green)"):"var(--border)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",transition:"border-color 0.2s",
          }}>
            {pin.length>i && <div style={{ width:14,height:14,borderRadius:"50%",background:pinErr?"var(--red)":"var(--green)" }}/>}
          </div>
        ))}
      </div>
      {pinErr && (
        <div style={{ color:"var(--red)",marginBottom:16,fontSize:14,display:"flex",alignItems:"center",gap:6 }}>
          <AlertCircle size={14}/> Incorrect PIN — try again
        </div>
      )}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:216 }}>
        {[1,2,3,4,5,6,7,8,9,"⌫",0,"✓"].map(k=>(
          <button key={k} onClick={()=>{
            if (k==="⌫") { setPin(p=>p.slice(0,-1)); setPinErr(false); }
            else if (k==="✓") login(pin);
            else if (!pinErr&&pin.length<4) { const next=pin+k; setPin(next); if(next.length===4) setTimeout(()=>login(next),280); }
          }} style={{
            height:62,borderRadius:14,
            background:k==="✓"?"var(--green)":k==="⌫"?"var(--surface)":"var(--card)",
            border:`1px solid ${k==="✓"?"var(--green)":"var(--border)"}`,
            color:k==="✓"?"#000":"var(--text)",
            fontSize:typeof k==="number"?22:18,
            fontWeight:700,cursor:"pointer",
            fontFamily:"var(--font-display)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.92)"}
          onMouseUp={e=>e.currentTarget.style.transform=""}
          onMouseLeave={e=>e.currentTarget.style.transform=""}
          >{k}</button>
        ))}
      </div>
      <div style={{ color:"var(--muted)",fontSize:12,marginTop:24,display:"flex",gap:12 }}>
        {CREW.map(c=>(
          <span key={c.id} style={{ padding:"3px 10px",background:"var(--card)",borderRadius:99,border:"1px solid var(--border)" }}>
            {c.name.split(" ")[0]}: {c.pin}
          </span>
        ))}
      </div>
    </div>
  );

  const myTasks   = tasks.filter(t=>t.crew===logged.id);
  const remaining = myTasks.filter(t=>t.status!=="done").length;
  const cp        = Math.round((myTasks.filter(t=>t.status==="done").length/myTasks.length)*100);

  return (
    <div style={{ minHeight:"100vh",maxWidth:480,margin:"0 auto" }} className="animate-fade">
      <div style={{ background:"var(--surface)",padding:"20px",borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{
              width:44,height:44,borderRadius:"50%",
              background:logged.color+"22",border:`2px solid ${logged.color}66`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:700,fontSize:15,color:logged.color,fontFamily:"var(--font-display)",
            }}>{logged.avatar}</div>
            <div>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:20 }}>Hey, {logged.name.split(" ")[0]} 👋</div>
              <div style={{ color:"var(--muted)",fontSize:13,marginTop:2 }}>
                {remaining>0 ? `${remaining} task${remaining>1?"s":""} remaining` : "All done! 🎉"}
              </div>
            </div>
          </div>
          <button onClick={()=>setLogged(null)} style={{
            background:"var(--card)",border:"1px solid var(--border)",
            color:"var(--muted)",borderRadius:"var(--radius)",
            padding:"7px 12px",cursor:"pointer",fontSize:13,
            display:"flex",alignItems:"center",gap:5,
          }}><LogOut size={13}/> Out</button>
        </div>
        <div style={{ marginTop:14 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,color:"var(--muted)" }}>
            <span>{myTasks.filter(t=>t.status==="done").length}/{myTasks.length} done</span>
            <span style={{ color:logged.color,fontWeight:600 }}>{cp}%</span>
          </div>
          <div style={{ background:"var(--bg)",borderRadius:99,height:6 }}>
            <div style={{ width:`${cp}%`,height:"100%",background:logged.color,borderRadius:99,transition:"width 0.5s" }}/>
          </div>
        </div>
      </div>
      <div style={{ padding:"16px 16px 32px" }}>
        {myTasks.map(task=>{
          const sm=statusMeta[task.status];
          return (
            <div key={task.id} style={{
              background:"var(--card)",borderRadius:"var(--radius-xl)",
              padding:"18px 20px",marginBottom:14,
              border:`2px solid ${task.status==="done"?"var(--green)33":"var(--border)"}`,
              transition:"border-color 0.3s",
            }}>
              <div style={{ fontSize:11,color:sm.color,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.07em",display:"flex",alignItems:"center",gap:6 }}>
                <CircleDot size={10}/>{sm.label}
              </div>
              <div style={{ fontWeight:700,fontSize:17,marginBottom:4,lineHeight:1.3 }}>{task.task}</div>
              <div style={{ color:"var(--muted)",fontSize:13,marginBottom:task.status==="done"?0:16 }}>📍 {task.project}</div>
              {task.status!=="done" && (
                <div style={{ display:"flex",gap:10 }}>
                  {task.status==="not_started" && (
                    <button onClick={()=>updateTask(task.id,"in_progress")} style={{
                      flex:1,padding:"14px 0",background:"var(--accent)",border:"none",
                      borderRadius:"var(--radius)",color:"#000",fontWeight:700,fontSize:15,
                      cursor:"pointer",fontFamily:"var(--font-sans)",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    }}>▶ Start</button>
                  )}
                  {task.status==="in_progress" && (<>
                    <button style={{
                      flex:1,padding:"14px 0",
                      background:"#1E3A8A",border:"1px solid var(--blue)",
                      borderRadius:"var(--radius)",color:"var(--blue)",fontWeight:700,fontSize:14,
                      cursor:"pointer",fontFamily:"var(--font-sans)",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    }}><Camera size={16}/> Add Photo</button>
                    <button onClick={()=>updateTask(task.id,"done")} style={{
                      flex:1,padding:"14px 0",background:"var(--green)",border:"none",
                      borderRadius:"var(--radius)",color:"#000",fontWeight:700,fontSize:15,
                      cursor:"pointer",fontFamily:"var(--font-sans)",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    }}><Check size={16}/> Done</button>
                  </>)}
                </div>
              )}
              {task.status==="done" && (
                <div style={{ color:"var(--green)",fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:6 }}>
                  <Check size={14}/> Completed · {task.photos} photos uploaded
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Root App ──────────────────────────────────────────────────────────── */
export default function App() {
  const [view,setView]         = useState("home");
  const [quoteTab,setQuoteTab] = useState("residential");

  const [floorSqft,setFloorSqft]     = useState("");
  const [floorMat,setFloorMat]       = useState("Hardwood Flooring");
  const [drywallSqft,setDrywallSqft] = useState("");
  const [paintSqft,setPaintSqft]     = useState("");
  const [baseboardLf,setBaseboardLf] = useState("");
  const [bathrooms,setBathrooms]     = useState({ "2pc":0,"3pc":0,"4pc":0 });
  const [commercial,setCommercial]   = useState({});

  const [client,setClient]         = useState({ name:"",address:"",phone:"",email:"" });
  const [quoteNum]                  = useState(genQuoteNum);
  const [quoteDate,setQuoteDate]    = useState(today);
  const [expiry,setExpiry]          = useState(()=>addDays(today(),30));
  const [notes,setNotes]            = useState("");

  const [vendors,setVendors]         = useState({ flooring:"manual",drywall:"manual",paint:"manual",baseboard:"manual" });
  const [fetchingPrice,setFetching]  = useState({});
  const [fetchedPrices,setFetched]   = useState({});

  const [tasks,setTasks] = useState(INITIAL_TASKS);
  const [toast,setToast] = useState(null);

  const showToast = useCallback((msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); },[]);
  const setVendor = (cat,v) => setVendors(prev=>({...prev,[cat]:v}));

  const simulateFetch = async (category,material,vendor) => {
    const key=`${vendor}_${material}`;
    setFetching(prev=>({...prev,[key]:true}));
    await new Promise(r=>setTimeout(r,900+Math.random()*600));
    const result=LIVE_PRICES_CAD[vendor]?.[material];
    if (result) setFetched(prev=>({...prev,[key]:{...result,fetchedAt:new Date().toLocaleTimeString()}}));
    setFetching(prev=>({...prev,[key]:false}));
  };

  const getPrice = (material,category) => {
    const v=vendors[category];
    if (v==="manual") return MANUAL_PRICES[material]?.price||0;
    const cached=fetchedPrices[`${v}_${material}`];
    if (cached) return cached.price;
    return LIVE_PRICES_CAD[v]?.[material]?.price||MANUAL_PRICES[material]?.price||0;
  };

  const calcFloor    = () => (parseFloat(floorSqft)||0)*getPrice(floorMat,"flooring");
  const calcDrywall  = () => { const s=parseFloat(drywallSqft)||0; const sh=Math.ceil(s/32); return sh*getPrice("Drywall Sheet (4x8)","drywall")+Math.ceil(sh/5)*getPrice("Drywall Compound","drywall"); };
  const calcPaint    = () => { const s=parseFloat(paintSqft)||0; const g=Math.ceil(s/400); return g*getPrice("Interior Paint (1 gal)","paint")+Math.ceil(g/2)*getPrice("Primer (1 gal)","paint"); };
  const calcBaseboard= () => Math.ceil((parseFloat(baseboardLf)||0)/8)*getPrice("Baseboard (8 ft)","baseboard");
  const calcBaths    = () => Object.entries(bathrooms).reduce((s,[t,q])=>s+q*(BATHROOM_PACKAGES[t].labor+BATHROOM_PACKAGES[t].materials),0);
  const calcComm     = () => Object.values(commercial).reduce((s,v)=>s+(parseFloat(v)||0),0);

  const materialTotal = calcFloor()+calcDrywall()+calcPaint()+calcBaseboard()+calcBaths()+calcComm();
  const laborTotal    = materialTotal*0.35;
  const grandTotal    = materialTotal+laborTotal;

  const completedTasks = tasks.filter(t=>t.status==="done").length;
  const projects       = [...new Set(tasks.map(t=>t.project))];

  const quoteProps = {
    quoteTab,setQuoteTab,
    floorSqft,setFloorSqft,floorMat,setFloorMat,
    drywallSqft,setDrywallSqft,
    paintSqft,setPaintSqft,
    baseboardLf,setBaseboardLf,
    bathrooms,setBathrooms,
    commercial,setCommercial,
    vendors,setVendor,fetchingPrice,fetchedPrices,simulateFetch,
    calcFloor,calcDrywall,calcPaint,calcBaseboard,calcBaths,calcComm,
    materialTotal,laborTotal,grandTotal,
    client,setClient,
    quoteNum,quoteDate,setQuoteDate,expiry,setExpiry,
    notes,setNotes,
    setView,showToast,
  };

  const printProps = {
    client,quoteNum,quoteDate,expiry,notes,quoteTab,
    floorSqft,floorMat,drywallSqft,paintSqft,baseboardLf,
    bathrooms,commercial,calcFloor,calcDrywall,calcPaint,
    calcBaseboard,calcBaths,calcComm,materialTotal,laborTotal,grandTotal,
  };

  return (
    <>
      {view==="home"  && <HomeView setView={setView} totalProjects={projects.length} completedTasks={completedTasks} totalTasks={tasks.length}/>}
      {view==="quote" && <QuoteView {...quoteProps}/>}
      {view==="field" && <FieldView tasks={tasks} setTasks={setTasks} setView={setView}/>}
      {view==="crew"  && <CrewView  tasks={tasks} setTasks={setTasks} setView={setView}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* Print portal */}
      <div id="printable-quote-portal" style={{ display:"none" }}>
        <PrintableQuote {...printProps}/>
      </div>
      <style>{`
        @media print {
          body > #root > *:not(:last-child) { display: none !important; }
          body > #root > :last-child { display: block !important; }
          #printable-quote-portal { display: block !important; }
        }
      `}</style>
    </>
  );
}
