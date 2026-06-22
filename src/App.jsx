import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowClockwise, ArrowsOutCardinal, CaretDown, CheckCircle,
  DownloadSimple, Eyeglasses, Globe, Info, MagicWand, Minus,
  Plus, UploadSimple,
} from '@phosphor-icons/react'
import { detectEyeTransform, generateTryOnResult } from './services/faceLandmarker'
import { removeGlassesBackground, validateImageFile } from './services/backgroundRemoval'
import { FaceAnalysisPanel } from './components/FaceAnalysisPanel'

const asset = (name) => `${import.meta.env.BASE_URL}${name}`
const DEFAULT_FACE = asset('sample-face.jpg')
const DEFAULT_GLASSES = [1, 2, 3, 4, 5].map((i) => asset(`glasses-${i}.png`))
const INITIAL_TRANSFORM = { x: 50, y: 40, width: 43, rotation: 0 }

function UploadBox({ step, title, hint, image, onUpload, compactLabel, statusText, disabled = false }) {
  const id = `upload-${step}`
  return (
    <section className="step-card">
      <div className="step-title"><span>{step}</span>{title}<Info size={15} weight="bold" /></div>
      <label className={`dropzone ${disabled ? 'processing' : ''}`} htmlFor={id}>
        <UploadSimple size={34} weight="regular" />
        <strong>点击上传{compactLabel}</strong>
        <small>{hint}</small>
      </label>
      <input id={id} hidden disabled={disabled} type="file" accept="image/jpeg,image/png" onChange={(e) => onUpload(e.target.files[0])} />
      <div className="upload-status">
        <img src={image} alt="已上传缩略图" />
        <span>{statusText || (image === DEFAULT_FACE ? '示例照片' : '已上传')}</span>
        <label htmlFor={id}><ArrowClockwise size={15} /> 更换{step === 1 ? '照片' : '眼镜'}</label>
      </div>
    </section>
  )
}

