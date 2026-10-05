export type LectureType = 'video' | 'material'

export type LectureErrors = {
  title?: string
  file?: string
}

const supportedFiles: Record<LectureType, Record<string, readonly string[]>> = {
  video: {
    mp4: ['video/mp4'],
    webm: ['video/webm'],
    mov: ['video/quicktime'],
  },
  material: {
    pdf: ['application/pdf'],
    ppt: ['application/vnd.ms-powerpoint'],
    pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  },
}

export function validateLecture(type: LectureType, title: string, file: File | null): LectureErrors {
  const errors: LectureErrors = {}

  if (!title.trim()) errors.title = '강의명을 입력해 주세요.'

  if (!file) {
    errors.file = '파일을 선택해 주세요.'
  } else if (file.size === 0) {
    errors.file = '비어 있는 파일은 등록할 수 없습니다.'
  } else {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    const acceptedMimeTypes = supportedFiles[type][extension]
    if (!acceptedMimeTypes || (file.type && !acceptedMimeTypes.includes(file.type.toLowerCase()))) {
      errors.file = type === 'video'
        ? 'MP4, WebM, MOV 영상 파일을 선택해 주세요.'
        : 'PDF, PPT, PPTX 교안 파일을 선택해 주세요.'
    }
  }

  return errors
}
