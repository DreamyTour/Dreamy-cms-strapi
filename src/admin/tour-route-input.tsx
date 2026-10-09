import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useForm } from '@strapi/strapi/admin';

type Place={label:string;coordinates:[number,number]};
type Plan={version:1;start:Place|null;legs:{destination:Place}[]};
interface Props {name:string;value:unknown;disabled?:boolean;error?:string;onChange:(event:{target:{name:string;type:string;value:unknown}})=>void}
const get=(object:unknown,path:string):any=>path.split('.').reduce((current:any,key)=>current?.[key],object);
function lastPlace(stop:any):Place|null {
 const legs=stop?.routePlan?.legs;
 const last=Array.isArray(legs)?legs[legs.length-1]?.destination:null;
 if(last?.coordinates?.length===2) return last;
 if(stop?.routePlan?.start?.coordinates?.length===2) return stop.routePlan.start;
 if(stop?.latitude==null||stop?.longitude==null) return null;
 const coordinates:[number,number]=[Number(stop.longitude),Number(stop.latitude)];
 return coordinates.every(Number.isFinite)?{label:stop.title||'Destino anterior',coordinates}:null;
}
const Input=forwardRef<HTMLIFrameElement,Props>(function Input({name,value,disabled,error,onChange},ref){
 const frame=useRef<HTMLIFrameElement|null>(null);
 const [ready,setReady]=useState(false);
 const values=useForm('TourRouteInput',state=>state.values);
 const match=name.match(/^(.*)\.(\d+)\.routePlan$/);
 const stops=match?get(values,match[1]):null;
 const current=match?stops?.[Number(match[2])]:null;
 const preceding=Array.isArray(stops)?stops.filter((stop:any)=>Number(stop.order)<Number(current?.order)).sort((a:any,b:any)=>Number(a.order)-Number(b.order)).at(-1):null;
 const inheritedStart=lastPlace(preceding);
 const frontend=import.meta.env.STRAPI_ADMIN_TOUR_MAP_FRONTEND_URL || (import.meta.env.DEV?'http://localhost:4321':'');
 let origin='';try{origin=new URL(frontend).origin;}catch{}
 const legacyDestination=lastPlace(current);
 const context={value,inheritedStart,legacyDestination,legacyMode:current?.transportMode,disabled:Boolean(disabled)};
 const latest=useRef({context,onChange,name,disabled});latest.current={context,onChange,name,disabled};
 const send=()=>frame.current?.contentWindow?.postMessage({type:'dreamy-route-init',...latest.current.context},origin);
 useEffect(()=>{if(ready&&origin)send();},[ready,origin,JSON.stringify(context)]);
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{
   if(event.origin!==origin||event.source!==frame.current?.contentWindow) return;
   if(event.data?.type==='dreamy-route-ready'){setReady(true);send();}
   if(event.data?.type==='dreamy-route-change'&&!latest.current.disabled){
    const plan=event.data.value as Plan|null;
    if(plan!==null&&(plan?.version!==1||!Array.isArray(plan.legs)||plan.legs.length>50))return;
    latest.current.onChange({target:{name:latest.current.name,type:'json',value:plan}});
   }
  };
  window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 },[origin]);
 if(!origin)return <p>Configura STRAPI_ADMIN_TOUR_MAP_FRONTEND_URL con la dirección de la web para abrir el editor.</p>;
 return <div style={{width:'100%'}}><p style={{marginBottom:12,fontWeight:600}}>Recorrido del día</p><iframe ref={element=>{frame.current=element;if(typeof ref==='function')ref(element);else if(ref)ref.current=element;}} src={`${origin}/cms/map-editor`} title="Editar destinos y transportes de este día" style={{width:'100%',height:780,border:'1px solid #a5b4a9',borderRadius:12,background:'#fff'}} onLoad={()=>{setReady(false);send();}}/><p style={{marginTop:8,fontSize:12}}>Los cambios se guardan con el botón Guardar del tour. Los campos antiguos se conservan para los recorridos existentes.</p>{error&&<p role="alert">{error}</p>}</div>;
});
export default Input;
