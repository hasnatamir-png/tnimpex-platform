"use client";

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
const CUT  = {stroke:"#1565C0",strokeWidth:1.5,fill:"none"} as const;
const FOLD = {stroke:"#C62828",strokeWidth:1,fill:"none",strokeDasharray:"5 3"} as const;

function Panel({x,y,w,h,label,sub="",fill="#FFF8E1"}:{x:number;y:number;w:number;h:number;label:string;sub?:string;fill?:string}){
  const fs=Math.max(5,Math.min(9,Math.min(w,h)*0.22));
  return(<g>
    <rect x={x} y={y} width={w} height={h} fill={fill} stroke="#B0BEC5" strokeWidth={0.5}/>
    <text x={x+w/2} y={y+h/2-(sub?fs*0.6:0)} textAnchor="middle" dominantBaseline="central" fontSize={fs} fill="#37474F" fontFamily="Arial,sans-serif" fontWeight="600">{label}</text>
    {sub&&<text x={x+w/2} y={y+h/2+fs*0.9} textAnchor="middle" dominantBaseline="central" fontSize={fs*0.78} fill="#78909C" fontFamily="Arial,sans-serif">{sub}</text>}
  </g>);
}
const Score=({x1,y1,x2,y2}:any)=><line x1={x1} y1={y1} x2={x2} y2={y2} {...FOLD}/>;

function Dim({x1,y1,x2,y2,label,off=8}:{x1:number;y1:number;x2:number;y2:number;label:string;off?:number}){
  const isH=Math.abs(y2-y1)<1,mx=(x1+x2)/2,my=(y1+y2)/2,tk=3;
  return(<g stroke="#1A237E" strokeWidth={0.85} fill="none">
    <line x1={x1} y1={y1} x2={x2} y2={y2}/>
    {isH?<>
      <line x1={x1} y1={y1-tk} x2={x1} y2={y1+tk}/>
      <line x1={x2} y1={y2-tk} x2={x2} y2={y2+tk}/>
      <text x={mx} y={my-off} textAnchor="middle" fontSize={6.5} fill="#1A237E" stroke="none" fontFamily="Arial,sans-serif">{label}</text>
    </>:<>
      <line x1={x1-tk} y1={y1} x2={x1+tk} y2={y1}/>
      <line x1={x2-tk} y1={y2} x2={x2+tk} y2={y2}/>
      <text x={mx+off} y={my} textAnchor="middle" dominantBaseline="central" fontSize={6.5} fill="#1A237E" stroke="none" fontFamily="Arial,sans-serif" transform={`rotate(90,${mx+off},${my})`}>{label}</text>
    </>}
  </g>);
}

// Window cutout rendered on the correct dieline panel
function WinCut({px,py,pw,ph,ww,wh}:{px:number;py:number;pw:number;ph:number;ww:number;wh:number}){
  const wx=px+(pw-ww)/2, wy=py+(ph-wh)/2;
  const fs=Math.max(4.5,Math.min(7,Math.min(ww,wh)*0.18));
  return(<g>
    {/* hatching to indicate open area */}
    <defs>
      <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke="#90CAF9" strokeWidth="1.2"/>
      </pattern>
    </defs>
    <rect x={wx} y={wy} width={ww} height={wh} fill="url(#hatch)" stroke="#1565C0" strokeWidth={1.4}/>
    <rect x={wx} y={wy} width={ww} height={wh} fill="#E1F5FE" fillOpacity={0.45} stroke="none"/>
    <text x={wx+ww/2} y={wy+wh/2} textAnchor="middle" dominantBaseline="central" fontSize={fs} fill="#0D47A1" fontFamily="Arial,sans-serif" fontWeight="700">⬜ WIN</text>
  </g>);
}

const Legend=({x,y,hasWin}:{x:number;y:number;hasWin:boolean})=>(
  <g>
    <line x1={x} y1={y} x2={x+18} y2={y} {...CUT}/>
    <text x={x+21} y={y} dominantBaseline="central" fontSize={6.5} fill="#1565C0" fontFamily="Arial,sans-serif">Cut</text>
    <line x1={x} y1={y+9} x2={x+18} y2={y+9} {...FOLD}/>
    <text x={x+21} y={y+9} dominantBaseline="central" fontSize={6.5} fill="#C62828" fontFamily="Arial,sans-serif">Score</text>
    <line x1={x+65} y1={y} x2={x+83} y2={y} stroke="#1A237E" strokeWidth={0.85}/>
    <line x1={x+65} y1={y-3} x2={x+65} y2={y+3} stroke="#1A237E" strokeWidth={0.85}/>
    <line x1={x+83} y1={y-3} x2={x+83} y2={y+3} stroke="#1A237E" strokeWidth={0.85}/>
    <text x={x+86} y={y} dominantBaseline="central" fontSize={6.5} fill="#1A237E" fontFamily="Arial,sans-serif">Dim</text>
    {hasWin&&<><rect x={x+110} y={y-4} width={12} height={8} fill="#E1F5FE" stroke="#1565C0" strokeWidth={1}/><text x={x+128} y={y} dominantBaseline="central" fontSize={6.5} fill="#0D47A1" fontFamily="Arial,sans-serif">Window cutout</text></>}
  </g>
);

function calcScale(iW:number,iH:number,maxW=282,maxH=318){return Math.min(maxW/iW,maxH/iH,52);}
const fmt=(n:number)=>Number.isInteger(n*100)?`${n}"`:`${n.toFixed(2)}"`;

type WP = {hasWindow:boolean;windowW:number;windowH:number;windowFace:string;s:number};

// Helper: render window on named face. Pass panel position+size in pixels.
function FaceWin({face,target,px,py,pw,ph,ww,wh,s}:
  {face:string;target:string;px:number;py:number;pw:number;ph:number;ww:number;wh:number;s:number}){
  if(face!==target)return null;
  return<WinCut px={px} py={py} pw={pw} ph={ph} ww={ww*s} wh={wh*s}/>;
}

