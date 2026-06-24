import * as Icons from '@phosphor-icons/react'
import { ArrowRight } from '@phosphor-icons/react'
import { scenarios } from '../utils/scenarios'

const iconMap = {
  briefcase:Icons.Briefcase, buildings:Icons.Buildings, rocket:Icons.Rocket, presentation:Icons.PresentationChart,
  heart:Icons.Heart, coffee:Icons.Coffee, wine:Icons.Wine, sparkle:Icons.Sparkle,
  airplane:Icons.AirplaneTilt, sun:Icons.Sun, mountains:Icons.Mountains, map:Icons.MapTrifold,
  palette:Icons.Palette, book:Icons.BookOpen, diamond:Icons.Diamond, circle:Icons.Circle,
}

export function ScenarioHub({ onNavigate }) {
  const groups = ['WORK','SOCIAL','LIFE','STYLE']
  return <main className="scenario-hub editorial-page">
    <section className="scenario-hero">
      <div><span className="issue-label wine">SCENARIO STUDIO · 02</span><h1>Choose Your<br/><em>Moment</em></h1><p>How do you want to show up today?</p></div>
      <img src={`${import.meta.env.BASE_URL}scenario-diptych.png`} onError={(e)=>{e.currentTarget.src=`${import.meta.env.BASE_URL}hero-portrait.png`}} alt="城市与户外两种场景"/>
    </section>
    <section className="moment-board">
      <div className="moment-intro"><span>16 MOMENTS</span><h2>不同场合，<br/>不同版本的你。</h2><p>先选择你即将进入的时刻。我们会从感知目标出发，为你组合镜框、气质与表达策略。</p></div>
      <div className="moment-groups">{groups.map((group)=><section key={group}><header><span>{group}</span><small>{group==='WORK'?'如何建立可信度':group==='SOCIAL'?'如何自然地被记住':group==='LIFE'?'如何保持松弛与完整': '如何放大个人表达'}</small></header><div>{scenarios.filter(s=>s.group===group).map((scene)=>{const Icon=iconMap[scene.icon]||Icons.Circle;return <button key={scene.id} onClick={()=>onNavigate(`scenario/${scene.id}`)}><Icon size={24}/><span><b>{scene.title}</b><small>{scene.cn}</small></span><ArrowRight/></button>})}</div></section>)}</div>
    </section>
  </main>
}
