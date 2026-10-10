# CLAUDE.md — AOHARUインターン LP リポジトリ 作業指針

このリポジトリ（`inc-worcry/aoharu-intern`）でLPを**新規作成・複製・改修**するときは、必ず以下の基準を満たした状態で作業・納品すること。過去にFV動画の重さとGTMタグの無駄発火が、モバイル速度とGoogle広告の「LP利便性スコア（post-click品質）」低下の主因になった。特にその2点を厳守する。

## リポジトリ概要
- `student/` 配下に学生向けLP：本体 `student/index.html`、派生版 `lis`（Google リスティング）、`meta`（Meta広告）、`meta1`（旧Meta LPを静的化したもの）。
- 配信：`main` にマージすると GitHub Actions「Deploy to Xserver (FTP)」が `aoharu-intern.worcry.com` へ自動デプロイ（ジョブは順次実行）。
- 派生版は本体を複製し、**uLandコード等の差分だけ**変更。アセットは `/student/` 配下を共有参照（絶対パス）。

## FV動画・ファーストビュー（最重要）
- FV動画は **720p / H.264 / CRF28〜30 / 音声なし / faststart（`-movflags +faststart`）** で書き出す。目安 **500KB前後**（1080p・数MBは不可）。
- `<video>` は `autoplay muted loop playsinline` ＋ **`preload="metadata"`**（`preload="auto"` は全量DLされるので不可）＋ `poster` 必須。
- poster は **40〜50KB** に圧縮（webp or jpg、表示解像度に合わせる）。

## 画像
- webp優先。表示サイズの2倍以内の解像度。favicon も適正サイズ（**180px前後**、512px巨大PNGは不可）。
- `width`/`height` 指定でCLS防止。ファーストビュー外は `loading="lazy"`。

## フォント
- Google Fonts は `preconnect`（fonts.googleapis.com ＋ fonts.gstatic.com）＋ `display=swap` 必須。
- 日本語フォントは重い。**使うウェイトだけ**読み込む（未使用の太さは入れない）。

## 計測・スクリプト
- 計測は **GTM一括管理（コンテナ GTM-NGGHLZ38）**。Meta Pixel・Yahooタグ・Google広告・GA4・Clarity 等の個別タグを **LPのHTMLに直書きしない**（GTMで差し込む）。
- `<head>` で `dataLayer` に `lp_grade` / `lp_channel`（hp / lis / meta など）/ `lp_variant` を push してからGTMを読み込む。
- 全トラッキングは `async`/`defer`（描画をブロックしない）。CSSはインラインで外部リクエストを削減。
- **チャネル別タグは `lp_channel` で出し分ける**：Meta Pixel は meta チャネル、Yahooタグは Yahoo チャネルのLPでだけ発火。Google リスティング用LP（lis）で Meta/Yahoo を鳴らさない（無駄＝重さの原因）。これはGTMのトリガー設定で行う（LPコードではない）。

## SEO・メタ
- **広告用LP（lis / meta / meta1 等）は `noindex, nofollow`**。自然流入LP（`/student/` 本体）のみ index ＋ self-canonical。
- OGP画像・favicon・`og:url`・canonical を整備。構造化データ（FAQPage 等）は自然流入LPに付与。

## デプロイ運用
- デプロイが FTP タイムアウト（`Error: Timeout (control socket)`）で赤くなるのは異常ではない。該当 run で「**Re-run failed jobs**」を実行（数回必要なこともある）。

## 公開前チェックリスト
1. FV動画 ≤約600KB／`preload="metadata"`／poster付き
2. 画像webp・適正サイズ、favicon軽量、width/height指定、下部画像はlazy
3. フォントは preconnect＋display=swap、ウェイト最小限
4. 計測はGTM経由・全タグ async、dataLayer に lp_channel 等セット
5. Meta/Yahooタグが対象チャネルでのみ発火（Google リスティングLPで鳴らない）
6. 広告LPは noindex,nofollow／OGP・canonical整備
7. 統一ドメイン配下・共有アセット参照、デプロイ成功を確認
8. モバイル実機で表示確認（LP利便性＝post-click品質が平均以上を目標）

## 参考：効果実績
- LP軽量化③（2026/10）：FV動画 5.2MB→530KB（-90%）＋poster/favicon圧縮＋`preload=metadata`化で、モバイルのコールドロードを約4.8MB削減。Google広告のLP利便性スコア（post-click QS）が全KWで「平均未満」だった主因がFV動画の重さだった。
