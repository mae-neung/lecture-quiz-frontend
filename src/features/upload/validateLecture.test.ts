import { describe, expect, it } from 'vitest'
import { validateLecture } from './validateLecture'

describe('validateLecture', () => {
  it('확장자와 MIME이 선택한 자료 유형에 맞아야 한다', () => {
    expect(validateLecture('video', '강의', new File(['x'], 'slide.pdf', { type: 'application/pdf' })).file)
      .toContain('MP4')
    expect(validateLecture('video', '강의', new File(['x'], 'video.mp4', { type: 'application/pdf' })).file)
      .toContain('MP4')
    expect(validateLecture('material', '강의', new File(['x'], 'slide.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })))
      .toEqual({})
  })
})
