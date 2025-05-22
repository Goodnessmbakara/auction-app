import { Loader2 } from "lucide-react"
import { Raleway, Poppins } from "next/font/google"

const raleway = Raleway({ subsets: ["latin"] })
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
})

interface LoadingStateProps {
  title: string
  description?: string
  variant?: 'default' | 'overlay'
  steps?: {
    current: number
    total: number
    steps: string[]
  }
}

export function LoadingState({ 
  title, 
  description, 
  variant = 'default',
  steps 
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#EC38BC]" />
      <h3 className={`${raleway.className} mt-4 text-lg font-semibold text-white`}>
        {title}
      </h3>
      {description && (
        <p className={`${poppins.className} mt-2 text-sm text-muted-foreground text-center max-w-sm`}>
          {description}
        </p>
      )}
      {steps && (
        <div className="mt-6 w-full max-w-sm">
          <div className="flex justify-between mb-2">
            <span className={`${poppins.className} text-sm text-[#EC38BC]`}>
              Step {steps.current} of {steps.total}
            </span>
            <span className={`${poppins.className} text-sm text-muted-foreground`}>
              {Math.round((steps.current / steps.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#1C043C]/50 rounded-full h-2">
            <div 
              className="bg-[#EC38BC] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(steps.current / steps.total) * 100}%` }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {steps.steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 ${
                  index + 1 === steps.current 
                    ? 'text-[#EC38BC]' 
                    : index + 1 < steps.current 
                    ? 'text-green-500' 
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${
                  index + 1 === steps.current 
                    ? 'bg-[#EC38BC] animate-pulse' 
                    : index + 1 < steps.current 
                    ? 'bg-green-500' 
                    : 'bg-muted-foreground'
                }`} />
                <span className={`${poppins.className} text-sm`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#1C043C] border border-[#EC38BC]/20 rounded-lg p-6 max-w-md w-full mx-4">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1C043C]/50 border border-[#EC38BC]/20 rounded-lg p-6">
      {content}
    </div>
  )
} 