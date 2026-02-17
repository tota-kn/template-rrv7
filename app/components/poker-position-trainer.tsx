import { useState, useCallback, useEffect } from "react";

type TableSize = 6 | 9;

interface Position {
  name: string;
  label: string;
}

const POSITIONS_9MAX: Position[] = [
  { name: "BTN", label: "BTN" },
  { name: "SB", label: "SB" },
  { name: "BB", label: "BB" },
  { name: "UTG", label: "UTG" },
  { name: "UTG+1", label: "UTG+1" },
  { name: "UTG+2", label: "UTG+2" },
  { name: "LJ", label: "LJ" },
  { name: "HJ", label: "HJ" },
  { name: "CO", label: "CO" },
];

const POSITIONS_6MAX: Position[] = [
  { name: "BTN", label: "BTN" },
  { name: "SB", label: "SB" },
  { name: "BB", label: "BB" },
  { name: "UTG", label: "UTG" },
  { name: "HJ", label: "HJ" },
  { name: "CO", label: "CO" },
];

function getPositions(tableSize: TableSize): Position[] {
  return tableSize === 6 ? POSITIONS_6MAX : POSITIONS_9MAX;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getSeatAngle(seatIndex: number, totalSeats: number): number {
  return (360 / totalSeats) * seatIndex - 90;
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

const FEEDBACK_DURATION = 3000;

interface QuizState {
  btnSeatIndex: number;
  questionSeatIndex: number;
  correctPosition: string;
}

function generateQuiz(tableSize: TableSize): QuizState {
  const positions = getPositions(tableSize);
  const totalSeats = positions.length;
  const btnSeatIndex = getRandomInt(totalSeats);
  const questionOffset = getRandomInt(totalSeats);
  const questionSeatIndex = (btnSeatIndex + questionOffset) % totalSeats;
  const relativePosition =
    (questionSeatIndex - btnSeatIndex + totalSeats) % totalSeats;
  const correctPosition = positions[relativePosition].name;
  return { btnSeatIndex, questionSeatIndex, correctPosition };
}

type AnswerResult = "correct" | "incorrect" | null;

export function PokerPositionTrainer() {
  const [tableSize, setTableSize] = useState<TableSize>(6);
  const [quiz, setQuiz] = useState<QuizState>(() => generateQuiz(6));
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [shuffledPositions, setShuffledPositions] = useState<Position[]>(() =>
    shuffleArray(getPositions(6))
  );

  // フィードバック表示用（テーブル中央に〇×を表示）
  const [feedback, setFeedback] = useState<AnswerResult>(null);

  const positions = getPositions(tableSize);
  const totalSeats = positions.length;

  const handleTableSizeChange = useCallback((size: TableSize) => {
    setTableSize(size);
    setQuiz(generateQuiz(size));
    setFeedback(null);
    setStats({ correct: 0, total: 0 });
    setShuffledPositions(shuffleArray(getPositions(size)));
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      const isCorrect = answer === quiz.correctPosition;
      const result: AnswerResult = isCorrect ? "correct" : "incorrect";

      // スコア更新
      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      // フィードバック表示
      setFeedback(result);

      // 即座に次の問題へ
      setQuiz(generateQuiz(tableSize));
    },
    [quiz.correctPosition, tableSize]
  );

  // フィードバックを一定時間後に消す
  useEffect(() => {
    if (feedback === null) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_DURATION);
    return () => clearTimeout(timer);
  }, [feedback]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">ポジション練習</h1>
      <p className="text-gray-400 text-sm mb-6">
        ?マーク のポジション名を当てよう
      </p>

      {/* テーブルサイズ切り替え */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => handleTableSizeChange(6)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            tableSize === 6
              ? "bg-emerald-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          6-max
        </button>
        <button
          onClick={() => handleTableSizeChange(9)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            tableSize === 9
              ? "bg-emerald-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          9-max
        </button>
      </div>

      {/* スコア表示 */}
      <div className="mb-6 text-center">
        <span className="text-gray-400 text-sm">
          正解率:{" "}
          <span className="text-white font-bold">
            {stats.total === 0
              ? "-"
              : `${Math.round((stats.correct / stats.total) * 100)}%`}
          </span>{" "}
          ({stats.correct}/{stats.total})
        </span>
      </div>

      {/* ポーカーテーブル */}
      <div className="relative w-[340px] h-[220px] sm:w-[420px] sm:h-[270px] mb-8">
        {/* テーブル本体 */}
        <div className="absolute inset-4 sm:inset-6 rounded-[50%] bg-emerald-900 border-4 border-emerald-700 shadow-lg shadow-emerald-900/50" />
        <div className="absolute inset-6 sm:inset-8 rounded-[50%] border border-emerald-600/30" />

        {/* テーブル中央のフィードバック表示 */}
        {feedback !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div
              className={`text-5xl sm:text-6xl font-bold animate-bounce ${
                feedback === "correct" ? "text-emerald-400" : "text-red-400"
              }`}
              style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}
            >
              {feedback === "correct" ? "\u25CB" : "\u2717"}
            </div>
          </div>
        )}

        {/* シート */}
        {Array.from({ length: totalSeats }).map((_, i) => {
          const angle = getSeatAngle(i, totalSeats);
          const radian = (angle * Math.PI) / 180;
          const rx = 48;
          const ry = 46;
          const cx = 50;
          const cy = 50;
          const x = cx + rx * Math.cos(radian);
          const y = cy + ry * Math.sin(radian);

          const isBTN = i === quiz.btnSeatIndex;
          const isQuestion = i === quiz.questionSeatIndex;

          const relPos =
            (i - quiz.btnSeatIndex + totalSeats) % totalSeats;
          const seatPositionName = positions[relPos].name;

          let label: string;
          let seatClasses: string;

          if (isQuestion) {
            label = "?";
            seatClasses =
              "bg-blue-600 text-white border-blue-400 animate-pulse font-bold";
          } else {
            label = `${i + 1}`;
            seatClasses = "bg-gray-800 text-gray-400 border-gray-600";
          }

          // BTN位置にDマーカーを添える（シートの右下にオフセット）
          const btnMarkerOffset = 14; // px
          const btnAngleRad = radian;
          // シートの外側方向にずらす
          const dxDir = Math.cos(btnAngleRad);
          const dyDir = Math.sin(btnAngleRad);

          return (
            <div key={i}>
              {/* 通常シート */}
              <div
                className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300
                  w-11 h-11 sm:w-13 sm:h-13 text-xs sm:text-sm -translate-x-1/2 -translate-y-1/2 ${seatClasses}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                {label}
              </div>
              {/* BTN Dマーカー（シートに添える小さい丸） */}
              {isBTN && (
                <div
                  className="absolute flex items-center justify-center rounded-full
                    w-5 h-5 sm:w-6 sm:h-6
                    bg-yellow-500 text-gray-900 border border-yellow-400 font-bold text-[9px] sm:text-[10px] shadow-md z-10"
                  style={{
                    left: `calc(${x}% + ${dxDir * btnMarkerOffset}px)`,
                    top: `calc(${y}% + ${dyDir * btnMarkerOffset}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  D
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 回答ボタン */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {shuffledPositions.map((pos) => (
          <button
            key={pos.name}
            onClick={() => handleAnswer(pos.name)}
            className="px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600
              text-white font-semibold text-sm transition-colors border border-gray-700
              hover:border-gray-500 min-w-[70px]"
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}
