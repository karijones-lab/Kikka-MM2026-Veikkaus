import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const DEADLINE = new Date("2026-06-01");

export default function Bracket(){

  const isLocked = new Date() > DEADLINE;

  // 🔹 STATE
  const [players,setPlayers] = useState([]);
  const [current,setCurrent] = useState("");
  const [input,setInput] = useState("");

  const [picks,setPicks] = useState({});
  const [matches,setMatches] = useState([]);

  const [r16,setR16] = useState(Array(16).fill(""));
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

  // 🔹 LISÄÄ PELAAJA
  const addPlayer = ()=>{
    if(!input) return;
    setPlayers([...players,input]);
    setCurrent(input);
    setInput("");
  };

  // 🔹 LOHKOVALINTA
  const updatePick = (group,pos,team)=>{
    if(isLocked) return;
    setPicks(prev=>({
      ...prev,
      [group]: {...prev[group], [pos]:team}
    }));
  };

  // 🔹 BRACKET PICK
  const pick = (team, round, index)=>{
    if(isLocked) return;

    if(round==="R32"){
      setR16(prev=>{
        const c=[...prev];
        c[index]=team;
        return c;
      });
    }

    if(round==="FINAL"){
      setWinner(team);
    }
  };

  // 🔹 GENEROI OTTELUT
  const generateBracket = ()=>{
    let qualified = [];

    Object.keys(picks).forEach(g=>{
      if(picks[g]?.[1]) qualified.push(picks[g][1]);
      if(picks[g]?.[2]) qualified.push(picks[g][2]);
    });

    while(qualified.length < 32){
      qualified.push("⭐ Best 3rd");
    }

    const pairs = [];
    for(let i=0;i<32;i+=2){
      pairs.push([qualified[i],qualified[i+1]]);
    }

    setMatches(pairs);
  };

  // 🔹 FIREBASE SAVE
  const saveToFirebase = async ()=>{
    await setDoc(doc(db,"veikkaus","data"),{
      ...allData,
      [current]: {picks,r16,final,winner}
    });
  };

  // 🔹 UI STYLE
  const box = (team,selected)=>({
    background:selected?"#22c55e":"#0f172a",
    color:selected?"#022c22":"white",
    padding:"10px",
    margin:"5px 0",
    borderRadius:"10px",
    cursor:"pointer",
    transition:"0.2s",
    transform:selected?"scale(1.05)":"scale(1)"
  });

  const connector = {
    width:"30px",
    height:"2px",
    background:"#475569"
  };

  // 🔹 GROUPS
  const groups = {
    A:["🇲🇽 Mexico","🇿🇦 South Africa","🇰🇷 Korea","🇨🇿 Czechia"],
    B:["🇨🇦 Canada","🇧🇦 Bosnia","🇶🇦 Qatar","🇨🇭 Switzerland"],
    C:["🇧🇷 Brazil","🇲🇦 Morocco","🇭🇹 Haiti","🏴 Scotland"],
    D:["🇺🇸 USA","🇵🇾 Paraguay","🇦🇺 Australia","🇹🇷 Türkiye"],
    E:["🇩🇪 Germany","🇨🇼 Curaçao","🇨🇮 Ivory Coast","🇪🇨 Ecuador"],
    F:["🇳🇱 Netherlands","🇯🇵 Japan","🇸🇪 Sweden","🇹🇳 Tunisia"],
    G:["🇧🇪 Belgium","🇪🇬 Egypt","🇮🇷 Iran","🇳🇿 New Zealand"],
    H:["🇪🇸 Spain","🇨🇻 Cabo Verde","🇸🇦 Saudi Arabia","🇺🇾 Uruguay"],
    I:["🇫🇷 France","🇸🇳 Senegal","🇮🇶 Iraq","🇳🇴 Norway"],
    J:["🇦🇷 Argentina","🇩🇿 Algeria","🇦🇹 Austria","🇯🇴 Jordan"],
    K:["🇵🇹 Portugal","🇨🇩 DR Congo","🇺🇿 Uzbekistan","🇨🇴 Colombia"],
    L:["🏴 England","🇭🇷 Croatia","🇬🇭 Ghana","🇵🇦 Panama"]
  };

  return (
    <div style={{background:"#020617",minHeight:"100vh",color:"white",padding:"20px"}}>

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

          {/* LOHKOT */}
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

          {/* BRACKET */}
          <h3>🏆 Turnauskaavio</h3>

          <div style={{display:"flex",justifyContent:"space-between"}}>

            {/* VASEN */}
            <div>
              {matches.slice(0,8).map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center"}}>
                  <div>
                    <div onClick={()=>pick(m[0],"R32",i)}
                      style={box(m[0], r16.includes(m[0]))}>{m[0]}</div>
                    <div onClick={()=>pick(m[1],"R32",i)}
                      style={box(m[1], r16.includes(m[1]))}>{m[1]}</div>
                  </div>
                  <div style={connector}></div>
                </div>
              ))}
            </div>

            {/* FINAL */}
            <div style={{textAlign:"center"}}>
              <div onClick={()=>pick(final[0],"FINAL",0)}
                style={box(final[0], winner===final[0])}>{final[0]}</div>
              <div onClick={()=>pick(final[1],"FINAL",0)}
                style={box(final[1], winner===final[1])}>{final[1]}</div>
              <h2>🏆 {winner}</h2>
            </div>

            {/* OIKEA */}
            <div>
              {matches.slice(8,16).map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center"}}>
                  <div style={connector}></div>
                  <div>
                    <div onClick={()=>pick(m[0],"R32",i+8)}
                      style={box(m[0], r16.includes(m[0]))}>{m[0]}</div>
                    <div onClick={()=>pick(m[1],"R32",i+8)}
                      style={box(m[1], r16.includes(m[1]))}>{m[1]}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <button onClick={saveToFirebase}>💾 Tallenna</button>

        </>
      )}

    </div>
  );
}