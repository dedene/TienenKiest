'use client';

import { trpc } from '@/lib/trpc';
import { cn, DEFAULT_COLOR } from '@/lib/utils';
import checkAnimation from '@/lottie/check.json';
import nopeAnimation from '@/lottie/nope.json';
import waitingAnimation from '@/lottie/waiting.json';
import { motion, AnimatePresence } from 'framer-motion';
import { flatten } from 'lottie-colorify';
import Lottie from 'lottie-react';
import localFont from 'next/font/local';
import { useState, useEffect, useRef, useMemo } from 'react';
import GaugeComponent from 'react-gauge-component';

const pixelfont = localFont({
  src: './pixelfont.ttf',
});

// Function to determine if text should be light or dark based on background color
const getContrastColor = (hexColor: string): string => {
  // Default to black if no color provided
  if (!hexColor) return '#000000';

  // Convert hex to RGB
  let r = 0,
    g = 0,
    b = 0;

  // 3 digits
  if (hexColor.length === 4) {
    r = parseInt(hexColor[1] + hexColor[1], 16);
    g = parseInt(hexColor[2] + hexColor[2], 16);
    b = parseInt(hexColor[3] + hexColor[3], 16);
  }
  // 6 digits
  else if (hexColor.length === 7) {
    r = parseInt(hexColor.slice(1, 3), 16);
    g = parseInt(hexColor.slice(3, 5), 16);
    b = parseInt(hexColor.slice(5, 7), 16);
  }

  // Calculate luminance (perceived brightness)
  // Using the formula from WCAG 2.0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.5) {
    // For light backgrounds, darken the color
    const darkR = Math.max(0, Math.floor(r * 0.3))
      .toString(16)
      .padStart(2, '0');
    const darkG = Math.max(0, Math.floor(g * 0.3))
      .toString(16)
      .padStart(2, '0');
    const darkB = Math.max(0, Math.floor(b * 0.3))
      .toString(16)
      .padStart(2, '0');
    return `#${darkR}${darkG}${darkB}`;
  } else {
    // For dark backgrounds, lighten the color
    const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.8))
      .toString(16)
      .padStart(2, '0');
    const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.8))
      .toString(16)
      .padStart(2, '0');
    const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.8))
      .toString(16)
      .padStart(2, '0');
    return `#${lightR}${lightG}${lightB}`;
  }
};

const ArrowDown = ({ color }: { color: string }) => {
  return (
    <div className="">
      <svg viewBox="0 0 75 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          className="transition-all"
          d="M37.495 30L0 8.7251H14.1338V0H60.8662V8.7251H75L37.495 30Z"
          fill={color ?? '#98A1AE'}
        />
      </svg>
    </div>
  );
};

// Skeleton component for loading state
const SkeletonVoteOption = () => {
  return (
    <div className="flex-1 flex flex-col items-center p-4 gap-3">
      <div className="bg-gray-300 rounded-lg w-full h-16 animate-pulse" />
      <div className="bg-gray-300 rounded-lg w-full h-16 animate-pulse" />
      <div className="w-full flex justify-center mt-2">
        <div className="w-full opacity-30">
          <ArrowDown color={DEFAULT_COLOR} />
        </div>
      </div>
    </div>
  );
};

