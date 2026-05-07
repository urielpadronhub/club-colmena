'use client'

export default function InstagramPosts() {
  const posts = [
    {
      id: 1,
      title: "Bienvenida",
      emoji: "🐝",
      mainText: "¡Únete a La Colmena!",
      subText: "Donde cada abeja cuenta",
      bgClass: "bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500",
      decoration: "honeycomb"
    },
    {
      id: 2,
      title: "Misión",
      emoji: "📚",
      mainText: "Educación para nuestros niños",
      subText: "150+ becados y contando...",
      bgClass: "bg-gradient-to-br from-amber-500 via-orange-400 to-yellow-500",
      decoration: "flowers"
    },
    {
      id: 3,
      title: "Tipos de Socio",
      emoji: "👑",
      mainText: "¿Qué tipo de abeja serás?",
      subText: "Presidente • Elite • Fundador • Formal",
      bgClass: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400",
      decoration: "types"
    },
    {
      id: 4,
      title: "Sorteos",
      emoji: "🏆",
      mainText: "¡Sorteos cada semana!",
      subText: "$15 semanal | $75 mensual",
      bgClass: "bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-400",
      decoration: "confetti"
    },
    {
      id: 5,
      title: "Comunidad",
      emoji: "💛",
      mainText: "Juntos somos más fuertes",
      subText: "Únete a nuestra colmena en Maracaibo 🇻🇪",
      bgClass: "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-400",
      decoration: "bees"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🐝 Posts para Instagram - El Club de La Colmena
          </h1>
          <p className="text-gray-400 text-lg">
            Haz clic derecho en cada post → &quot;Guardar imagen&quot; o captura de pantalla
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col items-center">
              {/* Post Container - Instagram Square Format */}
              <div 
                className={`w-[400px] h-[400px] rounded-3xl ${post.bgClass} relative overflow-hidden shadow-2xl`}
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {/* Decorations based on type */}
                {post.decoration === 'honeycomb' && (
                  <>
                    {/* Honeycomb pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="honeycomb1" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                          <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="#8B4513" strokeWidth="2"/>
                          <path d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34" fill="none" stroke="#8B4513" strokeWidth="2"/>
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#honeycomb1)"/>
                      </svg>
                    </div>
                    {/* Floating bees */}
                    <div className="absolute top-8 left-8 text-5xl animate-bounce">🐝</div>
                    <div className="absolute top-16 right-12 text-4xl animate-pulse">🐝</div>
                    <div className="absolute bottom-20 left-12 text-3xl animate-bounce">🐝</div>
                    <div className="absolute bottom-12 right-8 text-5xl animate-pulse">🐝</div>
                    {/* Honey drops */}
                    <div className="absolute top-24 left-20 text-3xl">🍯</div>
                    <div className="absolute bottom-32 right-20 text-2xl">🍯</div>
                  </>
                )}

                {post.decoration === 'flowers' && (
                  <>
                    {/* Flowers */}
                    <div className="absolute top-6 left-8 text-4xl">🌻</div>
                    <div className="absolute top-12 right-10 text-3xl">🌸</div>
                    <div className="absolute bottom-16 left-6 text-5xl">🌺</div>
                    <div className="absolute bottom-8 right-8 text-4xl">🌻</div>
                    <div className="absolute top-32 left-16 text-2xl">🌼</div>
                    <div className="absolute bottom-40 right-16 text-2xl">🌸</div>
                    {/* Children studying illustration */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-6xl">👧📖👦</div>
                    {/* Small bees */}
                    <div className="absolute top-20 right-20 text-2xl animate-bounce">🐝</div>
                    <div className="absolute top-40 left-10 text-xl animate-pulse">🐝</div>
                  </>
                )}

                {post.decoration === 'types' && (
                  <>
                    {/* Member type badges */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col gap-2">
                      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                        👑 Presidente <span className="text-xs opacity-70">2% donaciones</span>
                      </div>
                      <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                        ⭐ Elite <span className="text-xs opacity-70">100 socios</span>
                      </div>
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                        🏅 Fundador <span className="text-xs opacity-70">500 socios</span>
                      </div>
                      <div className="bg-gray-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                        🐝 Formal <span className="text-xs opacity-70">$2/mes</span>
                      </div>
                    </div>
                    {/* Decorative bees */}
                    <div className="absolute bottom-8 left-8 text-4xl animate-bounce">🐝</div>
                    <div className="absolute bottom-12 right-8 text-3xl animate-pulse">🐝</div>
                  </>
                )}

                {post.decoration === 'confetti' && (
                  <>
                    {/* Confetti */}
                    <div className="absolute top-4 left-10 text-2xl rotate-12">🎉</div>
                    <div className="absolute top-8 right-12 text-xl -rotate-12">🎊</div>
                    <div className="absolute top-20 left-6 text-lg rotate-45">✨</div>
                    <div className="absolute top-16 right-8 text-xl -rotate-20">🎊</div>
                    <div className="absolute bottom-20 left-8 text-2xl rotate-30">🎉</div>
                    <div className="absolute bottom-16 right-10 text-lg -rotate-45">✨</div>
                    <div className="absolute bottom-8 left-16 text-xl rotate-12">🎊</div>
                    {/* Trophy */}
                    <div className="absolute top-28 left-1/2 -translate-x-1/2 text-7xl">🏆</div>
                    {/* Money */}
                    <div className="absolute bottom-28 right-12 text-3xl">💰</div>
                    <div className="absolute bottom-24 left-12 text-2xl">💵</div>
                    {/* Bee with trophy */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl">🐝</div>
                  </>
                )}

                {post.decoration === 'bees' && (
                  <>
                    {/* Multiple bees flying together */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl">🐝🐝🐝🐝🐝</div>
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 text-3xl">🐝🐝🐝🐝</div>
                    <div className="absolute top-28 left-1/2 -translate-x-1/2 text-2xl">🐝🐝🐝</div>
                    <div className="absolute top-34 left-1/2 -translate-x-1/2 text-xl">🐝🐝</div>
                    {/* Heart */}
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-6xl animate-pulse">💛</div>
                    {/* Individual bees */}
                    <div className="absolute bottom-12 left-8 text-3xl animate-bounce">🐝</div>
                    <div className="absolute bottom-8 right-8 text-3xl animate-pulse">🐝</div>
                    {/* Venezuela flag */}
                    <div className="absolute top-6 right-6 text-3xl">🇻🇪</div>
                  </>
                )}

                {/* Main Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  {/* Main emoji for some posts */}
                  <div className="text-6xl mb-4 drop-shadow-lg">
                    {post.emoji}
                  </div>
                  
                  {/* Main text */}
                  <h2 className="text-3xl font-black text-white drop-shadow-lg mb-3 leading-tight"
                      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    {post.mainText}
                  </h2>
                  
                  {/* Sub text */}
                  <p className="text-xl font-bold text-white/90 drop-shadow"
                     style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    {post.subText}
                  </p>
                </div>

                {/* Logo watermark */}
                <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-bold text-white">@clubdelacolmena</span>
                </div>
              </div>

              {/* Label */}
              <div className="mt-4 text-center">
                <p className="text-white font-semibold text-lg">Post {post.id}: {post.title}</p>
                <p className="text-gray-400 text-sm">400x400px - Formato cuadrado Instagram</p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-amber-400 mb-4">📱 Cómo guardar los posts:</h3>
          <ol className="text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Haz clic derecho sobre el post que te guste</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Selecciona &quot;Guardar imagen como...&quot; o usa una herramienta de captura</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>¡Sube a tu Instagram y comparte con la comunidad!</span>
            </li>
          </ol>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/" className="text-amber-400 hover:text-amber-300 font-semibold">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
