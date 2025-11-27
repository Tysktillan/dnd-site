'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [clicks, setClicks] = useState<{ x: number; y: number; id: number }[]>([])

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    const handleClick = (e: MouseEvent) => {
      const id = Date.now()
      setClicks(prev => [...prev, { x: e.clientX, y: e.clientY, id }])

      // Remove click ripple after animation
      setTimeout(() => {
        setClicks(prev => prev.filter(click => click.id !== id))
      }, 1000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. The mists reject your passage.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      console.error(err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-stone-950 to-black cursor-none">
      {/* Custom cursor glow effect */}
      <div
        className="pointer-events-none fixed w-8 h-8 rounded-full bg-red-600/30 blur-xl transition-transform duration-75 ease-out z-50"
        style={{
          left: cursorPos.x - 16,
          top: cursorPos.y - 16,
        }}
      />
      <div
        className="pointer-events-none fixed w-3 h-3 rounded-full bg-red-400 border border-red-300/50 transition-transform duration-100 ease-out z-50"
        style={{
          left: cursorPos.x - 6,
          top: cursorPos.y - 6,
        }}
      />

      {/* Click ripple effects */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="pointer-events-none fixed w-4 h-4 rounded-full border-2 border-red-500/70 animate-ripple z-50"
          style={{
            left: click.x - 8,
            top: click.y - 8,
          }}
        />
      ))}
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-950/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-stone-900/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60"></div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[
          { left: '10%', top: '20%', delay: '0s', duration: '12s', size: '2px' },
          { left: '20%', top: '80%', delay: '2s', duration: '15s', size: '1px' },
          { left: '30%', top: '40%', delay: '4s', duration: '10s', size: '3px' },
          { left: '70%', top: '60%', delay: '1s', duration: '13s', size: '2px' },
          { left: '80%', top: '30%', delay: '3s', duration: '11s', size: '1px' },
          { left: '90%', top: '70%', delay: '5s', duration: '14s', size: '2px' },
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute bg-red-500/20 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          {/* Modern Header */}
          <div className="text-center mb-12 select-none">
            <div className="mb-8">
              <h1 className="text-7xl font-black tracking-tighter mb-3 relative inline-block">
                <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
                  BAROVIA
                </span>
                <div className="absolute -inset-8 bg-red-600/10 blur-3xl -z-10 animate-pulse"></div>
              </h1>
            </div>
            <div className="space-y-2">
              <p className="text-stone-400 text-sm tracking-[0.3em] uppercase font-light">Campaign Manager</p>
              <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
            </div>
          </div>

          {/* Login Card */}
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900/0 via-red-900/50 to-red-900/0 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative backdrop-blur-xl bg-gradient-to-br from-stone-950/90 via-black/90 to-stone-950/90 border border-red-950/30 rounded-3xl p-10 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Identity
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocused('username')}
                      onBlur={() => setFocused(null)}
                      className={`
                        bg-black/50 border-stone-800 text-stone-100 h-14 text-base
                        focus:border-red-800/60 focus:ring-2 focus:ring-red-900/20
                        placeholder:text-stone-600 rounded-xl
                        transition-all duration-300
                        ${focused === 'username' ? 'shadow-lg shadow-red-950/20' : ''}
                      `}
                      placeholder="Enter your identity..."
                      required
                      disabled={loading}
                    />
                    {focused === 'username' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Passphrase
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      className={`
                        bg-black/50 border-stone-800 text-stone-100 h-14 text-base
                        focus:border-red-800/60 focus:ring-2 focus:ring-red-900/20
                        placeholder:text-stone-600 rounded-xl
                        transition-all duration-300
                        ${focused === 'password' ? 'shadow-lg shadow-red-950/20' : ''}
                      `}
                      placeholder="Speak the words..."
                      required
                      disabled={loading}
                    />
                    {focused === 'password' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-950/30 border border-red-900/40 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-shake">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="group/btn relative w-full h-14 text-base font-medium bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:from-red-900 hover:via-red-800 hover:to-red-900 text-stone-100 rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-50"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-800/50 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-stone-400/30 border-t-stone-200 rounded-full animate-spin"></div>
                        <span>Entering...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Barovia</span>
                        <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Footer */}
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="mt-10 text-center select-none">
            <p className="text-stone-700 text-sm italic font-serif">
              &quot;The Devil Strahd awaits in the shadows...&quot;
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.6;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out forwards;
        }

        /* Force cursor none on all interactive elements in login page */
        .cursor-none * {
          cursor: none !important;
        }
      `}</style>
    </div>
  )
}
