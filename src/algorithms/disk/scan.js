export function scan(requests, initialHead, maxTrack = 200, direction = 'up') {
  const states = [];
  let currentHead = initialHead;
  let totalSeek = 0;
  let remainingRequests = [...requests];
  let completed = [];
  let path = [initialHead];
  

  let sortedRequests = [...requests].sort((a, b) => a - b);
  let left = sortedRequests.filter(r => r < initialHead);
  let right = sortedRequests.filter(r => r >= initialHead);

  const sequence = [];
  if (direction === 'up') {
    sequence.push(...right);
    if (left.length > 0) {
      sequence.push(maxTrack);
      sequence.push(...left.reverse());
    }
  } else {
    sequence.push(...left.reverse());
    if (right.length > 0) {
      sequence.push(0);
      sequence.push(...right);
    }
  }

  const totalSteps = sequence.length;

  states.push({
    currentHead,
    queue: [...remainingRequests],
    completed: [...completed],
    totalSeek,
    targetTrack: null,
    moveDistance: 0,
    path: [...path],
    totalSteps
  });

  for (let target of sequence) {
    const moveDistance = Math.abs(target - currentHead);
    totalSeek += moveDistance;
    currentHead = target;
    
    // 如果是有效请求点（不是边界折返点），则更新队列
    if (remainingRequests.includes(target)) {
      const idx = remainingRequests.indexOf(target);
      remainingRequests.splice(idx, 1);
      completed.push(target);
    }

    path.push(target);

    states.push({
      currentHead,
      queue: [...remainingRequests],
      completed: [...completed],
      totalSeek,
      targetTrack: target,
      moveDistance,
      path: [...path],
      totalSteps,
      cppLine: 29,
      pythonLine: 21,
      description: `磁头向 ${direction === 'up' ? '高' : '低'} 磁道移动：到达磁道 ${target}，寻道距离 ${moveDistance}`
    });
  }

  return states;
}