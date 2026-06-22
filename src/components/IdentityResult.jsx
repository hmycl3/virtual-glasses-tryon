import { ArrowRight, DownloadSimple, ShareNetwork } from '@phosphor-icons/react'

export function IdentityResult({ result, faceImage, onBack, onApply }) {
  const shareCard = async () => {
    const canvas=document.createElement('canvas'); canvas.width=1080; canvas.height=1350; const c=canvas.getContext('2d')
    c.fillStyle='#f7f7f4'; c.fillRect(0,0,1080,1350); c.fillStyle='#111'; c.font='34px Georgia'; c.fillText('MY VISUAL IDENTITY',70,90)
    c.font='74px Georgia'; c.fillText(result.primaryEn.toUpperCase(),70,230); c.font='30px sans-serif'; c.fillText(`Secondary / ${result.secondaryEn}`,72,290)
    c.font='28px sans-serif'; const lines=[result.aura.slice(0,28),result.aura.slice(28)]; lines.forEach((l,i)=>c.fillText(l,72,390+i*46))
    c.strokeStyle='#111'; c.strokeRect(70,530,940,360); c.font='28px sans-serif'; c.fillText('GLASSES STRATEGY',100,590); c.font='78px Georgia'; c.fillText(result.strategy,100,700); c.font='26px sans-serif'; c.fillText(result.recommendations[0].name,100,790); c.fillText('THIS IS HOW I AM SEEN.',70,1190)
    const blob=await new Promise(r=>canvas.toBlob(r,'image/png')); const file=new File([blob],'my-visual-identity.png',{type:'image/png'})
    if(navigator.share&&navigator.canShare?.({files:[file]})) await navigator.share({title:'My Visual Identity',text:'My visual identity through glasses.',files:[file]})
    else { const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=file.name; a.click() }
  }
  return <main className="identity-result-page editorial-page">
    <aside className="result-rail"><span className="issue-label">DISCOVER YOUR VISUAL IDENTITY</span><div className="result-steps"><b>01</b><span>上传照片<small>已完成</small></span><b>02</b><span>身份结果<small>正在查看</small></span><b>03</b><span>试戴体验<small>等待应用身份</small></span></div><button onClick={onBack}>返回测试</button></aside>
    <section className="identity-result-content">
      <div className="identity-summary"><div><span>视觉身份摘要</span><blockquote>“{result.summary}”</blockquote></div><div className="identity-class"><span>主导身份</span><strong>{result.primary}</strong><small>{result.primaryEn}</small><span>次要身份</span><strong>{result.secondary}</strong><small>{result.secondaryEn}</small></div><img src={faceImage} alt="视觉身份参考"/></div>
      <div className="profile-strategy"><div className="psych-profile"><h3>心理美学画像</h3>{Object.entries(result.psychologicalProfile).map(([key,value])=><div key={key}><span>{key==='socialDrive'?'社交感知驱动':key==='defenseStyle'?'情绪防御风格':'表达偏好'}</span><strong>{value}</strong></div>)}</div><div className="strategy-engine"><h3>视觉策略引擎</h3>{['ENHANCE','BALANCE','SHIFT'].map(s=><div className={result.strategy===s?'selected':''} key={s}><b>{s}</b>{result.strategy===s&&<p>{result.strategyExplanation}</p>}</div>)}</div></div>
      <div className="identity-recommendations"><div className="identity-rec-head"><h3>为你推荐的眼镜</h3><span>身份匹配度</span><span>心理契合度</span></div>{result.recommendations.map(frame=><article key={frame.name}><img src={`${import.meta.env.BASE_URL}glasses-${frame.styleIndex+1}.png`} alt={frame.name}/><div><strong>{frame.name}</strong><p>{frame.shape} / {frame.thickness} / {frame.material} / {frame.color}</p></div><div><span>情感效果</span><p>{frame.emotionalEffect}</p></div><div><span>身份转变效果</span><p>{frame.transformation}</p></div><div className="identity-tags">{frame.tags.map(t=><i key={t}>{t}</i>)}</div><b className="blue-score">{frame.identityScore}%</b><b className="blue-score">{frame.psychologicalScore}%</b></article>)}</div>
      <div className="identity-share"><div><h2>THIS IS HOW<br/>I AM SEEN.</h2><p>这就是我被看见的样子。</p></div><div className="share-preview"><img src={faceImage}/><span><b>{result.primary} × {result.secondary}</b><small>{result.aura}</small><small>推荐：{result.recommendations[0].name} / {result.strategy}</small></span><button onClick={shareCard}><ShareNetwork/>Share My Visual Identity</button></div><div><h2>MY VISUAL IDENTITY<br/>THROUGH GLASSES.</h2><button onClick={()=>onApply(result)}>Apply Identity to Try-On <ArrowRight/></button></div></div>
    </section>
  </main>
}
