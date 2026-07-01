import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

let landmarkerPromise
let videoLandmarkerPromise

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      )
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
      })
    })()
  }
  return landmarkerPromise
}

export async function getVideoLandmarker() {
  if (!videoLandmarkerPromise) {
    videoLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      )
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
      })
    })()
  }
  return videoLandmarkerPromise
}

export function computeLiveGlassesTransform(points, videoEl, stageEl) {
  const left = points[33]
  const right = points[263]
  const rect = stageEl?.getBoundingClientRect()
  const stageWidth = rect?.width || videoEl.videoWidth
  const stageHeight = rect?.height || videoEl.videoHeight
  const scale = Math.max(stageWidth / videoEl.videoWidth, stageHeight / videoEl.videoHeight)
  const renderedWidth = videoEl.videoWidth * scale
  const renderedHeight = videoEl.videoHeight * scale
  const offsetX = (stageWidth - renderedWidth) * 0.5
  const offsetY = (stageHeight - renderedHeight) * 0.5
  const mapPoint = (p) => ({
    x: p.x * renderedWidth + offsetX,
    y: p.y * renderedHeight + offsetY,
  })
  const mappedLeft = mapPoint(left)
  const mappedRight = mapPoint(right)
  const dx = mappedRight.x - mappedLeft.x
  const dy = mappedRight.y - mappedLeft.y
  const eyeDistance = Math.hypot(dx, dy)

  return {
    x: ((mappedLeft.x + mappedRight.x) / 2 / stageWidth) * 100,
    y: ((mappedLeft.y + mappedRight.y) / 2 / stageHeight) * 100 + 1,
    width: Math.min(62, Math.max(20, (eyeDistance / stageWidth) * 230)),
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
  }
}

export async function detectEyeTransform(imageEl, stageEl) {
  const landmarker = await getLandmarker()
  const result = landmarker.detect(imageEl)
  const points = result.faceLandmarks?.[0]
  if (!points) throw new Error('未检测到清晰的人脸')

  const left = points[33]
  const right = points[263]
  const rect = stageEl?.getBoundingClientRect()
  const stageWidth = rect?.width || imageEl.naturalWidth
  const stageHeight = rect?.height || imageEl.naturalHeight
  const scale = Math.min(stageWidth / imageEl.naturalWidth, stageHeight / imageEl.naturalHeight)
  const renderedWidth = imageEl.naturalWidth * scale
  const renderedHeight = imageEl.naturalHeight * scale
  const offsetX = (stageWidth - renderedWidth) * 0.5
  const offsetY = (stageHeight - renderedHeight) * 0.5
  const mapPoint = (p) => ({
    x: p.x * renderedWidth + offsetX,
    y: p.y * renderedHeight + offsetY,
  })
  const mappedLeft = mapPoint(left)
  const mappedRight = mapPoint(right)
  const dx = mappedRight.x - mappedLeft.x
  const dy = mappedRight.y - mappedLeft.y
  const eyeDistance = Math.hypot(dx, dy)

  return {
    x: ((mappedLeft.x + mappedRight.x) / 2 / stageWidth) * 100,
    y: ((mappedLeft.y + mappedRight.y) / 2 / stageHeight) * 100 + 1,
    width: Math.min(58, Math.max(18, (eyeDistance / stageWidth) * 230)),
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
  }
}

export async function generateTryOnResult(faceImage, glassesImage) {
  if (!faceImage || !glassesImage) throw new Error('请先选择人脸和眼镜图片')
  return { faceImage, glassesImage, generatedAt: Date.now() }
}
