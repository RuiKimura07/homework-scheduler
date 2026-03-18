# 宿題スケジュール作成アプリ

## 概要
個別指導塾の講師が、生徒ごとに宿題スケジュールを作成・印刷できるPWAアプリ。
講師のスマホにインストールして使う想定。

## 技術スタック
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- localStorage でデータ永続化（DB不要、全てクライアント完結）
- PWA対応（manifest.json + Service Worker）
- デプロイ先: Vercel

## Git
- リポジトリ: https://github.com/RuiKimura07/homework-scheduler
- ブランチ: main
- Vercelと連携済み（pushで自動デプロイ）

## ディレクトリ構成
```
src/
├── app/
│   ├── layout.tsx          # Noto Sans JP、PWA meta、SW登録
│   ├── page.tsx            # メインページ（1ページ完結）
│   └── globals.css         # Tailwind + 印刷CSS
├── components/
│   ├── SubjectInput.tsx    # 科目入力（量モード / 範囲モード対応）
│   ├── DateSetting.tsx     # 開始日ピッカー（曜日表示付き）
│   ├── DayConfig.tsx       # 各日の配分レベル設定
│   ├── ScheduleCalendar.tsx # スケジュール結果テーブル（手動編集可）
│   ├── PresetPanel.tsx     # プリセット保存/読込/削除（確認ダイアログ付き）
│   └── PrintView.tsx       # 印刷/プレビュー/A4向き選択
├── lib/
│   ├── types.ts            # 型定義・定数
│   ├── scheduler.ts        # 配分計算ロジック（量モード・範囲モード両対応）
│   └── storage.ts          # localStorage操作（プリセット・履歴）
└── hooks/
    └── usePresets.ts       # プリセット管理Hook
```

## 主な機能
- 科目入力: 量指定（20ページ等）と範囲指定（No.1~10等）の2モード
- 配分設定: 各日に多め/均等/少なめ/無しを設定、重み比率で自動配分
- 期間: 5/6/7/10/14日から選択可能
- 手動編集: 自動配分後に各セルの数値を直接編集、差分をリアルタイム表示
- プリセット: 科目セットを名前付きで保存・読み込み
- 履歴: 過去のスケジュールをlocalStorageに保存（最大30件）
- 印刷: A4横/縦選択、完了チェック欄付き、プレビュー機能
- PWA: オフライン対応、ホーム画面追加可能

## デザイン方針
- 白ベース背景 + アクセントカラー青系(#2563EB)
- 各セクションをカード（rounded-xl border）で囲む
- モバイルファースト、シンプル・クリーン
- フォント: Noto Sans JP

## コマンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run lint` - ESLint実行
