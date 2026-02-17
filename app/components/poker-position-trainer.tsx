import { useState, useCallback, useEffect, useMemo } from "react";

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

/** 配列をシャッフルして新しい配列を返す (Fisher-Yates) */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** 各シートの角度を計算（楕円上に均等配置） */
function getSeatAngle(seatIndex: number, totalSeats: number): number {
  return (360 / totalSeats) * seatIndex - 90;
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

const AUTO_NEXT_DELAY = 1500;

interface QuizState {
  btnSeatIndex: number;
  questionSeatIndex: number;
  correctPosition: string;
}

function generateQuiz(tableSize: TableSize): QuizState {
  const positions = getPositions(tableSize);
  const totalSeats = positions.length;
  const btnSeatIndex = getRandomInt(totalSeats);

  // BTN含む全ポジションをランダムに出題
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
  const [result, setResult] = useState<AnswerResult>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // 選択肢の並び順: テーブルサイズ変更時のみシャッフル
  const [shuffledPositions, setShuffledPositions] = useState<Position[]>(() =>
    shuffleArray(getPositions(6))
  );

  const positions = getPositions(tableSize);
  const totalSeats = positions.length;

  const handleTableSizeChange = useCallback((size: TableSize) => {
    setTableSize(size);
    setQuiz(generateQuiz(size));
    setResult(null);
    setSelectedAnswer(null);
    setStats({ correct: 0, total: 0 });
    setShuffledPositions(shuffleArray(getPositions(size)));
  }, []);

  const goToNext = useCallback(() => {
    setQuiz(generateQuiz(tableSize));
    setResult(null);
    setSelectedAnswer(null);
  }, [tableSize]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (result !== null) return;
      setSelectedAnswer(answer);
      const isCorrect = answer === quiz.correctPosition;
      setResult(isCorrect ? "correct" : "incorrect");
      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    },
    [result, quiz.correctPosition]
  );

  // 回答後に自動で次の問題へ
  useEffect(() => {
    if (result === null) return;
    const timer = setTimeout(goToNext, AUTO_NEXT_DELAY);
    return () => clearTimeout(timer);
  }, [result, goToNext]);

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
          const isBTNAndQuestion = isBTN && isQuestion;

          const relPos =
            (i - quiz.btnSeatIndex + totalSeats) % totalSeats;
          const seatPositionName = positions[relPos].name;

          let label: string;
          let seatClasses: string;

          if (isQuestion) {
            if (result === null) {
              label = "?";
              seatClasses =
                "bg-blue-600 text-white border-blue-400 animate-pulse font-bold";
            } else if (result === "correct") {
              label = quiz.correctPosition;
              seatClasses =
                "bg-emerald-500 text-white border-emerald-300 font-bold";
            } else {
              label = quiz.correctPosition;
              seatClasses =
                "bg-red-500 text-white border-red-300 font-bold";
            }
          } else if (isBTN) {
            // BTNは小さい丸で表示（下のbtnIndicatorで描画）
            label = "";
            seatClasses = "bg-transparent border-transparent";
          } else {
            if (result !== null) {
              label = seatPositionName;
              seatClasses =
                "bg-gray-700 text-gray-300 border-gray-600 text-xs";
            } else {
              label = `${i + 1}`;
              seatClasses =
                "bg-gray-800 text-gray-400 border-gray-600";
            }
          }

          return (
            <div key={i}>
              {/* BTNマーカー（小さい丸） */}
              {isBTN && !isBTNAndQuestion && (
                <div
                  className="absolute flex items-center justify-center rounded-full
                    w-7 h-7 sm:w-8 sm:h-8 -translate-x-1/2 -translate-y-1/2
                    bg-yellow-500 text-gray-900 border-2 border-yellow-400 font-bold text-[10px] sm:text-xs shadow-md"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  D
                </div>
              )}
              {/* 通常シート / 出題シート */}
              {(!isBTN || isBTNAndQuestion) && (
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
              )}
            </div>
          );
        })}
      </div>

      {/* 回答ボタン */}
      {result === null ? (
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
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={`text-lg font-bold ${
              result === "correct" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {result === "correct"
              ? "正解!"
              : `不正解... 正解は ${quiz.correctPosition}`}
          </div>
          <p className="text-gray-500 text-xs">自動で次の問題へ...</p>
        </div>
      )}
    </div>
  );
}
