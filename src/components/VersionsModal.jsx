import { ArrowRight, Briefcase, Palette, Rocket, X } from '@phosphor-icons/react'
import { versionProfiles } from '../utils/frameProfiles'

const icons = { briefcase: Briefcase, rocket: Rocket, palette: Palette }

export function VersionsModal({ frameName, onClose, onExplore }) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className="versions-modal" onMouseDown={(e)=>e.stopPropagation()}>
      <header><div><span>EXPLORE DIFFERENT VERSIONS OF ME</span><h2>同一副镜框，<br/>不同场景下的你。</h2><p>{frameName} 会如何改变别人对你的第一感知？</p></div><button onClick={onClose}><X/></button></header>
      <div className="versions-list">{versionProfiles.map((version) => {
        const Icon = icons[version.icon]
        return <article key={version.label}><Icon size={27}/><div><span>{version.label}</span>{version.traits.map(([trait,value])=><p key={trait}>{trait}<b>+{value}</b></p>)}</div><button onClick={()=>onExplore(version.scene)}><ArrowRight/></button></article>
      })}</div>
    </section>
  </div>
}
