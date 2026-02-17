import type { Route } from "./+types/home";
import { PokerPositionTrainer } from "../components/poker-position-trainer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ポーカー ポジション練習" },
    {
      name: "description",
      content:
        "テキサスホールデムのポジション認識を練習するツール。6-maxと9-maxに対応。",
    },
  ];
}

export default function Home() {
  return <PokerPositionTrainer />;
}
