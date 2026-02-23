import { useRef } from 'react';
import { applyWheelSwitch } from '../logic';

interface UseWheelPageSwitchParams {
  isPagination: boolean;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const useWheelPageSwitch = ({
  isPagination,
  totalPages,
  setCurrentPage,
}: UseWheelPageSwitchParams) => {
  const wheelDeltaRef = useRef(0);

  return (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isPagination || totalPages <= 1) return;

    event.preventDefault();
    setCurrentPage((previous) => {
      const { nextPage, nextDelta } = applyWheelSwitch({
        currentPage: previous,
        totalPages,
        accumulatedDelta: wheelDeltaRef.current,
        deltaY: event.deltaY,
      });
      wheelDeltaRef.current = nextDelta;
      return nextPage;
    });
  };
};
