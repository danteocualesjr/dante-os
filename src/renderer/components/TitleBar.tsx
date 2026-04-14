export default function TitleBar() {
  return (
    <div
      className="h-[52px] flex items-center justify-center shrink-0 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <span className="text-xs font-medium text-text-tertiary tracking-wide uppercase">
        Dante OS
      </span>
    </div>
  )
}
