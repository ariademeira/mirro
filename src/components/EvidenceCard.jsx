import ConfidenceIndicator from './ConfidenceIndicator'
import Disclaimer from './Disclaimer'
import { insightFormat } from '../config'

export default function EvidenceCard({ insight, format = insightFormat }) {
  const { content, confidence_score, insight_type } = insight

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-medium uppercase tracking-wide ${typeColor(insight_type)}`}>
          {insight_type}
        </span>
        <ConfidenceIndicator score={confidence_score} />
      </div>

      {format === 'three-layer' && <ThreeLayer content={content} />}
      {format === 'insight-only' && <InsightOnly content={content} />}
      {format === 'suggestion-only' && <SuggestionOnly content={content} />}

      <Disclaimer />
    </div>
  )
}

function ThreeLayer({ content }) {
  return (
    <div className="space-y-2">
      {content.pattern && (
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Finding</span>
          <p className="text-sm text-gray-800 mt-0.5">{content.pattern}</p>
        </div>
      )}
      {content.interpretation && (
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interpretation</span>
          <p className="text-sm text-gray-600 mt-0.5">{content.interpretation}</p>
        </div>
      )}
      {content.suggestion && (
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggestion</span>
          <p className="text-sm text-blue-700 mt-0.5">{content.suggestion}</p>
        </div>
      )}
      {content.evidence && (
        <p className="text-xs text-gray-400 italic">Evidence: {content.evidence}</p>
      )}
    </div>
  )
}

function InsightOnly({ content }) {
  return (
    <div className="space-y-2">
      {content.pattern && <p className="text-sm text-gray-800">{content.pattern}</p>}
      {content.evidence && (
        <p className="text-xs text-gray-400 italic">Evidence: {content.evidence}</p>
      )}
    </div>
  )
}

function SuggestionOnly({ content }) {
  return (
    <div className="space-y-2">
      {content.suggestion && (
        <p className="text-sm text-blue-700 font-medium">{content.suggestion}</p>
      )}
      {content.pattern && (
        <p className="text-xs text-gray-500">Based on: {content.pattern}</p>
      )}
    </div>
  )
}

function typeColor(type) {
  return {
    pattern:     'text-blue-600',
    strength:    'text-green-600',
    friction:    'text-amber-600',
    opportunity: 'text-purple-600',
  }[type] || 'text-gray-600'
}
