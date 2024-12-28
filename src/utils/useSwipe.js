import {TouchEvent, useState} from "react";

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

  const minSwipeDistance = 100;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    e.preventDefault();
  }

  const onTouchMove = (e: TouchEvent) => {
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
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      input.onSwipedLeft();
    }
    if (isRightSwipe) {
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
