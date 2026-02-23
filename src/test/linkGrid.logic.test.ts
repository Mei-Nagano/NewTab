import { describe, expect, it } from 'vitest';
import { applyWheelSwitch, getPageAfterDragEdge } from '@/features/links/grid/logic';

describe('link grid logic', () => {
  it('applyWheelSwitch should increment page when threshold reached', () => {
    const result = applyWheelSwitch({
      currentPage: 0,
      totalPages: 5,
      accumulatedDelta: 30,
      deltaY: 20,
    });
    expect(result.nextPage).toBe(1);
    expect(result.nextDelta).toBe(0);
  });

  it('applyWheelSwitch should keep page when threshold not reached', () => {
    const result = applyWheelSwitch({
      currentPage: 2,
      totalPages: 5,
      accumulatedDelta: 10,
      deltaY: 10,
    });
    expect(result.nextPage).toBe(2);
    expect(result.nextDelta).toBe(20);
  });

  it('getPageAfterDragEdge should clamp within range', () => {
    expect(getPageAfterDragEdge({ edge: 'top', currentPage: 0, totalPages: 3 })).toBe(0);
    expect(getPageAfterDragEdge({ edge: 'bottom', currentPage: 2, totalPages: 3 })).toBe(2);
    expect(getPageAfterDragEdge({ edge: 'bottom', currentPage: 1, totalPages: 3 })).toBe(2);
  });
});