function ResultStage({ face, glasses, transform, setTransform, editable = false, stageRef }) {
  const drag = useRef(null)
  const pointers = useRef(new Map())
  const gesture = useRef(null)
  const pointerPair = () => [...pointers.current.values()]
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
  const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
  const onPointerDown = (e) => {
    if (!editable) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      drag.current = { sx: e.clientX, sy: e.clientY, x: transform.x, y: transform.y }
    } else if (pointers.current.size === 2) {
      const [a, b] = pointerPair()
      drag.current = null
      gesture.current = { distance: distance(a, b), angle: angle(a, b), width: transform.width, rotation: transform.rotation }
    }
  }
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId) || !stageRef.current) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = pointerPair()
      const scale = distance(a, b) / Math.max(1, gesture.current.distance)
      const rotationDelta = angle(a, b) - gesture.current.angle
      setTransform((t) => ({ ...t,
        width: Math.max(15, Math.min(90, gesture.current.width * scale)),
        rotation: gesture.current.rotation + rotationDelta,
      }))
      return
    }
    if (!drag.current) return
    const rect = stageRef.current.getBoundingClientRect()
    setTransform((t) => ({ ...t,
      x: Math.max(0, Math.min(100, drag.current.x + ((e.clientX - drag.current.sx) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, drag.current.y + ((e.clientY - drag.current.sy) / rect.height) * 100)),
    }))
  }
  const onPointerEnd = (e) => {
    pointers.current.delete(e.pointerId)
    gesture.current = null
    const remaining = pointerPair()[0]
    drag.current = remaining ? { sx: remaining.x, sy: remaining.y, x: transform.x, y: transform.y } : null
  }
  return (
    <div className="photo-stage" ref={stageRef}>
      <img className="face-image" src={face} alt={editable ? '试戴效果' : '原始照片'} />
      {editable && <img
        className="glasses-overlay" src={glasses} alt="叠加眼镜"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
        style={{ left: `${transform.x}%`, top: `${transform.y}%`, width: `${transform.width}%`, transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)` }}
      />}
    </div>
  )
}

export function App() {
  const [face, setFace] = useState(DEFAULT_FACE)
  const [glasses, setGlasses] = useState(DEFAULT_GLASSES[0])
  const [transform, setTransform] = useState(INITIAL_TRANSFORM)
  const [generated, setGenerated] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [processingBackground, setProcessingBackground] = useState(false)
  const [glassesStatus, setGlassesStatus] = useState('默认透明素材')
  const [notice, setNotice] = useState('单指拖动，双指缩放和旋转')
  const imageProbe = useRef(null)
  const leftStage = useRef(null)
  const resultStage = useRef(null)

  const autoFit = useCallback(async () => {
    setDetecting(true)
    setNotice('正在识别人脸关键点…')
    try {
      const img = imageProbe.current
      if (!img.complete) await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })
      const fitted = await detectEyeTransform(img, leftStage.current)
      setTransform(fitted)
      setNotice('已根据双眼关键点自动对齐')
    } catch (error) {
      setTransform(INITIAL_TRANSFORM)
      setNotice(`${error.message || '人脸检测暂不可用'}，已使用默认位置`)
    } finally { setDetecting(false) }
  }, [])

  const generate = async () => {
    setGenerated(false)
    await generateTryOnResult(face, glasses)
    await autoFit()
    setGenerated(true)
  }

  const uploadFace = (file) => {
    try { if (validateImageFile(file)) setFace(URL.createObjectURL(file)) }
    catch (error) { alert(error.message) }
  }

  const uploadGlasses = async (file) => {
    if (!file) return
    setProcessingBackground(true)
    setGlassesStatus('正在自动去除背景…')
    try {
      const transparentImage = await removeGlassesBackground(file)
      setGlasses(transparentImage)
      setGlassesStatus('已自动去除背景')
      setGenerated(true)
      setNotice('背景已透明化，可单指拖动、双指缩放')
    } catch (error) {
      try { validateImageFile(file); setGlasses(URL.createObjectURL(file)); setGlassesStatus('背景处理失败，已使用原图') }
      catch { setGlassesStatus('请选择 JPG / PNG 图片') }
      alert(error.message)
    } finally { setProcessingBackground(false) }
  }

  const tryRecommendedFrame = (frame) => {
    const selected = DEFAULT_GLASSES[frame.styleIndex]
    if (!selected) return alert('请上传一张类似风格的眼镜图片进行试戴')
    setGlasses(selected)
    setGlassesStatus(`推荐款式：${frame.name}`)
    setGenerated(true)
    setNotice(`已切换到「${frame.name}」，可继续手动微调`)
    setTimeout(() => resultStage.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  useEffect(() => { if (generated) autoFit() }, [face]) // eslint-disable-line react-hooks/exhaustive-deps

  const download = async () => {
    const faceImg = imageProbe.current
    const glassesImg = new Image(); glassesImg.src = glasses
    await glassesImg.decode()
    const canvas = document.createElement('canvas')
    canvas.width = faceImg.naturalWidth; canvas.height = faceImg.naturalHeight
    const ctx = canvas.getContext('2d'); ctx.drawImage(faceImg, 0, 0)
    const w = canvas.width * transform.width / 100
    const ratio = glassesImg.naturalHeight / glassesImg.naturalWidth
    ctx.save(); ctx.translate(canvas.width * transform.x / 100, canvas.height * transform.y / 100)
    ctx.rotate(transform.rotation * Math.PI / 180)
    ctx.drawImage(glassesImg, -w / 2, -(w * ratio) / 2, w, w * ratio); ctx.restore()
    const a = document.createElement('a'); a.download = 'virtual-glasses-try-on.png'; a.href = canvas.toDataURL('image/png'); a.click()
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><Eyeglasses size={35} weight="regular" /><strong>Virtual Glasses Try-On</strong></div>
        <button className="language"><Globe size={19} /> 简体中文 <CaretDown size={14} /></button>
      </header>

      <main className="workspace">
        <aside className="sidebar panel">
          <div className="sidebar-heading"><h1>虚拟眼镜试戴</h1><p>上传照片和眼镜，看看适合你的效果</p></div>
          <UploadBox step={1} title="上传正脸照片" compactLabel="正脸照片" hint="支持 JPG / PNG，文件不超过 10MB" image={face} onUpload={uploadFace} />
          <UploadBox step={2} title="上传眼镜图片" compactLabel="眼镜图片" hint="支持 JPG / PNG，自动去除纯色或简洁背景" image={glasses} onUpload={uploadGlasses} statusText={glassesStatus} disabled={processingBackground} />
          <section className="step-card generate-card">
            <div className="step-title"><span>3</span>生成效果</div>
            <button className="primary" onClick={generate} disabled={detecting}><MagicWand size={18} weight="fill" />{detecting ? '识别人脸中…' : '生成试戴效果'}</button>
          </section>
        </aside>

        <section className="content-area">
          <div className="result-panel panel">
            <div className="section-head">
              <div><h2>试戴效果</h2><p className="detect-status"><CheckCircle size={14} weight="fill" /> {notice}</p></div>
              <div className="actions">
                <button onClick={download}><DownloadSimple size={18} />下载图片</button>
                <button className="dark" onClick={generate}><ArrowClockwise size={18} />重新生成</button>
              </div>
            </div>
            <div className="comparison">
              <div className="photo-wrap"><span className="image-label">原图</span><ResultStage face={face} stageRef={leftStage} /></div>
              <div className="photo-wrap"><span className="image-label">试戴效果</span>{generated && <ResultStage face={face} glasses={glasses} transform={transform} setTransform={setTransform} editable stageRef={resultStage} />}</div>
            </div>
            <div className="adjust-bar" aria-label="眼镜调整工具">
              <span><ArrowsOutCardinal size={16} />单指拖动 · 双指缩放</span>
              <button title="缩小" onClick={() => setTransform(t => ({...t, width: Math.max(15, t.width - 3)}))}><Minus /></button>
              <span>{Math.round(transform.width)}%</span>
              <button title="放大" onClick={() => setTransform(t => ({...t, width: Math.min(90, t.width + 3)}))}><Plus /></button>
              <button title="逆时针旋转" onClick={() => setTransform(t => ({...t, rotation: t.rotation - 3}))}><ArrowClockwise className="flip" /></button>
              <span>{Math.round(transform.rotation)}°</span>
              <button title="顺时针旋转" onClick={() => setTransform(t => ({...t, rotation: t.rotation + 3}))}><ArrowClockwise /></button>
              <button className="auto-fit" onClick={autoFit}>自动对齐双眼</button>
            </div>
          </div>

          <div className="styles-panel panel">
            <h2>眼镜样式选择</h2>
            <div className="styles-row">
              <label className="upload-style" htmlFor="style-upload"><Plus size={28} /><span>上传眼镜</span></label>
              <input id="style-upload" hidden type="file" accept="image/jpeg,image/png" onChange={(e) => uploadGlasses(e.target.files[0])} />
              {DEFAULT_GLASSES.map((src, i) => (
                <button className={`style-card ${glasses === src ? 'selected' : ''}`} key={src} onClick={() => { setGlasses(src); setGlassesStatus('默认透明素材'); setGenerated(true) }}>
                  <img src={src} alt={`默认眼镜样式 ${i + 1}`} />
                  {glasses === src && <CheckCircle size={22} weight="fill" />}
                </button>
              ))}
            </div>
          </div>
          <FaceAnalysisPanel faceImage={face} onTryFrame={tryRecommendedFrame} />
        </section>
      </main>
      <img ref={imageProbe} src={face} alt="" className="image-probe" crossOrigin="anonymous" />
      <footer>💡 建议：请上传清晰的正脸照片，效果会更好哦！</footer>
    </div>
  )
}
