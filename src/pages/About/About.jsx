const folders = [
  ['components', '여러 화면에서 재사용하는 UI'],
  ['features', '기능 단위의 화면·상태·로직'],
  ['hooks', '재사용 가능한 React Hook'],
  ['layouts', '여러 페이지가 공유하는 화면 구조'],
  ['pages', 'URL에 연결되는 페이지'],
  ['services', 'API 등 외부 시스템 통신'],
  ['utils', 'React에 의존하지 않는 공통 함수'],
]

function About() {
  return (
    <section className="page">
      <p className="page__eyebrow">Structure</p>
      <h1 className="page__title">기본 폴더 구조</h1>
      <p className="page__description">기능을 추가할 때 파일의 책임을 구분하기 위한 출발점입니다.</p>
      <dl className="folder-list">
        {folders.map(([name, description]) => (
          <div key={name}>
            <dt>src/{name}/</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default About
