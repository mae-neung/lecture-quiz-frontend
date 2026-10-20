export type LectureType = 'video' | 'material' | 'audio'

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
  audio: { mp3: ['audio/mpeg', 'audio/mp3'] },
}

export function validateLecture(type: LectureType, title: string, file: File | null, apiMode = false): LectureErrors {
  const errors: LectureErrors = {}

  if (!title.trim()) errors.title = '강의명을 입력해 주세요.'

  if (!file) {
    errors.file = '파일을 선택해 주세요.'
  } else if (file.size === 0) {
    errors.file = '비어 있는 파일은 등록할 수 없습니다.'
  } else {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    const acceptedMimeTypes = apiMode && !['pdf', 'mp3', 'mp4'].includes(extension) ? undefined : supportedFiles[type][extension]
    if (!acceptedMimeTypes || (file.type && !acceptedMimeTypes.includes(file.type.toLowerCase()))) {
      errors.file = apiMode ? 'PDF, MP3, MP4 파일 중 선택한 자료 유형에 맞는 파일을 선택해 주세요.' : type === 'video'
        ? 'MP4, WebM, MOV 영상 파일을 선택해 주세요.'
        : type === 'audio' ? 'MP3 오디오 파일을 선택해 주세요.' : 'PDF, PPT, PPTX 교안 파일을 선택해 주세요.'
    }
  }

  return errors
}
