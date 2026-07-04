import React, { useState, useEffect } from "react";
// force deploy v5
import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

console.log("🔥 NEW VERSION LOADED");

export default function Bracket(){

  const [players,setPlayers] = useState([]);
  const [current,setCurrent] = useState("");
  const [input,setInput] = useState("");

  const [picks,setPicks] = useState({});
  const [matches,setMatches] = useState([]);

  const [r16,setR16] = useState(Array(16).fill(""));
  const [qf,setQF] = useState(Array(8).fill(""));
  const [sf,setSF] = useState(Array(4).fill(""));
  const [final,setFinal] = useState(["",""]);
  const [winner,setWinner] = useState("");
  const [predFinal,setPredFinal] = useState(["",""]);
  const [predWinner,setPredWinner] = useState("");

  const [allData,setAllData] = useState({});

  // 🔹 FIREBASE SYNC
  useEffect(()=>{
  const unsub = onSnapshot(doc(db,"veikkaus","data"),snap=>{
    if(snap.exists()){
      setAllData(snap.data());
    }
  });

  return ()=>unsub();
},[]);

useEffect(()=>{
  console.log("🔥 DB TEST:", db);
},[]);

  // 🔹 LOAD PLAYER
  useEffect(()=>{
    if(current && allData[current]){
      const d = allData[current];
      setPicks(d.picks || {});
      setR16(d.r16 || Array(16).fill(""));
      setQF(d.qf || Array(8).fill(""));
      setSF(d.sf || Array(4).fill(""));
      setFinal(d.final || ["",""]);
      setWinner(d.winner || "");
      setPredFinal(d.predFinal || ["",""]);
      setPredWinner(d.predWinner || "");

      //
    }
  },[current, allData]);

  const addPlayer = ()=>{
    if(!input) return;
    setPlayers([...players,input]);
    setCurrent(input);
    setInput("");
  };

  const updatePick = (group,pos,team)=>{
    setPicks(prev=>({
      ...prev,
      [group]: {...prev[group], [pos]:team}
    }));
  };

  // 🔥 AUTO ETENEMINEN
 const pick = (team, round, index)=>{

  if(round==="R32"){
    setR16(prev=>{
      const c=[...prev];
      c[index]=team;
      return c;
    });
  }

  if(round==="R16"){
    setQF(prev=>{
      const c=[...prev];
      c[index] = team;
      return c;
    });
  }

  if(round==="QF"){
    setSF(prev=>{
      const c=[...prev];
      c[Math.floor(index/2)] = team;   // 🔥 TÄMÄ
      return c;
    });
  }

  if(round==="SF"){
    setFinal(prev=>{
      const c=[...prev];
      c[Math.floor(index/2)] = team;   // 🔥 TÄMÄ
      return c;
    });
  }

  if(round==="FINAL"){
    setWinner(team);
  }
};

  // 🔹 GENERATE
const generateBracket = ()=>{
  setMatches(R32_MATCHES);
};

 const saveToFirebase = async ()=>{

  console.log("🔥 SAVE START");

  if(!current){
    alert("Valitse pelaaja");
    return;
  }

  try {

    const cleanData = {
      picks: picks || {},
      r16: r16.map(t => t || ""),
      qf: qf.map(t => t || ""),
      sf: sf.map(t => t || ""),
      final: final.map(t => t || ""),
      winner: winner || "",
      predFinal: predFinal,
      predWinner: predWinner,
    };

  console.log("🔥 BEFORE FIREBASE");

await Promise.race([
  setDoc(
    doc(db,"veikkaus","data"),
    { [current]: cleanData },
    { merge:true }
  ),
  new Promise((_, reject)=>
    setTimeout(()=>reject("timeout"), 5000)
  )
]);

console.log("🔥 AFTER FIREBASE");

alert("✅ Tallennettu!");
  } catch(err){
    console.error("❌ ERROR:", err);
    alert("Tallennus epäonnistui");
  }
};
   
  // 🎨 UI
  const box = (team, selected)=>({
    background:selected?"#22c55e":"#1e293b",
    padding:"8px",
    borderRadius:"8px",
    margin:"4px 0",
    cursor:"pointer",
    textAlign:"center"
  });

  const line = {
    width:"40px",
    height:"2px",
    background:"#475569",
    margin:"auto"
  };

  const groups = {
    A:["Mexico","South Africa","Korea","Czechia"],
    B:["Canada","Bosnia","Qatar","Switzerland"],
    C:["Brazil","Morocco","Haiti","Scotland"],
    D:["USA","Paraguay","Australia","Türkiye"],
    E:["Germany","Curacao","Ivory Coast","Ecuador"],
    F:["Netherlands","Japan","Sweden","Tunisia"],
    G:["Belgium","Egypt","Iran","New Zealand"],
    H:["Spain","Cabo Verde","Saudi Arabia","Uruguay"],
    I:["France","Senegal","Iraq","Norway"],
    J:["Argentina","Algeria","Austria","Jordan"],
    K:["Portugal","DR Congo","Uzbekistan","Colombia"],
    L:["England","Croatia","Ghana","Panama"]
  };

  const R32_MATCHES = [
  ["South Africa", "Canada"],
  ["Germany", "Paraguay"],
  ["Brazil", "Japan"],
  ["France", "Sweden"],
  ["Netherlands", "Morocco"],
  ["Ivory Coast", "Norway"],
  ["Belgium", "Senegal"],
  ["Mexico", "Ecuador"],
  ["England", "DR Congo"],
  ["Spain", "Austria"],
  ["USA", "Bosnia"],
  ["Argentina", "Cabo Verde"],
  ["Portugal", "Croatia"],
  ["Australia", "Egypt"],
  ["Switzerland", "Algeria"],
  ["Colombia", "Ghana"],
];


const R16_MATCHES = [
  ["Canada", "Morocco"],
  ["Paraguay", "France"],
  ["Brazil", "Norway"],
  ["Mexico", "England"],
  ["Portugal", "Spain"],
  ["USA", "Belgium"],
  ["Argentina", "Egypt"],
  ["Switzerland", "Colombia"],
];

const manualR16 = [
  "Canada", "Paraguay", "Brazil", "France", "Morocco", "Norway", "Belgium", "Mexico",
  "England", "Spain", "USA", "Argentina", "Portugal", "Egypt", "Switzerland", "Colombia"
];

const manualQF = [
  "Morocco", "", "", "",
  "", "", "", ""
];

  const correct = {
  
  groups: {
    A: ["Mexico","South Africa"],
    B: ["Switzerland","Canada"],
    C: ["Brazil","Morocco"],
    D: ["USA","Australia"],
    E: ["Germany","Ivory Coast"],
    F: ["Netherlands","Japan"],
    G: ["Belgium","Egypt"],
    H: ["Spain","Cabo Verde"],
    I: ["France","Norway"],
    J: ["Argentina","Austria"],
    K: ["Colombia","Portugal"],
    L: ["England","Croatia"]
  },
 r16: manualR16,
 qf: [],
  sf: [],
  final: [],
  winner: ""
};

const DEADLINE = new Date("2026-07-04T20:00:00");
const isLocked = new Date() > DEADLINE;

    return (
  <div style={{background:"#020617",color:"white",padding:"20px"}}>

    <h1>🏆 MM Veikkaus</h1>

{isLocked && (
  <p style={{color:"red", fontWeight:"bold"}}>
    🔒 Veikkaus on suljettu
  </p>
)}
    <input value={input} onChange={e=>setInput(e.target.value)} />
    <button onClick={addPlayer}>Lisää</button>

    <div>
      {players.map(p=>(
        <button key={p} onClick={()=>setCurrent(p)}>{p}</button>
      ))}
    </div>

    {current && (
  <>
    <h2>{current}</h2>

    <h3>🔮 Finaaliveikkaus</h3>

    <p>🔮 {predFinal[0]} vs {predFinal[1]}</p>
    <p>🏆 {predWinner}</p>

    <h4>📊 Lohkoveikkaukset</h4>
    <pre>{JSON.stringify(picks, null, 2)}</pre>

<select disabled={true} onChange={(e)=>setPredFinal([e.target.value, predFinal[1]])}>
  <option>Finaalisti 1</option>
  {Object.values(groups).flat().map(t=>(
    <option key={t}>{t}</option>
  ))}
</select>

<select disabled={true} onChange={(e)=>setPredFinal([predFinal[0], e.target.value])}>
  <option>Finaalisti 2</option>
  {Object.values(groups).flat().map(t=>(
    <option key={t}>{t}</option>
  ))}
</select>

<select disabled={true} onChange={(e)=>setPredWinner(e.target.value)}>
  <option>Voittaja</option>
  {Object.values(groups).flat().map(t=>(
    <option key={t}>{t}</option>
  ))}
</select>
    
    {Object.keys(groups).map(g => (
  <div key={g}>
    <b>{g}</b>

    {[1,2].map(pos => (
     <select
  key={pos}
  disabled={true}
  onChange={(e)=>updatePick(g,pos,e.target.value)}
>
        <option>Valitse</option>
        {groups[g].map(t => (
          <option key={t}>{t}</option>
        ))}
      </select>
    ))}

  </div>
))}

  <button onClick={generateBracket}>
  Generoi
</button>

    <button onClick={saveToFirebase} disabled={isLocked}>
      💾 Tallenna
    </button>

      <h3>🏆 Kaavio</h3>

    <div style={{display:"flex",justifyContent:"space-between"}}>

  {/* LEFT */}
  <div>
    {(matches || []).slice(0,8).map((m,i)=>(
      
      <div key={i}>
        <div onClick={()=>!isLocked && pick(m?.[0],"R32",i)} style={box(m?.[0], r16.includes(m?.[0]))}>
          {m?.[0] || "-"}
        </div>
        <div onClick={()=>!isLocked && pick(m?.[1],"R32",i)} style={box(m?.[1], r16.includes(m?.[1]))}>
          {m?.[1] || "-"}
        </div>
      </div>
    ))}
  </div>

  {/* R16 */}
{/* 🔒 HIDDEN DURING R32 STAGE
<div>
  {r16.map((team,i)=>(
    <div key={i}>
      {team || "-"}
    </div>
  ))}
</div>
*/}

{/* QF */}
{/* 🔒 HIDDEN DURING R32 STAGE
<div>
  {qf.map((team,i)=>(
    <div key={i}>
      {team || "-"}
    </div>
  ))}
</div>
*/}

{/* SF */}
{/* 🔒 HIDDEN DURING R32 STAGE
<div>
  {sf.map((team,i)=>(
    <div key={i}>
      {team || "-"}
    </div>
  ))}
</div>
*/}

  {/* FINAL */}
  <div style={{textAlign:"center"}}>
    <div onClick={()=>!isLocked && pick(final?.[0],"FINAL",0)} style={box(final?.[0], winner===final?.[0])}>
      {final?.[0] || "-"}
    </div>
    <div onClick={()=>!isLocked && pick(final?.[1],"FINAL",1)} style={box(final?.[1], winner===final?.[1])}>
      {final?.[1] || "-"}
    </div>
    <h2>🏆 {winner || "-"}</h2>
  </div>

  {/* RIGHT */}
  <div>
    {(matches || []).slice(8,16).map((m,i)=>(
      <div key={i}>
        <div onClick={()=>!isLocked && pick(m?.[0],"R32",i+8)} style={box(m?.[0], r16.includes(m?.[0]))}>
          {m?.[0] || "-"}
        </div>
        <div onClick={()=>!isLocked && pick(m?.[1],"R32",i+8)} style={box(m?.[1], r16.includes(m?.[1]))}>
          {m?.[1] || "-"}
        </div>
      </div>
    ))}
  </div>

</div>

<h3>R16</h3>

<div style={{display:"flex",justifyContent:"space-between"}}>

  {R16_MATCHES.map((m,i)=>(
    <div key={i}>

      <div
        onClick={()=>!isLocked && pick(m?.[0],"R16",i)}
        style={box(m?.[0], qf.includes(m?.[0]))}
      >
        {m?.[0] || "-"}
      </div>

      <div
        onClick={()=>!isLocked && pick(m?.[1],"R16",i)}
        style={box(m?.[1], qf.includes(m?.[1]))}
      >
        {m?.[1] || "-"}
      </div>

    </div>
  ))}

</div>

  </>
)}

    <h2>📊 Leaderboard</h2>

    <div>
{Object.entries(allData || {})
  .map(([player, data]) => {

    let score = 0;

    // lohkot
Object.keys(data.picks || {}).forEach(g=>{
  const p = data.picks[g];
  const correctGroup = correct.groups[g];

  if(!p || !correctGroup) return;

  if(p[1] === correctGroup[0]) score += 2; // voittaja oikein
  if(p[2] === correctGroup[1]) score += 3; // kakkonen oikein
});

    data.r16?.forEach(t=>{
      if(correct.r16.includes(t)) score += 2;
    });

    data.qf?.forEach(t=>{
      if(correct.qf.includes(t)) score += 3;
    });

    data.sf?.forEach(t=>{
      if(correct.sf.includes(t)) score += 4;
    });

    data.final?.forEach(t=>{
      if(correct.final.includes(t)) score += 5;
    });

    if(correct.winner && data.winner === correct.winner) score += 10;
    // ennakkovoittaja
    if(correct.winner && data.predWinner === correct.winner) score += 15;
   return { player, score, predWinner: data.predWinner, data };
  })
  .sort((a,b)=>b.score-a.score)
  .map((item, i, arr) => ({
  ...item,
  diff: i === 0 ? 0 : arr[0].score - item.score
}))

.map(({player, score, predWinner, diff, data}, i) => (
    <div
      key={player}
      style={{
        background: i === 0 ? "#facc15" : "#1e293b",
        color: i === 0 ? "#000" : "#fff",
        margin:"5px",
        padding:"10px",
        borderRadius:"10px",
        fontWeight: i === 0 ? "bold" : "normal"
      }}
    >
  {i === 0 ? "🥇" : "🧑"} {player} — ⭐ {score}
{diff > 0 && ` (-${diff})`}
{correct.winner && predWinner === correct.winner && " 🎯"}

  <div>
   <button onClick={()=>{
  setCurrent(player);
  window.scrollTo({ top: 0, behavior: "smooth" });
}}>
  👁 Katso veikkaus
</button>
{current === player && (
  <div style={{marginTop:"10px", fontSize:"14px"}}>
    
    <b>R32 veikkaukset:</b>

    {matches.length === 0 ? (
      <div>⚠️ Generoi kaavio nähdäksesi parit</div>
    ) : (
      <div>
        {(matches || []).map((m, i) => {
          const team = data.r16?.[i];

          return (
            <div key={i}>
              {m?.[0] || "-"} vs {m?.[1] || "-"} → <b>{team || "-"}</b>
            </div>
          );
        })}
      </div>
    )}

  </div>
)}
    </div>

    </div>
  ))
}
    </div>

  </div>
);
}
