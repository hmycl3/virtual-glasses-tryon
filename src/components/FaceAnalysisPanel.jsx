import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle, Sparkle, SpinnerGap, WarningCircle } from '@phosphor-icons/react'
import { analyzeFace } from '../utils/faceAnalysis'

export function FaceAnalysisPanel({ faceImage, onTryFrame }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { setResult(null); setError('') }, [faceImage])

  const startAnalysis = async () => {
    setLoading(true); setError(''); setResult(null)
    try { setResult(await analyzeFace(faceImage)) }
    catch (analysisError) { setError(analysisError.message) }
    finally { setLoading(false) }
  }

  return (
    <section className="analysis-panel panel" id="face-analysis">
      <div className="analysis-heading">
        <div className="analysis-title-mark"><Sparkle size={22} weight="fill" /></div>
        <div><h2>AI 脸型分析</h2><p>找到更适合你的眼镜风格</p></div>
        {!loading && <button className="analysis-start" onClick={startAnalysis}><Sparkle size={16} weight="fill" />{result ? '重新分析' : '开始分析'}</button>}
      </div>

      {loading && <div className="analysis-loading"><SpinnerGap size={30} className="spin" /><strong>正在分析你的脸型与五官比例……</strong><span>正在生成个性化镜框建议</span></div>}
      {error && <div className="analysis-error"><WarningCircle size={18} />{error}</div>}
      {!loading && !result && !error && <div className="analysis-intro"><p>上传正脸照片后，点击开始分析。我们会进行搭配，给您眼镜风格建议。</p></div>}

      {!loading && result && <div className="analysis-results">
        <div className="face-summary">
          <div className="shape-block"><span>分析脸型</span><strong>{result.faceShape}</strong><small>模拟分析结果</small></div>
          <div className="summary-copy">
            <div className="feature-row">{result.facialFeatures.map((feature) => <span key={feature}><CheckCircle size={14} weight="fill" />{feature}</span>)}</div>
            <div className="keyword-row">{result.styleKeywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            <p className="affirmation">“{result.affirmation}”</p>
          </div>
        </div>

        <div className="recommendation-heading"><div><h3>为你推荐的镜框</h3><p>结合脸型特征与风格关键词，优先尝试这 3 种方向</p></div></div>
        <div className="recommendation-grid">
          {result.recommendedFrames.map((frame) => <article className="recommendation-card" key={frame.name}>
            <div className="frame-card-head"><h4>{frame.name}</h4><div className="score-ring" style={{ '--score': `${frame.matchScore * 3.6}deg` }}><strong>{frame.matchScore}</strong><span>%</span></div></div>
            <p className="frame-reason">{frame.reason}</p>
            <div className="frame-meta"><strong>适合场景</strong><div>{frame.suitableScenes.map((scene) => <span key={scene}>{scene}</span>)}</div></div>
            <div className="frame-meta color-meta"><strong>推荐颜色</strong><div>{frame.colorSuggestions.map((color) => <span key={color}>{color}</span>)}</div></div>
            <button onClick={() => onTryFrame(frame)}>试戴这个风格 <ArrowRight size={16} /></button>
          </article>)}
        </div>

        <div className="avoid-card"><div><WarningCircle size={20} /><span><strong>不太建议优先选择</strong><small>不是不能戴，而是这些款式可能会压住你本身的气质。</small></span></div><div className="avoid-tags">{result.avoidFrames.map((frame) => <span key={frame}>{frame}</span>)}</div></div>
      </div>}
    </section>
  )
}
