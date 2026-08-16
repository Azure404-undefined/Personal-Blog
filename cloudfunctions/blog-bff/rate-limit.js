// 按 IP 的登录失败限流（内存实现，实例内有效）
// 已知局限：内存 Map 不跨实例，多实例并发时可能被绕过；
// 免费版实例数少，实际够用；跨实例需数据模型持久化，个人博客不值得。
const createLoginLimiter = ({ maxFails = 10, windowMs = 15 * 60 * 1000 } = {}) => {
  const fails = new Map(); // ip -> { count, windowStart }

  /** 窗口内失败次数是否已达上限（过期条目惰性删除） */
  const isBlocked = (ip, now) => {
    const rec = fails.get(ip);
    if (!rec) return false;
    if (now - rec.windowStart >= windowMs) {
      fails.delete(ip);
      return false;
    }
    return rec.count >= maxFails;
  };

  /** 记录一次失败（窗口过期则重新计数） */
  const recordFail = (ip, now) => {
    const rec = fails.get(ip);
    if (!rec || now - rec.windowStart >= windowMs) {
      fails.set(ip, { count: 1, windowStart: now });
    } else {
      rec.count += 1;
    }
  };

  /** 登录成功后清零 */
  const clear = (ip) => {
    fails.delete(ip);
  };

  return { isBlocked, recordFail, clear };
};

module.exports = { createLoginLimiter };
