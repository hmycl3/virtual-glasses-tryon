export const identityQuestions = [
  { driver:'社会印象控制', question:'当你走进一个房间，你希望别人感受到什么？', options:['平静而可靠的存在','聪明而有距离的气场','温暖而容易接近','强大而自信的能量'] },
  { driver:'自我保护方式', question:'在陌生社交场合中，你通常会……', options:['先安静观察','适应并融入','主动开启交流','保持情绪距离'] },
  { driver:'情绪基线', question:'哪一种审美环境最接近你？', options:['安静的图书馆','雨天窗边的房间','夜晚城市灯光','自然开阔空间'] },
  { driver:'身份原型', question:'你在群体中自然扮演什么角色？', options:['稳定者','思考者','连接者','领导者'] },
  { driver:'核心转变动机', question:'戴上眼镜时，你潜意识里希望自己……', options:['看起来更聪明','更平静稳定','更时髦有表达力','更独特且容易被记住'] },
]

const identities = [
  { primary:'冷静知性', primaryEn:'Cool Intellectual', secondary:'柔和极简', secondaryEn:'Soft Minimalist', aura:'你给人的感觉冷静清晰、有思想、有分寸，同时保留克制的温度。', strategy:'BALANCE' },
  { primary:'温暖自然', primaryEn:'Warm Natural', secondary:'年轻清透', secondaryEn:'Youthful Clean', aura:'你的存在感温和而松弛，亲近感不是刻意迎合，而是一种自然的开放。', strategy:'ENHANCE' },
  { primary:'锐利专业', primaryEn:'Sharp Professional', secondary:'冷静知性', secondaryEn:'Cool Intellectual', aura:'你倾向用清晰、可靠的结构表达自己，同时希望被看见真实的判断力。', strategy:'ENHANCE' },
  { primary:'艺术疏离', primaryEn:'Artistic Detached', secondary:'柔和极简', secondaryEn:'Soft Minimalist', aura:'你的气质带着独立的观察感，既不急于解释，也愿意让细节替你表达。', strategy:'SHIFT' },
]

const frames = [
  { name:'细长钛金属方框', shape:'窄方框', thickness:'纤细', material:'钛金属', color:'冷银色', emotionalEffect:'冷静、清晰、有分寸', transformation:'强化理性与专业感，同时建立轻盈的权威感。', tags:['minimal','intellectual','clean'], identityScore:96, psychologicalScore:93, styleIndex:4 },
  { name:'轻量金属圆框', shape:'圆框', thickness:'极细', material:'金属', color:'浅金色', emotionalEffect:'温和、细腻、松弛', transformation:'柔化距离感，让知性表达更容易接近。', tags:['soft','minimal','youthful'], identityScore:92, psychologicalScore:91, styleIndex:0 },
  { name:'黑金眉线半框', shape:'眉线框', thickness:'中等', material:'组合材质', color:'黑金拼色', emotionalEffect:'复古、有型、聪敏', transformation:'增加复古气质与品牌感，建立更鲜明的身份印象。', tags:['bold','artistic','professional'], identityScore:90, psychologicalScore:88, styleIndex:3 },
]

export function generateVisualIdentity(answers = []) {
  const seed = answers.reduce((sum, value, index) => sum + (value + 1) * (index + 2), 0)
  const identity = identities[seed % identities.length]
  const visibility = answers.filter((v) => v >= 2).length >= 3 ? '高可见度表达' : answers.filter((v) => v === 0).length >= 3 ? '低可见度表达' : '中等可见度表达'
  return {
    ...identity,
    summary: identity.aura,
    psychologicalProfile: {
      socialDrive: answers[0] === 3 ? '希望被感知为自信且具有影响力' : answers[0] === 2 ? '希望被感知为温暖可靠' : '希望被感知为值得信赖的思考者',
      defenseStyle: answers[1] === 2 ? '主动连接，以行动建立安全感' : answers[1] === 3 ? '保持边界，理性优先' : '先观察环境，再决定如何投入',
      expressionPreference: visibility,
    },
    strategyExplanation: identity.strategy === 'ENHANCE' ? '放大你已经具备的身份特征，让镜框成为气质的清晰延伸。推荐会优先强化一致性与记忆点。' : identity.strategy === 'SHIFT' ? '尝试柔和地改变他人对你的第一印象，让镜框带来新的表达方向，同时保留真实的你。' : '平衡你希望呈现的理性与内在的柔和。镜框会增加结构感，但避免制造过度距离，让身份表达更完整。',
    recommendations: frames.map((frame, index) => ({ ...frame, identityScore: Math.max(82, frame.identityScore - ((seed + index) % 4)), psychologicalScore: Math.max(80, frame.psychologicalScore - ((seed + index * 2) % 4)) })),
  }
}
