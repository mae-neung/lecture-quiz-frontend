import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { createSavedSet } from '@/features/library/libraryStorage'
import { validateLecture } from '@/features/upload/validateLecture'
import type { LectureErrors, LectureType } from '@/features/upload/validateLecture'
import { useApiUpload } from '@/features/upload/useApiUpload'
import { useAuth } from '@/features/auth/useAuth'
import { isApiMode } from '@/services/api'
import './Upload.css'

type RegisteredLecture = {
  id: string
  type: LectureType
  title: string
  fileName: string
  fileSize: number
}

const options: { type: LectureType; label: string; description: string }[] = [
  { type: 'video', label: '강의 영상', description: 'MP4, WebM, MOV 파일' },
  { type: 'material', label: '강의 교안', description: 'PDF, PPT, PPTX 파일' },
]
const apiOptions: { type: LectureType; label: string; description: string }[] = [
  { type: 'video', label: '강의 영상', description: 'MP4 파일' },
  { type: 'material', label: '강의 교안', description: 'PDF 파일' },
  { type: 'audio', label: '강의 음성', description: 'MP3 파일' },
]

function Upload() {
  const { userId } = useAuth()
  const apiUpload = useApiUpload(userId)
  const [type, setType] = useState<LectureType>('video')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<LectureErrors>({})
  const [registered, setRegistered] = useState<RegisteredLecture | null>(null)
  const [saveError, setSaveError] = useState('')
  const titleInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function resetForm() {
    apiUpload.reset()
    if (fileInput.current) fileInput.current.value = ''
    setType('video')
    setTitle('')
    setFile(null)
    setErrors({})
    setRegistered(null)
    setSaveError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (apiUpload.isPending) return
    const nextErrors = validateLecture(type, title, file, isApiMode)
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

    const saved = isApiMode
      ? await apiUpload.submit(title.trim(), type, file)
      : createSavedSet({ materialType: type, title: title.trim(), fileName: file.name, fileSize: file.size })
    if (isApiMode) {
      if (saved && 'id' in saved) setRegistered({ id: saved.id, type, title: saved.title, fileName: file.name, fileSize: file.size })
      return
    }
    if (!saved || !('ok' in saved)) return
    if (!saved.ok) {
      setSaveError(saved.error)
      return
    }
    setSaveError('')
    setRegistered({ id: saved.value.id, type, title: saved.value.title, fileName: file.name, fileSize: file.size })
  }

  return (
    <section className="upload-page">
      <div className="upload-page__heading">
        <p className="page__eyebrow">STEP 01 · 자료 등록</p>
        <h1>이번 시험에 나올 강의 자료를 골라주세요.</h1>
        <p>{isApiMode ? '강의 영상, 음성 또는 교안을 올리면 서버에서 요약하고 문제를 생성해요.' : '강의 영상이나 교안을 선택하면 문제 만들기 전 등록 흐름을 체험할 수 있어요.'}</p>
      </div>

      {registered ? (
        <div className="upload-result" role="status">
          <span className="upload-result__icon" aria-hidden="true">✓</span>
          <div>
            <p className="upload-result__eyebrow">{isApiMode ? '문제 생성 완료' : '데모 등록 확인 완료'}</p>
            <h2>{registered.title}</h2>
            <dl>
              <div><dt>자료 유형</dt><dd>{registered.type === 'video' ? '강의 영상' : registered.type === 'audio' ? '강의 음성' : '강의 교안'}</dd></div>
              <div><dt>파일명</dt><dd>{registered.fileName}</dd></div>
              <div><dt>파일 크기</dt><dd>{(registered.fileSize / 1024 / 1024).toFixed(2)} MB</dd></div>
            </dl>
            <p className="upload-result__notice">{isApiMode ? '서버가 만든 5개 문제를 이 브라우저에 저장했어요. 원본 파일은 서버에 전송되며 브라우저 보관함에는 저장되지 않아요.' : '문제 세트를 이 브라우저에 저장했어요. 실제 파일 분석 결과 대신 준비된 5개의 목업 문제로 풀이 흐름을 체험할 수 있어요. 원본 파일은 저장되지 않았어요.'}</p>
            <div className="upload-result__actions">
              <Link className="upload-result__quiz-link" to={`/quiz/${registered.id}`}>저장한 문제 풀기</Link>
              <Link className="upload-result__quiz-link" to={`/library/${registered.id}`}>문제 세트 관리</Link>
              <Button onClick={resetForm} variant="secondary">다른 자료 등록하기</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="upload-page__content">
          <aside className="upload-guide" aria-label="등록 안내">
            <span className="upload-guide__mark" aria-hidden="true">EXAM PREP · 01 / 02</span>
            <h2>벼락치기도<br />순서가 중요해요.</h2>
            <p>시험 범위에 해당하는 자료인지 확인하고 하나씩 등록해 보세요.</p>
            <ol>
              <li>자료 유형 선택</li>
              <li>강의명 입력</li>
              <li>파일 선택</li>
            </ol>
            <div className="upload-guide__privacy">
              <strong>자료를 올리기 전에</strong>
              <p>저작권이 있거나 개인정보가 포함된 자료는 업로드 권한을 꼭 확인해 주세요.</p>
            </div>
            <p className="upload-guide__note">{isApiMode ? '업로드한 원본 파일은 서버로 전송됩니다.' : '원본 파일은 서버에 전송되거나 저장되지 않습니다. 파일명과 목업 문제는 이 브라우저에 저장됩니다.'}</p>
          </aside>

          <form className="upload-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="upload-type">
              <legend>자료 유형</legend>
              <div className="upload-type__options">
                {(isApiMode ? apiOptions : options).map((option) => (
                  <label className={`upload-type__option ${type === option.type ? 'is-selected' : ''}`} key={option.type}>
                    <input
                      type="radio"
                      name="lecture-type"
                      value={option.type}
                      checked={type === option.type}
                      onChange={() => { apiUpload.reset(); setType(option.type); setFile(null); setErrors((current) => ({ ...current, file: undefined })) }}
                      disabled={apiUpload.isPending || apiUpload.hasCheckpoint}
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
                placeholder="예: 경영통계 3주차 회귀분석"
                value={title}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'lecture-title-error' : undefined}
                onChange={(event) => { apiUpload.reset(); setTitle(event.target.value); setErrors((current) => ({ ...current, title: undefined })) }}
                disabled={apiUpload.isPending || apiUpload.hasCheckpoint}
              />
              {errors.title && <p className="form-error" id="lecture-title-error">{errors.title}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="lecture-file">{type === 'video' ? '강의 영상 파일' : type === 'audio' ? '강의 음성 파일' : '강의 교안 파일'}</label>
              <input
                id="lecture-file"
                key={type}
                ref={fileInput}
                type="file"
                accept={isApiMode ? type === 'video' ? '.mp4' : type === 'audio' ? '.mp3' : '.pdf' : type === 'video' ? '.mp4,.webm,.mov' : '.pdf,.ppt,.pptx'}
                disabled={apiUpload.isPending || apiUpload.hasCheckpoint}
                aria-invalid={Boolean(errors.file)}
                aria-describedby={errors.file ? 'lecture-file-hint lecture-file-error' : 'lecture-file-hint'}
                onChange={(event) => { apiUpload.reset(); setFile(event.target.files?.[0] ?? null); setErrors((current) => ({ ...current, file: undefined })) }}
              />
              <p className="form-hint" id="lecture-file-hint">
                {isApiMode ? type === 'video' ? 'MP4' : type === 'audio' ? 'MP3' : 'PDF' : type === 'video' ? 'MP4, WebM, MOV' : 'PDF, PPT, PPTX'} 형식을 선택해 주세요.
              </p>
              {errors.file && <p className="form-error" id="lecture-file-error">{errors.file}</p>}
            </div>

            {(errors.title || errors.file) && <p className="upload-form__alert" role="alert">입력 내용을 확인해 주세요.</p>}
            {saveError && <p className="upload-form__alert" role="alert">{saveError}</p>}
            {isApiMode && <p aria-live="polite" role="status">{apiUpload.progress}</p>}
            {isApiMode && apiUpload.error && <p className="upload-form__alert" role="alert">{apiUpload.error}</p>}
            {isApiMode && apiUpload.hasCheckpoint && <p className="form-hint">처리 중인 자료의 제목·유형·파일은 변경할 수 없습니다.</p>}
            <Button className="upload-form__submit" type="submit" disabled={apiUpload.isPending || apiUpload.isBlocked}>{apiUpload.isPending ? '처리 중…' : apiUpload.isBlocked ? '자동 재시도 중단' : apiUpload.canRetry ? '멈춘 단계부터 다시 시도' : isApiMode ? '자료 업로드하고 문제 만들기' : '데모 등록 확인'}</Button>
          </form>
        </div>
      )}
    </section>
  )
}

export default Upload
