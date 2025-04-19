'use client';

import { trpc } from '@/trpc/client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  // Keep track of last data update time
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Create a direct query to fetch active question (for fallback)
  const { data: activeQuestionQueryData, refetch: refetchQuestion } =
    trpc.questions.getAll.useQuery(
      { activeOnly: true },
      {
        enabled: true, // Run on mount to get initial data quickly
        refetchInterval: 10000, // Refresh every 10 seconds as a fallback
      }
    );

  // State for displayed data
  const [displayedQuestion, setDisplayedQuestion] = useState('Laden...');
  const [answer1Text, setAnswer1Text] = useState('JA');
  const [answer1Count, setAnswer1Count] = useState(0);
  const [answer2Text, setAnswer2Text] = useState('NEEN');
  const [answer2Count, setAnswer2Count] = useState(0);
  const [needleRotation, setNeedleRotation] = useState(0);

  // State for tracking question changes
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

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

      // If the question ID has changed, trigger transition effect
      if (lastQuestionId && lastQuestionId !== data.id) {
        console.log('Question changed from', lastQuestionId, 'to', data.id);

        // Force an immediate query refetch to get the most up-to-date data
        refetchQuestion().then(() => {
          console.log('Refetched question data after change');
        });

        setIsFading(true);

        // After a short delay to allow fade out, update the displayed question data
        setTimeout(() => {
          updateDisplayedData(data);

          // Then fade back in
          setTimeout(() => {
            setIsFading(false);
          }, 100);
        }, 400);
      } else {
        // If it's just a counter update or the first load, update immediately
        updateDisplayedData(data);
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
    text: string;
    answer1Text: string;
    answer1Count: number;
    answer2Text: string;
    answer2Count: number;
  }) => {
    setDisplayedQuestion(data.text);
    setAnswer1Text(data.answer1Text);
    setAnswer1Count(data.answer1Count);
    setAnswer2Text(data.answer2Text);
    setAnswer2Count(data.answer2Count);

    // Calculate gauge needle position
    const total = data.answer1Count + data.answer2Count;
    const ratio = total > 0 ? data.answer1Count / total : 0.5;
    const degrees = ratio * 180 - 90; // Maps from 0 to 180 degrees, centered at -90
    setNeedleRotation(degrees);
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
          setIsFading(true);
          setTimeout(() => {
            updateDisplayedData({
              text: question.text,
              answer1Text: question.answer1Text,
              answer1Count: question.answer1Count,
              answer2Text: question.answer2Text,
              answer2Count: question.answer2Count,
            });
            setLastQuestionId(question.id);

            setTimeout(() => {
              setIsFading(false);
            }, 100);
          }, 400);
        } else {
          // First load, no transition
          updateDisplayedData({
            text: question.text,
            answer1Text: question.answer1Text,
            answer1Count: question.answer1Count,
            answer2Text: question.answer2Text,
            answer2Count: question.answer2Count,
          });
          setLastQuestionId(question.id);
        }
      } else {
        // Same question but maybe updated counts
        updateDisplayedData({
          text: question.text,
          answer1Text: question.answer1Text,
          answer1Count: question.answer1Count,
          answer2Text: question.answer2Text,
          answer2Count: question.answer2Count,
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

  // Format the question for display with line breaks at appropriate points
  const formatQuestion = () => {
    if (!displayedQuestion) return 'Laden...';

    // If question already has line breaks, respect them
    if (displayedQuestion.includes('\n')) {
      return displayedQuestion.split('\n').map((line, i) => (
        <span key={i}>
          {line}
          {i < displayedQuestion.split('\n').length - 1 && <br />}
        </span>
      ));
    }

    // For a question without breaks, split it into approximately equal parts
    const words = displayedQuestion.split(' ');

    if (words.length <= 6) {
      return displayedQuestion; // Short questions don't need breaks
    }

    const thirdOfWords = Math.ceil(words.length / 3);

    const firstPart = words.slice(0, thirdOfWords).join(' ');
    const secondPart = words.slice(thirdOfWords, thirdOfWords * 2).join(' ');
    const thirdPart = words.slice(thirdOfWords * 2).join(' ');

    return (
      <>
        {firstPart}
        <br />
        {secondPart}
        <br />
        {thirdPart}
      </>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-200">
      <div className="vote-card w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="bg-gray-300 p-3 text-center border-b-2 border-blue-900">
          <h2 className="text-xl md:text-2xl font-bold text-black">Stem met je sigarettenpeuk</h2>
        </div>

        {/* Main Question */}
        <div
          className={`bg-green-100 p-6 md:p-8 transition-opacity duration-300 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-black leading-tight">
            {formatQuestion()}
          </h1>
        </div>

        {/* Vote Counter and Options */}
        <div className="flex flex-row">
          {/* Left Option */}
          <div
            className={`flex-1 flex flex-col items-center p-4 gap-3 bg-gray-300 transition-opacity duration-300 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="vote-option-box">
              <span className="text-5xl md:text-6xl font-bold text-blue-600">{answer1Count}</span>
            </div>
            <div className="vote-option-box">
              <span className="text-5xl md:text-6xl font-bold text-blue-600">{answer1Text}</span>
            </div>
            <div className="w-full flex justify-center mt-2">
              <div className="arrow-down w-4/5"></div>
            </div>
          </div>

          {/* Center Gauge */}
          <div className="flex-1 flex items-center justify-center bg-gray-300 py-4">
            <div className="gauge-circle">
              {/* Placeholder gauge markings */}
              <div className="gauge-marking absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2"></div>
              <div className="gauge-marking absolute top-1/2 left-0 w-full h-0.5"></div>
              <div className="gauge-marking absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2"></div>

              {/* Circular gauge arc (visual only) */}
              <div className="absolute top-1 left-1 right-1 bottom-1/2 border-t-[12px] border-l-[12px] border-r-[12px] border-gray-400 rounded-t-full"></div>

              {/* Gauge needle */}
              <div
                className="gauge-needle transition-transform duration-1000"
                style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
              ></div>
              <div className="gauge-needle-pivot"></div>
            </div>
          </div>

          {/* Right Option */}
          <div
            className={`flex-1 flex flex-col items-center p-4 gap-3 bg-gray-300 transition-opacity duration-300 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="vote-option-box">
              <span className="text-5xl md:text-6xl font-bold text-blue-600">{answer2Count}</span>
            </div>
            <div className="vote-option-box">
              <span className="text-5xl md:text-6xl font-bold text-blue-600">{answer2Text}</span>
            </div>
            <div className="w-full flex justify-center mt-2">
              <div className="arrow-down w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
