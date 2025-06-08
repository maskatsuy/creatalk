const userSteps = [
  {
    step: 1,
    title: 'アカウント作成',
    description: 'メールアドレスで簡単に登録',
    color: 'bg-blue-500'
  },
  {
    step: 2,
    title: '専門家選択',
    description: '目的に合った専門家・クリエイターを見つける',
    color: 'bg-purple-500'
  },
  {
    step: 3,
    title: 'セッション予約',
    description: '相談・学習したい時間枠を選択',
    color: 'bg-pink-500'
  },
  {
    step: 4,
    title: 'セッション開始',
    description: '時間になったら学習・相談を開始',
    color: 'bg-green-500'
  }
]

export function UserStepsSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">ユーザーの方の利用方法</h2>
        <p className="text-center text-gray-600 mb-12">専門家・クリエイターと直接相談・学習しよう</p>
        <div className="grid md:grid-cols-4 gap-8">
          {userSteps.map((step) => (
            <div key={step.step} className="text-center">
              <div className={`w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold`}>
                {step.step}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}