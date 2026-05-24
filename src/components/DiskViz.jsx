import { useRef, useState, useEffect } from 'react';

export default function DiskViz({ state, maxTrack = 200 }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!state) return null;

  const { currentHead, queue, completed, totalSeek, targetTrack, path, totalSteps, moveDistance } = state;
  const padding = 50; 
  const chartHeight = Math.max(300, (totalSteps || 10) * 35); 

  const getX = (track) => {
    if (width === 0) return 0;
    const usableWidth = width - padding * 2;
    return padding + (track / maxTrack) * usableWidth;
  };

  const getY = (index) => {
    const paddingY = 30;
    const usableHeight = chartHeight - paddingY * 2;
    const steps = totalSteps || (path ? path.length - 1 : 1);
    if (steps === 0) return paddingY;
    return paddingY + (index / steps) * usableHeight;
  };

  // 融合网站亮/暗色主题，同时保留几何/数学直观感
  const theme = {
    bg: 'transparent',
    panel: 'var(--surface-2)',
    textMain: 'var(--text-primary)',
    textSub: 'var(--text-tertiary)',
    axis: 'var(--border)',
    cyan: 'var(--accent)',         
    yellow: 'var(--yellow)',
    pink: 'var(--red)',
    green: 'var(--green)'
  };

  const headX = getX(currentHead);

  return (
    <div style={{ 
      padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 20, 
      background: theme.bg, color: theme.textMain, borderRadius: 16, 
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    }} ref={containerRef}>
      
      {/* 核心数据仪表盘：极简数学排版 */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '16px 24px', background: theme.panel, borderRadius: 12, flex: 1, border: `1px solid ${theme.axis}` }}>
          <div style={{ fontSize: 13, color: theme.textSub, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Head Position / 磁头位置</div>
          <div style={{ fontSize: 32, color: theme.cyan, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
            {currentHead}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 24px', background: theme.panel, borderRadius: 12, flex: 1, border: `1px solid ${theme.axis}` }}>
          <div style={{ fontSize: 13, color: theme.textSub, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Total Distance / 总寻道距离</div>
          <div style={{ fontSize: 32, color: theme.yellow, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
            {totalSeek}
          </div>
        </div>
      </div>

      {/* 数学解释区 (注释与运算公式) */}
      <div style={{ textAlign: 'center', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: `1px solid ${theme.axis}`, borderRadius: 8 }}>
        {targetTrack !== null ? (
          <div style={{ fontSize: 16, fontFamily: 'Georgia, serif', letterSpacing: 1, color: theme.textMain }}>
            <span style={{ fontSize: 14, color: theme.textSub, marginRight: 15, fontFamily: 'sans-serif', fontStyle: 'normal' }}>正在寻道计算:</span>
            Distance = 
            <span style={{ margin: '0 8px', color: theme.textSub }}>|</span>
            <span style={{ color: theme.cyan, fontWeight: 'bold' }}>{targetTrack}</span> 
            <span style={{ margin: '0 8px' }}>-</span> 
            <span style={{ color: theme.textSub }}>{path[path.length - 2]}</span>
            <span style={{ margin: '0 8px', color: theme.textSub }}>|</span>
            = <span style={{ color: theme.yellow, fontWeight: 'bold' }}>{moveDistance}</span>
          </div>
        ) : (
          <div style={{ fontSize: 15, color: theme.textSub, fontFamily: 'Georgia, serif', letterSpacing: 1 }}>
            Initial State / 等待开始
          </div>
        )}
      </div>

      {/* 一维数轴 (几何轨迹) */}
      <div style={{ height: 120, position: 'relative', background: theme.panel, borderRadius: 12, border: `1px solid ${theme.axis}` }}>
        <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 12, color: theme.textSub, letterSpacing: 1 }}>1D TRACK GEOMETRY</div>
        {width > 0 && (
          <svg width="100%" height="100%">
            {/* 主数轴线 */}
            <line x1={padding} y1={70} x2={width - padding} y2={70} stroke={theme.axis} strokeWidth={2} />
            <path d={`M ${padding} 65 v 10 M ${width - padding} 65 v 10`} stroke={theme.axis} strokeWidth={2} />
            <text x={padding} y={95} fill={theme.textSub} fontSize={13} fontFamily="Georgia, serif" textAnchor="middle">0</text>
            <text x={width - padding} y={95} fill={theme.textSub} fontSize={13} fontFamily="Georgia, serif" textAnchor="middle">{maxTrack}</text>

            {/* 未处理的请求散点 */}
            {(() => {
              // 将所有出现过的磁道升序排序，用来根据名次计算交错的高度（避免相邻过近的数字重叠）
              const allPoints = Array.from(new Set([...queue, ...completed]));
              allPoints.sort((a, b) => a - b);

              return queue.map((req, i) => {
                // 利用排名决定标签文字在上方还是下方交错显示
                const rank = allPoints.indexOf(req);
                const textY = rank % 2 === 0 ? -16 : 24;

                return (
                  <g key={`q-${i}`} style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translate(${getX(req)}px, 70px)` }}>
                    <circle r={targetTrack === req ? 7 : 4} fill={targetTrack === req ? theme.yellow : theme.pink} 
                      style={{ filter: targetTrack === req ? `drop-shadow(0 0 6px ${theme.yellow})` : 'none' }} />
                    <text y={textY} fill={targetTrack === req ? theme.yellow : theme.textMain} fontSize={12} fontFamily="Georgia, serif" textAnchor="middle" opacity={targetTrack === req ? 1 : 0.7}>
                      {req}
                    </text>
                  </g>
                );
              });
            })()}

            {/* 已经经过的历史散点轨迹 */}
            {completed.map((req, i) => (
              <circle key={`c-${i}`} cx={getX(req)} cy={70} r={3} fill={theme.textSub} opacity={0.3} />
            ))}

            {/* 极简指示箭头（代表当前磁头） */}
            <g style={{ transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translate(${headX}px, 70px)` }}>
              <polygon points="-8,-24 8,-24 0,-4" fill={theme.cyan} />
              <text y={-32} fill={theme.cyan} fontSize={14} fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" textAnchor="middle">
                head
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* 二维时空图 (Time -> Space Trace) */}
      <div style={{ height: chartHeight + 40, background: theme.panel, borderRadius: 12, position: 'relative', border: `1px solid ${theme.axis}` }}>
        <div style={{ position: 'absolute', top: 15, left: 20, fontSize: 12, color: theme.textSub, letterSpacing: 1 }}>TIME & SPACE TRACE (SCHEDULING PATH)</div>
        {width > 0 && (
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* 纵向对齐的弱虚线 */}
            <line x1={padding} y1={0} x2={padding} y2={chartHeight + 40} stroke={theme.axis} strokeWidth={1} strokeDasharray="4 4" />
            <line x1={width - padding} y1={0} x2={width - padding} y2={chartHeight + 40} stroke={theme.axis} strokeWidth={1} strokeDasharray="4 4" />

            {/* 绘制实际运动过的路径 (青色连续折线) */}
            {path && path.length > 1 && (
              <polyline 
                points={path.map((track, i) => `${getX(track)},${getY(i)}`).join(' ')}
                fill="none" 
                stroke={theme.cyan} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'all 0.5s' }}
              />
            )}

            {/* 绘制历史驻留节点 */}
            {path && path.map((track, i) => (
              <g key={i} style={{ transition: 'all 0.5s', transform: `translate(${getX(track)}px, ${getY(i)}px)` }}>
                <circle r={4.5} fill="var(--bg)" stroke={i === path.length - 1 ? theme.yellow : theme.cyan} strokeWidth="2" />
                <text x={track > maxTrack / 2 ? -15 : 15} y={4} fill={i === path.length - 1 ? theme.yellow : theme.textSub} fontSize={12} fontFamily="Georgia, serif" textAnchor={track > maxTrack / 2 ? "end" : "start"}>
                  {track}
                </text>
              </g>
            ))}

            {/* 下一步的预测虚线，展示正在寻道的连接过程 */}
            {targetTrack !== null && (
              <line 
                x1={getX(currentHead)} y1={getY(path.length - 1)} 
                x2={getX(targetTrack)} y2={getY(path.length)} 
                stroke={theme.yellow} strokeWidth="2" strokeDasharray="6 6"
                style={{ transition: 'all 0.5s' }}
              />
            )}
          </svg>
        )}
      </div>

    </div>
  );
}