const WaitingAnimation = ({ color }: { color: string }) => {
  const lottieColor = useMemo(() => {
    return getContrastColor(color);
  }, [color]);

  const animationData = useMemo(() => {
    return flatten(lottieColor, waitingAnimation);
  }, [lottieColor]);

  return (
    <div className="scale-200 translate-y-[-25px] translate-x-[5px]">
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

const NopeAnimation = ({ color }: { color: string }) => {
  const lottieColor = useMemo(() => {
    return getContrastColor(color);
  }, [color]);

  const animationData = useMemo(() => {
    return flatten(lottieColor, nopeAnimation);
  }, [lottieColor]);

  return (
    <>
      <div
        className="absolute top-[20px] w-full left-1/2 -translate-x-1/2 text-3xl font-bold uppercase tracking-[2px]"
        style={{ color: lottieColor }}
      >
        Geen peuk herkend
      </div>
      <div className="scale-70 translate-y-[20px]">
        <Lottie animationData={animationData} loop={true} />
      </div>
    </>
  );
};

const DetectedAnimation = ({ color }: { color: string }) => {
  const lottieColor = useMemo(() => {
    return getContrastColor(color);
  }, [color]);

  const animationData = useMemo(() => {
    return flatten(lottieColor, checkAnimation);
  }, [lottieColor]);

  return (
    <div className="scale-60 translate-y-[-5px]">
      <Lottie animationData={animationData} loop={1} />
    </div>
  );
};

interface VoteOptionProps {
  count: number;
  text: string;
  isAnimating: boolean;
  isProcessing?: boolean;
  isDetected?: boolean;
  isWrong?: boolean;
  contentVariants: {
    hidden: { opacity: number };
    visible: {
      opacity: number;
      transition: { duration: number };
    };
    exit: {
      opacity: number;
      transition: { duration: number };
    };
  };
  color: string;
}

const VoteOption = ({
  count,
  isProcessing,
  isDetected,
  isWrong,
  text,
  isAnimating,
  contentVariants,
  color,
}: VoteOptionProps) => {
  // Memoize the contrast color and only update it when not animating
  const [currentContrastColor, setCurrentContrastColor] = useState(() => getContrastColor(color));

  // Update contrast color only when animation is complete or on initial render
  useEffect(() => {
    if (!isAnimating) {
      setCurrentContrastColor(getContrastColor(color));
    }
  }, [color, isAnimating]);

  return (
    <div className="flex-1 flex flex-col items-center p-4 gap-3">
      {isProcessing || isWrong ? (
        <div
          className="bg-gray-400 relative rounded-lg w-full text-center pt-4 p-1 min-h-55 h-55 flex items-center justify-center transition-all"
          style={{ backgroundColor: color }}
        >
          {isProcessing ? <WaitingAnimation color={color} /> : <NopeAnimation color={color} />}
        </div>
      ) : (
        <>
          <div
            className="bg-gray-400 rounded-lg w-full text-center pt-4 p-1 min-h-26 h-26 flex items-center justify-center transition-all"
            style={{ backgroundColor: color }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`count-${count}`}
                className="text-7xl font-bold tracking-[2px]"
                style={{ color: currentContrastColor }}
                variants={contentVariants}
                initial="hidden"
                animate={isAnimating ? 'exit' : 'visible'}
                exit="exit"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </div>
          <div
            className="bg-gray-400 rounded-lg w-full text-center pt-4 p-1 min-h-26 h-26 flex items-center justify-center transition-all"
            style={{ backgroundColor: color }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`text-${text}`}
                className="text-6xl font-bold tracking-[2px]"
                style={{ color: currentContrastColor }}
                variants={contentVariants}
                initial="hidden"
                animate={isAnimating ? 'exit' : 'visible'}
                exit="exit"
              >
                {text.toUpperCase()}
              </motion.span>
            </AnimatePresence>
          </div>
        </>
      )}
      <div className="w-full flex justify-center mt-2">
        <div className="w-full relative">
          {isDetected && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <DetectedAnimation color={color} />
            </div>
          )}
          <ArrowDown color={color} />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  // Keep track of last data update time
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Create a direct query to fetch active question (for fallback)
  const { data: activeQuestionQueryData, refetch: refetchQuestion } =
    trpc.questions.getAll.useQuery(
      { activeOnly: true },
      {
        enabled: true, // Run on mount to get initial data quickly
      }
    );

  // Set loading state when data is received
  useEffect(() => {
    if (activeQuestionQueryData) {
      setIsLoading(false);
    }
  }, [activeQuestionQueryData]);

  // State for displayed data
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [answer1Text, setAnswer1Text] = useState('');
  const [answer1Count, setAnswer1Count] = useState(0);
  const [answer1Color, setAnswer1Color] = useState('');
  const [answer2Text, setAnswer2Text] = useState('');
  const [answer2Count, setAnswer2Count] = useState(0);
  const [answer2Color, setAnswer2Color] = useState('');
  const [gaugeValue, setGaugeValue] = useState(50); // For the gauge component

  // State for tracking question changes
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // State for vote option statuses
  const [answer1Status, setAnswer1Status] = useState<number>(0);
  const [answer2Status, setAnswer2Status] = useState<number>(0);

  // Subscribe to counter updates separately
  trpc.subscriptions.counterUpdates.useSubscription(undefined, {
    onData: (data) => {
      console.log('Received counter update:', data);
      lastUpdateTimeRef.current = Date.now();

      // Check if this counter update is for the current question
      if (lastQuestionId && data.answerId.startsWith(lastQuestionId)) {
        // Refetch the question to get updated counts
        refetchQuestion();
      }
    },
    onError: (error) => {
      console.error('Counter subscription error:', error);
    },
  });

  // Subscribe to status updates
  trpc.subscriptions.statusUpdates.useSubscription(undefined, {
    onData: (data) => {
      console.log('Received status update:', data);
      lastUpdateTimeRef.current = Date.now();

      // Check if this status update is for the current question
      if (lastQuestionId && data.answerId.startsWith(lastQuestionId)) {
        // Update the corresponding status
        if (data.answerId.endsWith('answer1')) {
          setAnswer1Status(data.status);
        } else if (data.answerId.endsWith('answer2')) {
          setAnswer2Status(data.status);
        }
      }
    },
    onError: (error) => {
      console.error('Status subscription error:', error);
    },
  });

  // Subscribe to active question updates
  trpc.subscriptions.activeQuestion.useSubscription(undefined, {
    onData: (data) => {
      console.log('Received active question data:', data);
      lastUpdateTimeRef.current = Date.now();

      // Mark as not loading once we have data
      if (isLoading) {
        setIsLoading(false);
      }

      // If the question ID has changed, trigger transition effect
      if (lastQuestionId && lastQuestionId !== data.id) {
        console.log('Question changed from', lastQuestionId, 'to', data.id);

        // Force an immediate query refetch to get the most up-to-date data
        refetchQuestion().then(() => {
          console.log('Refetched question data after change');
        });

        setIsAnimating(true);
        updateDisplayedData({
          question: data.question,
          answer1Text: data.answer1Text,
          answer1Count: data.answer1Count,
          answer1Color: data.answer1Color,
          answer2Text: data.answer2Text,
          answer2Count: data.answer2Count,
          answer2Color: data.answer2Color,
        });
      } else {
        // If it's just a counter update or the first load, update immediately
        updateDisplayedData({
          question: data.question,
          answer1Text: data.answer1Text,
          answer1Count: data.answer1Count,
          answer1Color: data.answer1Color,
          answer2Text: data.answer2Text,
          answer2Count: data.answer2Count,
          answer2Color: data.answer2Color,
        });
      }

      // Store the current question ID for comparing on next update
      setLastQuestionId(data.id);
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  });

  // Update local state with new question data
  const updateDisplayedData = (data: {
    question: string;
    answer1Text: string;
    answer1Count: number;
    answer1Color?: string; // Make optional since it might not be in the subscription data
    answer2Text: string;
    answer2Count: number;
    answer2Color?: string; // Make optional since it might not be in the subscription data
  }) => {
    setDisplayedQuestion(data.question);
    setAnswer1Text(data.answer1Text);
    setAnswer1Count(data.answer1Count);
    if (data.answer1Color) setAnswer1Color(data.answer1Color);
    setAnswer2Text(data.answer2Text);
    setAnswer2Count(data.answer2Count);
    if (data.answer2Color) setAnswer2Color(data.answer2Color);

    // Calculate gauge value (0-100 scale)
    // Using a non-linear function to make small differences less pronounced
    const total = data.answer1Count + data.answer2Count;

    // Default to center if no votes
    if (total === 0) {
      setGaugeValue(50);
    } else {
      // Apply a sigmoid-like function to make small differences less pronounced
      // and large differences more pronounced
      // This function will:
      // - Keep values closer to 50% when vote counts are small or differences are small
      // - Move more dramatically toward extremes as total votes or differences increase

      // Calculate normalized vote difference (-1 to 1 range)
      const difference = (data.answer2Count - data.answer1Count) / total;

      // Apply scaling based on total votes (smaller effect with fewer votes)
      const voteScalingFactor = Math.min(1, Math.log10(total + 1) / 2);

      // Calculate dampened difference
      const dampedDifference = difference * voteScalingFactor;

      // Convert to gauge value (0-100 range)
      const adjustedValue = 50 + dampedDifference * 50;

      setGaugeValue(adjustedValue);
    }
  };

  // Set initial data from query
  useEffect(() => {
    if (activeQuestionQueryData && activeQuestionQueryData.length > 0) {
      const question = activeQuestionQueryData[0];
      console.log('Received active question from direct query:', question);

      // Only update if different question or first load
      if (!lastQuestionId || lastQuestionId !== question.id) {
        console.log('Updating from query with question ID:', question.id);

        if (lastQuestionId) {
          // Use transition effect for question changes
          setIsAnimating(true);
          updateDisplayedData({
            question: question.text,
            answer1Text: question.answer1Text,
            answer1Count: question.answer1Count,
            answer1Color: question.answer1Color,
            answer2Text: question.answer2Text,
            answer2Count: question.answer2Count,
            answer2Color: question.answer2Color,
          });
          setLastQuestionId(question.id);
        } else {
          // First load, no transition
          updateDisplayedData({
            question: question.text,
            answer1Text: question.answer1Text,
            answer1Count: question.answer1Count,
            answer1Color: question.answer1Color,
            answer2Text: question.answer2Text,
            answer2Count: question.answer2Count,
            answer2Color: question.answer2Color,
          });
          setLastQuestionId(question.id);
        }
      } else {
        // Same question but maybe updated counts
        updateDisplayedData({
          question: question.text,
          answer1Text: question.answer1Text,
          answer1Count: question.answer1Count,
          answer1Color: question.answer1Color,
          answer2Text: question.answer2Text,
          answer2Count: question.answer2Count,
          answer2Color: question.answer2Color,
        });
      }
    }
  }, [activeQuestionQueryData, lastQuestionId]);

  // Handle initialization and reconnection
  useEffect(() => {
    console.log('Initializing home page subscriptions');

    // Immediate refetch to get the latest data
    refetchQuestion();

    // Set up a periodic refetch as a fallback
    const interval = setInterval(() => {
      refetchQuestion();
    }, 30000); // 30-second fallback

    return () => clearInterval(interval);
  }, [refetchQuestion]);

  // Animation complete handler
  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  // Define animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <main
      className={cn(
        'flex min-h-screen flex-col items-center justify-center p-0 bg-gray-200',
        pixelfont.className
      )}
    >
      <div className="vote-card w-full mx-auto flex-grow flex flex-col max-h-[800px]">
        {/* Header */}
        <div className="bg-gray-300 p-3 text-center border-b-2 border-blue-900">
          <h2 className="text-xl md:text-3xl font-bold text-black uppercase tracking-[2px]">
            Stem met je sigarettenpeuk
          </h2>
        </div>

        {/* Main Question */}
        <div className="bg-green-100 p-6 md:p-8 flex flex-grow items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayedQuestion}
              variants={contentVariants}
              initial="hidden"
              animate={isAnimating ? 'exit' : 'visible'}
              exit="exit"
              onAnimationComplete={handleAnimationComplete}
            >
              <h1 className="text-3xl md:text-6xl font-bold text-center text-black leading-13 text-balance uppercase tracking-[4px]">
                {isLoading ? 'Laden...' : displayedQuestion}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Vote Counter and Options */}
        <div className="flex flex-row bg-gray-300 h-[433px]">
          {/* Left Option */}
          {isLoading ? (
            <SkeletonVoteOption />
          ) : (
            <VoteOption
              count={answer1Count}
              text={answer1Text}
              isAnimating={isAnimating}
              contentVariants={contentVariants}
              color={answer1Color}
              isProcessing={answer1Status === 1}
              isDetected={answer1Status === 2}
              isWrong={answer1Status === 3}
            />
          )}

          {/* Center Gauge */}
          <div className="flex-1 flex justify-center py-4">
            <div className="w-full mx-auto">
              {isLoading ? (
                <div className="h-55 bg-gray-300 rounded-full animate-pulse" />
              ) : (
                <div className="bg-white/50 flex w-full h-55 rounded-xl items-center justify-center">
                  <GaugeComponent
                    id="gauge-component"
                    type="semicircle"
                    style={{ width: '100%' }}
                    value={gaugeValue}
                    minValue={0}
                    maxValue={100}
                    arc={{
                      colorArray: [answer1Color, answer2Color],
                      nbSubArcs: 50,
                      padding: 0.01,
                      width: 0.4,
                    }}
                    pointer={{
                      type: 'needle',
                      color: '#464A4F',
                      baseColor: '#464A4F',
                      length: 0.8,
                      width: 15,
                      animate: true,
                      animationDuration: 1000,
                      elastic: true,
                    }}
                    labels={{
                      valueLabel: { hide: true },
                      tickLabels: { hideMinMax: true, ticks: [] },
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Option */}
          {isLoading ? (
            <SkeletonVoteOption />
          ) : (
            <VoteOption
              count={answer2Count}
              text={answer2Text}
              isAnimating={isAnimating}
              contentVariants={contentVariants}
              color={answer2Color}
              isProcessing={answer2Status === 1}
              isDetected={answer2Status === 2}
              isWrong={answer2Status === 3}
            />
          )}
        </div>
      </div>
    </main>
  );
}
