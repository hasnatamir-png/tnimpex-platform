"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { TrackballControls, Decal, useTexture, ContactShadows, Edges, Text, Line } from "@react-three/drei";
import { Suspense, useRef, useMemo, useEffect } from "react";

function panelFold(o:number,hi:number,lo:number,maxAngle=Math.PI/2){
  if(hi<=lo)return 0;
  return Math.max(0,Math.min(1,(o-lo)/(hi-lo)))*maxAngle;
}
function DimArrow({from,to,label,opacity,tickDir=[0,0,1] as [number,number,number]}:{from:[number,number,number];to:[number,number,number];label:string;opacity:number;tickDir?:[number,number,number]}){
  const ref=useRef<THREE.Group>(null!);
  useFrame(({camera})=>{if(ref.current)ref.current.scale.setScalar(Math.max(0.4,Math.min(6,camera.position.length()/22)));});
  if(opacity<=0.005)return null;
  const[f0,f1,f2]=from,[t0,t1,t2]=to,[d0,d1,d2]=tickDir,ts=0.10;
  const mid:[number,number,number]=[(f0+t0)/2,(f1+t1)/2,(f2+t2)/2];
  const lp:[number,number,number]=[mid[0]+d0*0.38,mid[1]+d1*0.38,mid[2]+d2*0.38];
  return(<group><Line points={[from,to]} color="#1A237E" lineWidth={1.5} transparent opacity={opacity}/>
    <Line points={[[f0-d0*ts,f1-d1*ts,f2-d2*ts],[f0+d0*ts,f1+d1*ts,f2+d2*ts]]} color="#1A237E" lineWidth={1.5} transparent opacity={opacity}/>
    <Line points={[[t0-d0*ts,t1-d1*ts,t2-d2*ts],[t0+d0*ts,t1+d1*ts,t2+d2*ts]]} color="#1A237E" lineWidth={1.5} transparent opacity={opacity}/>
    <group position={lp} ref={ref}><Text fontSize={0.44} color="#1A237E" fillOpacity={opacity} anchorX="center" anchorY="middle" fontWeight="black" outlineWidth={0.03} outlineColor="#ffffff" outlineOpacity={Math.min(opacity,0.75)}>{label}</Text></group>
  </group>);
}
function CameraSetup({length,width,depth,boxType}:any){
  const{camera}=useThree();
  useEffect(()=>{
    const gTab=Math.min(0.6,width*0.8),lip=Math.min(0.6,depth*0.5);
    let eX:number,eY:number;
    if(['tray-lock','gable','two-piece'].includes(boxType)){eX=length+2*depth;eY=width+2*depth;}
    else if(boxType==='hex'){eX=6*width+1;eY=depth+2;}
    else if(boxType==='display'){eX=length+width;eY=depth+width;}
    else if(boxType==='sleeve'){eX=2*length+2*width+gTab;eY=depth;}
    else{eX=2*length+2*width+gTab;eY=depth+2*(width+lip);}
    const dist=Math.max(eX,eY,depth)*1.9;
    camera.position.set(0,dist*0.50,dist*0.87);
    camera.lookAt(0,0,0);camera.updateProjectionMatrix();
  },[length,width,depth,boxType,camera]);
  return null;
}
function MagneticTrackball({target=[0,0,0]}:any){
  const ref=useRef<any>(null),drag=useRef(false);
  const{camera}=useThree(),tv=useMemo(()=>new THREE.Vector3(...target),[target]);
  useEffect(()=>{const c=ref.current;if(!c)return;const s=()=>{drag.current=true;},e=()=>{drag.current=false;};c.addEventListener('start',s);c.addEventListener('end',e);return()=>{c.removeEventListener('start',s);c.removeEventListener('end',e);};},[]);
  useFrame(()=>{
    if(!ref.current)return;ref.current.target.copy(tv);if(drag.current)return;
    const pos=camera.position.clone().sub(tv),dist=pos.length();if(!dist)return;
    const dir=pos.normalize();
    const axes=[new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)];
    let best=axes[0],mx=-1;axes.forEach(a=>{const d=dir.dot(a);if(d>mx){mx=d;best=a;}});
    let snap=false;
    if(mx>0.98&&mx<0.999){camera.position.lerp(best.clone().multiplyScalar(dist).add(tv),0.08);snap=true;}
    let bestUp=axes[0],mu=-1;const up=camera.up.clone().normalize();
    axes.forEach(a=>{if(Math.abs(best.dot(a))<0.1){const d=up.dot(a);if(d>mu){mu=d;bestUp=a;}}});
    if(mu>0.90&&mu<0.999){camera.up.lerp(bestUp,0.08).normalize();snap=true;}
    if(snap)camera.lookAt(tv);
  });
  return<TrackballControls ref={ref} makeDefault panSpeed={2} zoomSpeed={3.5} rotateSpeed={3} staticMoving minDistance={1} maxDistance={300}/>;
}
function BoxLogo({panelData,panelWidth,panelHeight,isExtruded,t}:any){
  const tex=useTexture(panelData.displayUrl);
  const base=Math.min(panelWidth,panelHeight),z=isExtruded?t+0.001:0.026;
  return<Decal position={[panelData.x||0,panelData.y||0,z]} rotation={[0,0,0]} scale={[base*panelData.scale*0.5,base*panelData.scale*0.5,0.02]}><meshStandardMaterial map={tex} transparent polygonOffset polygonOffsetFactor={-1} depthTest/></Decal>;
}
const FaceGraphics=({graphics,w,h,isExtruded=false,t=0}:any)=><>{graphics?.map?.((g:any)=><BoxLogo key={g.id} panelData={g} panelWidth={w} panelHeight={h} isExtruded={isExtruded} t={t}/>)}</>;
const Cardboard=({materialColor}:any)=>{
  const mc=(materialColor||'').toUpperCase(),isW=mc==='#FFFFFF'||mc==='#FAFAFA'||mc==='#F8F8F8',isG=mc==='#C8C8C2'||mc==='#C8C8C8';
  return(<><meshStandardMaterial color={materialColor} roughness={isW?0.70:isG?0.85:0.93}/><Edges linewidth={1} threshold={15} color={isW?'#6B6B6B':'#111111'} opacity={isW?0.16:0.07} transparent/></>);
};
const PanelLabel=({label,length,width,isExtruded,t}:any)=>{
  const fs=Math.min(width*0.5,(length*0.8)/((label?.length||1)*0.65));
  return<Text position={[0,0,isExtruded?t+0.001:0.027]} fontSize={fs} color="#283593" fillOpacity={0.25} anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.1} depthTest>{label}</Text>;
};
function WindowPanel({panelW,panelH,winW,winH,t,materialColor,panelData,label}:any){
  const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-panelW/2,-panelH/2);s.lineTo(panelW/2,-panelH/2);s.lineTo(panelW/2,panelH/2);s.lineTo(-panelW/2,panelH/2);s.lineTo(-panelW/2,-panelH/2);const h=new THREE.Path();h.moveTo(-winW/2,-winH/2);h.lineTo(winW/2,-winH/2);h.lineTo(winW/2,winH/2);h.lineTo(-winW/2,winH/2);h.lineTo(-winW/2,-winH/2);s.holes.push(h);return s;},[panelW,panelH,winW,winH]);
  return(<group><mesh position={[0,0,-t/2]}><extrudeGeometry args={[shape,{depth:t,bevelEnabled:false,curveSegments:1,steps:1}]}/><meshStandardMaterial color={materialColor} roughness={0.9}/><FaceGraphics graphics={panelData} w={panelW} h={panelH} isExtruded t={t}/><PanelLabel label={label} length={panelW} width={panelH} isExtruded t={t}/></mesh><mesh position={[0,0,0]}><boxGeometry args={[winW,winH,t/4]}/><meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.05} ior={1.5}/></mesh></group>);
}

