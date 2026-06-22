const SHAPE_PROFILES = {
  鹅蛋脸: {
    facialFeatures: ['五官比例协调', '脸部线条柔和', '眼距适中', '下颌线自然'],
    styleKeywords: ['知性', '温柔', '清透', '自然高级'],
    affirmation: '你的五官比例给人一种舒服、自然、耐看的感觉。眼镜对你来说不是遮挡，而是强化个人气质的风格表达。',
    avoidFrames: ['过厚黑框', '过宽大框型', '过尖锐猫眼框'],
  },
  圆脸: {
    facialFeatures: ['轮廓圆润流畅', '面中比例紧凑', '线条亲和', '下颌转折柔和'],
    styleKeywords: ['亲和', '轻盈', '元气', '利落感'],
    affirmation: '你的脸部线条给人温和亲近的感觉。带一点结构感的镜框，可以自然增加轮廓层次与风格记忆点。',
    avoidFrames: ['小尺寸正圆框', '过窄镜框', '厚重全包围框'],
  },
  方脸: {
    facialFeatures: ['轮廓结构清晰', '下颌线有存在感', '额颌比例均衡', '面部转折明确'],
    styleKeywords: ['沉稳', '清晰', '松弛', '现代感'],
    affirmation: '你的面部轮廓有清晰的结构感。圆润、轻薄的镜框能够柔化转折，同时保留自然坚定的气质。',
    avoidFrames: ['直角粗方框', '眉线过重款式', '尺寸过小镜框'],
  },
  长脸: {
    facialFeatures: ['纵向比例舒展', '眉眼区域清晰', '轮廓线条修长', '面部留白充足'],
    styleKeywords: ['优雅', '文艺', '从容', '复古感'],
    affirmation: '你的面部纵向线条舒展，适合用有适度高度和存在感的镜框丰富眉眼区域，让整体比例更有节奏。',
    avoidFrames: ['过窄长方框', '无存在感细框', '镜腿位置过高款式'],
  },
  心形脸: {
    facialFeatures: ['上庭轮廓舒展', '下颌线轻巧', '眉眼区域醒目', '面部重心自然向上'],
    styleKeywords: ['灵动', '精致', '清透', '轻复古'],
    affirmation: '你的眉眼区域具有自然的视觉焦点。轻盈、下缘柔和的镜框可以延续这种灵动感，让轮廓更平衡。',
    avoidFrames: ['上缘过厚镜框', '夸张尖角猫眼', '顶部装饰复杂款式'],
  },
}

