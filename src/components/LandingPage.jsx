import { ArrowRight, Eye, Fingerprint, Sparkle } from '@phosphor-icons/react'

const asset = (name) => `${import.meta.env.BASE_URL}${name}`

export function LandingPage({ onNavigate }) {
  const scrollToExplore = () => document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' })
  return <main className="landing-page">
    <section className="landing-hero">
      <div className="hero-copy">
        <span className="issue-label wine">VISUAL IDENTITY · 01</span>
        <h1>See Yourself<br/><em>Differently</em></h1>
        <div className="hero-rule"/>
        <p>Glasses are not just what you wear.<br/>They are how the world reads you.</p>
        <button className="journey-button" onClick={scrollToExplore}>Start Your Journey <ArrowRight/></button>
      </div>
      <div className="hero-image">
        <img src={asset('hero-portrait.png')} alt="戴眼镜的都市人物肖像"/>
      </div>
    </section>

    <nav className="module-tabs" aria-label="三大核心模块">
      <button onClick={() => onNavigate('try-on')}><span>TRY ON</span><small>Try before you decide</small><ArrowRight/></button>
      <button onClick={() => onNavigate('scenario')}><span>SCENARIO</span><small>Choose your moment</small><ArrowRight/></button>
      <button onClick={() => onNavigate('identity-test')}><span>IDENTITY</span><small>Discover your visual identity</small><ArrowRight/></button>
    </nav>

    <section id="explore" className="experience-section">
      <div className="experience-intro">
        <span className="issue-label">CHOOSE YOUR PATH · 02</span>
        <h2>Who do you want<br/>to be today?</h2>
        <p>从试戴开始，在不同场景里探索你希望被如何看见，最后形成属于你的视觉身份。</p>
      </div>
      <div className="experience-grid">
        <article className="experience-card try-card" onClick={() => onNavigate('try-on')}>
          <div className="experience-image"><img src={asset('tryon-entry.jpg')} alt="虚拟眼镜试戴正面照"/><span>01</span></div>
          <div className="experience-copy"><Eye size={22}/><span>TRY ON</span><h3>Try Before<br/>You Decide</h3><p>Upload your photo and explore different frames instantly.</p><button aria-label="Enter Try-On"/></div>
        </article>
        <article className="experience-card scenario-card" onClick={() => onNavigate('scenario')}>
          <div className="experience-image"><img src={asset('scenario-diptych.png')} onError={(e)=>{e.currentTarget.src=asset('hero-portrait.png')}} alt="不同场景下的视觉风格"/><span>02</span></div>
          <div className="experience-copy"><Sparkle size={22}/><span>SCENARIO</span><h3>Who Do You Want<br/>To Be Today?</h3><p>Different moments call for different versions of you.</p><button aria-label="Choose Your Moment"/></div>
        </article>
        <article className="experience-card identity-card" onClick={() => onNavigate('identity-test')}>
          <div className="identity-art"><img src={asset('identity-portrait.png')} alt="视觉身份侧脸肖像"/><div><b>The Quiet<br/>Strategist</b><small>CALM · THOUGHTFUL · RELIABLE</small></div><span>03</span></div>
          <div className="experience-copy"><Fingerprint size={22}/><span>IDENTITY</span><h3>Discover Your<br/>Visual Identity</h3><p>Understand how you are seen, and how you want to be seen.</p><button aria-label="Begin Discovery"/></div>
        </article>
      </div>
    </section>
    <section className="landing-manifesto" id="about"><span>NOT AN EYEWEAR STORE</span><blockquote>“The frame is not the destination.<br/>It is a way to meet another version of yourself.”</blockquote><p>我们不替你定义风格。我们把试戴、场景和身份表达连接起来，帮助你看见更多可能。</p></section>
  </main>
}
