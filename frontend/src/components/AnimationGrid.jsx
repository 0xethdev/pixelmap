import { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import pixelMap from '../hooks/animationSequence';

  const AnimationGrid = () => {
    const squareSize = 8; // Size of each square
    const gap = 1; // Gap between squares
    const gridSize = 64; // 100x100 grid
  
    return (
      <svg width="600" height="600">
        {Array.from({ length: gridSize * gridSize }, (_, i) => i).map((index) => {
          const x = (index % gridSize) * (squareSize + gap) + 12;
          const y = Math.floor(index / gridSize) * (squareSize + gap) + 12;
          const posX = (index % gridSize) + 1;
          const posY = Math.floor(index / gridSize) + 1;
          const key = `${posX}_${posY}`;

          return (
            <AnimatedPixel
              key={index}
              x={x}
              y={y}
              width={squareSize}
              height={squareSize}
              animationSequence={pixelMap[key] || []}  // Use the sequence from pixelMap if defined
            />
          );
        })}
      </svg>
    );
  };
  
    // Individual animated pixel component using react-spring
    const AnimatedPixel = ({ x, y, width, height, animationSequence }) => {
        // Initial color
        const initialColor = '#0F0F0F';
      
        // Use react-spring to animate the color transitions
        const [{ color }, api] = useSpring(() => ({ color: initialColor }));
    
        useEffect(() => {
            let cancel = false;
    
            // Define an async function to handle the animation sequence
            const runAnimationSequence = async () => {
                // Previous time to calculate the delay between steps
                let previousTime = 0;
    
                for (const { time, color: newColor } of animationSequence) {
                    // Calculate the delay for this step
                    const delay = time - previousTime;
    
                    // Wait for the delay before applying the new color
                    await new Promise(resolve => setTimeout(resolve, delay));
    
                    // Check if the component is still mounted before updating
                    if (!cancel) {
                        api.start({ color: newColor });
                        previousTime = time;
                    }
                }
            };
    
            // Run the animation sequence
            runAnimationSequence();
    
            // Cleanup function to set cancel flag
            return () => {
                cancel = true;
            };
        }, [animationSequence, api]);
    
        return (
          <animated.rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
          />
        );
    };
  
export default AnimationGrid;
