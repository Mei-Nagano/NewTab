import { useState, useLayoutEffect, type RefObject } from 'react';

interface Position {
    x: number;
    y: number;
}

export const useMenuPosition = (
    ref: RefObject<HTMLElement | null>,
    visible: boolean,
    x: number,
    y: number
): Position => {
    const [position, setPosition] = useState<Position>({ x, y });

    useLayoutEffect(() => {
        if (visible && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newX = x;
            let newY = y;

            // Horizontal overflow check
            if (x + rect.width > viewportWidth) {
                newX = viewportWidth - rect.width - 5;
            }

            // Vertical overflow check
            if (y + rect.height > viewportHeight) {
                newY = viewportHeight - rect.height - 5;
            }

            // Ensure not off-screen top/left
            if (newX < 5) newX = 5;
            if (newY < 5) newY = 5;

            setPosition({ x: newX, y: newY });
        }
    }, [visible, x, y, ref]);

    return position;
};
