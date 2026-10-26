# worcry.com コーポレートサイト（配信用）

- 原本は `~/Downloads/WorCry資料/worcry-hp-renewal/`（build.py で生成した dist/ をここ public/ に同期する）。手順はスキル `worcry-hp`。
- `public/` が Xserver の `/worcry.com/public_html/` へFTP配信される（`.github/workflows/deploy-worcry-hp.yml`）。
- 同じフォルダに LP（`aoharu-intern.worcry.com/`）がある。**削除系の設定は使わない／.htaccess はHPのホスト限定で書く。**
- `htaccess.pending` は、既存の .htaccess の中身を確認して統合するまで配信しない。
