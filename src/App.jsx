import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">React + Vite starter</p>
        <h1 id="welcome-title">프론트엔드 템플릿</h1>
        <p>
          새 프로젝트를 시작할 준비가 됐습니다. 첫 화면은 <code>src/pages</code>에,
          재사용할 UI는 <code>src/components</code>에 추가하세요.
        </p>
      </section>
    </main>
  )
}

export default App
