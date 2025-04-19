'use client';

import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import GaugeComponent from 'react-gauge-component';

const ArrowDown = () => {
  return (
    <div className="">
      <svg viewBox="0 0 75 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37.495 40L0 11.6335H14.1338V0H60.8662V11.6335H75L37.495 40Z"
          fill="#98A1AE"
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
          <ArrowDown />
        </div>
      </div>
    </div>
  );
};

interface VoteOptionProps {
  count: number;
  text: string;
  isAnimating: boolean;
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

const VoteOption = ({ count, text, isAnimating, contentVariants }: VoteOptionProps) => {
  return (
    <div className="flex-1 flex flex-col items-center p-4 gap-3">
      <div className="bg-gray-400 rounded-lg w-full text-center p-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={`count-${count}`}
            className="text-5xl md:text-6xl font-bold text-gray-700"
            variants={contentVariants}
            initial="hidden"
            animate={isAnimating ? 'exit' : 'visible'}
            exit="exit"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="bg-gray-400 rounded-lg w-full text-center p-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={`text-${text}`}
            className="text-5xl md:text-6xl font-bold text-gray-700"
            variants={contentVariants}
            initial="hidden"
            animate={isAnimating ? 'exit' : 'visible'}
            exit="exit"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="w-full flex justify-center mt-2">
        <div className="w-full">
          <ArrowDown />
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-200">
      <div className="vote-card w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="bg-gray-300 p-3 text-center border-b-2 border-blue-900">
          <h2 className="text-xl md:text-2xl font-bold text-black">Stem met je sigarettenpeuk</h2>
        </div>

        {/* Main Question */}
        <div className="bg-green-100 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayedQuestion}
              variants={contentVariants}
              initial="hidden"
              animate={isAnimating ? 'exit' : 'visible'}
              exit="exit"
              onAnimationComplete={handleAnimationComplete}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-center text-black leading-tight text-balance">
                {isLoading ? 'Laden...' : displayedQuestion}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Vote Counter and Options */}
        <div className="flex flex-row bg-gray-300">
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
            />
          )}

          {/* Center Gauge */}
          <div className="flex-1 flex justify-center py-4">
            <div className="w-full mx-auto">
              {isLoading ? (
                <div className="h-28 bg-gray-300 rounded-full animate-pulse" />
              ) : (
                <div className="bg-white/50 flex w-full h-full rounded-xl items-center justify-center">
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
            />
          )}
        </div>
      </div>
    </main>
  );
}
