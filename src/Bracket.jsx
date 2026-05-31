import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const DEADLINE = new Date("2026-06-01");

export default function Bracket(){

  const isLocked = new Date() > DEADLINE;

  // STATE
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

  // 🔹 AUTO LOAD PLAYER DATA
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

  // 🔹 ADD PLAYER
  const addPlayer = ()=>{
    if(!input) return;
    setPlayers([...players,input]);
    setCurrent(input);
    setInput("");
  };

  // 🔹 GROUP PICKS
  const updatePick = (group,pos,team)=>{
    if(isLocked) return;
    setPicks(prev=>({
      ...prev,
      [group]: {...prev[group], [pos]:team}
    }));
  };

  // 🔹 KNOCKOUT PICK
 const pick = (team, round, index)=>{
  if(isLocked) return;

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
  // 🔹 GENERATE BRACKET
  const generateBracket = ()=>{

    let first = {};
    let second = {};
    let thirds = [];

    Object.keys(groups).forEach(g=>{
      const p = picks[g];
      if(!p?.[1] || !p?.[2]) return;

      first[g] = p[1];
      second[g] = p[2];

      const third = groups[g].find(
        t => t !== p[1] && t !== p[2]
      );

      thirds.push({
        team: third,
        score: Math.random()
      });
    });

    thirds.sort((a,b)=>b.score - a.score);
    const bestThirds = thirds.slice(0,8).map(t=>t.team);

    const qualified = [
      ...Object.values(first),
      ...Object.values(second),
      ...bestThirds
    ];

    const pairs = [];
    for(let i=0;i<32;i+=2){
      pairs.push([qualified[i],qualified[i+1]]);
    }

    setMatches(pairs);
  };

  // 🔹 SAVE
  const saveToFirebase = async ()=>{

    if(!current){
      alert("Valitse pelaaja");
      return;
    }

    await setDoc(
      doc(db,"veikkaus","data"),
      {
        [current]: {
          picks,
          r16,
          qf,
          sf,
          final,
          winner
        }
      },
      { merge: true }
    );

    alert("Tallennettu!");
  };

  // 🔹 STYLE
  const box = (team, selected)=>({
    background: selected ? "#22c55e" : "#0f172a",
    padding: "8px",
    margin: "4px 0",
    borderRadius: "8px",
    cursor: "pointer",
    transform: selected ? "scale(1.05)" : "scale(1)"
  });

  // 🔹 GROUPS
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
    <div style={{padding:"20px",color:"white",background:"#020617",minHeight:"100vh"}}>

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
                  disabled={isLocked}
                  onChange={(e)=>updatePick(g,pos,e.target.value)}
                >
                  <option>Valitse</option>
                  {groups[g].map(t=><option key={t}>{t}</option>)}
                </select>
              ))}
            </div>
          ))}

          <button onClick={generateBracket}>Generoi</button>

          <h3>Bracket</h3>

          {matches.map((m,i)=>(
            <div key={i}>
              <div onClick={()=>pick(m[0],"R32",i)}
                style={box(m[0], r16.includes(m[0]))}>{m[0]}</div>
              <div onClick={()=>pick(m[1],"R32",i)}
                style={box(m[1], r16.includes(m[1]))}>{m[1]}</div>
            </div>
          ))}

          <h3>Final</h3>

          <div onClick={()=>pick(final[0],"FINAL",0)}
            style={box(final[0], winner===final[0])}>{final[0]}</div>

          <div onClick={()=>pick(final[1],"FINAL",0)}
            style={box(final[1], winner===final[1])}>{final[1]}</div>

          <h2>🏆 {winner}</h2>

          <button onClick={saveToFirebase}>💾 Tallenna</button>
        </>
      )}

    </div>
  );
}