const FRAME_RECOMMENDATIONS = {
  鹅蛋脸: [
    { name: '细金属圆框', matchScore: 96, reason: '可以保留脸部本身的柔和感，同时增加精致和知性的气质。', suitableScenes: ['日常通勤', '校园', '咖啡馆', '轻正式场合'], colorSuggestions: ['香槟金', '银色', '浅玫瑰金'], styleIndex: 0 },
    { name: '半框眼镜', matchScore: 91, reason: '可以轻微增强面部结构感，让整体更利落，但不会显得过于强势。', suitableScenes: ['面试', '商务', '课堂展示', '工作场合'], colorSuggestions: ['深棕', '枪灰', '黑银拼色'], styleIndex: 3 },
    { name: '轻复古方圆框', matchScore: 88, reason: '方圆结合的线条可以平衡柔和脸型，带来一点文艺和复古气质。', suitableScenes: ['旅行', '拍照', '艺术展', '日常穿搭'], colorSuggestions: ['琥珀棕', '透明茶色', '奶油白'], styleIndex: 4 },
  ],
  圆脸: [
    { name: '轻盈方框', matchScore: 95, reason: '清晰的横向线条能增加轮廓层次，同时保持整体轻盈。', suitableScenes: ['日常通勤', '课堂', '会议'], colorSuggestions: ['黑色', '枪灰', '深茶色'], styleIndex: 2 },
    { name: '柔和半框', matchScore: 91, reason: '上缘结构感能够自然提升视觉重心，让眉眼区域更利落。', suitableScenes: ['面试', '商务', '轻正式场合'], colorSuggestions: ['黑银', '深棕', '雾灰'], styleIndex: 3 },
    { name: '窄版方圆框', matchScore: 87, reason: '方圆转角既能修饰圆润轮廓，又不会产生生硬的对比。', suitableScenes: ['旅行', '约会', '日常穿搭'], colorSuggestions: ['玳瑁棕', '透明灰', '墨绿'], styleIndex: 4 },
  ],
  方脸: [
    { name: '细金属圆框', matchScore: 95, reason: '圆润曲线可以柔和轮廓转折，细框又能保留清爽感。', suitableScenes: ['通勤', '阅读', '社交'], colorSuggestions: ['银色', '香槟金', '枪灰'], styleIndex: 0 },
    { name: '柔和方圆框', matchScore: 92, reason: '微弧转角能平衡下颌结构，让整体更松弛自然。', suitableScenes: ['工作', '旅行', '日常穿搭'], colorSuggestions: ['透明茶色', '琥珀棕', '奶油白'], styleIndex: 4 },
    { name: '轻量半框', matchScore: 88, reason: '强调眉眼区域但不过分加重轮廓，适合需要利落感的场合。', suitableScenes: ['会议', '展示', '面试'], colorSuggestions: ['枪灰', '黑银', '深棕'], styleIndex: 3 },
  ],
  长脸: [
    { name: '复古大圆框', matchScore: 94, reason: '适度的镜框高度能丰富面部横向比例，增添从容的复古感。', suitableScenes: ['艺术展', '阅读', '旅行'], colorSuggestions: ['玫瑰金', '银色', '古铜色'], styleIndex: 0 },
    { name: '宽版方圆框', matchScore: 91, reason: '横向延展的方圆轮廓可以让整体比例更平衡、更有节奏。', suitableScenes: ['通勤', '拍照', '日常穿搭'], colorSuggestions: ['玳瑁棕', '透明灰', '黑色'], styleIndex: 4 },
    { name: '眉线半框', matchScore: 87, reason: '明确的上缘能聚焦眉眼，减少纵向留白感。', suitableScenes: ['商务', '面试', '课堂展示'], colorSuggestions: ['深棕', '枪灰', '黑银'], styleIndex: 3 },
  ],
  心形脸: [
    { name: '细金属圆框', matchScore: 96, reason: '轻盈圆润的下缘能平衡上庭视觉重心，突出清透感。', suitableScenes: ['日常', '咖啡馆', '校园'], colorSuggestions: ['香槟金', '银色', '浅玫瑰金'], styleIndex: 0 },
    { name: '透明方圆框', matchScore: 92, reason: '低对比材质不会压住眉眼，同时为下半脸增加柔和分量。', suitableScenes: ['旅行', '拍照', '日常穿搭'], colorSuggestions: ['透明茶色', '奶油白', '浅灰'], styleIndex: 4 },
    { name: '轻量半框', matchScore: 88, reason: '简洁眉线能延续面部上方的自然焦点，又保持下缘通透。', suitableScenes: ['工作', '面试', '轻正式场合'], colorSuggestions: ['枪灰', '浅棕', '黑银'], styleIndex: 3 },
  ],
}

export function getFrameRecommendations(faceShape) {
  return FRAME_RECOMMENDATIONS[faceShape] || FRAME_RECOMMENDATIONS.鹅蛋脸
}

export function getAffirmationByFaceShape(faceShape) {
  return (SHAPE_PROFILES[faceShape] || SHAPE_PROFILES.鹅蛋脸).affirmation
}

// 模拟接口：未来接入 OpenAI Vision、MediaPipe 或后端时，只需替换此函数。
export async function analyzeFace(faceImage) {
  if (!faceImage) throw new Error('请先上传一张清晰的正脸照片')
  await new Promise((resolve) => setTimeout(resolve, 1500))
  const faceShapes = Object.keys(SHAPE_PROFILES)
  const faceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)]
  const profile = SHAPE_PROFILES[faceShape]
  return {
    faceShape,
    facialFeatures: profile.facialFeatures,
    styleKeywords: profile.styleKeywords,
    affirmation: getAffirmationByFaceShape(faceShape),
    recommendedFrames: getFrameRecommendations(faceShape),
    avoidFrames: profile.avoidFrames,
  }
}
