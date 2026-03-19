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
│   ├── page.tsx            # メインページ（1ページ完結、全状態管理）
│   └── globals.css         # Tailwind + 印刷CSS + スクロールヒント
├── components/
│   ├── SubjectInput.tsx    # 科目入力（プルダウン選択/手入力切替、量/範囲モード、並び替え）
│   ├── DateSetting.tsx     # 開始日ピッカー（曜日表示付き）
│   ├── DayConfig.tsx       # 各日の配分レベル設定（4段階ボタン、未選択もラベル表示）
│   ├── ScheduleCalendar.tsx # スケジュール結果テーブル（手動編集可、進捗バー付き）
│   ├── PresetPanel.tsx     # プリセット保存/読込/上書き/削除（確認ダイアログ付き）
│   └── PrintView.tsx       # 印刷/プレビュー（コメント・次回授業日・完了チェック欄）
├── lib/
│   ├── types.ts            # 型定義・定数（SubjectEntry, Preset, ScheduleHistory等）
│   ├── scheduler.ts        # 配分計算ロジック（重み付き比例配分、端数処理）
│   └── storage.ts          # localStorage操作（プリセット・履歴・科目マスター・エクスポート/インポート）
└── hooks/
    └── usePresets.ts       # プリセット管理Hook（CRUD + localStorage同期）
```

## 主な機能
- 担当科目マスター: データ管理画面で科目一覧を登録・削除・並び替え（初期値: 数学/英語/国語/理科/社会）
- 科目入力: プルダウンから選択、「その他（手入力）」で一時入力、「＋新しい科目を追加」でマスター登録
- 科目入力モード: 量指定（20ページ等）と範囲指定（No.1~10等）の2モード
- 科目並び替え: 上下矢印で順番変更、印刷時の表示順に連動
- 配分設定: 各日に多め(×2)/均等(×1)/少なめ(×0.5)/無し(×0)を設定、重み比率で自動配分
- 配分ボタン: 選択中は色付き、未選択もうっすらラベル表示
- 期間: 5/6/7/10/14日 + カスタム（1~31日）から選択可能
- 手動編集: 自動配分後に各セルの数値を直接編集、差分をリアルタイム表示（OK/超過/不足）
- プリセット: 科目セット・日数・配分レベルを名前付きで保存・読み込み・上書き・削除（読込時に科目マスターへ自動追加）
- サンプルプリセット: 初回起動時に「中学5教科サンプル」を自動投入（seededフラグで再投入防止）
- 履歴: 過去のスケジュールをlocalStorageに保存（最大30件）、生徒名・科目で検索可能
- 印刷: プレビュー機能、コメント欄、次回授業日、完了チェック欄付き
- データ管理: 全データのJSONエクスポート/インポート（バックアップ・復元）
- PWA: オフライン対応（cache-first SW）、ホーム画面追加可能

## localStorageキー
- `homework-scheduler-presets` - プリセット配列
- `homework-scheduler-history` - スケジュール履歴（最大30件）
- `homework-scheduler-seeded` - サンプルプリセット投入済みフラグ
- `subject-master` - 担当科目マスター（string[]、初期値: 数学/英語/国語/理科/社会）

## デザイン方針
- 白ベース背景 + アクセントカラー青系(#2563EB)
- 各セクションをカード（rounded-xl border）で囲む
- モバイルファースト、シンプル・クリーン
- フォント: Noto Sans JP (400, 500, 700)
- 配分レベルの色: 多め=赤, 均等=青, 少なめ=エメラルド, 無し=グレー

## コマンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run lint` - ESLint実行
