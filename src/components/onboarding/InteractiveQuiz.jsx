import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveQuiz({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === question.correct_answer;
    const newAnswers = {
      ...answers,
      [currentQuestion]: {
        question: question.question,
        selected: selectedOption,
        correct: question.correct_answer,
        isCorrect
      }
    };
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowFeedback(true);
    
    // Auto-advance after showing feedback
    setTimeout(() => {
      if (isLastQuestion) {
        onComplete({
          score,
          total: quiz.questions.length,
          answers: newAnswers,
          passed: (score + (isCorrect ? 1 : 0)) >= Math.ceil(quiz.questions.length * 0.6)
        });
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
      }
    }, 2000);
  };

  return (
    <Card className="card-dark border-[#8b85f7]">
      <CardHeader>
        <CardTitle className="text-gradient">{quiz.title}</CardTitle>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-[#64748b]">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-[#8b85f7]">
            Score: {score}/{quiz.questions.length}
          </span>
        </div>
        <div className="w-full bg-[#1a0f2e] rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-white mb-4">{question.question}</h3>
            
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`w-full justify-start text-left h-auto py-3 px-4 ${
                    showFeedback
                      ? option === question.correct_answer
                        ? 'bg-green-600 hover:bg-green-600 text-white'
                        : answers[currentQuestion]?.selected === option
                        ? 'bg-red-600 hover:bg-red-600 text-white'
                        : 'bg-[#1a0f2e] text-[#64748b]'
                      : 'bg-[#1a0f2e] hover:bg-[#2d1e50] text-white'
                  }`}
                  variant={showFeedback ? 'default' : 'ghost'}
                >
                  <span className="flex-1">{option}</span>
                  {showFeedback && option === question.correct_answer && (
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                  )}
                  {showFeedback && answers[currentQuestion]?.selected === option && option !== question.correct_answer && (
                    <XCircle className="w-5 h-5 ml-2" />
                  )}
                </Button>
              ))}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  answers[currentQuestion]?.isCorrect
                    ? 'bg-green-600/20 border border-green-600/50'
                    : 'bg-red-600/20 border border-red-600/50'
                }`}
              >
                <p className={`text-sm ${
                  answers[currentQuestion]?.isCorrect ? 'text-green-300' : 'text-red-300'
                }`}>
                  {answers[currentQuestion]?.isCorrect 
                    ? '✓ Correct! ' + question.explanation
                    : '✗ ' + question.explanation
                  }
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}