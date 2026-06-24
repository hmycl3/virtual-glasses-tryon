export const identityQuestions = [
  { driver:'SOCIAL PRESENCE', question:'当你走进一个房间，你希望别人首先感受到什么？', options:['平静而可靠的存在','聪明而有边界的气场','温暖而容易接近','自信且具有影响力'] },
  { driver:'SOCIAL RHYTHM', question:'在陌生社交场合中，你通常会……', options:['先安静观察','慢慢适应并融入','主动开启交流','保持清晰边界'] },
  { driver:'AESTHETIC HOME', question:'哪一种环境最接近你的审美直觉？', options:['安静的图书馆','雨天窗边的房间','夜晚城市灯光','自然开阔空间'] },
  { driver:'NATURAL ROLE', question:'你在群体中自然扮演什么角色？', options:['稳定者','思考者','连接者','推动者'] },
  { driver:'DESIRED SHIFT', question:'戴上眼镜时，你潜意识里希望自己……', options:['显得更有思考力','更平静稳定','更有表达力','更独特且容易被记住'] },
]

const identities = [
  { primary:'安静的策略家', primaryEn:'The Quiet Strategist', aura:'你很少主动占据注意力，但人们会自然信任你的存在。', traits:['Calm','Structured','Reflective'], drivers:['希望被尊重','不喜欢刻意表现','倾向长期关系'], strategy:'ENHANCE' },
  { primary:'温柔的观察者', primaryEn:'The Gentle Observer', aura:'你的表达松弛而敏锐，擅长在细节里建立连接。', traits:['Warm','Perceptive','Open'], drivers:['重视真实连接','先观察再靠近','偏爱自然表达'], strategy:'BALANCE' },
  { primary:'清晰的创造者', primaryEn:'The Clear Creator', aura:'你愿意把想法变成可见的风格，同时保留自己的节奏。', traits:['Creative','Decisive','Curious'], drivers:['希望被理解','享受形成观点','接受适度关注'], strategy:'SHIFT' },
  { primary:'沉着的引领者', primaryEn:'The Composed Leader', aura:'你的存在感来自清晰和稳定，而不是音量。', traits:['Reliable','Focused','Assured'], drivers:['承担责任','重视可信度','倾向长期影响'], strategy:'ENHANCE' },
]

const recommendations = [
  { name:'细金属圆框', styleIndex:1, identityScore:96, psychologicalScore:94, reason:'保留轻盈感，同时增加精致和思考力。', tags:['Intellectual','Elegant'] },
  { name:'无框矩形镜', styleIndex:2, identityScore:92, psychologicalScore:91, reason:'让视觉更利落，适合需要清晰表达的时刻。', tags:['Professional','Calm'] },
  { name:'复古茶色框', styleIndex:3, identityScore:89, psychologicalScore:88, reason:'增加温暖的材质记忆点，表达独立审美。', tags:['Creative','Thoughtful'] },
]

export function generateVisualIdentity(answers = []) {
  const seed = answers.reduce((sum, value, index) => sum + (value + 1) * (index + 2), 0)
  const identity = identities[seed % identities.length]
  return {
    ...identity,
    summary: identity.aura,
    recommendations: recommendations.map((frame,index)=>({...frame,identityScore:frame.identityScore-((seed+index)%3)})),
    scenarioMatches:[['Interview',94],['Founder',91],['Coffee Chat',88]],
  }
}
