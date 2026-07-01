import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowClockwise, ArrowRight, ArrowsOutCardinal, CaretDown, CheckCircle, DownloadSimple,
  Eyeglasses, Globe, House, Info, MagicWand, Minus, Plus, UploadSimple, X,
} from '@phosphor-icons/react'
import { detectEyeTransform, generateTryOnResult } from './services/faceLandmarker'
import { removeGlassesBackground, validateImageFile } from './services/backgroundRemoval'
import { FaceAnalysisPanel } from './components/FaceAnalysisPanel'
import { IdentityTest } from './components/IdentityTest'
import { IdentityResult } from './components/IdentityResult'
import { LandingPage } from './components/LandingPage'
import { ScenarioHub } from './components/ScenarioHub'
import { ScenarioDetail } from './components/ScenarioDetail'
import { VersionsModal } from './components/VersionsModal'
import { SwipeTryOn } from './components/SwipeTryOn'
import { generateVisualIdentity } from './utils/visualIdentity'
import { frameProfiles } from './utils/frameProfiles'
import { getScenario } from './utils/scenarios'

const asset=(name)=>`${import.meta.env.BASE_URL}${name}`
const DEFAULT_FACE=asset('sample-face.jpg')
const DEFAULT_GLASSES=[1,2,3,4,5].map(i=>asset(`glasses-${i}.png`))
const INITIAL_TRANSFORM={x:50,y:38,width:43,rotation:0}
const BASE_PATH=import.meta.env.BASE_URL
const getRoute=()=>new URLSearchParams(window.location.search).get('route')||window.location.hash.replace(/^#\/?/,'')||window.location.pathname.replace(BASE_PATH,'').replace(/^\//,'')

function ResultStage({ face,glasses,transform,setTransform,editable=false,stageRef }) {
  const drag=useRef(null); const pointers=useRef(new Map()); const gesture=useRef(null)
  const points=()=>[...pointers.current.values()]; const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y); const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI
  const down=(e)=>{if(!editable)return;e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===1)drag.current={sx:e.clientX,sy:e.clientY,x:transform.x,y:transform.y};else{const[a,b]=points();drag.current=null;gesture.current={distance:distance(a,b),angle:angle(a,b),width:transform.width,rotation:transform.rotation}}}
  const move=(e)=>{if(!pointers.current.has(e.pointerId)||!stageRef.current)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===2&&gesture.current){const[a,b]=points();setTransform(t=>({...t,width:Math.max(15,Math.min(90,gesture.current.width*distance(a,b)/Math.max(1,gesture.current.distance))),rotation:gesture.current.rotation+angle(a,b)-gesture.current.angle}));return}if(!drag.current)return;const rect=stageRef.current.getBoundingClientRect();setTransform(t=>({...t,x:Math.max(0,Math.min(100,drag.current.x+(e.clientX-drag.current.sx)/rect.width*100)),y:Math.max(0,Math.min(100,drag.current.y+(e.clientY-drag.current.sy)/rect.height*100))}))}
  const end=(e)=>{pointers.current.delete(e.pointerId);gesture.current=null;const p=points()[0];drag.current=p?{sx:p.x,sy:p.y,x:transform.x,y:transform.y}:null}
  return <div className="photo-stage" ref={stageRef}><img className="face-image" src={face} alt={editable?'试戴效果':'原始照片'}/>{editable&&<img className="glasses-overlay" src={glasses} alt="叠加眼镜" onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} style={{left:`${transform.x}%`,top:`${transform.y}%`,width:`${transform.width}%`,transform:`translate(-50%,-50%) rotate(${transform.rotation}deg)`}}/>}</div>
}

