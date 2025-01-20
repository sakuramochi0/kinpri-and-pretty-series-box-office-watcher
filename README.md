# kinpri-and-pretty-series-box-office-watcher

🌟 プリティーシリーズ（「KING OF PRISM」シリーズを含む）の映画の興行収入を簡単に確認できるウェブサイト

## Overview

3つのコンポーネントから作られています。
- [x] [collector](collector): https://mimorin2014.com さんから『KING OF PRISM -Dramatic PRISM.1-』のデータを集めます (collect)
  - TypeScript + Playwright
- [x] [converter](converter): 集めたテキストデータを扱いやすいように変換します (convert)
  - Python + Pandas
- [x] [visualizer](visualizer): 販売数の変化や興行収入の合計などの知りたい情報をグラフでわかりやすく可視化します (visualize)
  - TypeScript + React + Chart.js + Vite
