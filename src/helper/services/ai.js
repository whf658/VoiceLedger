import fetch from '@system.fetch'
import prompt from '@system.prompt'

// 请替换为你自己的 DeepSeek API Key
const API_KEY = 'sk-*****' 
const API_URL = 'https://api.deepseek.com/chat/completions'

export default {
  // 1. 发送文本给 AI 进行解析
  parseBill(text) {
    return new Promise((resolve, reject) => {
      // --- 核心修改：Prompt 升级 ---
      const systemPrompt = `你是一个专业的记账助手。请基于用户的自然语言输入，进行语义分析并提取 JSON 数据。
      
      【输出规则】：
      1. 必须且只能返回纯 JSON 格式，严禁包含 Markdown 标记（如 \`\`\`json）。
      2. 字段说明：
         - amount (数字): 交易金额。
         - category (字符串): 从 [餐饮, 交通, 购物, 娱乐, 居住, 医疗, 工资, 奖金, 理财, 其他] 中匹配最合适的分类。
         - desc (字符串): 简短的备注说明。
         - date_offset (整数): 0表示今天，-1表示昨天，以此类推。
         - is_income_probability (数字, 0.0 - 1.0): **关键字段**，表示这笔交易属于“收入”的语义置信度。
      
      【语义判断标准】：
      - 如果语义是资金**流入**用户账户（如：收到工资、抢到红包、朋友还钱、闲鱼卖出、报销到账、理财收益、退款到账），则 is_income_probability 应接近 1.0。
      - 如果语义是资金**流出**用户账户（如：买东西、消费、扣款、借给别人、发红包、还信用卡），则 is_income_probability 应接近 0.0。
      
      【示例】：
      用户："发工资五千" -> {"amount":5000, "category":"工资", "desc":"发工资", "is_income_probability": 0.99, "date_offset":0}
      用户："买菜花了20" -> {"amount":20, "category":"购物", "desc":"买菜", "is_income_probability": 0.01, "date_offset":0}
      用户："退票费扣了10块" -> {"amount":10, "category":"交通", "desc":"退票费", "is_income_probability": 0.05, "date_offset":0}
      用户："商家退款100元" -> {"amount":100, "category":"其他", "desc":"商家退款", "is_income_probability": 0.95, "date_offset":0}`

      const requestBody = {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        stream: false,
        temperature: 0.1 // 低温模式，保证逻辑严谨
      }

      fetch.fetch({
        url: API_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: JSON.stringify(requestBody),
        success: function(response) {
          try {
            const resObj = JSON.parse(response.data)
            const content = resObj.choices[0].message.content
            // 清洗 Markdown 符号，防止 AI 偶尔不听话
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim()
            const result = JSON.parse(cleanJson)
            
            console.info('AI 原始解析:', result)
            resolve(result)
          } catch (e) {
            console.error('AI 解析 JSON 失败:', e)
            reject(e)
          }
        },
        fail: function(data, code) {
          console.error('API 请求失败:', code)
          reject(code)
        }
      })
    })
  },

  // 2. 格式化/标准化数据
  normalizeBill(parsed, rawText) {
    if (!parsed) return {}
    
    // 日期处理
    const now = new Date()
    if (parsed.date_offset !== undefined && parsed.date_offset !== 0) {
      now.setDate(now.getDate() + parsed.date_offset)
    }
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`

    // --- 核心修改：基于置信度阈值判断类型 ---
    // 默认阈值设为 0.5，大于 0.5 判定为收入
    const prob = typeof parsed.is_income_probability === 'number' ? parsed.is_income_probability : 0
    const finalType = prob > 0.5 ? 'income' : 'expense'

    console.info(`语义分析结果: 置信度=${prob}, 判定类型=${finalType}`)

    return {
      amount: parsed.amount || '',
      category: parsed.category || (finalType === 'income' ? '收入' : '其他'),
      desc: parsed.desc || rawText,
      date: dateStr,
      type: finalType // 将判定结果传回 UI
    }
  }
}