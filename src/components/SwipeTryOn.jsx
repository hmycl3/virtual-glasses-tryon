import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, CaretDown, CaretUp, Camera, CheckCircle,
  DownloadSimple, ShareNetwork, SpinnerGap, WarningCircle, X,
} from '@phosphor-icons/react'
import { getVideoLandmarker, computeLiveGlassesTransform } from '../services/faceLandmarker'
import { frameProfiles } from '../utils/frameProfiles'

const asset = (name) => `${import.meta.env.BASE_URL}${name}`

const FRAME_LIBRARY = frameProfiles.map((profile, index) => ({
  id: index,
  src: asset(`glasses-${index + 1}.png`),
  ...profile,
}))

const SWIPE_THRESHOLD = 42

export function SwipeTryOn({ onNavigate, onCollect }) {
  const [index, setIndex] = useState(0)
  const [transform, setTransform] = useState({ x: 50, y: 42, width: 40, rotation: 0 })
  const [faceDetected, setFaceDetected] = useState(false)
  const [cameraState, setCameraState] = useState('loading')
  const [showHint, setShowHint] = useState(true)
  const [shots, setShots] = useState([])
  const [flash, setFlash] = useState(false)
  const [activeShot, setActiveShot] = useState(null)

  const videoRef = useRef(null)
  const stageRef = useRef(null)
  const streamRef = useRef(null)
  const touchStart = useRef(null)
  const frameImages = useRef({})

  const frame = FRAME_LIBRARY[index]

  useEffect(() => {
    FRAME_LIBRARY.forEach((f) => {
      if (frameImages.current[f.id]) return
      const img = new Image()
      img.src = f.src
      frameImages.current[f.id] = img
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported')
      return undefined
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => videoRef.current.play()
        }
        setCameraState('ready')
      })
      .catch(() => {
        if (!cancelled) setCameraState('denied')
      })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (cameraState !== 'ready') return undefined
    let rafId
    let cancelled = false
    getVideoLandmarker().then((landmarker) => {
      const loop = () => {
        if (cancelled) return
        const video = videoRef.current
        if (video && video.readyState >= 2 && stageRef.current) {
          try {
            const result = landmarker.detectForVideo(video, performance.now())
            const points = result.faceLandmarks?.[0]
            if (points) {
              setTransform(computeLiveGlassesTransform(points, video, stageRef.current))
              setFaceDetected(true)
            } else {
              setFaceDetected(false)
            }
          } catch {
            // Skip a failed frame and keep the live loop responsive.
          }
        }
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [cameraState])

  const next = useCallback(() => setIndex((i) => (i + 1) % FRAME_LIBRARY.length), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + FRAME_LIBRARY.length) % FRAME_LIBRARY.length), [])
  const dismissHint = () => setShowHint(false)

  const onPointerDown = (event) => {
    touchStart.current = event.clientY
    dismissHint()
  }
  const onPointerUp = (event) => {
    if (touchStart.current == null) return
    const delta = touchStart.current - event.clientY
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) next()
      else prev()
    }
    touchStart.current = null
  }
  const onWheel = (event) => {
    dismissHint()
    if (event.deltaY > 0) next()
    else prev()
  }

  const capture = () => {
    const video = videoRef.current
    const frameImg = frameImages.current[frame.id]
    if (!video || video.readyState < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    if (frameImg?.complete) {
      const w = canvas.width * transform.width / 100
      const ratio = frameImg.naturalHeight / frameImg.naturalWidth
      ctx.save()
      ctx.translate(canvas.width * transform.x / 100, canvas.height * transform.y / 100)
      ctx.rotate(transform.rotation * Math.PI / 180)
      ctx.drawImage(frameImg, -w / 2, -w * ratio / 2, w, w * ratio)
      ctx.restore()
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    const shot = { id: `${Date.now()}`, src: dataUrl, frameName: frame.name, frameEn: frame.en }
    setShots((list) => [shot, ...list].slice(0, 12))
    onCollect?.(shot)
    setFlash(true)
    setTimeout(() => setFlash(false), 180)
  }

  const shareShot = async (shot) => {
    const photo = new Image()
    photo.src = shot.src
    await new Promise((resolve) => {
      photo.onload = resolve
    })
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const c = canvas.getContext('2d')
    c.fillStyle = '#f5f0e7'
    c.fillRect(0, 0, 1080, 1350)
    c.fillStyle = '#1b1714'
    c.font = '28px Georgia'
    c.fillText('MY LIVE TRY-ON', 70, 84)
    const photoW = 940
    const photoH = 940
    const scale = Math.max(photoW / photo.width, photoH / photo.height)
    const sw = photo.width * scale
    const sh = photo.height * scale
    c.save()
    c.beginPath()
    c.rect(70, 130, photoW, photoH)
    c.clip()
    c.drawImage(photo, 70 - (sw - photoW) / 2, 130 - (sh - photoH) / 2, sw, sh)
    c.restore()
    c.strokeStyle = '#9c9184'
    c.strokeRect(70, 130, photoW, photoH)
    c.fillStyle = '#7b0b0e'
    c.font = '52px Georgia'
    c.fillText(shot.frameName, 70, 1150)
    c.fillStyle = '#777069'
    c.font = '24px sans-serif'
    c.fillText(shot.frameEn || '', 70, 1190)
    c.fillStyle = '#1b1714'
    c.font = '26px Georgia'
    c.fillText('Which frame should I get?', 70, 1290)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    const file = new File([blob], 'my-live-try-on.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'My Live Try-On', files: [file] })
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.name
      a.click()
    }
  }

  return <main className="swipe-tryon-page">
    <div
      className="swipe-stage"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      <div className="swipe-mirror">
        <video ref={videoRef} className="swipe-video" playsInline muted />
        {cameraState === 'ready' && <img
          className="swipe-glasses"
          src={frame.src}
          alt={frame.name}
          style={{
            left: `${transform.x}%`,
            top: `${transform.y}%`,
            width: `${transform.width}%`,
            transform: `translate(-50%,-50%) rotate(${transform.rotation}deg)`,
            opacity: faceDetected ? 1 : 0.35,
          }}
        />}
      </div>
      {flash && <div className="swipe-flash" />}

      <button className="swipe-back" onClick={() => onNavigate('')}><ArrowLeft />Home</button>

      {cameraState === 'loading' && <div className="swipe-status">
        <SpinnerGap className="spin" /><span>正在开启摄像头...</span>
      </div>}
      {cameraState === 'denied' && <div className="swipe-status swipe-status-error">
        <WarningCircle /><span>没有获得摄像头权限，暂时无法使用实时试戴</span>
        <small>请在浏览器地址栏旁允许摄像头访问后刷新页面；你也可以先返回使用上传照片的试戴方式。</small>
        <button onClick={() => onNavigate('try-on')}>去上传照片试戴</button>
      </div>}
      {cameraState === 'unsupported' && <div className="swipe-status swipe-status-error">
        <WarningCircle /><span>当前浏览器不支持摄像头实时试戴</span>
        <button onClick={() => onNavigate('try-on')}>去上传照片试戴</button>
      </div>}
      {cameraState === 'ready' && !faceDetected && <div className="swipe-face-hint">
        <span>正在寻找人脸，请将脸部保持在画面中央</span>
      </div>}

      {cameraState === 'ready' && <div className="swipe-frame-label">
        <span>{String(index + 1).padStart(2, '0')} / {String(FRAME_LIBRARY.length).padStart(2, '0')}</span>
        <b>{frame.name}</b>
        <i>{frame.perception.join(' · ')}</i>
      </div>}

      {cameraState === 'ready' && <div className="swipe-vertical-nav">
        <button onClick={() => { prev(); dismissHint() }}><CaretUp /></button>
        <div className="swipe-dots">
          {FRAME_LIBRARY.map((f, i) => <span key={f.id} className={i === index ? 'active' : ''} />)}
        </div>
        <button onClick={() => { next(); dismissHint() }}><CaretDown /></button>
      </div>}

      {cameraState === 'ready' && showHint && <div className="swipe-onboarding" onClick={dismissHint}>
        <p>上下滑动切换镜框</p>
        <p>点击圆形按钮截图收藏</p>
      </div>}
    </div>

    {cameraState === 'ready' && <div className="swipe-capture-bar">
      <button className="swipe-capture" onClick={capture} aria-label="截图收藏"><Camera weight="fill" /></button>
      {shots.length > 0 && <div className="swipe-filmstrip">
        {shots.map((shot) => <button key={shot.id} className="swipe-filmstrip-item" onClick={() => setActiveShot(shot)}>
          <img src={shot.src} alt={shot.frameName} />
        </button>)}
      </div>}
    </div>}

    {activeShot && <div className="modal-backdrop" onClick={() => setActiveShot(null)}>
      <section className="shot-preview-modal" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><span>SAVED SHOT</span><h2>{activeShot.frameName}</h2></div>
          <button onClick={() => setActiveShot(null)}><X /></button>
        </header>
        <img src={activeShot.src} alt={activeShot.frameName} />
        <div className="shot-preview-actions">
          <button onClick={() => { const a = document.createElement('a'); a.href = activeShot.src; a.download = 'my-live-try-on.png'; a.click() }}>
            <DownloadSimple />下载
          </button>
          <button className="wine-button" onClick={() => shareShot(activeShot)}>
            <ShareNetwork />生成分享卡片
          </button>
        </div>
        <p className="shot-preview-tip"><CheckCircle weight="fill" />截图仅保存在本次浏览会话中，关闭页面后不会上传或留存。</p>
      </section>
    </div>}
  </main>
}