// ─── 1. TRAY-LOCK ─────────────────────────────────────────────────────────────
function TraySideLock({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,tab=Math.min(D*0.8,L*0.45),lip=Math.min(0.6,D*0.5);
  const lipF=panelFold(openness,1.00,0.70),topF=panelFold(openness,0.88,0.50),fbF=panelFold(openness,0.68,0.20),sF=panelFold(openness,0.35,0.00);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[0,0,openness*D/2]}>
    <group>{WP(L,W,'bottom','BOTTOM')||MP([L,W,t],'bottom','BOTTOM',L,W)}</group>
    <group position={[0,W/2,0]} rotation={[-fbF,0,0]}><group position={[0,D/2,0]}>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group></group>
    <group position={[0,-W/2,0]} rotation={[fbF,0,0]}><group position={[0,-D/2,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group><group position={[0,-D,0]} rotation={[topF,0,0]}><group position={[0,-W/2,0]}>{WP(L,W,'top','TOP')||MP([L,W,t],'top','TOP',L,W)}</group><group position={[0,-W,0]} rotation={[lipF,0,0]}><mesh position={[0,-lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group></group>
    <group position={[L/2,0,0]} rotation={[0,sF,0]}><group position={[D/2,0,0]}>{WP(D,W,'right','RIGHT')||MP([D,W,t],'right','RIGHT',L,W)}</group><group position={[D/2,W/2,0]} rotation={[-sF,0,0]}><mesh position={[0,tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group><group position={[D/2,-W/2,0]} rotation={[sF,0,0]}><mesh position={[0,-tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <group position={[-L/2,0,0]} rotation={[0,-sF,0]}><group position={[-D/2,0,0]}>{WP(D,W,'left','LEFT')||MP([D,W,t],'left','LEFT',L,W)}</group><group position={[-D/2,W/2,0]} rotation={[-sF,0,0]}><mesh position={[0,tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group><group position={[-D/2,-W/2,0]} rotation={[sF,0,0]}><mesh position={[0,-tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <DimArrow from={[-L/2,0,0.55]} to={[L/2,0,0.55]} label={`L: ${L}"`} opacity={co} tickDir={[0,0,1]}/>
    <DimArrow from={[-L/2-0.55,0,0]} to={[-L/2-0.55,0,-D]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[L/2+0.55,-W/2,-D/2]} to={[L/2+0.55,W/2,-D/2]} label={`W: ${W}"`} opacity={co} tickDir={[1,0,0]}/>
    <DimArrow from={[-L/2,W/2+D+0.55,0]} to={[L/2,W/2+D+0.55,0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,1,0]}/>
    <DimArrow from={[-(L/2+D+0.55),-W/2,0]} to={[-(L/2+D+0.55),W/2,0]} label={`W: ${W}"`} opacity={oo} tickDir={[-1,0,0]}/>
    <DimArrow from={[L/2+0.42,W/2,0]} to={[L/2+0.42,W/2+D,0]} label={`D: ${D}"`} opacity={oo} tickDir={[1,0,0]}/>
  </group>);
}

// ─── 2. TUCK-END BOX ─────────────────────────────────────────────────────────
function TuckEndBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness,isRTE}:any){
  const t=0.05,L=length,W=width,D=depth,lip=Math.min(0.6,D*0.5),dW=W*0.85,dH=Math.min(0.7,L*0.45),gTab=Math.min(0.6,W*0.8);
  const tPF=panelFold(openness,1.00,0.65),bPF=isRTE?panelFold(openness,0.97,0.63):panelFold(openness,1.00,0.65);
  const tLF=panelFold(openness,0.62,0.28),bLF=isRTE?panelFold(openness,0.59,0.25):panelFold(openness,0.62,0.28);
  const bp=Math.max(0,Math.min(1,openness/0.32)),fold=bp*(Math.PI/2),sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[sX,0,sZ]}>
    <group>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}>
      <group position={[W/2,0,0]}>{WP(W,D,'right','RIGHT')||MP([W,D,t],'right','RIGHT',W,D)}</group>
      <group position={[W/2,D/2,0]} rotation={[-fold,0,0]}><mesh position={[0,dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W/2,-D/2,0]} rotation={[fold,0,0]}><mesh position={[0,-dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W,0,0]} rotation={[0,fold,0]}>
        <group position={[L/2,0,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group>
        {isRTE&&<group position={[L/2,-D/2,0]} rotation={[bPF,0,0]}><group position={[0,-W/2,0]}>{WP(L,W,'bottom','BOTTOM')||MP([L,W,t],'bottom','BOTTOM',L,W)}</group><group position={[0,-W,0]} rotation={[bLF,0,0]}><mesh position={[0,-lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>}
        <group position={[L,0,0]} rotation={[0,fold,0]}>
          <group position={[W/2,0,0]}>{WP(W,D,'left','LEFT')||MP([W,D,t],'left','LEFT',W,D)}</group>
          <group position={[W/2,D/2,0]} rotation={[-fold,0,0]}><mesh position={[0,dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W/2,-D/2,0]} rotation={[fold,0,0]}><mesh position={[0,-dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        </group>
      </group>
    </group>
    <group position={[0,D/2,0]} rotation={[-tPF,0,0]}><group position={[0,W/2,0]}>{WP(L,W,'top','TOP')||MP([L,W,t],'top','TOP',L,W)}</group><group position={[0,W,0]} rotation={[-tLF,0,0]}><mesh position={[0,lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    {!isRTE&&<group position={[0,-D/2,0]} rotation={[bPF,0,0]}><group position={[0,-W/2,0]}>{WP(L,W,'bottom','BOTTOM')||MP([L,W,t],'bottom','BOTTOM',L,W)}</group><group position={[0,-W,0]} rotation={[bLF,0,0]}><mesh position={[0,-lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>}
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-(D/2+0.55),0]} to={[-(L/2+0.55),-(D/2+0.55),-W]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={oo} tickDir={[-1,0,0]}/>
  </group>);
}

// ─── 3. SLEEVE ────────────────────────────────────────────────────────────────
function SleeveBox({length,width,depth,materialColor,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,gTab=Math.min(0.6,W*0.8),fold=openness*(Math.PI/2);
  const sX=(1-openness)*(-(L/2+W+gTab/2)),sZ=openness*(W/2);
  return(<group position={[sX,0,sZ]}>
    <mesh><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="FRONT" length={L} width={D}/><FaceGraphics graphics={panels.front} w={L} h={D}/></mesh>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}><mesh position={[W/2,0,0]}><boxGeometry args={[W,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="RIGHT" length={W} width={D}/><FaceGraphics graphics={panels.right} w={W} h={D}/></mesh><group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[L/2,0,0]}><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="BACK" length={L} width={D}/><FaceGraphics graphics={panels.back} w={L} h={D}/></mesh><group position={[L,0,0]} rotation={[0,fold,0]}><mesh position={[W/2,0,0]}><boxGeometry args={[W,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="LEFT" length={W} width={D}/><FaceGraphics graphics={panels.left} w={W} h={D}/></mesh><group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group></group></group>
  </group>);
}

// ─── 4. GABLE BOX ─────────────────────────────────────────────────────────────
function GableBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,tab=Math.min(D*0.8,L*0.45);
  const gH=Math.min(W*0.65,2.5),hW=L*0.35,hH=Math.min(0.45,gH*0.3);
  const gableMax=Math.min(Math.PI*0.45,Math.asin(Math.min(0.97,W/(2.0*gH)))*1.08);
  const gF=panelFold(openness,1.00,0.72,gableMax),gTF=panelFold(openness,0.90,0.68,gableMax*0.25);
  const fbF=panelFold(openness,0.68,0.20),sF=panelFold(openness,0.35,0.00);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[0,0,openness*D/2]}>
    <group>{WP(L,W,'bottom','BOTTOM')||MP([L,W,t],'bottom','BOTTOM',L,W)}</group>
    <group position={[0,W/2,0]} rotation={[-fbF,0,0]}><group position={[0,D/2,0]}>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group><group position={[0,D,0]} rotation={[-gF,0,0]}><mesh position={[0,gH/2,0]}><boxGeometry args={[L,gH,t]}/><Cardboard materialColor={materialColor}/></mesh><group position={[0,gH,0]} rotation={[-gTF,0,0]}><mesh position={[0,hH/2,0]}><boxGeometry args={[hW,hH,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group></group>
    <group position={[0,-W/2,0]} rotation={[fbF,0,0]}><group position={[0,-D/2,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group><group position={[0,-D,0]} rotation={[gF,0,0]}><mesh position={[0,-gH/2,0]}><boxGeometry args={[L,gH,t]}/><Cardboard materialColor={materialColor}/></mesh><group position={[0,-gH,0]} rotation={[gTF,0,0]}><mesh position={[0,-hH/2,0]}><boxGeometry args={[hW,hH,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group></group>
    <group position={[L/2,0,0]} rotation={[0,sF,0]}><group position={[D/2,0,0]}>{WP(D,W,'right','RIGHT')||MP([D,W,t],'right','RIGHT',L,W)}</group><group position={[D/2,W/2,0]} rotation={[-sF,0,0]}><mesh position={[0,tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group><group position={[D/2,-W/2,0]} rotation={[sF,0,0]}><mesh position={[0,-tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <group position={[-L/2,0,0]} rotation={[0,-sF,0]}><group position={[-D/2,0,0]}>{WP(D,W,'left','LEFT')||MP([D,W,t],'left','LEFT',L,W)}</group><group position={[-D/2,W/2,0]} rotation={[-sF,0,0]}><mesh position={[0,tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group><group position={[-D/2,-W/2,0]} rotation={[sF,0,0]}><mesh position={[0,-tab/2,0]}><boxGeometry args={[D*0.9,tab,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <DimArrow from={[-L/2,0,0.55]} to={[L/2,0,0.55]} label={`L: ${L}"`} opacity={co} tickDir={[0,0,1]}/>
    <DimArrow from={[-L/2-0.55,0,0]} to={[-L/2-0.55,0,-D]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[L/2+0.55,-W/2,-D/2]} to={[L/2+0.55,W/2,-D/2]} label={`W: ${W}"`} opacity={co} tickDir={[1,0,0]}/>
    <DimArrow from={[-L/2,W/2+D+gH+0.55,0]} to={[L/2,W/2+D+gH+0.55,0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,1,0]}/>
    <DimArrow from={[-(L/2+D+0.55),-W/2,0]} to={[-(L/2+D+0.55),W/2,0]} label={`W: ${W}"`} opacity={oo} tickDir={[-1,0,0]}/>
    <DimArrow from={[L/2+0.42,W/2,0]} to={[L/2+0.42,W/2+D,0]} label={`D: ${D}"`} opacity={oo} tickDir={[1,0,0]}/>
  </group>);
}

// ─── 5. MAILER BOX (RSC) ─────────────────────────────────────────────────────
function MailerBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,gTab=Math.min(0.6,W*0.8),majD=W/2,minD=Math.min(L/2-0.1,W/2*0.88);
  const bp=Math.max(0,Math.min(1,openness/0.35)),fold=bp*(Math.PI/2),sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  const mTF=panelFold(openness,1.00,0.68),nTF=panelFold(openness,0.76,0.46),mBF=panelFold(openness,0.68,0.40),nBF=panelFold(openness,0.68,0.40);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[sX,0,sZ]}>
    <group>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group>
    <group position={[0,D/2,0]} rotation={[-mTF,0,0]}><mesh position={[0,majD/2,0]}><boxGeometry args={[L*0.98,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
    <group position={[0,-D/2,0]} rotation={[mBF,0,0]}><mesh position={[0,-majD/2,0]}><boxGeometry args={[L*0.98,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}>
      <group position={[W/2,0,0]}>{WP(W,D,'right','RIGHT')||MP([W,D,t],'right','RIGHT',W,D)}</group>
      <group position={[W/2,D/2,0]} rotation={[-nTF,0,0]}><mesh position={[0,minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W/2,-D/2,0]} rotation={[nBF,0,0]}><mesh position={[0,-minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W,0,0]} rotation={[0,fold,0]}>
        <group position={[L/2,0,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group>
        <group position={[L/2,D/2,0]} rotation={[-mTF,0,0]}><mesh position={[0,majD/2,0]}><boxGeometry args={[L*0.98,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        <group position={[L/2,-D/2,0]} rotation={[mBF,0,0]}><mesh position={[0,-majD/2,0]}><boxGeometry args={[L*0.98,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        <group position={[L,0,0]} rotation={[0,fold,0]}>
          <group position={[W/2,0,0]}>{WP(W,D,'left','LEFT')||MP([W,D,t],'left','LEFT',W,D)}</group>
          <group position={[W/2,D/2,0]} rotation={[-nTF,0,0]}><mesh position={[0,minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W/2,-D/2,0]} rotation={[nBF,0,0]}><mesh position={[0,-minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        </group>
      </group>
    </group>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-(D/2+0.55),0]} to={[-(L/2+0.55),-(D/2+0.55),-W]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={oo} tickDir={[-1,0,0]}/>
  </group>);
}

// ─── 6. TWO-PIECE LID ────────────────────────────────────────────────────────
function TwoPieceBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,bH=D*0.38,lH=D*0.62,gap=0.04;
  const lift=(1-openness)*D*1.6,slideX=(1-openness)*L*0.55;
  const co=openness>0.90?(openness-0.90)/0.10:0;
  const Tray=({h,gfxKey}:{h:number;gfxKey:string})=>(<group>
    <mesh><boxGeometry args={[L,W,t]}/><Cardboard materialColor={materialColor}/><FaceGraphics graphics={panels[gfxKey]||[]} w={L} h={W}/></mesh>
    <mesh position={[0,W/2+h/2,0]}><boxGeometry args={[L,h,t]}/><Cardboard materialColor={materialColor}/><FaceGraphics graphics={panels.front||[]} w={L} h={h}/></mesh>
    <mesh position={[0,-(W/2+h/2),0]}><boxGeometry args={[L,h,t]}/><Cardboard materialColor={materialColor}/></mesh>
    <mesh position={[L/2+h/2,0,0]}><boxGeometry args={[h,W+h*2,t]}/><Cardboard materialColor={materialColor}/></mesh>
    <mesh position={[-(L/2+h/2),0,0]}><boxGeometry args={[h,W+h*2,t]}/><Cardboard materialColor={materialColor}/></mesh>
  </group>);
  return(<group position={[0,0,openness*D/2]}>
    <Tray h={bH} gfxKey="bottom"/>
    <group position={[slideX,0,-(bH+lH+gap+lift)]}>
      {hasWindow&&windowFace==='top'?<WindowPanel panelW={L+gap*2} panelH={W+gap*2} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels.top||[]} label="LID"/>:<mesh><boxGeometry args={[L+gap*2,W+gap*2,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="LID" length={L} width={W}/><FaceGraphics graphics={panels.top||[]} w={L} h={W}/></mesh>}
      <mesh position={[0,(W+gap*2)/2+lH/2,0]}><boxGeometry args={[L+gap*2,lH,t]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[0,-((W+gap*2)/2+lH/2),0]}><boxGeometry args={[L+gap*2,lH,t]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[(L+gap*2)/2+lH/2,0,0]}><boxGeometry args={[lH,W+gap*2+lH*2,t]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[-((L+gap*2)/2+lH/2),0,0]}><boxGeometry args={[lH,W+gap*2+lH*2,t]}/><Cardboard materialColor={materialColor}/></mesh>
    </group>
    <DimArrow from={[-L/2,0,0.55]} to={[L/2,0,0.55]} label={`L: ${L}"`} opacity={co} tickDir={[0,0,1]}/>
    <DimArrow from={[-L/2-0.55,0,0]} to={[-L/2-0.55,0,-D]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[L/2+0.55,-W/2,-D/2]} to={[L/2+0.55,W/2,-D/2]} label={`W: ${W}"`} opacity={co} tickDir={[1,0,0]}/>
  </group>);
}

// ─── 7. PILLOW BOX ───────────────────────────────────────────────────────────
function PillowBox({length,width,depth,materialColor,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,gTab=Math.min(0.5,W*0.6);
  const crimpFold=openness*(Math.PI/1.6),bp=Math.max(0,Math.min(1,openness/0.40)),fold=bp*(Math.PI/2);
  const sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  return(<group position={[sX,0,sZ]}>
    <mesh><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="FRONT" length={L} width={D}/><FaceGraphics graphics={panels.front} w={L} h={D}/></mesh>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}><mesh position={[W/2,0,0]}><boxGeometry args={[W,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="RIGHT" length={W} width={D}/><FaceGraphics graphics={panels.right} w={W} h={D}/></mesh><group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[L/2,0,0]}><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="BACK" length={L} width={D}/><FaceGraphics graphics={panels.back} w={L} h={D}/></mesh><group position={[L,0,0]} rotation={[0,fold,0]}><mesh position={[W/2,0,0]}><boxGeometry args={[W,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="LEFT" length={W} width={D}/><FaceGraphics graphics={panels.left} w={W} h={D}/></mesh><group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group></group></group>
    <group position={[0,D/2,0]} rotation={[-crimpFold,0,0]}><mesh position={[0,W/2,0]}><boxGeometry args={[L*0.6,W,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
    <group position={[0,-D/2,0]} rotation={[crimpFold,0,0]}><mesh position={[0,-W/2,0]}><boxGeometry args={[L*0.6,W,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
  </group>);
}

// ─── 8. DRAWER ────────────────────────────────────────────────────────────────
function DrawerBox({length,width,depth,materialColor,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,slide=(1-openness)*L*0.85;
  const co=openness>0.90?(openness-0.90)/0.10:0;
  return(<group>
    <mesh position={[0,0,W/2+t/2]}><boxGeometry args={[L+t*2,D+t*2,t]}/><Cardboard materialColor={materialColor}/><FaceGraphics graphics={panels.top||[]} w={L} h={D}/></mesh>
    <mesh position={[0,0,-(W/2+t/2)]}><boxGeometry args={[L+t*2,D+t*2,t]}/><Cardboard materialColor={materialColor}/><FaceGraphics graphics={panels.bottom||[]} w={L} h={D}/></mesh>
    <mesh position={[0,D/2+t/2,0]}><boxGeometry args={[L+t*2,t,W+t*2]}/><Cardboard materialColor={materialColor}/></mesh>
    <mesh position={[0,-(D/2+t/2),0]}><boxGeometry args={[L+t*2,t,W+t*2]}/><Cardboard materialColor={materialColor}/></mesh>
    <mesh position={[-(L/2+t/2),0,0]}><boxGeometry args={[t,D+t*2,W+t*2]}/><Cardboard materialColor={materialColor}/></mesh>
    <group position={[slide,0,0]}>
      <mesh position={[L/2,0,0]}><boxGeometry args={[t,D,W]}/><Cardboard materialColor={materialColor}/><FaceGraphics graphics={panels.front||[]} w={D} h={W}/></mesh>
      <mesh position={[-L/2,0,0]}><boxGeometry args={[t,D,W]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[0,0,W/2]}><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[0,0,-W/2]}><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[0,D/2,0]}><boxGeometry args={[L,t,W]}/><Cardboard materialColor={materialColor}/></mesh>
      <mesh position={[0,-D/2,0]}><boxGeometry args={[L,t,W]}/><Cardboard materialColor={materialColor}/></mesh>
    </group>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,D/2+0.55,0]} to={[L/2,D/2+0.55,0]} label={`L: ${L}"`} opacity={co} tickDir={[0,1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,-W/2]} to={[-(L/2+0.55),-D/2,W/2]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
  </group>);
}

// ─── 9. SNAP LOCK BOTTOM — FIXED ─────────────────────────────────────────────
// ROOT CAUSE of sticking-out tabs: snap panels and anchor tabs were nested
// INSIDE their panel containers with extra L/2 or W/2 offsets, misplacing
// hinges to the far back/side corners of each panel face.
//
// FIX: all snap bottom panels are now SIBLINGS of their panel containers
// (same pattern as TuckEndBox dust flaps). This places hinges at the true
// centre of each panel's bottom edge so panels fold cleanly inside the box.
//
// Snap geometry note: tab width W*0.90 was verified correct — when centred
// on the depth it spans ±W*0.45 which fits within the ±W/2 box boundary.
function SnapLockBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth;
  const gTab=Math.min(0.6,W*0.8),lip=Math.min(0.6,D*0.5),dW=W*0.85,dH=Math.min(0.7,L*0.45);
  const tPF=panelFold(openness,1.00,0.65),tLF=panelFold(openness,0.62,0.28);
  const bp=Math.max(0,Math.min(1,openness/0.35)),fold=bp*(Math.PI/2),sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  // Snap panels close just before body assembles; phases slightly before body
  const snapM=panelFold(openness,0.34,0.00,Math.PI/2);  // main panels (front/back)
  const snapT=panelFold(openness,0.27,0.00,Math.PI/2);  // anchor tabs (right/left)
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[sX,0,sZ]}>

    {/* FRONT panel — at root, no container nesting */}
    <group>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group>
    {/* FRONT snap main — SIBLING at root, hinge on front panel bottom centre */}
    <group position={[0,-D/2,0]} rotation={[snapM,0,0]}>
      <mesh position={[0,-W/4,0]}><boxGeometry args={[L*0.97,W/2,t]}/><Cardboard materialColor={materialColor}/></mesh>
    </group>

    {/* RIGHT chain */}
    <group position={[L/2,0,0]} rotation={[0,fold,0]}>
      {/* RIGHT container — no snap inside */}
      <group position={[W/2,0,0]}>{WP(W,D,'right','RIGHT')||MP([W,D,t],'right','RIGHT',W,D)}</group>
      {/* RIGHT dust flap top — SIBLING (correct, same as TuckEndBox) */}
      <group position={[W/2,D/2,0]} rotation={[-fold,0,0]}><mesh position={[0,dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      {/* RIGHT snap anchor — SIBLING: hinge at centre of right panel bottom edge */}
      <group position={[W/2,-D/2,0]} rotation={[snapT,0,0]}>
        <mesh position={[0,-W/3/2,0]}><boxGeometry args={[W*0.90,W/3,t]}/><Cardboard materialColor={materialColor}/></mesh>
      </group>

      {/* BACK chain */}
      <group position={[W,0,0]} rotation={[0,fold,0]}>
        {/* BACK container — no snap inside */}
        <group position={[L/2,0,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group>
        {/* BACK snap main — SIBLING: hinge at centre of back panel bottom edge */}
        <group position={[L/2,-D/2,0]} rotation={[snapM,0,0]}>
          <mesh position={[0,-W/4,0]}><boxGeometry args={[L*0.97,W/2,t]}/><Cardboard materialColor={materialColor}/></mesh>
        </group>

        {/* LEFT chain */}
        <group position={[L,0,0]} rotation={[0,fold,0]}>
          {/* LEFT container — no snap inside */}
          <group position={[W/2,0,0]}>{WP(W,D,'left','LEFT')||MP([W,D,t],'left','LEFT',W,D)}</group>
          {/* LEFT dust flap top — SIBLING */}
          <group position={[W/2,D/2,0]} rotation={[-fold,0,0]}><mesh position={[0,dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          {/* LEFT snap anchor — SIBLING */}
          <group position={[W/2,-D/2,0]} rotation={[snapT,0,0]}>
            <mesh position={[0,-W/3/2,0]}><boxGeometry args={[W*0.90,W/3,t]}/><Cardboard materialColor={materialColor}/></mesh>
          </group>
          {/* GLUE TAB */}
          <group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        </group>
      </group>
    </group>

    {/* TOP tuck (STE) */}
    <group position={[0,D/2,0]} rotation={[-tPF,0,0]}><group position={[0,W/2,0]}>{WP(L,W,'top','TOP')||MP([L,W,t],'top','TOP',L,W)}</group><group position={[0,W,0]} rotation={[-tLF,0,0]}><mesh position={[0,lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>

    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-(D/2+0.55),0]} to={[-(L/2+0.55),-(D/2+0.55),-W]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
  </group>);
}

// ─── 10. DISPLAY BOX ─────────────────────────────────────────────────────────
function DisplayBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth;
  const shelfFold=(1-openness)*(Math.PI/2),topF=panelFold(openness,1.00,0.65,Math.PI/2),topLF=panelFold(openness,0.62,0.30,Math.PI/2);
  const co=openness>0.90?(openness-0.90)/0.10:0;
  return(<group>
    <mesh position={[0,0,-W]}><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="BACK" length={L} width={D}/><FaceGraphics graphics={panels.back||[]} w={L} h={D}/></mesh>
    <mesh position={[L/2,0,-W/2]} rotation={[0,Math.PI/2,0]}><boxGeometry args={[W,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="RIGHT" length={W} width={D}/><FaceGraphics graphics={panels.right||[]} w={W} h={D}/></mesh>
    <mesh position={[-L/2,0,-W/2]} rotation={[0,Math.PI/2,0]}><boxGeometry args={[W,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="LEFT" length={W} width={D}/><FaceGraphics graphics={panels.left||[]} w={W} h={D}/></mesh>
    <mesh position={[0,-D/2,-W/2]} rotation={[Math.PI/2,0,0]}><boxGeometry args={[L,W,t]}/><Cardboard materialColor={materialColor}/><FaceGraphics graphics={panels.bottom||[]} w={L} h={W}/></mesh>
    <group position={[0,-D/2,0]} rotation={[shelfFold,0,0]}><mesh position={[0,D/2,0]}>{hasWindow&&windowFace==='front'?null:<><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label={openness<0.5?"SHELF":"FRONT"} length={L} width={D}/><FaceGraphics graphics={panels.front||[]} w={L} h={D}/></>}{hasWindow&&windowFace==='front'&&<><boxGeometry args={[L,D,t]}/><Cardboard materialColor={materialColor}/></>}</mesh></group>
    <group position={[0,D/2,0]} rotation={[-topF,0,0]}><mesh position={[0,W/2,0]}><boxGeometry args={[L,W,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="TOP" length={L} width={W}/><FaceGraphics graphics={panels.top||[]} w={L} h={W}/></mesh><group position={[0,W,0]} rotation={[-topLF,0,0]}><mesh position={[0,Math.min(0.4,W*0.3)/2,0]}><boxGeometry args={[L*0.98,Math.min(0.4,W*0.3),t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,-W]} to={[-(L/2+0.55),-D/2,0]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
  </group>);
}

// ─── 11. SEAL END BOX (FIXED — siblings pattern) ─────────────────────────────
function SealEndBox({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,gTab=Math.min(0.6,W*0.8),majD=W*0.99,minD=Math.min(L*0.45,W*0.48);
  const bp=Math.max(0,Math.min(1,openness/0.35)),fold=bp*(Math.PI/2),sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  const bkMTF=panelFold(openness,1.00,0.68,Math.PI/2),frMTF=panelFold(openness,0.75,0.50,Math.PI/2),minTF=panelFold(openness,0.55,0.30,Math.PI/2);
  const bkMBF=panelFold(openness,0.80,0.58,Math.PI/2),frMBF=panelFold(openness,0.65,0.42,Math.PI/2),minBF=panelFold(openness,0.50,0.28,Math.PI/2);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[sX,0,sZ]}>
    <group>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group>
    <group position={[0,D/2,0]} rotation={[-frMTF,0,0]}><mesh position={[0,majD/2,0]}><boxGeometry args={[L*0.99,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
    <group position={[0,-D/2,0]} rotation={[frMBF,0,0]}><mesh position={[0,-majD/2,0]}><boxGeometry args={[L*0.99,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}>
      <group position={[W/2,0,0]}>{WP(W,D,'right','RIGHT')||MP([W,D,t],'right','RIGHT',W,D)}</group>
      <group position={[W/2,D/2,0]} rotation={[-minTF,0,0]}><mesh position={[0,minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W/2,-D/2,0]} rotation={[minBF,0,0]}><mesh position={[0,-minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W,0,0]} rotation={[0,fold,0]}>
        <group position={[L/2,0,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group>
        <group position={[L/2,D/2,0]} rotation={[-bkMTF,0,0]}><mesh position={[0,majD/2,0]}><boxGeometry args={[L*0.99,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        <group position={[L/2,-D/2,0]} rotation={[bkMBF,0,0]}><mesh position={[0,-majD/2,0]}><boxGeometry args={[L*0.99,majD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        <group position={[L,0,0]} rotation={[0,fold,0]}>
          <group position={[W/2,0,0]}>{WP(W,D,'left','LEFT')||MP([W,D,t],'left','LEFT',W,D)}</group>
          <group position={[W/2,D/2,0]} rotation={[-minTF,0,0]}><mesh position={[0,minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W/2,-D/2,0]} rotation={[minBF,0,0]}><mesh position={[0,-minD/2,0]}><boxGeometry args={[W*0.95,minD,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        </group>
      </group>
    </group>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-(D/2+0.55),0]} to={[-(L/2+0.55),-(D/2+0.55),-W]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
  </group>);
}

// ─── 12. HEXAGONAL BOX ───────────────────────────────────────────────────────
function HexagonalBox({width,depth,materialColor,panels,openness}:any){
  const t=0.05,S=width,D=depth,r=S*Math.sqrt(3)/2;
  const capAlpha=Math.max(0,Math.min(1,(openness-0.45)/0.30));
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const faceKeys=['front','right','back','left','back','right'] as const;
  return(<group>
    {[0,1,2,3,4,5].map(i=>{const θ=i*(Math.PI/3),ax=r*Math.sin(θ),az=r*Math.cos(θ),aRy=θ,fx=(i-2.5)*S,ry=fx+openness*(ax-fx)<ax?θ*openness:0;const px=fx+openness*(ax-fx),pz=openness*(az),ryf=openness*aRy;return(<group key={i} position={[px,0,pz]} rotation={[0,ryf,0]}><mesh><boxGeometry args={[S,D,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label={`P${i+1}`} length={S} width={D}/><FaceGraphics graphics={panels[faceKeys[i]]||[]} w={S} h={D}/></mesh></group>);})}
    <mesh position={[0,D/2+t/2,0]}><cylinderGeometry args={[S*0.988,S*0.988,t,6]}/><meshStandardMaterial color={materialColor} roughness={0.85} transparent opacity={capAlpha}/></mesh>
    <mesh position={[0,-(D/2+t/2),0]}><cylinderGeometry args={[S*0.988,S*0.988,t,6]}/><meshStandardMaterial color={materialColor} roughness={0.85} transparent opacity={capAlpha}/></mesh>
    <DimArrow from={[-(r+0.55),-D/2,0]} to={[-(r+0.55),D/2,0]} label={`H: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[0,D/2+0.55,0]} to={[S,D/2+0.55,0]} label={`S: ${S}"`} opacity={co} tickDir={[0,1,0]}/>
    <DimArrow from={[-S*3,D/2+0.55,0]} to={[S*3,D/2+0.55,0]} label={`6×${S}"`} opacity={oo} tickDir={[0,1,0]}/>
  </group>);
}

// ─── 13. ROLL END TUCK FRONT ─────────────────────────────────────────────────
function RollEndTuckFront({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,gTab=Math.min(0.6,W*0.8),lip=Math.min(0.5,D*0.4),rollH=Math.min(D*0.35,W*0.6);
  const bp=Math.max(0,Math.min(1,openness/0.35)),fold=bp*(Math.PI/2),sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  const tPF=panelFold(openness,1.00,0.65),tLF=panelFold(openness,0.62,0.28),bPF=panelFold(openness,1.00,0.65),bLF=panelFold(openness,0.62,0.28),rollF=panelFold(openness,0.60,0.00,Math.PI/2);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[sX,0,sZ]}>
    <group>{WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}</group>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}>
      <group position={[W/2,0,0]}>{WP(W,D,'right','RIGHT')||MP([W,D,t],'right','RIGHT',W,D)}</group>
      <group position={[W/2,D/2,0]} rotation={[-rollF,0,0]}><mesh position={[0,rollH/2,0]}><boxGeometry args={[W*0.92,rollH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W/2,-D/2,0]} rotation={[rollF,0,0]}><mesh position={[0,-rollH/2,0]}><boxGeometry args={[W*0.92,rollH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W,0,0]} rotation={[0,fold,0]}>
        <group position={[L/2,0,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group>
        <group position={[L,0,0]} rotation={[0,fold,0]}>
          <group position={[W/2,0,0]}>{WP(W,D,'left','LEFT')||MP([W,D,t],'left','LEFT',W,D)}</group>
          <group position={[W/2,D/2,0]} rotation={[-rollF,0,0]}><mesh position={[0,rollH/2,0]}><boxGeometry args={[W*0.92,rollH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W/2,-D/2,0]} rotation={[rollF,0,0]}><mesh position={[0,-rollH/2,0]}><boxGeometry args={[W*0.92,rollH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        </group>
      </group>
    </group>
    <group position={[0,D/2,0]} rotation={[-tPF,0,0]}><group position={[0,W/2,0]}>{WP(L,W,'top','TOP')||MP([L,W,t],'top','TOP',L,W)}</group><group position={[0,W,0]} rotation={[-tLF,0,0]}><mesh position={[0,lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <group position={[0,-D/2,0]} rotation={[bPF,0,0]}><group position={[0,-W/2,0]}>{WP(L,W,'bottom','BOTTOM')||MP([L,W,t],'bottom','BOTTOM',L,W)}</group><group position={[0,-W,0]} rotation={[bLF,0,0]}><mesh position={[0,-lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-(D/2+0.55),0]} to={[-(L/2+0.55),-(D/2+0.55),-W]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
  </group>);
}

// ─── 14. FIVE-PANEL HANGER (header always vertical above front) ───────────────
function FivePanelHanger({length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const t=0.05,L=length,W=width,D=depth,gTab=Math.min(0.6,W*0.8),lip=Math.min(0.6,D*0.5),dW=W*0.85,dH=Math.min(0.7,L*0.45);
  const hdrH=Math.min(D*0.55,2.2),slotW=L*0.38,slotH=0.50;
  const tPF=panelFold(openness,1.00,0.65),tLF=panelFold(openness,0.62,0.28),bPF=panelFold(openness,1.00,0.65),bLF=panelFold(openness,0.62,0.28);
  const bp=Math.max(0,Math.min(1,openness/0.32)),fold=bp*(Math.PI/2),sX=(1-bp)*(-(L/2+W+gTab/2)),sZ=bp*(W/2);
  const co=openness>0.90?(openness-0.90)/0.10:0,oo=openness<0.10?(0.10-openness)/0.10:0;
  const WP=(pW:number,pH:number,f:any,n:string)=>hasWindow&&windowFace===f?<WindowPanel panelW={pW} panelH={pH} winW={windowW} winH={windowH} t={t} materialColor={materialColor} panelData={panels[f]} label={n}/>:null;
  const MP=(a:[number,number,number],f:any,n:string,w:number,h:number)=><mesh><boxGeometry args={a}/><Cardboard materialColor={materialColor}/><PanelLabel label={n} length={a[0]} width={a[1]}/><FaceGraphics graphics={panels[f]} w={w} h={h}/></mesh>;
  return(<group position={[sX,0,sZ]}>
    <group>
      {WP(L,D,'front','FRONT')||MP([L,D,t],'front','FRONT',L,D)}
      <mesh position={[0,D/2+hdrH/2,0]}><boxGeometry args={[L,hdrH,t]}/><Cardboard materialColor={materialColor}/><PanelLabel label="HEADER" length={L} width={hdrH}/></mesh>
      <mesh position={[0,D/2+hdrH*0.75,t/2+0.003]}><boxGeometry args={[slotW,slotH,0.025]}/><meshBasicMaterial color="#000000" transparent opacity={0.65}/></mesh>
    </group>
    <group position={[L/2,0,0]} rotation={[0,fold,0]}>
      <group position={[W/2,0,0]}>{WP(W,D,'right','RIGHT')||MP([W,D,t],'right','RIGHT',W,D)}</group>
      <group position={[W/2,D/2,0]} rotation={[-fold,0,0]}><mesh position={[0,dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W/2,-D/2,0]} rotation={[fold,0,0]}><mesh position={[0,-dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
      <group position={[W,0,0]} rotation={[0,fold,0]}>
        <group position={[L/2,0,0]}>{WP(L,D,'back','BACK')||MP([L,D,t],'back','BACK',L,D)}</group>
        <group position={[L,0,0]} rotation={[0,fold,0]}>
          <group position={[W/2,0,0]}>{WP(W,D,'left','LEFT')||MP([W,D,t],'left','LEFT',W,D)}</group>
          <group position={[W/2,D/2,0]} rotation={[-fold,0,0]}><mesh position={[0,dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W/2,-D/2,0]} rotation={[fold,0,0]}><mesh position={[0,-dH/2,0]}><boxGeometry args={[dW,dH,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
          <group position={[W,0,0]} rotation={[0,fold,0]}><mesh position={[gTab/2,0,0]}><boxGeometry args={[gTab,D,t]}/><Cardboard materialColor={materialColor}/></mesh></group>
        </group>
      </group>
    </group>
    <group position={[0,D/2,0]} rotation={[-tPF,0,0]}><group position={[0,W/2,0]}>{WP(L,W,'top','TOP')||MP([L,W,t],'top','TOP',L,W)}</group><group position={[0,W,0]} rotation={[-tLF,0,0]}><mesh position={[0,lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <group position={[0,-D/2,0]} rotation={[bPF,0,0]}><group position={[0,-W/2,0]}>{WP(L,W,'bottom','BOTTOM')||MP([L,W,t],'bottom','BOTTOM',L,W)}</group><group position={[0,-W,0]} rotation={[bLF,0,0]}><mesh position={[0,-lip/2,0]}><boxGeometry args={[L*0.98,lip,t]}/><Cardboard materialColor={materialColor}/></mesh></group></group>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={co} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2,0]} label={`D: ${D}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-(L/2+0.55),-(D/2+0.55),0]} to={[-(L/2+0.55),-(D/2+0.55),-W]} label={`W: ${W}"`} opacity={co} tickDir={[-1,0,0]}/>
    <DimArrow from={[-L/2,-(D/2+0.55),0]} to={[L/2,-(D/2+0.55),0]} label={`L: ${L}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[L/2,-(D/2+0.55),0]} to={[L/2+W,-(D/2+0.55),0]} label={`W: ${W}"`} opacity={oo} tickDir={[0,-1,0]}/>
    <DimArrow from={[-(L/2+0.55),-D/2,0]} to={[-(L/2+0.55),D/2+hdrH,0]} label={`D+Hdr`} opacity={co} tickDir={[-1,0,0]}/>
  </group>);
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function BoxCanvas({length,width,depth,materialColor,boxType,hasWindow,windowW,windowH,windowFace,panels,openness}:any){
  const needsWrapper=['tray-lock','gable','two-piece'].includes(boxType);
  return(
    <div className="w-full h-full relative">
      <Canvas shadows camera={{position:[0,10,20],fov:45}} className="w-full h-full cursor-move">
        <ambientLight intensity={0.6}/><spotLight position={[10,20,10]} intensity={2.5} castShadow/>
        <Suspense fallback={null}>
          <CameraSetup length={length} width={width} depth={depth} boxType={boxType}/>
          <group>
            {needsWrapper?(
              <group rotation={[Math.PI/2,0,0]}>
                {boxType==='tray-lock'&&<TraySideLock {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>}
                {boxType==='gable'    &&<GableBox     {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>}
                {boxType==='two-piece'&&<TwoPieceBox  {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>}
              </group>
            ):boxType==='straight-tuck'?<TuckEndBox {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness,isRTE:false}}/>
            :boxType==='reverse-tuck' ?<TuckEndBox {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness,isRTE:true}}/>
            :boxType==='mailer'       ?<MailerBox  {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>
            :boxType==='pillow'       ?<PillowBox  {...{length,width,depth,materialColor,panels,openness}}/>
            :boxType==='drawer'       ?<DrawerBox  {...{length,width,depth,materialColor,panels,openness}}/>
            :boxType==='snap-lock'    ?<SnapLockBox    {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>
            :boxType==='display'      ?<DisplayBox     {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>
            :boxType==='seal-end'     ?<SealEndBox     {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>
            :boxType==='hex'          ?<HexagonalBox   {...{width,depth,materialColor,panels,openness}}/>
            :boxType==='roll-end'     ?<RollEndTuckFront {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>
            :boxType==='five-panel'   ?<FivePanelHanger  {...{length,width,depth,materialColor,hasWindow,windowW,windowH,windowFace,panels,openness}}/>
            :boxType==='sleeve'       ?<SleeveBox {...{length,width,depth,materialColor,panels,openness}}/>
            :null}
          </group>
          <ContactShadows position={[0,-depth/2-1.0,0]} opacity={0.3} scale={25} blur={2}/>
        </Suspense>
        <MagneticTrackball target={[0,0,0]}/>
      </Canvas>
    </div>
  );
}
