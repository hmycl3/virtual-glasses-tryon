import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { identityQuestions } from '../utils/visualIdentity'

export function IdentityTest({ faceImage, onBack, onComplete, onUploadFace }) {
  const [step,setStep]=useState(0); const [answers,setAnswers]=useState([])
  const question=identityQuestions[step]
  const select=(value)=>{const next=[...answers];next[step]=value;setAnswers(next);if(step<4)setTimeout(()=>setStep(step+1),180)}
  return <main className="identity-test-page editorial-page">
    <aside className="identity-rail"><span className="issue-label wine">VISUAL IDENTITY · 03</span><h1>Discover Your<br/><em>Visual Identity</em></h1><p>理解你如何被看见，也理解你希望如何被看见。五个选择，会形成一份属于你的视觉身份编辑档案。</p><label className="identity-face-preview"><img src={faceImage} alt="身份测试参考照片"/><span><CheckCircle weight="fill"/>正脸照片<small>点击可更换，仅用于本次视觉风格分析</small></span><input hidden type="file" accept="image/jpeg,image/png" onChange={(e)=>onUploadFace?.(e.target.files[0])}/></label></aside>
    <section className="question-stage"><div className="test-progress"><span>QUESTION {String(step+1).padStart(2,'0')} / 05</span><div><i style={{width:`${(step+1)*20}%`}}/></div></div><p className="driver-label">{question.driver}</p><h2>{question.question}</h2><div className="answer-list">{question.options.map((option,index)=><button className={answers[step]===index?'selected':''} onClick={()=>select(index)} key={option}><b>{String.fromCharCode(65+index)}</b><span>{option}</span><ArrowRight/></button>)}</div><div className="test-actions"><button onClick={step===0?onBack:()=>setStep(step-1)}><ArrowLeft/>{step===0?'返回首页':'上一题'}</button>{step===4&&answers[4]!==undefined&&<button className="finish-test" onClick={()=>onComplete(answers)}><Sparkle weight="fill"/>生成我的视觉身份</button>}</div></section>
  </main>
}
