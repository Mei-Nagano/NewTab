interface WheelSwitchInput {
  currentPage: number;
  totalPages: number;
  accumulatedDelta: number;
  deltaY: number;
  threshold?: number;
}

interface WheelSwitchResult {
  nextPage: number;
  nextDelta: number;
}

export const applyWheelSwitch = ({
  currentPage,
  totalPages,
  accumulatedDelta,
  deltaY,
  threshold = 40,
}: WheelSwitchInput): WheelSwitchResult => {
  if (totalPages <= 1) {
    return { nextPage: currentPage, nextDelta: 0 };
  }

  const mergedDelta = accumulatedDelta + deltaY;
  if (mergedDelta >= threshold) {
    return {
      nextPage: Math.min(totalPages - 1, currentPage + 1),
      nextDelta: 0,
    };
  }

  if (mergedDelta <= -threshold) {
    return {
      nextPage: Math.max(0, currentPage - 1),
      nextDelta: 0,
    };
  }

  return {
    nextPage: currentPage,
    nextDelta: mergedDelta,
  };
};

interface DragPageSwitchInput {
  edge: 'top' | 'bottom' | null;
  currentPage: number;
  totalPages: number;
}

export const getPageAfterDragEdge = ({
  edge,
  currentPage,
  totalPages,
}: DragPageSwitchInput): number => {
  if (edge === 'top') {
    return Math.max(0, currentPage - 1);
  }
  if (edge === 'bottom') {
    return Math.min(totalPages - 1, currentPage + 1);
  }
  return currentPage;
};
