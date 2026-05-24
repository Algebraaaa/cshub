export function sstf(requests, initialHead) {
  const states = [];
  let currentHead = initialHead;
  let totalSeek = 0;
  let remainingRequests = [...requests];
  let completed = [];
  let path = [initialHead];
  const totalSteps = requests.length;

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

  while (remainingRequests.length > 0) {
    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < remainingRequests.length; i++) {
        const dist = Math.abs(remainingRequests[i] - currentHead);
        if (dist < minDistance) {
            minDistance = dist;
            closestIndex = i;
        }
    }

    const targetTrack = remainingRequests[closestIndex];
    totalSeek += minDistance;
    currentHead = targetTrack;

    remainingRequests.splice(closestIndex, 1);
    completed.push(targetTrack);
    path.push(targetTrack);

    states.push({
      currentHead,
      queue: [...remainingRequests],
      completed: [...completed],
      totalSeek,
      targetTrack: targetTrack,
      moveDistance: minDistance,
      path: [...path],
      totalSteps,
      cppLine: 16,
      pythonLine: 8,
      description: `选择最近磁道 ${targetTrack}：寻道距离 ${minDistance}，当前总寻道 ${totalSeek}`
    });
  }

  return states;
}
