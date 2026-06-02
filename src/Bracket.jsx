import React, { useState, useEffect } from "react";
// force deploy
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

      setQF(prev=>{
        const c=[...prev];
        c[Math.floor(index/2)] = team;
        return c;
      });
    }

    if(round==="R16"){
      setQF(prev=>{
        const c=[...prev];
        c[index]=team;
        return c;
      });

      setSF(prev=>{
        const c=[...prev];
        c[Math.floor(index/2)] = team;
        return c;
      });
    }

    if(round==="QF"){
      setSF(prev=>{
        const c=[...prev];
        c[index]=team;
        return c;
      });

      setFinal(prev=>{
        const c=[...prev];
        c[Math.floor(index/2)] = team;
        return c;
      });
    }

    if(round==="SF"){
      setFinal(prev=>{
        const c=[...prev];
        c[index]=team;
        return c;
      });
    }

    if(round==="FINAL"){
      setWinner(team);
    }
  };

  // 🔹 GENERATE
  const generateBracket = ()=>{
    let first={}, second={}, thirds=[];

    Object.keys(groups).forEach(g=>{
      const p = picks[g];
      if(!p?.[1] || !p?.[2]) return;

      first[g]=p[1];
      second[g]=p[2];

      const third = groups[g].find(t=>t!==p[1] && t!==p[2]);
      thirds.push({team:third,score:Math.random()});
    });

    thirds.sort((a,b)=>b.score-a.score);
    const bestThirds = thirds.slice(0,8).map(t=>t.team);

    const qualified=[
      ...Object.values(first),
      ...Object.values(second),
      ...bestThirds
    ];

    const pairs=[];
    for(let i=0;i<32;i+=2){
     pairs.push([
  qualified[i] || "",
  qualified[i+1] || ""
]);
    }

    setMatches(pairs);
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
      winner: winner || ""
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

  return (
   <div>
  {Object.keys(allData).map(player => {
    const data = allData[player] || {};

    const score =
      (data.r16?.filter(Boolean).length || 0) +
      (data.qf?.filter(Boolean).length || 0) +
      (data.sf?.filter(Boolean).length || 0) +
      (data.final?.filter(Boolean).length || 0) +
      (data.winner ? 5 : 0);

    return (
      <div
        key={player}
        style={{
          background:"#1e293b",
          margin:"5px",
          padding:"10px",
          borderRadius:"10px"
        }}
      >
        🧑 {player} — ⭐ {score} pistettä
      </div>
    );
  })}
</div>
          ))}

          <button onClick={generateBracket}>Generoi</button>

         <h3>🏆 Kaavio</h3>

<div style={{display:"flex",justifyContent:"space-between"}}>

  {/* LEFT */}
  <div>
    {(matches || []).slice(0,8).map((m,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center"}}>
        
        <div>
          <div
            onClick={()=>pick(m?.[0] || "","R32",i)}
            style={box(m?.[0], r16.includes(m?.[0]))}
          >
            {m?.[0] || "-"}
          </div>

          <div
            onClick={()=>pick(m?.[1] || "","R32",i)}
            style={box(m?.[1], r16.includes(m?.[1]))}
          >
            {m?.[1] || "-"}
          </div>
        </div>

        <div style={line}></div>

      </div>
    ))}
  </div>

  {/* FINAL */}
  <div style={{textAlign:"center"}}>

    <div
      onClick={()=>pick(final?.[0] || "","FINAL",0)}
      style={box(final?.[0], winner===final?.[0])}
    >
      {final?.[0] || "-"}
    </div>

    <div
      onClick={()=>pick(final?.[1] || "","FINAL",1)}
      style={box(final?.[1], winner===final?.[1])}
    >
      {final?.[1] || "-"}
    </div>

    <h2>🏆 {winner || "-"}</h2>

  </div>

  {/* RIGHT */}
  <div>
    {(matches || []).slice(8,16).map((m,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center"}}>

        <div style={line}></div>

        <div>
          <div
            onClick={()=>pick(m?.[0] || "","R32",i+8)}
            style={box(m?.[0], r16.includes(m?.[0]))}
          >
            {m?.[0] || "-"}
          </div>

          <div
            onClick={()=>pick(m?.[1] || "","R32",i+8)}
            style={box(m?.[1], r16.includes(m?.[1]))}
          >
            {m?.[1] || "-"}
          </div>
        </div>

      </div>
    ))}
  </div>

</div>

       <button onClick={()=>{
  console.log("🔥 BUTTON CLICKED");
  saveToFirebase();
}}>
  💾 Tallenna
</button>

</>
)}

{/* 🔥 LEADERBOARD */}
<h2>📊 Leaderboard</h2>

<div>
  {Object.keys(allData).map(player => {
    const data = allData[player] || {};

    const score =
      (data.r16?.filter(Boolean).length || 0) +
      (data.qf?.filter(Boolean).length || 0) +
      (data.sf?.filter(Boolean).length || 0) +
      (data.final?.filter(Boolean).length || 0) +
      (data.winner ? 5 : 0);

   return (
  <div style={{background:"#020617",color:"white",padding:"20px"}}>

    <h1>🏆 MM Veikkaus</h1>

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

        {Object.keys(groups).map(g=>(
          <div key={g}>
            <b>{g}</b>
            {[1,2].map(pos=>(
              <select key={pos}
                onChange={(e)=>updatePick(g,pos,e.target.value)}
              >
                <option>Valitse</option>
                {groups[g].map(t=><option key={t}>{t}</option>)}
              </select>
            ))}
          </div>
        ))}

        <button onClick={generateBracket}>Generoi</button>

        <button onClick={()=>{
          console.log("🔥 BUTTON CLICKED");
          saveToFirebase();
        }}>
          💾 Tallenna
        </button>

      </>
    )}

    {/* 🔥 LEADERBOARD */}
    <h2>📊 Leaderboard</h2>

    <div>
      {Object.keys(allData).map(player => {
        const data = allData[player] || {};

        const score =
          (data.r16?.filter(Boolean).length || 0) +
          (data.qf?.filter(Boolean).length || 0) +
          (data.sf?.filter(Boolean).length || 0) +
          (data.final?.filter(Boolean).length || 0) +
          (data.winner ? 5 : 0);

        return (
          <div
            key={player}
            style={{
              background:"#1e293b",
              margin:"5px",
              padding:"10px",
              borderRadius:"10px"
            }}
          >
            🧑 {player} — ⭐ {score} pistettä
          </div>
        );
      })}
    </div>

  </div>
);
