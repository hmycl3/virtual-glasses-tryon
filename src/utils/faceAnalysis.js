const profiles={
  '鹅蛋脸':{features:['五官比例协调','脸部线条柔和','眼距适中','下颌线自然'],keywords:['知性','温柔','清透','自然高级'],affirmation:'你的五官比例给人舒服、自然、耐看的感受。镜框可以成为强化个人气质的风格表达。',avoid:['过厚黑框','过宽大框型','过尖锐猫眼框']},
  '圆脸':{features:['轮廓圆润流畅','面部线条亲和','下颌转折柔和'],keywords:['亲和','轻盈','利落'],affirmation:'你的脸部线条给人温和亲近的感觉，带一点结构感的镜框会自然增加风格记忆点。',avoid:['小尺寸正圆框','过窄镜框','厚重全包框']},
  '方脸':{features:['轮廓结构清晰','下颌线有存在感','面部转折明确'],keywords:['沉稳','清晰','现代'],affirmation:'你的面部轮廓有清晰的结构感，圆润轻薄的镜框能柔化转折，同时保留坚定气质。',avoid:['直角粗方框','眉线过重款式','尺寸过小镜框']},
  '长脸':{features:['纵向比例舒展','眉眼区域清晰','轮廓线条修长'],keywords:['优雅','文艺','从容'],affirmation:'你的面部纵向线条舒展，适合用有适度高度的镜框丰富眉眼区域，让整体更有节奏。',avoid:['过窄长方框','无存在感细框','位置过高款式']},
  '心形脸':{features:['上庭轮廓舒展','下颌线轻巧','眉眼区域醒目'],keywords:['灵动','精致','清透'],affirmation:'你的眉眼区域具有自然焦点，轻盈、下缘柔和的镜框可以延续这种灵动感。',avoid:['上缘过厚镜框','夸张尖角猫眼','顶部装饰复杂款式']},
}

const frames=[
  {name:'细金属圆框',matchScore:96,reason:'保留脸部轻盈感，同时增加精致和知性气质。',suitableScenes:['日常通勤','校园','轻正式场合'],colorSuggestions:['香槟金','银色','浅玫瑰金'],styleIndex:1},
  {name:'无框矩形镜',matchScore:91,reason:'轻微增强面部结构感，让整体更利落但不过分强势。',suitableScenes:['面试','商务','课堂展示'],colorSuggestions:['枪灰','黑银','浅金'],styleIndex:2},
  {name:'轻复古方圆框',matchScore:88,reason:'方圆结合的线条带来文艺与复古气质。',suitableScenes:['旅行','拍照','艺术展'],colorSuggestions:['琥珀棕','透明茶色','奶油白'],styleIndex:3},
]
export const getFrameRecommendations=()=>frames
export const getAffirmationByFaceShape=(shape)=>(profiles[shape]||profiles['鹅蛋脸']).affirmation
export async function analyzeFace(faceImage){if(!faceImage)throw new Error('请先上传一张清晰的正脸照片');await new Promise(r=>setTimeout(r,1200));const shapes=Object.keys(profiles);const faceShape=shapes[Math.floor(Math.random()*shapes.length)];const p=profiles[faceShape];return{faceShape,facialFeatures:p.features,styleKeywords:p.keywords,affirmation:p.affirmation,recommendedFrames:frames,avoidFrames:p.avoid}}