function SiteHeader({ route,onNavigate }) {
  const isLanding=!route
  return <header className={`site-header ${isLanding?'landing-header':''}`}><button className="brand" onClick={()=>onNavigate('')}><Eyeglasses size={34}/><strong>Virtual Glasses Try-On</strong></button><nav>{isLanding?<><button onClick={()=>document.querySelector('#explore')?.scrollIntoView({behavior:'smooth'})}>Explore</button><button onClick={()=>document.querySelector('#about')?.scrollIntoView({behavior:'smooth'})}>About</button></>:<><button onClick={()=>onNavigate('')}><House/>Home</button><button className={route==='try-on'?'active':''} onClick={()=>onNavigate('try-on')}>Try On</button><button className={route==='swipe'?'active':''} onClick={()=>onNavigate('swipe')}>Live</button><button className={route.startsWith('scenario')?'active':''} onClick={()=>onNavigate('scenario')}>Scenario</button><button className={route.startsWith('identity')?'active':''} onClick={()=>onNavigate('identity-test')}>Identity</button></>}</nav><button className="language"><Globe/>简体中文<CaretDown/></button></header>
}

export function App(){
  const[route,setRoute]=useState(getRoute);const[face,setFace]=useState(DEFAULT_FACE);const[glasses,setGlasses]=useState(DEFAULT_GLASSES[0]);const[transform,setTransform]=useState(INITIAL_TRANSFORM);const[generated,setGenerated]=useState(true);const[detecting,setDetecting]=useState(false);const[processing,setProcessing]=useState(false);const[uploadedGlasses,setUploadedGlasses]=useState([]);const[notice,setNotice]=useState('已根据双眼关键点自动对齐');const[glassesStatus,setGlassesStatus]=useState('内置透明镜框');const[libraryOpen,setLibraryOpen]=useState(false);const[versionsOpen,setVersionsOpen]=useState(false);const[identityResult,setIdentityResult]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('visualIdentity'))}catch{return null}})
  const imageProbe=useRef(null);const stageRef=useRef(null)
  const navigate=useCallback((next='')=>{window.history.pushState({},'',`${BASE_PATH}${next}`);setRoute(next);window.scrollTo({top:0,behavior:'smooth'})},[])
  useEffect(()=>{const h=()=>setRoute(getRoute());window.addEventListener('popstate',h);return()=>window.removeEventListener('popstate',h)},[])

  const autoFit=useCallback(async()=>{setDetecting(true);setNotice('正在识别人脸关键点……');try{const img=imageProbe.current;if(!img.complete)await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject});setTransform(await detectEyeTransform(img,stageRef.current));setNotice('已根据双眼关键点自动对齐')}catch(error){setTransform(INITIAL_TRANSFORM);setNotice(`${error.message||'暂未识别到双眼'}，可手动微调`)}finally{setDetecting(false)}},[])
  const generate=async()=>{setGenerated(false);await generateTryOnResult(face,glasses);setGenerated(true);setTimeout(autoFit,30)}
  const uploadFace=(file)=>{try{if(validateImageFile(file)){setFace(URL.createObjectURL(file));setGenerated(true);setTimeout(autoFit,60)}}catch(e){alert(e.message)}}
  const addGlassesFiles=async(files)=>{const selected=Array.from(files||[]);if(!selected.length)return;setProcessing(true);const completed=[];for(let i=0;i<selected.length;i+=1){setGlassesStatus(`正在透明化 ${i+1} / ${selected.length}`);try{validateImageFile(selected[i]);completed.push(await removeGlassesBackground(selected[i]))}catch(error){console.warn(error)}}if(completed.length){setUploadedGlasses(v=>[...v,...completed]);setGlasses(completed[0]);setGlassesStatus(`已添加 ${completed.length} 副镜框并自动去除背景`);setGenerated(true)}else alert('没有可处理的 JPG / PNG 图片');setProcessing(false)}
  const selectFrame=(index,source=DEFAULT_GLASSES)=>{setGlasses(source[index]);setGlassesStatus(frameProfiles[index]?.name||'上传镜框');setGenerated(true);setLibraryOpen(false);setTimeout(autoFit,40)}
  const tryRecommendedFrame=(frame)=>{selectFrame(frame.styleIndex);document.querySelector('.tryon-canvas')?.scrollIntoView({behavior:'smooth'})}
  const trySceneFrame=(index,scenario)=>{selectFrame(index);setNotice(`${scenario.cn}场景建议已应用，可继续手动调整`);navigate('try-on')}
  const completeIdentity=(answers)=>{const result=generateVisualIdentity(answers);setIdentityResult(result);sessionStorage.setItem('visualIdentity',JSON.stringify(result));navigate('identity-result')}
  const applyIdentity=(result,frame=result.recommendations[0])=>{selectFrame(frame.styleIndex);setNotice(`${result.primary} 风格建议已应用`);navigate('try-on')}

  const download=async()=>{const faceImg=imageProbe.current;const frameImg=new Image();frameImg.crossOrigin='anonymous';frameImg.src=glasses;await frameImg.decode();const canvas=document.createElement('canvas');canvas.width=faceImg.naturalWidth;canvas.height=faceImg.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(faceImg,0,0);const w=canvas.width*transform.width/100;const ratio=frameImg.naturalHeight/frameImg.naturalWidth;ctx.save();ctx.translate(canvas.width*transform.x/100,canvas.height*transform.y/100);ctx.rotate(transform.rotation*Math.PI/180);ctx.drawImage(frameImg,-w/2,-w*ratio/2,w,w*ratio);ctx.restore();const a=document.createElement('a');a.download='my-virtual-try-on.png';a.href=canvas.toDataURL('image/png');a.click()}

  useEffect(()=>{if(route==='try-on'&&generated){const timer=setTimeout(autoFit,120);return()=>clearTimeout(timer)}},[route,face,generated,autoFit])

  const header=<SiteHeader route={route} onNavigate={navigate}/>
  if(!route)return <div className="app-shell">{header}<LandingPage onNavigate={navigate}/></div>
  if(route==='scenario')return <div className="app-shell">{header}<ScenarioHub onNavigate={navigate}/></div>
  if(route.startsWith('scenario/'))return <div className="app-shell">{header}<ScenarioDetail scenario={getScenario(route.split('/')[1])} onBack={()=>navigate('scenario')} onTryFrame={trySceneFrame}/></div>
  if(route==='swipe')return <div className="app-shell">{header}<SwipeTryOn onNavigate={navigate}/></div>
  if(route==='identity-test')return <div className="app-shell">{header}<IdentityTest faceImage={face} onUploadFace={uploadFace} onBack={()=>navigate('')} onComplete={completeIdentity}/></div>
  if(route==='identity-result')return <div className="app-shell">{header}<IdentityResult result={identityResult||generateVisualIdentity([0,0,0,0,0])} faceImage={face} onBack={()=>navigate('identity-test')} onApply={applyIdentity}/></div>

  const allFrames=[...DEFAULT_GLASSES,...uploadedGlasses]
  return <div className="app-shell">{header}<main className="tryon-page">
    <section className="tryon-title"><div><span className="issue-label wine">VIRTUAL TRY-ON · 01</span><h1>Try a different<br/><em>version of you.</em></h1></div><p>上传一张正脸照，选择镜框。系统会自动识别双眼位置，你仍可以拖动、双指缩放和旋转。</p></section>
    <div className="tryon-workspace">
      <aside className="tryon-controls"><span>01 · YOUR PHOTO</span><h2>上传正脸照片</h2><label className="try-upload"><UploadSimple size={30}/><b>点击上传照片</b><small>JPG / PNG，建议正面清晰照片</small><input hidden type="file" accept="image/jpeg,image/png" onChange={e=>uploadFace(e.target.files[0])}/></label><div className="uploaded-face"><img src={face}/><span>当前照片<small>点击上方即可更换</small></span></div><hr/><span>02 · GENERATE</span><button className="wine-button" onClick={generate} disabled={detecting}><MagicWand weight="fill"/>{detecting?'识别人脸中……':'生成试戴效果'}</button><button className="outline-button" onClick={()=>navigate('scenario')}>先选择使用场景<ArrowRight/></button><button className="outline-button live-entry" onClick={()=>navigate('swipe')}>打开摄像头，划一划试戴<ArrowRight/></button></aside>
      <section className="tryon-canvas"><header><div><h2>试戴效果</h2><p><CheckCircle weight="fill"/>{notice}</p></div><div><button onClick={download}><DownloadSimple/>下载</button><button onClick={generate}><ArrowClockwise/>重新生成</button></div></header><div className="canvas-main"><ResultStage face={face} glasses={glasses} transform={transform} setTransform={setTransform} editable={generated} stageRef={stageRef}/><span className="canvas-label">LIVE TRY-ON</span><div className="original-thumb"><ResultStage face={face}/><span>原图</span></div></div><div className="adjust-bar"><span><ArrowsOutCardinal/>拖动 · 双指缩放</span><button onClick={()=>setTransform(t=>({...t,width:Math.max(15,t.width-3)}))}><Minus/></button><b>{Math.round(transform.width)}%</b><button onClick={()=>setTransform(t=>({...t,width:Math.min(90,t.width+3)}))}><Plus/></button><button onClick={()=>setTransform(t=>({...t,rotation:t.rotation-3}))}><ArrowClockwise className="flip"/></button><b>{Math.round(transform.rotation)}°</b><button onClick={()=>setTransform(t=>({...t,rotation:t.rotation+3}))}><ArrowClockwise/></button><button onClick={autoFit}>自动对齐</button></div><button className="versions-trigger" onClick={()=>setVersionsOpen(true)}>Explore Different Versions of Me <ArrowRight/></button></section>
      <aside className="frame-rail"><header><span>03 · FRAME LIBRARY</span><h2>选择镜框</h2><button onClick={()=>setLibraryOpen(true)}>View all</button></header><div>{allFrames.map((src,index)=>{const profile=frameProfiles[index%5];return <button className={glasses===src?'selected':''} key={`${src}-${index}`} onClick={()=>{setGlasses(src);setGlassesStatus(profile.name);setTimeout(autoFit,20)}}><img src={src} alt={profile.name}/><span><b>{profile.name}</b><small>Perception Effect</small><i>{profile.perception.join(' · ')}</i></span></button>})}</div><label className="add-frames"><Plus/>添加多张眼镜图片<input hidden multiple type="file" accept="image/jpeg,image/png" onChange={e=>addGlassesFiles(e.target.files)}/></label><p><Info/>上传后会自动去除纯色或浅色背景</p></aside>
    </div>
    <FaceAnalysisPanel faceImage={face} onTryFrame={tryRecommendedFrame}/>
  </main>
  {libraryOpen&&<div className="modal-backdrop"><section className="frame-library-modal"><header><div><span>CURATED FRAME LIBRARY</span><h2>选择你的表达方式</h2><p>{glassesStatus}</p></div><button onClick={()=>setLibraryOpen(false)}><X/></button></header><div>{allFrames.map((src,index)=>{const p=frameProfiles[index%5];return <article key={`${src}-modal`}><span>0{index+1}</span><img src={src}/><h3>{p.name}</h3><p>{p.note}</p><div>{p.perception.map(x=><i key={x}>{x}</i>)}</div><button onClick={()=>{setGlasses(src);setLibraryOpen(false);setTimeout(autoFit,20)}}>Try This Frame<ArrowRight/></button></article>})}</div><label className="library-upload"><UploadSimple/>{processing?'正在处理背景……':'上传多张眼镜并自动透明化'}<input hidden multiple type="file" accept="image/jpeg,image/png" onChange={e=>addGlassesFiles(e.target.files)}/></label></section></div>}
  {versionsOpen&&<VersionsModal frameName={glassesStatus} onClose={()=>setVersionsOpen(false)} onExplore={(scene)=>{setVersionsOpen(false);navigate(`scenario/${scene}`)}}/>}
  <img ref={imageProbe} className="image-probe" src={face} alt=""/>
  </div>
}
