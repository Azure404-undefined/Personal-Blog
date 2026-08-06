/** 用户名 → 首字（中文取第一个字，英文取首字母大写） */
export function avatarInitial(name?: string | null): string {
  return (name || '?').charAt(0).toUpperCase()
}
