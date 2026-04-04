import React, { useState, useEffect, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Helper function to extract number, prefix, and suffix
const parseValue = (strValue) => {
  if (!strValue) return { number: 0, prefix: '', suffix: '' };
  const str = String(strValue);
  const numMatch = str.match(/(\d+(\.\d+)?)/);
  const number = numMatch ? parseFloat(numMatch[1]) : 0;
  const prefix = numMatch ? str.substring(0, numMatch.index) : '';
  const suffix = numMatch ? str.substring(numMatch.index + numMatch[1].length) : str;
  return { number, prefix, suffix };
};

const Card = ({
  title = "This Month",
  amount = "0",       // e.g., "₹18.5L"
  percentage = 0,     // progress
  statusText = "",    // trend text
  isDecrease = false, // trend type
  icon: LucideIcon,
  color = '#700174',
  iconBg = '#F3E8FF',
  className = ''
}) => {
  const isIncrease = !isDecrease;
  const targetProgress = Math.abs(percentage);

  // --- Animation for Progress Bar ---
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progressBarAnimationFrameId = useRef(null);

  useEffect(() => {
    const animateProgressBar = (currentTime) => {
      if (!progressBarStartTime.current) progressBarStartTime.current = currentTime;
      const elapsedTime = currentTime - progressBarStartTime.current;
      const progressFraction = Math.min(elapsedTime / progressBarDuration, 1);
      const currentAnimatedValue = progressBarStart + (progressBarEnd - progressBarStart) * progressFraction;

      setAnimatedProgress(currentAnimatedValue);

      if (progressFraction < 1) {
        progressBarAnimationFrameId.current = requestAnimationFrame(animateProgressBar);
      }
    };

    let progressBarStart = 0;
    const progressBarEnd = targetProgress;
    const progressBarDuration = 800; // Animation duration for progress bar
    const progressBarStartTime = { current: null };

    if (targetProgress > 0) {
      progressBarAnimationFrameId.current = requestAnimationFrame(animateProgressBar);
    } else {
      setAnimatedProgress(0);
    }

    return () => {
      if (progressBarAnimationFrameId.current) {
        cancelAnimationFrame(progressBarAnimationFrameId.current);
      }
    };
  }, [targetProgress]);

  // --- Animation for Count Value ---
  const { number: targetCountNumber, prefix, suffix } = parseValue(amount);
  const [animatedCount, setAnimatedCount] = useState(0);
  const countAnimationFrameId = useRef(null);

  useEffect(() => {
    const animateCount = (currentTime) => {
      if (!countStartTime.current) countStartTime.current = currentTime;
      const elapsedTime = currentTime - countStartTime.current;
      const countFraction = Math.min(elapsedTime / countDuration, 1);
      const currentAnimatedCount = countStart + (targetCountNumber - countStart) * countFraction;

      setAnimatedCount(currentAnimatedCount);

      if (countFraction < 1) {
        countAnimationFrameId.current = requestAnimationFrame(animateCount);
      }
    };

    let countStart = 0;
    const countDuration = 1200;
    const countStartTime = { current: null };

    if (targetCountNumber > 0) {
      countAnimationFrameId.current = requestAnimationFrame(animateCount);
    } else {
      setAnimatedCount(0);
    }

    return () => {
      if (countAnimationFrameId.current) {
        cancelAnimationFrame(countAnimationFrameId.current);
      }
    };
  }, [targetCountNumber]);

  const displayAnimatedCount = `${prefix}${Number.isInteger(targetCountNumber)
    ? Math.round(animatedCount)
    : animatedCount.toFixed(1)
    }${suffix}`;

  return (
    <div className={`bg-white font-dm-sans rounded-2xl p-5 shadow-sm border-4 border-gray-100 relative overflow-hidden flex flex-col gap-4 h-full ${className}`}>
      {/* Right side colored border */}
      <div
        className="absolute right-[-7px] top-14 bottom-0 w-4 h-[50%] rounded-full bg-gradient-to-b from-[#7E1080] to-[#FAB800]"
      />

      <div className="flex justify-between items-start">
        {/* Icon Container */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {LucideIcon && <LucideIcon size={24} color={color} />}
        </div>

        {/* Circular Progress Bar */}
        <div className="w-16 h-16 relative font-bold mr-2">
          <CircularProgressbar
            value={animatedProgress}
            text={`${isIncrease ? '+' : '-'}${Math.round(animatedProgress)}%`}
            styles={buildStyles({
              textSize: '18px',
              pathColor: '#7E1080',
              trailColor: '#FAB800',
              strokeLinecap: 'butt',
            })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-black font-dm-sans font-semibold text-[17px] tracking-tight">{title}</span>
        <span className="text-[28px] font-semibold text-black leading-none">{displayAnimatedCount}</span>
      </div>

      <div className="mt-auto">
        <p className={`text-[10px] font-dm-sans font-semibold ${isIncrease ? 'text-[#377A27]' : 'text-[#FF0900]'}`}>
          {statusText}
        </p>
      </div>
    </div>
  );
};

export default Card;