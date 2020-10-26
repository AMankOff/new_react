// 判断是否为生产环境
const isZSEnv = window.location.host.indexOf('duihuanjifen') !== -1

export const os = 'b'
export const version = '1.0'
export const desIv = isZSEnv? '14947362': '28720162'
export const desKey = isZSEnv? 'k76Qh7uEzpuMEMCvooMbSfl3': '4saas8275933d4f933fv8f62'
export const depositoryHost = isZSEnv? 'https://sup-depository.duihuanjifen.com' : 'https://t-sup-depository.51jfg.com'
