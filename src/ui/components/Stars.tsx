/** Estrelas de uma fase (UI-STAR-EMPTY / UI-STAR-FULL, arte provisória). Texto alternativo para leitor de tela. */
export function Stars({ count, size = 28 }: { count: 0 | 1 | 2 | 3; size?: number }) {
  return (
    <span
      role="img"
      aria-label={count === 0 ? 'Sem estrelas ainda' : `${count} de 3 estrelas`}
      className="inline-flex gap-1"
      data-testid="stars"
      data-count={count}
    >
      {[1, 2, 3].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
            fill={i <= count ? '#e8731a' : '#ffffff'}
            stroke="#2b2118"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeDasharray={i <= count ? undefined : '3 2'}
          />
        </svg>
      ))}
    </span>
  )
}
