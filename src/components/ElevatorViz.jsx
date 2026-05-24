import { useRef, useState, useEffect } from 'react';

export default function ElevatorViz({ state, maxTrack = 200 }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const currentHead = state?.currentHead ?? 0;
  const [displayedFloor, setDisplayedFloor] = useState(currentHead);
  const prevHeadRef = useRef(currentHead);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (currentHead !== prevHeadRef.current) {
      const start = prevHeadRef.current;
      const end = currentHead;
      const duration = 1000; // 与 CSS transition 一致的 1秒
      const startTime = performance.now();
      
      const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(start + (end - start) * easeInOutQuad(progress));
        setDisplayedFloor(current);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          prevHeadRef.current = end;
        }
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayedFloor(currentHead);
      prevHeadRef.current = currentHead;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [currentHead]);

  if (!state) return null;

  const { queue, completed, totalSeek, targetTrack, path, totalSteps, moveDistance } = state;
  const { width } = size;

  // Let's use a nice vertical layout.
  // We'll have two columns: Left for Building Shaft, Right for Time-Space Trace.
  const paddingY = 40;
  const paddingX = 40;
  
  // Height of the building visual and chart
  const visHeight = 400;

  // Building Shaft is on the left
  const getFloorY = (floor) => {
    // top is maxTrack, bottom is 0
    return paddingY + (1 - floor / maxTrack) * (visHeight - paddingY * 2);
  };

  // Time-Space Trace is on the right
  const getTraceX = (stepIndex) => {
    const traceTotalWidth = width - 180 - paddingX * 2; // 180 is shaft width reserved
    if (traceTotalWidth <= 0) return 0;
    const steps = totalSteps || (path ? path.length - 1 : 1);
    if (steps <= 0) return 0;
    return paddingX + (stepIndex / steps) * traceTotalWidth;
  };

  const theme = {
    bg: 'transparent',
    panel: 'var(--surface-2)',
    textMain: 'var(--text-primary)',
    textSub: 'var(--text-tertiary)',
    axis: 'var(--border)',
    primary: 'var(--accent)',
    highlight: 'var(--yellow)',
    warning: 'var(--red)',
    success: 'var(--green)'
  };

  const currentFloorY = getFloorY(currentHead);

  return (
    <div style={{ 
      padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 20, 
      background: theme.bg, color: theme.textMain, borderRadius: 16, 
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    }} ref={containerRef}>
      
      {/* 核心数据仪表盘：电梯显示 */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '16px 24px', background: theme.panel, borderRadius: 12, flex: 1, border: `1px solid ${theme.axis}` }}>
          <div style={{ fontSize: 13, color: theme.textSub, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Current Floor / 当前楼层</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 32, color: theme.primary, fontFamily: 'monospace', fontWeight: 'bold' }}>
              {displayedFloor}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 24px', background: theme.panel, borderRadius: 12, flex: 1, border: `1px solid ${theme.axis}` }}>
          <div style={{ fontSize: 13, color: theme.textSub, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Total Travel / 总运行距离</div>
          <div style={{ fontSize: 32, color: theme.highlight, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
            {totalSeek}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 24px', background: theme.panel, borderRadius: 12, flex: 1, border: `1px solid ${theme.axis}`, opacity: targetTrack !== null ? 1 : 0.3 }}>
          <div style={{ fontSize: 13, color: theme.textSub, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Target Floor / 目标楼层</div>
          <div style={{ fontSize: 32, color: theme.highlight, fontFamily: 'monospace', fontWeight: 'bold' }}>
            {targetTrack !== null ? targetTrack : '-'}
          </div>
          <div style={{ fontSize: 12, color: theme.textSub, marginTop: 4 }}>Distance: {targetTrack !== null ? moveDistance : 0}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, height: visHeight }}>
        
        {/* 左侧：电梯井与楼层 (Elevator Shaft) */}
        <div style={{ width: 140, position: 'relative', background: theme.panel, borderRadius: 12, border: `1px solid ${theme.axis}` }}>
          <div style={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: theme.textSub, letterSpacing: 1 }}>ELEVATOR SHAFT</div>
          <svg width="100%" height="100%">
            
            {/* 井道边缘 */}
            <line x1={40} y1={paddingY} x2={40} y2={visHeight - paddingY} stroke={theme.axis} strokeWidth={2} />
            <line x1={100} y1={paddingY} x2={100} y2={visHeight - paddingY} stroke={theme.axis} strokeWidth={2} />

            {/* 所有楼层刻度与标记 */}
            {Array.from({ length: maxTrack + 1 }).map((_, floor) => (
               <g key={`floor-tick-${floor}`}>
                 {/* 刻度线 */}
                 <line x1={40} y1={getFloorY(floor)} x2={45} y2={getFloorY(floor)} stroke={theme.axis} strokeWidth={1} />
                 <line x1={95} y1={getFloorY(floor)} x2={100} y2={getFloorY(floor)} stroke={theme.axis} strokeWidth={1} />
                 {/* 楼层数字：如果楼层数量较少全显，太多则隔层显示 */}
                 {(maxTrack <= 30 || floor % 5 === 0 || floor === maxTrack) && (
                   <text x={35} y={getFloorY(floor) + 3} fill={theme.textSub} fontSize={9} textAnchor="end">{floor}</text>
                 )}
               </g>
            ))}

            {/* 正在等待的楼层请求 (人/按钮) */}
            {(() => {
              const allPoints = Array.from(new Set([...queue, ...completed]));
              allPoints.sort((a, b) => a - b);
              
              return queue.map((req) => {
                const rank = allPoints.indexOf(req);
                const xOffset = rank % 2 === 0 ? 0 : 25;
                const textY = rank % 2 === 0 ? 4 : 4;
                
                return (
                  <g key={`req-${req}`} style={{ transition: 'all 0.5s', transform: `translate(0px, ${getFloorY(req)}px)` }}>
                    <rect x={18} y={-8} width={16} height={16} rx={4} fill={targetTrack === req ? theme.highlight : theme.warning} style={{ filter: targetTrack === req ? `drop-shadow(0 0 6px ${theme.highlight})` : 'none' }}/>
                    <text x={26} y={4} fill="#fff" fontSize={10} fontFamily="monospace" textAnchor="middle" fontWeight="bold">呼</text>
                    {/* 楼层标识 */}
                    <text x={105 + xOffset} y={textY} fill={targetTrack === req ? theme.highlight : theme.textMain} fontSize={12} textAnchor="start">
                      {xOffset > 0 && <tspan fill={theme.axis}>- </tspan>}{req}
                    </text>
                  </g>
                );
              });
            })()}

            {/* 轿厢 (Elevator Car) */}
            <g style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translate(70px, ${currentFloorY}px)` }}>
              {/* 缆绳 */}
              <line x1={0} y1={-visHeight} x2={0} y2={-15} stroke={theme.textSub} strokeWidth={2} strokeDasharray="4 4" />
              {/* 轿厢本体 */}
              <rect x={-20} y={-15} width={40} height={30} rx={4} fill={theme.bg} stroke={theme.primary} strokeWidth={3} />
              {/* 里面发光 */}
              <rect x={-15} y={-10} width={13} height={20} fill={theme.primary} opacity={0.2} />
              <rect x={2} y={-10} width={13} height={20} fill={theme.primary} opacity={0.2} />
              <text x={0} y={4} fill={theme.primary} fontSize={14} fontWeight="bold" fontFamily="monospace" textAnchor="middle">{displayedFloor}</text>
            </g>
          </svg>
        </div>

        {/* 右侧：时空旅行轨迹 (Time-Space trace) */}
        <div style={{ flex: 1, position: 'relative', background: theme.panel, borderRadius: 12, border: `1px solid ${theme.axis}` }}>
          <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 11, color: theme.textSub, letterSpacing: 1 }}>TIME & SPACE TRACE</div>
          {width > 180 && (
            <svg width="100%" height="100%">
              {/* 背景楼层线 */}
              <line x1={paddingX} y1={getFloorY(0)} x2={width - 180 - paddingX} y2={getFloorY(0)} stroke={theme.axis} strokeWidth={1} strokeDasharray="4 4" />
              <line x1={paddingX} y1={getFloorY(maxTrack)} x2={width - 180 - paddingX} y2={getFloorY(maxTrack)} stroke={theme.axis} strokeWidth={1} strokeDasharray="4 4" />
              <text x={paddingX - 10} y={getFloorY(maxTrack) + 4} fill={theme.textSub} fontSize={10} textAnchor="end">{maxTrack}</text>
              <text x={paddingX - 10} y={getFloorY(0) + 4} fill={theme.textSub} fontSize={10} textAnchor="end">0</text>

              {/* 已经经过的轨迹 */}
              {path && path.length > 1 && (
                <polyline 
                  points={path.map((track, i) => `${getTraceX(i)},${getFloorY(track)}`).join(' ')}
                  fill="none" 
                  stroke={theme.primary} 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* 轨迹站靠点 */}
              {path && path.map((track, i) => (
                <g key={`p-${i}`} style={{ transition: 'all 0.5s', transform: `translate(${getTraceX(i)}px, ${getFloorY(track)}px)` }}>
                  <circle r={4.5} fill="var(--bg)" stroke={i === path.length - 1 ? theme.highlight : theme.primary} strokeWidth="2" />
                  <text y={i % 2 === 0 ? -10 : 16} fill={i === path.length - 1 ? theme.highlight : theme.textSub} fontSize={11} fontFamily="monospace" textAnchor="middle">
                    {track}
                  </text>
                </g>
              ))}

              {/* 预测的目标轨迹虚线 */}
              {targetTrack !== null && (
                <line 
                  x1={getTraceX(path.length - 1)} y1={getFloorY(currentHead)} 
                  x2={getTraceX(path.length)} y2={getFloorY(targetTrack)} 
                  stroke={theme.highlight} strokeWidth="2" strokeDasharray="6 6"
                  style={{ transition: 'all 0.5s' }}
                />
              )}
            </svg>
          )}
        </div>

      </div>

    </div>
  );
}
