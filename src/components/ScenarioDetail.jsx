import { ArrowLeft, ArrowRight, Check, Target } from '@phosphor-icons/react'
import { frameProfiles } from '../utils/frameProfiles'

export function ScenarioDetail({ scenario, onBack, onTryFrame }) {
  return <main className="scenario-detail editorial-page">
    <button className="detail-back" onClick={onBack}><ArrowLeft/> ALL MOMENTS</button>
    <section className="scene-masthead">
      <div><span className="issue-label wine">{scenario.group} · {scenario.cn}</span><h1>{scenario.title}</h1><p>How do you want to show up?</p></div>
      <div className="scene-goal"><Target size={25}/><span>GOAL</span><blockquote>{scenario.goal}</blockquote></div>
    </section>
    <section className="scene-strategy">
      <div><span>RECOMMENDED VISUAL STRATEGY</span><strong>{scenario.strategy}</strong></div>
      <p>{scenario.strategyCn}</p>
      <div>{scenario.traits.map(trait=><span key={trait}><Check weight="bold"/>{trait}</span>)}</div>
    </section>
    <section className="scene-recommendations">
      <header><span>03 RECOMMENDATIONS</span><h2>Frames for this moment</h2><p>不是只看款式，而是看戴上以后，别人会怎样读懂你。</p></header>
      <div>{scenario.frameIndexes.map((index, rank)=>{const frame=frameProfiles[index];return <article key={frame.name}><span>0{rank+1}</span><img src={`${import.meta.env.BASE_URL}glasses-${index+1}.png`} alt={frame.name}/><div><small>{frame.en}</small><h3>{frame.name}</h3><p>{frame.note}</p><div className="perception-pills">{frame.perception.map(item=><i key={item}>{item}</i>)}</div></div><button onClick={()=>onTryFrame(index,scenario)}>Try This Frame <ArrowRight/></button></article>})}</div>
    </section>
  </main>
}
