import { describe, expect, it } from 'vitest'
import { apiSessionKey, resolveApiStorageNamespace } from './apiStorage'

describe('API 환경별 저장소 식별자', () => {
  it('명시값, 프록시 대상, API 주소 순으로 결정한다', () => {
    expect(resolveApiStorageNamespace('staging', 'http://local:8000', '/api')).toBe('staging')
    expect(resolveApiStorageNamespace('', 'http://local:8000', '/api')).toBe('http://local:8000')
    expect(resolveApiStorageNamespace(undefined, undefined, '/api')).toBe('/api')
  })

  it('환경이 다르면 세션 키가 다르다', () => {
    expect(apiSessionKey('staging')).not.toBe(apiSessionKey('production'))
  })
})
