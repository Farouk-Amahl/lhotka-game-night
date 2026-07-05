import {TouchEvent, useState} from "react";
const MIN_SWIPE = 100;

interface SwipeInput {
  onSwipedLeft: () => void,
  onSwipedRight: () => void,
  onSwiping?: (data: { dir: 'Left' | 'Right', absX: number }) => void,
  onSwipeEnd?: () => void
}

interface SwipeOutput {
  onTouchStart: (e: TouchEvent) => void,
  onTouchMove: (e: TouchEvent) => void,
  onTouchEnd: () => void
}

const useSwipe = (input: SwipeInput): SwipeOutput => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
    e.preventDefault();
    e.stopPropagation();
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    
    setTouchEnd(e.targetTouches[0].clientX);
    if (input.onSwiping) {
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - touchStart;
      input.onSwiping({
        dir: diff > 0 ? 'Right' : 'Left',
        absX: Math.abs(diff)
      });
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE;
    const isRightSwipe = distance < -MIN_SWIPE;

    if (isLeftSwipe) {
      input.onSwipedLeft();
    } else if (isRightSwipe) {
      input.onSwipedRight();
    } else if (input.onSwipeEnd) {
      input.onSwipeEnd();
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

export default useSwipe;
