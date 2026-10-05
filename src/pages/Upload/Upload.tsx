import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Button from '@/components/Button/Button'
import { validateLecture } from '@/features/upload/validateLecture'
import type { LectureErrors, LectureType } from '@/features/upload/validateLecture'
import './Upload.css'

type RegisteredLecture = {
  type: LectureType
  title: string
  fileName: string
  fileSize: number
}

const options: { type: LectureType; label: string; description: string }[] = [
  { type: 'video', label: '강의 영상', description: 'MP4, WebM, MOV 파일' },
  { type: 'material', label: '강의 교안', description: 'PDF, PPT, PPTX 파일' },
]

function Upload() {
  const [type, setType] = useState<LectureType>('video')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<LectureErrors>({})
  const [registered, setRegistered] = useState<RegisteredLecture | null>(null)
  const titleInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function resetForm() {
    setType('video')
    setTitle('')
    setFile(null)
    setErrors({})
    setRegistered(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateLecture(type, title, file)
    setErrors(nextErrors)

    if (nextErrors.title) {
      titleInput.current?.focus()
      return
    }
    if (nextErrors.file) {
      fileInput.current?.focus()
      return
    }
    if (!file) return

    setRegistered({ type, title: title.trim(), fileName: file.name, fileSize: file.size })
  }

  return (
    <section className="upload-page">
      <div className="upload-page__heading">
        <p className="page__eyebrow">자료 등록</p>
        <h1>학습할 강의를 등록해 주세요</h1>
        <p>영상 또는 교안을 선택해 등록 흐름을 체험할 수 있습니다.</p>
      </div>

      {registered ? (
        <div className="upload-result" role="status">
          <span className="upload-result__icon" aria-hidden="true">✓</span>
          <div>
            <p className="upload-result__eyebrow">등록 화면 확인 완료</p>
            <h2>{registered.title}</h2>
            <dl>
              <div><dt>자료 유형</dt><dd>{registered.type === 'video' ? '강의 영상' : '강의 교안'}</dd></div>
              <div><dt>파일명</dt><dd>{registered.fileName}</dd></div>
              <div><dt>파일 크기</dt><dd>{(registered.fileSize / 1024 / 1024).toFixed(2)} MB</dd></div>
            </dl>
            <p className="upload-result__notice">현재는 데모입니다. 실제 파일 전송, 저장, 분석 및 문제 생성은 진행되지 않았습니다.</p>
            <Button onClick={resetForm} variant="secondary">다른 자료 등록하기</Button>
          </div>
        </div>
      ) : (
        <div className="upload-page__content">
          <aside className="upload-guide" aria-label="등록 안내">
            <span className="upload-guide__mark" aria-hidden="true">01 / 02</span>
            <h2>자료를 준비하셨나요?</h2>
            <p>강의명과 파일을 선택하면 등록 결과를 바로 미리 볼 수 있습니다.</p>
            <ol>
              <li>자료 유형 선택</li>
              <li>강의명 입력</li>
              <li>파일 선택</li>
            </ol>
            <p className="upload-guide__note">현재는 데모 화면으로 파일을 서버에 전송하지 않습니다.</p>
          </aside>

          <form className="upload-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="upload-type">
              <legend>자료 유형</legend>
              <div className="upload-type__options">
                {options.map((option) => (
                  <label className={`upload-type__option ${type === option.type ? 'is-selected' : ''}`} key={option.type}>
                    <input
                      type="radio"
                      name="lecture-type"
                      value={option.type}
                      checked={type === option.type}
                      onChange={() => { setType(option.type); setFile(null); setErrors((current) => ({ ...current, file: undefined })) }}
                    />
                    <span><strong>{option.label}</strong><small>{option.description}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-field">
              <label htmlFor="lecture-title">강의명</label>
              <input
                id="lecture-title"
                ref={titleInput}
                placeholder="예: 데이터 분석 입문 1강"
                value={title}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'lecture-title-error' : undefined}
                onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: undefined })) }}
              />
              {errors.title && <p className="form-error" id="lecture-title-error">{errors.title}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="lecture-file">{type === 'video' ? '강의 영상 파일' : '강의 교안 파일'}</label>
              <input
                id="lecture-file"
                key={type}
                ref={fileInput}
                type="file"
                accept={type === 'video' ? '.mp4,.webm,.mov' : '.pdf,.ppt,.pptx'}
                aria-invalid={Boolean(errors.file)}
                aria-describedby={errors.file ? 'lecture-file-hint lecture-file-error' : 'lecture-file-hint'}
                onChange={(event) => { setFile(event.target.files?.[0] ?? null); setErrors((current) => ({ ...current, file: undefined })) }}
              />
              <p className="form-hint" id="lecture-file-hint">
                {type === 'video' ? 'MP4, WebM, MOV' : 'PDF, PPT, PPTX'} 형식을 선택해 주세요.
              </p>
              {errors.file && <p className="form-error" id="lecture-file-error">{errors.file}</p>}
            </div>

            {(errors.title || errors.file) && <p className="upload-form__alert" role="alert">입력 내용을 확인해 주세요.</p>}
            <Button className="upload-form__submit" type="submit">자료 등록 확인</Button>
          </form>
        </div>
      )}
    </section>
  )
}

export default Upload
