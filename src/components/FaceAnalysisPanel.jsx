import { useEffect,useState } from 'react'
import { ArrowRight,CheckCircle,Sparkle,SpinnerGap,WarningCircle } from '@phosphor-icons/react'
import { analyzeFace } from '../utils/faceAnalysis'

export function FaceAnalysisPanel({faceImage,onTryFrame}){
  const[loading,setLoading]=useState(false);const[result,setResult]=useState(null);const[error,setError]=useState('')
  useEffect(()=>{setResult(null);setError('')},[faceImage])
  const start=async()=>{setLoading(true);setError('');try{setResult(await analyzeFace(faceImage))}catch(e){setError(e.message)}finally{setLoading(false)}}
  return <section className="analysis-panel"><header><div><span className="issue-label wine">AI FACE ANALYSIS · 04</span><h2>AI 脸型分析</h2><p>我们会进行搭配，给您眼镜风格建议。</p></div><button onClick={start} disabled={loading}><Sparkle weight="fill"/>{result?'重新分析':'开始分析'}</button></header>
    {loading&&<div className="analysis-loading"><SpinnerGap className="spin"/><strong>正在分析你的脸型与五官比例……</strong><span>正在生成镜框搭配建议</span></div>}
    {error&&<div className="analysis-error"><WarningCircle/>{error}</div>}
    {!loading&&!result&&<div className="analysis-empty"><p>上传正脸照片后即可开始。现在使用前端模拟分析，未来可在 <code>analyzeFace(faceImage)</code> 中接入真实 AI。</p></div>}
    {!loading&&result&&<div className="analysis-result"><div className="face-summary"><div><span>分析脸型</span><strong>{result.faceShape}</strong><small>模拟分析结果</small></div><section><div>{result.facialFeatures.map(x=><span key={x}><CheckCircle weight="fill"/>{x}</span>)}</div><p>{result.affirmation}</p><footer>{result.styleKeywords.map(x=><i key={x}>{x}</i>)}</footer></section></div><div className="analysis-recs">{result.recommendedFrames.map(frame=><article key={frame.name}><div><h3>{frame.name}</h3><b>{frame.matchScore}<small>%</small></b></div><p>{frame.reason}</p><span>适合场景</span><footer>{frame.suitableScenes.map(x=><i key={x}>{x}</i>)}</footer><button onClick={()=>onTryFrame(frame)}>试戴这个风格<ArrowRight/></button></article>)}</div><div className="avoid-line"><WarningCircle/><span><b>不太建议优先选择</b><small>不是不能戴，而是这些款式可能会压住你本身的气质。</small></span>{result.avoidFrames.map(x=><i key={x}>{x}</i>)}</div></div>}
  </section>
}