// ─── 1. STRAIGHT-TUCK END ────────────────────────────────────────────────────
function STEDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH,s:ws}=wp;
  const lip=Math.min(0.6,D*0.5),dH=Math.min(0.7,L*0.45),dW=W*0.85,gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1.2,D+2*(W+lip)+dH*0.7+1);
  const m=18;
  const bodyY=m+(W+lip)*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*(W+lip)+dH*0.7)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}  y={bodyY} w={L*s} h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bodyY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}  y={bodyY} w={W*s} h={bH} label="RIGHT"/>
    {hw&&wf==='right'&&<WinCut px={rX} py={bodyY} pw={W*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={bkX} y={bodyY} w={L*s} h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bodyY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}  y={bodyY} w={W*s} h={bH} label="LEFT"/>
    {hw&&wf==='left'&&<WinCut px={lX} py={bodyY} pw={W*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={tabX} y={bodyY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX}  y={bodyY-W*s}         w={L*s}      h={W*s}   label="TOP TUCK" fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={fX} py={bodyY-W*s} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bodyY-W*s-lip*s} w={L*0.98*s} h={lip*s} label="LIP" fill="#E3F2FD"/>
    <Panel x={fX}  y={bodyY+bH}          w={L*s}      h={W*s}   label="BTM TUCK" fill="#FBE9E7"/>
    {hw&&wf==='bottom'&&<WinCut px={fX} py={bodyY+bH} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bodyY+bH+W*s}  w={L*0.98*s} h={lip*s} label="LIP" fill="#FBE9E7"/>
    <Panel x={rX+((W-dW)/2)*s} y={bodyY-dH*s} w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Panel x={rX+((W-dW)/2)*s} y={bodyY+bH}   w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bodyY-dH*s} w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bodyY+bH}   w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Score x1={fX}  y1={bodyY}        x2={tabX+gTab*s} y2={bodyY}/>
    <Score x1={fX}  y1={bodyY+bH}     x2={tabX+gTab*s} y2={bodyY+bH}/>
    <Score x1={rX}  y1={bodyY-dH*s}   x2={rX}  y2={bodyY+bH+dH*s}/>
    <Score x1={bkX} y1={bodyY}         x2={bkX} y2={bodyY+bH}/>
    <Score x1={lX}  y1={bodyY-dH*s}   x2={lX}  y2={bodyY+bH+dH*s}/>
    <Score x1={tabX} y1={bodyY}        x2={tabX} y2={bodyY+bH}/>
    <Score x1={fX}  y1={bodyY-W*s}    x2={fX+L*s} y2={bodyY-W*s}/>
    <Score x1={fX}  y1={bodyY+bH+W*s} x2={fX+L*s} y2={bodyY+bH+W*s}/>
    <Dim x1={fX}  y1={bodyY-W*s-lip*s-9} x2={fX+L*s} y2={bodyY-W*s-lip*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX}  y1={bodyY-W*s-lip*s-9} x2={bkX}    y2={bodyY-W*s-lip*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bodyY} x2={tabX+gTab*s+9} y2={bodyY+bH} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 2. REVERSE-TUCK END ─────────────────────────────────────────────────────
function RTEDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const lip=Math.min(0.6,D*0.5),dH=Math.min(0.7,L*0.45),dW=W*0.85,gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1.2,D+2*(W+lip)+dH*0.7+1);
  const m=18;
  const bodyY=m+(W+lip)*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*(W+lip)+dH*0.7)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}  y={bodyY} w={L*s} h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bodyY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}  y={bodyY} w={W*s} h={bH} label="RIGHT"/>
    <Panel x={bkX} y={bodyY} w={L*s} h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bodyY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}  y={bodyY} w={W*s} h={bH} label="LEFT"/>
    <Panel x={tabX} y={bodyY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX}  y={bodyY-W*s} w={L*s} h={W*s} label="TOP TUCK" fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={fX} py={bodyY-W*s} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bodyY-W*s-lip*s} w={L*0.98*s} h={lip*s} label="LIP" fill="#E3F2FD"/>
    <Panel x={bkX} y={bodyY+bH} w={L*s} h={W*s} label="BTM TUCK" fill="#FBE9E7" sub="(from BACK)"/>
    {hw&&wf==='bottom'&&<WinCut px={bkX} py={bodyY+bH} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={bkX+(L*(1-0.98)/2)*s} y={bodyY+bH+W*s} w={L*0.98*s} h={lip*s} label="LIP" fill="#FBE9E7"/>
    <Panel x={rX+((W-dW)/2)*s} y={bodyY-dH*s} w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Panel x={rX+((W-dW)/2)*s} y={bodyY+bH}   w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bodyY-dH*s} w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bodyY+bH}   w={dW*s} h={dH*s} label="DUST" fill="#F3E5F5"/>
    <Score x1={fX} y1={bodyY} x2={tabX+gTab*s} y2={bodyY}/>
    <Score x1={fX} y1={bodyY+bH} x2={tabX+gTab*s} y2={bodyY+bH}/>
    <Score x1={rX} y1={bodyY-dH*s} x2={rX} y2={bodyY+bH+dH*s}/>
    <Score x1={bkX} y1={bodyY-dH*s} x2={bkX} y2={bodyY+bH+W*s+lip*s}/>
    <Score x1={lX} y1={bodyY-dH*s} x2={lX} y2={bodyY+bH+dH*s}/>
    <Score x1={tabX} y1={bodyY} x2={tabX} y2={bodyY+bH}/>
    <Score x1={fX} y1={bodyY-W*s} x2={fX+L*s} y2={bodyY-W*s}/>
    <Score x1={bkX} y1={bodyY+bH+W*s} x2={bkX+L*s} y2={bodyY+bH+W*s}/>
    <Dim x1={fX} y1={bodyY-W*s-lip*s-9} x2={fX+L*s} y2={bodyY-W*s-lip*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX} y1={bodyY-W*s-lip*s-9} x2={bkX}    y2={bodyY-W*s-lip*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bodyY} x2={tabX+gTab*s+9} y2={bodyY+bH} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 3. TRAY-LOCK ─────────────────────────────────────────────────────────────
function TrayLockDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const tab=Math.min(D*0.8,L*0.45),lip=Math.min(0.6,D*0.5);
  const s=calcScale(L+2*D+0.5,2*tab+2*D+2*W+lip+0.8);
  const m=18,cx=m+D*s,cy=m+tab*s+D*s;
  const frontY=cy-D*s,backY=cy+W*s,topY=backY+D*s,lipY=topY+W*s;
  const rightX=cx+L*s,leftX=cx-D*s;
  const tabCX_r=rightX+(D-D*0.9)/2*s,tabCX_l=leftX+(D-D*0.9)/2*s;
  const svgW=m*2+(L+2*D)*s+28,svgH=m*2+(2*tab+2*D+2*W+lip)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={cx}     y={cy}     w={L*s}   h={W*s}  label="BOTTOM"/>
    {hw&&wf==='bottom'&&<WinCut px={cx} py={cy} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx}     y={frontY} w={L*s}   h={D*s}  label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={cx} py={frontY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx}     y={backY}  w={L*s}   h={D*s}  label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={cx} py={backY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rightX} y={cy}     w={D*s}   h={W*s}  label="RIGHT"/>
    {hw&&wf==='right'&&<WinCut px={rightX} py={cy} pw={D*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={leftX}  y={cy}     w={D*s}   h={W*s}  label="LEFT"/>
    {hw&&wf==='left'&&<WinCut px={leftX} py={cy} pw={D*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx}     y={topY}   w={L*s}   h={W*s}  label="TOP" fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={cx} py={topY} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx+(L*(1-0.98)/2)*s} y={lipY} w={L*0.98*s} h={lip*s} label="LIP" fill="#E3F2FD"/>
    <Panel x={tabCX_r} y={cy-tab*s} w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Panel x={tabCX_r} y={cy+W*s}   w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Panel x={tabCX_l} y={cy-tab*s} w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Panel x={tabCX_l} y={cy+W*s}   w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Score x1={cx}     y1={cy}     x2={cx+L*s} y2={cy}/>
    <Score x1={cx}     y1={cy+W*s} x2={cx+L*s} y2={cy+W*s}/>
    <Score x1={cx}     y1={frontY} x2={cx+L*s} y2={frontY}/>
    <Score x1={cx}     y1={backY+D*s}  x2={cx+L*s} y2={backY+D*s}/>
    <Score x1={cx}     y1={topY+W*s}   x2={cx+L*s} y2={topY+W*s}/>
    <Score x1={cx}     y1={frontY} x2={cx}     y2={lipY+lip*s}/>
    <Score x1={cx+L*s} y1={frontY} x2={cx+L*s} y2={lipY+lip*s}/>
    <Score x1={leftX}  y1={cy}     x2={rightX+D*s} y2={cy}/>
    <Score x1={leftX}  y1={cy+W*s} x2={rightX+D*s} y2={cy+W*s}/>
    <Score x1={rightX} y1={cy-tab*s} x2={rightX} y2={cy+W*s+tab*s}/>
    <Score x1={leftX}  y1={cy-tab*s} x2={leftX}  y2={cy+W*s+tab*s}/>
    <Dim x1={cx}     y1={frontY-9} x2={cx+L*s}       y2={frontY-9}   label={`L=${fmt(L)}`}/>
    <Dim x1={leftX}  y1={frontY-9} x2={cx}            y2={frontY-9}   label={`D=${fmt(D)}`}/>
    <Dim x1={cx+L*s} y1={frontY-9} x2={rightX+D*s}    y2={frontY-9}   label={`D`} off={12}/>
    <Dim x1={rightX+D*s+9} y1={cy}     x2={rightX+D*s+9} y2={cy+W*s}  label={`W=${fmt(W)}`}/>
    <Dim x1={rightX+D*s+9} y1={frontY} x2={rightX+D*s+9} y2={cy}      label={`D`} off={12}/>
    <Dim x1={rightX+D*s+9} y1={cy-tab*s} x2={rightX+D*s+9} y2={cy}    label={`tab`} off={14}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 4. SLEEVE ────────────────────────────────────────────────────────────────
function SleeveDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1,D+0.6);
  const m=18,bY=m,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+D*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}  y={bY} w={L*s}     h={D*s} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}  y={bY} w={W*s}     h={D*s} label="RIGHT"/>
    <Panel x={bkX} y={bY} w={L*s}     h={D*s} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}  y={bY} w={W*s}     h={D*s} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={D*s} label="GLUE" fill="#E8F5E9"/>
    <Score x1={rX}   y1={bY} x2={rX}   y2={bY+D*s}/>
    <Score x1={bkX}  y1={bY} x2={bkX}  y2={bY+D*s}/>
    <Score x1={lX}   y1={bY} x2={lX}   y2={bY+D*s}/>
    <Score x1={tabX} y1={bY} x2={tabX} y2={bY+D*s}/>
    <Dim x1={fX}  y1={bY-9} x2={fX+L*s} y2={bY-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX}  y1={bY-9} x2={bkX}    y2={bY-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY} x2={tabX+gTab*s+9} y2={bY+D*s} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 5. GABLE BOX ────────────────────────────────────────────────────────────
function GableDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const tab=Math.min(D*0.8,L*0.45),gH=Math.min(W*0.65,2.5);
  const s=calcScale(L+2*D+tab*0.3+0.4,2*tab+W+2*(D+gH)+0.8);
  const m=18,cx=m+D*s,cy=m+tab*s+D*s+gH*s;
  const frontY=cy-D*s,backY=cy+W*s;
  const rightX=cx+L*s,leftX=cx-D*s;
  const tabCX_r=rightX+(D-D*0.9)/2*s,tabCX_l=leftX+(D-D*0.9)/2*s;
  const svgW=m*2+(L+2*D)*s+28,svgH=m*2+(2*tab+W+2*(D+gH))*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={cx} y={cy}          w={L*s} h={W*s} label="BOTTOM"/>
    {hw&&wf==='bottom'&&<WinCut px={cx} py={cy} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx} y={frontY}      w={L*s} h={D*s} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={cx} py={frontY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx} y={backY}       w={L*s} h={D*s} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={cx} py={backY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={cx} y={frontY-gH*s} w={L*s} h={gH*s} label="GABLE FRONT" fill="#E3F2FD"/>
    <Panel x={cx} y={backY+D*s}   w={L*s} h={gH*s} label="GABLE BACK"  fill="#FBE9E7"/>
    <rect x={cx+(L-L*0.35)/2*s} y={frontY-gH*s+gH*0.3*s} width={L*0.35*s} height={gH*0.32*s} rx={3} fill="white" stroke="#1565C0" strokeWidth={1}/>
    <text x={cx+L*0.5*s} y={frontY-gH*s+gH*0.47*s} textAnchor="middle" dominantBaseline="central" fontSize={5} fill="#1565C0">HANDLE</text>
    <Panel x={rightX} y={cy} w={D*s} h={W*s} label="RIGHT"/>
    {hw&&wf==='right'&&<WinCut px={rightX} py={cy} pw={D*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={leftX}  y={cy} w={D*s} h={W*s} label="LEFT"/>
    {hw&&wf==='left'&&<WinCut px={leftX} py={cy} pw={D*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={tabCX_r} y={cy-tab*s} w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Panel x={tabCX_r} y={cy+W*s}   w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Panel x={tabCX_l} y={cy-tab*s} w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Panel x={tabCX_l} y={cy+W*s}   w={D*0.9*s} h={tab*s} label="TAB" fill="#E8F5E9"/>
    <Score x1={cx} y1={cy} x2={cx+L*s} y2={cy}/><Score x1={cx} y1={cy+W*s} x2={cx+L*s} y2={cy+W*s}/>
    <Score x1={cx} y1={frontY} x2={cx+L*s} y2={frontY}/><Score x1={cx} y1={backY+D*s} x2={cx+L*s} y2={backY+D*s}/>
    <Score x1={cx} y1={frontY-gH*s} x2={cx+L*s} y2={frontY-gH*s}/><Score x1={cx} y1={backY+D*s+gH*s} x2={cx+L*s} y2={backY+D*s+gH*s}/>
    <Score x1={cx} y1={frontY} x2={cx} y2={backY+D*s}/><Score x1={cx+L*s} y1={frontY} x2={cx+L*s} y2={backY+D*s}/>
    <Score x1={leftX} y1={cy} x2={rightX+D*s} y2={cy}/><Score x1={leftX} y1={cy+W*s} x2={rightX+D*s} y2={cy+W*s}/>
    <Score x1={rightX} y1={cy-tab*s} x2={rightX} y2={cy+W*s+tab*s}/>
    <Score x1={leftX}  y1={cy-tab*s} x2={leftX}  y2={cy+W*s+tab*s}/>
    <Dim x1={cx} y1={frontY-gH*s-9} x2={cx+L*s} y2={frontY-gH*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rightX+D*s+9} y1={cy} x2={rightX+D*s+9} y2={cy+W*s} label={`W=${fmt(W)}`}/>
    <Dim x1={rightX+D*s+9} y1={frontY} x2={rightX+D*s+9} y2={cy} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 6. MAILER (RSC) ─────────────────────────────────────────────────────────
function MailerDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const majD=W/2,minD=Math.min(L/2-0.05,W/2*0.85),gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1,D+2*majD+0.6);
  const m=18,bY=m+majD*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*majD)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}  y={bY} w={L*s} h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}  y={bY} w={W*s} h={bH} label="RIGHT"/>
    <Panel x={bkX} y={bY} w={L*s} h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}  y={bY} w={W*s} h={bH} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX}  y={bY-majD*s} w={L*s} h={majD*s} label="MAJ TOP" fill="#E3F2FD"/>
    <Panel x={fX}  y={bY+bH}     w={L*s} h={majD*s} label="MAJ BOT" fill="#FBE9E7"/>
    <Panel x={bkX} y={bY-majD*s} w={L*s} h={majD*s} label="MAJ TOP" fill="#E3F2FD"/>
    <Panel x={bkX} y={bY+bH}     w={L*s} h={majD*s} label="MAJ BOT" fill="#FBE9E7"/>
    <Panel x={rX+((W-W*0.95)/2)*s} y={bY-(majD-minD)*s-minD*s} w={W*0.95*s} h={minD*s} label="min" fill="#E3F2FD"/>
    <Panel x={rX+((W-W*0.95)/2)*s} y={bY+bH+(majD-minD)*s}     w={W*0.95*s} h={minD*s} label="min" fill="#FBE9E7"/>
    <Panel x={lX+((W-W*0.95)/2)*s} y={bY-(majD-minD)*s-minD*s} w={W*0.95*s} h={minD*s} label="min" fill="#E3F2FD"/>
    <Panel x={lX+((W-W*0.95)/2)*s} y={bY+bH+(majD-minD)*s}     w={W*0.95*s} h={minD*s} label="min" fill="#FBE9E7"/>
    <Score x1={fX} y1={bY} x2={tabX+gTab*s} y2={bY}/><Score x1={fX} y1={bY+bH} x2={tabX+gTab*s} y2={bY+bH}/>
    <Score x1={rX} y1={bY-majD*s} x2={rX} y2={bY+bH+majD*s}/>
    <Score x1={bkX} y1={bY-majD*s} x2={bkX} y2={bY+bH+majD*s}/>
    <Score x1={lX} y1={bY-majD*s} x2={lX} y2={bY+bH+majD*s}/>
    <Score x1={tabX} y1={bY} x2={tabX} y2={bY+bH}/>
    <Dim x1={fX} y1={bY-majD*s-9} x2={fX+L*s} y2={bY-majD*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX} y1={bY-majD*s-9} x2={bkX}    y2={bY-majD*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY} x2={tabX+gTab*s+9} y2={bY+bH} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 7. TWO-PIECE LID ────────────────────────────────────────────────────────
function TwoPieceDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const bH=D*0.38,lH=D*0.62;
  const s=calcScale(L+2*lH+0.5,2*(W+2*lH)+1.4);
  const m=18,lidCX=m+lH*s,lidCY=m+lH*s,baseCX=m+lH*s,baseCY=lidCY+(W+2*lH)*s+s;
  const svgW=m*2+(L+2*lH)*s+28,svgH=m*2+(2*(W+2*lH)+1.2)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={lidCX}       y={lidCY}          w={L*s}  h={W*s}        label="LID TOP"    fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={lidCX} py={lidCY} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lidCX}       y={lidCY-lH*s}     w={L*s}  h={lH*s}       label="LID FRONT"  fill="#E3F2FD"/>
    {hw&&wf==='front'&&<WinCut px={lidCX} py={lidCY-lH*s} pw={L*s} ph={lH*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lidCX}       y={lidCY+W*s}      w={L*s}  h={lH*s}       label="LID BACK"   fill="#E3F2FD"/>
    <Panel x={lidCX+L*s}   y={lidCY-lH*s}     w={lH*s} h={(W+2*lH)*s} label="R"          fill="#E3F2FD"/>
    <Panel x={lidCX-lH*s}  y={lidCY-lH*s}     w={lH*s} h={(W+2*lH)*s} label="L"          fill="#E3F2FD"/>
    <Panel x={baseCX}      y={baseCY}          w={L*s}  h={W*s}        label="BASE BTM"   fill="#FBE9E7"/>
    {hw&&wf==='bottom'&&<WinCut px={baseCX} py={baseCY} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={baseCX}      y={baseCY-bH*s}     w={L*s}  h={bH*s}       label="BASE FRONT" fill="#FBE9E7"/>
    <Panel x={baseCX}      y={baseCY+W*s}      w={L*s}  h={bH*s}       label="BASE BACK"  fill="#FBE9E7"/>
    <Panel x={baseCX+L*s}  y={baseCY-bH*s}     w={bH*s} h={(W+2*bH)*s} label="R"          fill="#FBE9E7"/>
    <Panel x={baseCX-bH*s} y={baseCY-bH*s}     w={bH*s} h={(W+2*bH)*s} label="L"          fill="#FBE9E7"/>
    <Score x1={lidCX} y1={lidCY} x2={lidCX+L*s} y2={lidCY}/>
    <Score x1={lidCX} y1={lidCY+W*s} x2={lidCX+L*s} y2={lidCY+W*s}/>
    <Score x1={baseCX} y1={baseCY} x2={baseCX+L*s} y2={baseCY}/>
    <Score x1={baseCX} y1={baseCY+W*s} x2={baseCX+L*s} y2={baseCY+W*s}/>
    <text x={lidCX+L*s/2} y={lidCY-lH*s-10} textAnchor="middle" fontSize={7} fill="#1565C0" fontFamily="Arial,sans-serif">LID (larger)</text>
    <text x={baseCX+L*s/2} y={baseCY-bH*s-10} textAnchor="middle" fontSize={7} fill="#C62828" fontFamily="Arial,sans-serif">BASE (smaller)</text>
    <Dim x1={lidCX} y1={lidCY-lH*s-18} x2={lidCX+L*s} y2={lidCY-lH*s-18} label={`L=${fmt(L)}`}/>
    <Dim x1={lidCX+L*s+9} y1={lidCY} x2={lidCX+L*s+9} y2={lidCY+W*s} label={`W=${fmt(W)}`}/>
    <Dim x1={lidCX+L*s+9} y1={lidCY-lH*s} x2={lidCX+L*s+9} y2={lidCY} label={`lH`} off={12}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 8. PILLOW ────────────────────────────────────────────────────────────────
function PillowDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const gTab=Math.min(0.5,W*0.6);
  const s=calcScale(L+W+L+W+gTab+1,D+2*W+0.6);
  const m=18,bY=m+W*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*W)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}  y={bY} w={L*s}     h={D*s} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}  y={bY} w={W*s}     h={D*s} label="RIGHT"/>
    <Panel x={bkX} y={bY} w={L*s}     h={D*s} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}  y={bY} w={W*s}     h={D*s} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={D*s} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX+(L-L*0.6)/2*s} y={bY-W*s} w={L*0.6*s} h={W*s} label="CRIMP TOP" fill="#E3F2FD"/>
    <Panel x={fX+(L-L*0.6)/2*s} y={bY+D*s} w={L*0.6*s} h={W*s} label="CRIMP BOT" fill="#FBE9E7"/>
    <Score x1={fX} y1={bY} x2={tabX+gTab*s} y2={bY}/><Score x1={fX} y1={bY+D*s} x2={tabX+gTab*s} y2={bY+D*s}/>
    <Score x1={rX} y1={bY} x2={rX} y2={bY+D*s}/><Score x1={bkX} y1={bY} x2={bkX} y2={bY+D*s}/>
    <Score x1={lX} y1={bY} x2={lX} y2={bY+D*s}/><Score x1={tabX} y1={bY} x2={tabX} y2={bY+D*s}/>
    <Dim x1={fX} y1={bY-W*s-9} x2={fX+L*s} y2={bY-W*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX} y1={bY-W*s-9} x2={bkX}    y2={bY-W*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY} x2={tabX+gTab*s+9} y2={bY+D*s} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 9. DRAWER ────────────────────────────────────────────────────────────────
function DrawerDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const gTab=Math.min(0.5,W*0.6),slW=L+D+L+D+gTab,drW=L+2*D,gap=0.5;
  const s=calcScale(Math.max(slW,drW)+0.5,W+(W+2*D)+gap+0.6);
  const m=18,sy=m,s1x=m,s2x=s1x+L*s,s3x=s2x+D*s,s4x=s3x+L*s,s5x=s4x+D*s;
  const dy=m+(W+gap)*s,dcx=m+D*s,dcy=dy+D*s;
  const svgW=m*2+Math.max(slW,drW)*s+28,svgH=m*2+(W+gap+W+2*D)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={s1x} y={sy} w={L*s}     h={W*s} label="SLEEVE FRONT" fill="#E3F2FD"/>
    {hw&&wf==='front'&&<WinCut px={s1x} py={sy} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={s2x} y={sy} w={D*s}     h={W*s} label="R" fill="#E3F2FD"/>
    <Panel x={s3x} y={sy} w={L*s}     h={W*s} label="SLEEVE BACK"  fill="#E3F2FD"/>
    <Panel x={s4x} y={sy} w={D*s}     h={W*s} label="L" fill="#E3F2FD"/>
    <Panel x={s5x} y={sy} w={gTab*s}  h={W*s} label="GLUE" fill="#E8F5E9"/>
    <Panel x={dcx}     y={dcy}     w={L*s} h={W*s} label="DRAWER BTM" fill="#FBE9E7"/>
    <Panel x={dcx}     y={dcy-D*s} w={L*s} h={D*s} label="PULL FACE"  fill="#FBE9E7"/>
    <Panel x={dcx}     y={dcy+W*s} w={L*s} h={D*s} label="BACK"       fill="#FBE9E7"/>
    <Panel x={dcx+L*s} y={dcy}     w={D*s} h={W*s} label="R"          fill="#FBE9E7"/>
    <Panel x={dcx-D*s} y={dcy}     w={D*s} h={W*s} label="L"          fill="#FBE9E7"/>
    <text x={m+slW*s/2} y={sy-9} textAnchor="middle" fontSize={7} fill="#1565C0" fontFamily="Arial,sans-serif">OUTER SLEEVE</text>
    <text x={m+drW*s/2} y={dy-9} textAnchor="middle" fontSize={7} fill="#C62828" fontFamily="Arial,sans-serif">INNER DRAWER TRAY</text>
    <Score x1={s2x} y1={sy} x2={s2x} y2={sy+W*s}/><Score x1={s3x} y1={sy} x2={s3x} y2={sy+W*s}/>
    <Score x1={s4x} y1={sy} x2={s4x} y2={sy+W*s}/><Score x1={s5x} y1={sy} x2={s5x} y2={sy+W*s}/>
    <Score x1={dcx} y1={dcy} x2={dcx+L*s} y2={dcy}/><Score x1={dcx} y1={dcy+W*s} x2={dcx+L*s} y2={dcy+W*s}/>
    <Score x1={dcx} y1={dcy-D*s} x2={dcx} y2={dcy+W*s+D*s}/>
    <Score x1={dcx+L*s} y1={dcy-D*s} x2={dcx+L*s} y2={dcy+W*s+D*s}/>
    <Score x1={dcx-D*s} y1={dcy} x2={dcx+L*s+D*s} y2={dcy}/>
    <Score x1={dcx-D*s} y1={dcy+W*s} x2={dcx+L*s+D*s} y2={dcy+W*s}/>
    <Dim x1={s1x} y1={sy-18} x2={s1x+L*s} y2={sy-18} label={`L=${fmt(L)}`}/>
    <Dim x1={s2x} y1={sy-18} x2={s3x}     y2={sy-18} label={`D=${fmt(D)}`}/>
    <Dim x1={s5x+gTab*s+9} y1={sy} x2={s5x+gTab*s+9} y2={sy+W*s} label={`W=${fmt(W)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 10. SNAP-LOCK ────────────────────────────────────────────────────────────
function SnapLockDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const lip=Math.min(0.6,D*0.5),dH=Math.min(0.7,L*0.45)*0.5,dW=W*0.85;
  const snapMain=W/2,snapTab=W/3,gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1,D+W+lip+snapMain+dH+0.6);
  const m=18,bY=m+(W+lip)*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+W+lip+snapMain+dH)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}   y={bY} w={L*s}    h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}   y={bY} w={W*s}    h={bH} label="RIGHT"/>
    <Panel x={bkX}  y={bY} w={L*s}    h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}   y={bY} w={W*s}    h={bH} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX}   y={bY-W*s}       w={L*s}      h={W*s}   label="TOP TUCK" fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={fX} py={bY-W*s} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bY-W*s-lip*s} w={L*0.98*s} h={lip*s} label="LIP" fill="#E3F2FD"/>
    <Panel x={rX+((W-dW)/2)*s} y={bY-dH*s} w={dW*s} h={dH*s} label="D" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bY-dH*s} w={dW*s} h={dH*s} label="D" fill="#F3E5F5"/>
    <Panel x={fX+(L*0.015)*s}          y={bY+bH} w={L*0.97*s} h={snapMain*s} label="SNAP MAIN" fill="#FFF3E0"/>
    <Panel x={bkX+(L*0.015)*s}         y={bY+bH} w={L*0.97*s} h={snapMain*s} label="SNAP MAIN" fill="#FFF3E0"/>
    <Panel x={rX+((W-W*0.90)/2)*s}     y={bY+bH} w={W*0.90*s} h={snapTab*s}  label="TAB"       fill="#FFF9C4"/>
    <Panel x={lX+((W-W*0.90)/2)*s}     y={bY+bH} w={W*0.90*s} h={snapTab*s}  label="TAB"       fill="#FFF9C4"/>
    <Score x1={fX} y1={bY} x2={tabX+gTab*s} y2={bY}/><Score x1={fX} y1={bY+bH} x2={tabX+gTab*s} y2={bY+bH}/>
    <Score x1={rX} y1={bY-dH*s} x2={rX} y2={bY+bH}/><Score x1={bkX} y1={bY} x2={bkX} y2={bY+bH}/>
    <Score x1={lX} y1={bY-dH*s} x2={lX} y2={bY+bH}/><Score x1={tabX} y1={bY} x2={tabX} y2={bY+bH}/>
    <Score x1={fX} y1={bY-W*s} x2={fX+L*s} y2={bY-W*s}/>
    <Dim x1={fX} y1={bY-W*s-lip*s-9} x2={fX+L*s} y2={bY-W*s-lip*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX} y1={bY-W*s-lip*s-9} x2={bkX}    y2={bY-W*s-lip*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY}    x2={tabX+gTab*s+9} y2={bY+bH}   label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 11. DISPLAY ──────────────────────────────────────────────────────────────
function DisplayDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const topLip=Math.min(0.4,W*0.3);
  const s=calcScale(L+2*W+0.6,D+D+D+W+topLip+0.6);
  const m=18,backX=m+W*s,shelfY=m+D*s,backY=shelfY+D*s,floorY=backY+D*s,topY=floorY+W*s;
  const svgW=m*2+(L+2*W)*s+28,svgH=m*2+(D+D+D+W+topLip)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={backX}     y={shelfY}  w={L*s} h={D*s}    label="FRONT/SHELF" fill="#FFF3E0" sub="folds down"/>
    {hw&&wf==='front'&&<WinCut px={backX} py={shelfY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={backX}     y={backY}   w={L*s} h={D*s}    label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={backX} py={backY} pw={L*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={backX+L*s} y={backY}   w={W*s} h={D*s}    label="RIGHT"/>
    {hw&&wf==='right'&&<WinCut px={backX+L*s} py={backY} pw={W*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={backX-W*s} y={backY}   w={W*s} h={D*s}    label="LEFT"/>
    {hw&&wf==='left'&&<WinCut px={backX-W*s} py={backY} pw={W*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={backX}     y={floorY}  w={L*s} h={W*s}    label="FLOOR" fill="#E8F5E9"/>
    <Panel x={backX}     y={topY}    w={L*s} h={W*s}    label="TOP CLOSURE" fill="#E3F2FD" sub="hinged front-top"/>
    {hw&&wf==='top'&&<WinCut px={backX} py={topY} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={backX+(L*(1-0.98)/2)*s} y={topY+W*s} w={L*0.98*s} h={topLip*s} label="LIP" fill="#E3F2FD"/>
    <Score x1={backX} y1={shelfY+D*s} x2={backX+L*s} y2={shelfY+D*s}/>
    <Score x1={backX} y1={backY+D*s}  x2={backX+L*s} y2={backY+D*s}/>
    <Score x1={backX} y1={floorY+W*s} x2={backX+L*s} y2={floorY+W*s}/>
    <Score x1={backX} y1={topY+W*s}   x2={backX+L*s} y2={topY+W*s}/>
    <Score x1={backX}     y1={shelfY} x2={backX}     y2={topY+W*s+topLip*s}/>
    <Score x1={backX+L*s} y1={shelfY} x2={backX+L*s} y2={topY+W*s+topLip*s}/>
    <Score x1={backX-W*s} y1={backY}  x2={backX+L*s+W*s} y2={backY}/>
    <Score x1={backX-W*s} y1={backY+D*s} x2={backX+L*s+W*s} y2={backY+D*s}/>
    <Dim x1={backX} y1={shelfY-9} x2={backX+L*s} y2={shelfY-9} label={`L=${fmt(L)}`}/>
    <Dim x1={backX+L*s} y1={shelfY-9} x2={backX+L*s+W*s} y2={shelfY-9} label={`W=${fmt(W)}`}/>
    <Dim x1={backX+L*s+W*s+9} y1={backY} x2={backX+L*s+W*s+9} y2={backY+D*s} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 12. SEAL-END ─────────────────────────────────────────────────────────────
function SealEndDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const majD=W*0.99,minD=Math.min(L*0.45,W*0.48),gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1,D+2*majD+0.6);
  const m=18,bY=m+majD*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*majD)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}   y={bY} w={L*s}    h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}   y={bY} w={W*s}    h={bH} label="RIGHT"/>
    <Panel x={bkX}  y={bY} w={L*s}    h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}   y={bY} w={W*s}    h={bH} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={rX+((W-W*0.95)/2)*s} y={bY-minD*s} w={W*0.95*s} h={minD*s} label="GUSSET" fill="#F3E5F5" sub="1st"/>
    <Panel x={lX+((W-W*0.95)/2)*s} y={bY-minD*s} w={W*0.95*s} h={minD*s} label="GUSSET" fill="#F3E5F5" sub="1st"/>
    <Panel x={fX}   y={bY-majD*s}    w={L*s}      h={majD*s}  label="FRONT MAJ"  fill="#E3F2FD" sub="2nd"/>
    <Panel x={bkX}  y={bY-majD*s}    w={L*s}      h={majD*s}  label="BACK MAJ"   fill="#BBDEFB" sub="top/last"/>
    <Panel x={rX+((W-W*0.95)/2)*s} y={bY+bH} w={W*0.95*s} h={minD*s} label="GUSSET" fill="#F3E5F5" sub="1st"/>
    <Panel x={lX+((W-W*0.95)/2)*s} y={bY+bH} w={W*0.95*s} h={minD*s} label="GUSSET" fill="#F3E5F5" sub="1st"/>
    <Panel x={fX}  y={bY+bH}         w={L*s}      h={majD*s}  label="FRONT MAJ"  fill="#FBE9E7" sub="2nd"/>
    <Panel x={bkX} y={bY+bH}         w={L*s}      h={majD*s}  label="BACK MAJ"   fill="#FFCCBC" sub="top/last"/>
    <Score x1={fX} y1={bY} x2={tabX+gTab*s} y2={bY}/><Score x1={fX} y1={bY+bH} x2={tabX+gTab*s} y2={bY+bH}/>
    <Score x1={rX} y1={bY-majD*s} x2={rX} y2={bY+bH+majD*s}/>
    <Score x1={bkX} y1={bY-majD*s} x2={bkX} y2={bY+bH+majD*s}/>
    <Score x1={lX} y1={bY-majD*s} x2={lX} y2={bY+bH+majD*s}/>
    <Score x1={tabX} y1={bY} x2={tabX} y2={bY+bH}/>
    <Dim x1={fX}  y1={bY-majD*s-9} x2={fX+L*s} y2={bY-majD*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX}  y1={bY-majD*s-9} x2={bkX}    y2={bY-majD*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY} x2={tabX+gTab*s+9} y2={bY+bH} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 13. HEX ──────────────────────────────────────────────────────────────────
function HexDieline({W,D,wp}:{W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowW:wW,windowH:wH}=wp;
  const hexR=W*0.82,gTab=Math.min(0.5,W*0.5);
  const s=calcScale(W*6+gTab+0.5,D+hexR*1.6+0.6);
  const m=18,bY=m+hexR*s;
  const svgW=m*2+(W*6+gTab)*s+28,svgH=m*2+(D+hexR*1.6)*s+24;
  function hexPoly(cx:number,cy:number,r:number){const pts=[];for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;pts.push(`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`);}return pts.join(' ');}
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    {[0,1,2,3,4,5].map(i=><Panel key={i} x={m+i*W*s} y={bY} w={W*s} h={D*s} label={`P${i+1}`}/>)}
    {/* Show window on P1 (front) */}
    {hw&&<WinCut px={m} py={bY} pw={W*s} ph={D*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={m+6*W*s} y={bY} w={gTab*s} h={D*s} label="GLUE" fill="#E8F5E9"/>
    {[1,2,3,4,5].map(i=><Score key={i} x1={m+i*W*s} y1={bY} x2={m+i*W*s} y2={bY+D*s}/>)}
    <polygon points={hexPoly(m+W*0.5*s,bY-hexR*s*0.58,hexR*s*0.74)} fill="#E3F2FD" stroke="#B0BEC5" strokeWidth={0.5}/>
    <text x={m+W*0.5*s} y={bY-hexR*s*0.58} textAnchor="middle" dominantBaseline="central" fontSize={6} fill="#37474F" fontFamily="Arial,sans-serif">TOP CAP</text>
    <polygon points={hexPoly(m+W*0.5*s,bY+D*s+hexR*s*0.58,hexR*s*0.74)} fill="#FBE9E7" stroke="#B0BEC5" strokeWidth={0.5}/>
    <text x={m+W*0.5*s} y={bY+D*s+hexR*s*0.58} textAnchor="middle" dominantBaseline="central" fontSize={6} fill="#37474F" fontFamily="Arial,sans-serif">BTM CAP</text>
    <Score x1={m} y1={bY} x2={m+(6*W+gTab)*s} y2={bY}/>
    <Score x1={m} y1={bY+D*s} x2={m+(6*W+gTab)*s} y2={bY+D*s}/>
    <Dim x1={m} y1={bY-9} x2={m+W*s} y2={bY-9} label={`S=${fmt(W)}`}/>
    <Dim x1={m+6*W*s+gTab*s+9} y1={bY} x2={m+6*W*s+gTab*s+9} y2={bY+D*s} label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 14. ROLL-END ─────────────────────────────────────────────────────────────
function RollEndDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const lip=Math.min(0.5,D*0.4),rollH=Math.min(D*0.35,W*0.6),gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1,D+2*(W+lip)+rollH*0.5+0.6);
  const m=18,bY=m+(W+lip)*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*(W+lip)+rollH*0.5)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX}   y={bY} w={L*s}    h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}   y={bY} w={W*s}    h={bH} label="RIGHT"/>
    <Panel x={bkX}  y={bY} w={L*s}    h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}   y={bY} w={W*s}    h={bH} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX}   y={bY-W*s}      w={L*s}      h={W*s}  label="TOP TUCK" fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={fX} py={bY-W*s} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bY-W*s-lip*s} w={L*0.98*s} h={lip*s} label="LIP" fill="#E3F2FD"/>
    <Panel x={fX}   y={bY+bH}       w={L*s}      h={W*s}  label="BTM TUCK" fill="#FBE9E7"/>
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bY+bH+W*s}   w={L*0.98*s} h={lip*s} label="LIP" fill="#FBE9E7"/>
    <Panel x={rX+((W-W*0.92)/2)*s} y={bY-rollH*s} w={W*0.92*s} h={rollH*s} label="ROLL" fill="#E8EAF6"/>
    <Panel x={rX+((W-W*0.92)/2)*s} y={bY+bH}      w={W*0.92*s} h={rollH*s} label="ROLL" fill="#E8EAF6"/>
    <Panel x={lX+((W-W*0.92)/2)*s} y={bY-rollH*s} w={W*0.92*s} h={rollH*s} label="ROLL" fill="#E8EAF6"/>
    <Panel x={lX+((W-W*0.92)/2)*s} y={bY+bH}      w={W*0.92*s} h={rollH*s} label="ROLL" fill="#E8EAF6"/>
    <Score x1={fX} y1={bY} x2={tabX+gTab*s} y2={bY}/><Score x1={fX} y1={bY+bH} x2={tabX+gTab*s} y2={bY+bH}/>
    <Score x1={rX} y1={bY-rollH*s} x2={rX} y2={bY+bH+rollH*s}/>
    <Score x1={bkX} y1={bY} x2={bkX} y2={bY+bH}/>
    <Score x1={lX} y1={bY-rollH*s} x2={lX} y2={bY+bH+rollH*s}/>
    <Score x1={tabX} y1={bY} x2={tabX} y2={bY+bH}/>
    <Score x1={fX} y1={bY-W*s} x2={fX+L*s} y2={bY-W*s}/>
    <Score x1={fX} y1={bY+bH+W*s} x2={fX+L*s} y2={bY+bH+W*s}/>
    <Dim x1={fX} y1={bY-W*s-lip*s-9} x2={fX+L*s} y2={bY-W*s-lip*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX} y1={bY-W*s-lip*s-9} x2={bkX}    y2={bY-W*s-lip*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY}   x2={tabX+gTab*s+9} y2={bY+bH}  label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── 15. FIVE-PANEL HANGER ────────────────────────────────────────────────────
function FivePanelDieline({L,W,D,wp}:{L:number;W:number;D:number;wp:WP}){
  const{hasWindow:hw,windowFace:wf,windowW:wW,windowH:wH}=wp;
  const lip=Math.min(0.6,D*0.5),dH=Math.min(0.7,L*0.45)*0.5,dW=W*0.85;
  const hdrH=Math.min(D*0.55,2.2),slotW=L*0.38,slotH=0.45,gTab=Math.min(0.6,W*0.8);
  const s=calcScale(L+W+L+W+gTab+1,D+2*(W+lip)+hdrH+dH+0.6);
  const m=18,bY=m+(W+lip)*s+hdrH*s,fX=m,rX=fX+L*s,bkX=rX+W*s,lX=bkX+L*s,tabX=lX+W*s;
  const bH=D*s,svgW=m*2+(L+W+L+W+gTab)*s+28,svgH=m*2+(D+2*(W+lip)+hdrH+dH)*s+24;
  const W2=(w:number)=>w*s;
  return(<svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
    <Panel x={fX} y={bY-W*s-hdrH*s} w={L*s} h={hdrH*s} label="HEADER (P5)" fill="#E8EAF6" sub="euro-slot"/>
    <rect x={fX+(L-slotW)/2*s} y={bY-W*s-hdrH*s+hdrH*0.22*s} width={slotW*s} height={slotH*s} rx={slotH*s/2} fill="white" stroke="#1565C0" strokeWidth={1}/>
    <text x={fX+L*0.5*s} y={bY-W*s-hdrH*s+hdrH*0.22*s+slotH*s/2} textAnchor="middle" dominantBaseline="central" fontSize={4.5} fill="#1565C0">EURO SLOT</text>
    <Panel x={fX} y={bY-W*s}    w={L*s} h={W*s}   label="TOP TUCK" fill="#E3F2FD"/>
    {hw&&wf==='top'&&<WinCut px={fX} py={bY-W*s} pw={L*s} ph={W*s} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bY-W*s-lip*s} w={L*0.98*s} h={lip*s} label="" fill="#E3F2FD"/>
    <Panel x={fX}   y={bY} w={L*s}    h={bH} label="FRONT"/>
    {hw&&wf==='front'&&<WinCut px={fX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={rX}   y={bY} w={W*s}    h={bH} label="RIGHT"/>
    <Panel x={bkX}  y={bY} w={L*s}    h={bH} label="BACK"/>
    {hw&&wf==='back'&&<WinCut px={bkX} py={bY} pw={L*s} ph={bH} ww={W2(wW)} wh={W2(wH)}/>}
    <Panel x={lX}   y={bY} w={W*s}    h={bH} label="LEFT"/>
    <Panel x={tabX} y={bY} w={gTab*s} h={bH} label="GLUE" fill="#E8F5E9"/>
    <Panel x={fX} y={bY+bH}         w={L*s}       h={W*s}  label="BTM TUCK" fill="#FBE9E7"/>
    <Panel x={fX+(L*(1-0.98)/2)*s} y={bY+bH+W*s}  w={L*0.98*s} h={lip*s} label="LIP" fill="#FBE9E7"/>
    <Panel x={rX+((W-dW)/2)*s} y={bY-dH*s} w={dW*s} h={dH*s} label="D" fill="#F3E5F5"/>
    <Panel x={rX+((W-dW)/2)*s} y={bY+bH}   w={dW*s} h={dH*s} label="D" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bY-dH*s} w={dW*s} h={dH*s} label="D" fill="#F3E5F5"/>
    <Panel x={lX+((W-dW)/2)*s} y={bY+bH}   w={dW*s} h={dH*s} label="D" fill="#F3E5F5"/>
    <Score x1={fX} y1={bY} x2={tabX+gTab*s} y2={bY}/><Score x1={fX} y1={bY+bH} x2={tabX+gTab*s} y2={bY+bH}/>
    <Score x1={fX} y1={bY-W*s}        x2={fX+L*s} y2={bY-W*s}/>
    <Score x1={fX} y1={bY-W*s-hdrH*s} x2={fX+L*s} y2={bY-W*s-hdrH*s}/>
    <Score x1={rX} y1={bY-dH*s} x2={rX} y2={bY+bH+dH*s}/><Score x1={bkX} y1={bY} x2={bkX} y2={bY+bH}/>
    <Score x1={lX} y1={bY-dH*s} x2={lX} y2={bY+bH+dH*s}/><Score x1={tabX} y1={bY} x2={tabX} y2={bY+bH}/>
    <Score x1={fX} y1={bY+bH+W*s} x2={fX+L*s} y2={bY+bH+W*s}/>
    <Dim x1={fX}  y1={bY-W*s-hdrH*s-9} x2={fX+L*s} y2={bY-W*s-hdrH*s-9} label={`L=${fmt(L)}`}/>
    <Dim x1={rX}  y1={bY-W*s-hdrH*s-9} x2={bkX}    y2={bY-W*s-hdrH*s-9} label={`W=${fmt(W)}`}/>
    <Dim x1={tabX+gTab*s+9} y1={bY}    x2={tabX+gTab*s+9} y2={bY+bH}     label={`D=${fmt(D)}`}/>
    <Legend x={m} y={svgH-16} hasWin={hw}/>
  </svg>);
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Dieline({
  length, width, depth, boxType,
  hasWindow=false, windowW=0, windowH=0, windowFace='front'
}:{
  length:number; width:number; depth:number; boxType:string;
  hasWindow?:boolean; windowW?:number; windowH?:number; windowFace?:string;
}){
  const L=length, W=width, D=depth;
  // Scale for window pixels is pre-computed inside each dieline using calcScale
  // We pass s=0 since each fn recalculates its own s; WinCut receives px values directly
  const wp:WP={hasWindow,windowW,windowH,windowFace,s:0};

  const pending=(n:string)=>(
    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-4">
      2D DIELINE PENDING FOR {n.toUpperCase()}
    </div>
  );

  if(boxType==='straight-tuck')return<STEDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1.2,D+2*(W+Math.min(0.6,D*0.5))+Math.min(0.7,L*0.45)*0.7+1)}}/>;
  if(boxType==='reverse-tuck') return<RTEDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1.2,D+2*(W+Math.min(0.6,D*0.5))+Math.min(0.7,L*0.45)*0.7+1)}}/>;
  if(boxType==='tray-lock')    return<TrayLockDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+2*D+0.5,2*Math.min(D*0.8,L*0.45)+2*D+2*W+Math.min(0.6,D*0.5)+0.8)}}/>;
  if(boxType==='sleeve')       return<SleeveDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1,D+0.6)}}/>;
  if(boxType==='gable')        return<GableDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+2*D+0.8,2*Math.min(D*0.8,L*0.45)+W+2*(D+Math.min(W*0.65,2.5))+0.8)}}/>;
  if(boxType==='mailer')       return<MailerDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1,D+W+0.6)}}/>;
  if(boxType==='two-piece')    return<TwoPieceDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+D*1.24+0.5,2*(W+D)+1.4)}}/>;
  if(boxType==='pillow')       return<PillowDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.5,W*0.6)+1,D+2*W+0.6)}}/>;
  if(boxType==='drawer')       return<DrawerDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+2*D+Math.min(0.5,W*0.6)+0.5,W+(W+2*D)+0.8)}}/>;
  if(boxType==='snap-lock')    return<SnapLockDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1,D+W+Math.min(0.6,D*0.5)+W/2+0.8)}}/>;
  if(boxType==='display')      return<DisplayDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+2*W+0.6,D*3+W+Math.min(0.4,W*0.3)+0.6)}}/>;
  if(boxType==='seal-end')     return<SealEndDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1,D+2*W+0.6)}}/>;
  if(boxType==='hex')          return<HexDieline W={W} D={D} wp={{...wp,s:calcScale(W*6+Math.min(0.5,W*0.5)+0.5,D+W*0.82*1.6+0.6)}}/>;
  if(boxType==='roll-end')     return<RollEndDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1,D+2*(W+Math.min(0.5,D*0.4))+Math.min(D*0.35,W*0.6)*0.5+0.6)}}/>;
  if(boxType==='five-panel')   return<FivePanelDieline L={L} W={W} D={D} wp={{...wp,s:calcScale(L+W+L+W+Math.min(0.6,W*0.8)+1,D+2*(W+Math.min(0.6,D*0.5))+Math.min(D*0.55,2.2)+0.8)}}/>;
  return pending(boxType);
}
