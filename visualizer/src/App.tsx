import './assets/pico.classless.orange.min.css'

import './App.css'

import data from '../../data/converted/kinpri-dramatic-prism-1.json'

type Record = typeof data.records[0]

function App() {
  const headers = [
    '日付',
    '順位',
    '販売座席数',
    '合計座席数',
    '上映回数',
    '上映館数',
    '先週比販売座席数数',
    'ソース'
  ]

  const records = data.records
    .sort((r1, r2) => r1.meta.record_date > r2.meta.record_date ? 1 : -1)
    .filter(r => r.meta.title.startsWith('（独立系を含む）デイリー合算ランキング'))

  return (
    <>
      <h1>『KING OF PRISM -Dramatic PRISM.1-』の販売座席数と興行収入</h1>
      <p>
        最終更新日時: {new Intl.DateTimeFormat('ja', {
        dateStyle: 'long',
        timeStyle: 'long'
      }).format(new Date(data.updated + 'Z'))}
      </p>
      <p>
        このページは、<a target="_blank" href="https://mimorin2014.com/">興行収入を見守りたい！</a>さんが公開している座席販売数のデータをもとに、<a target="_blank" href="https://www.takaratomy-arts.co.jp/specials/prettyseries/">プリティーシリーズ</a>の映画の座席販売数・興行収入の変化を表やグラフで確認できるようにしたページです。販売座席数のテーブルは1日1回自動更新されます。現在は『<a href="https://kinpri.com/">KING OF PRISM -Dramatic PRISM.1-</a>』に対応しています。
      </p>
      <h2>座席販売数と先週比のグラフ（仮）</h2>
      <iframe width="900" height="540"
              src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQK4EQdeuxlXz1Iy3RDWbAP0v1KYJDpFMWVGr6wguoPRl-9kMa5LA_ZaJcBM8uEHKKB1WLH38ZgpWOj/pubchart?oid=1244534495&format=interactive'></iframe>
      <h2>座席販売数のテーブル</h2>
      <div className="card">
        <table>
          <thead>
          <tr>
            {headers.map(header => <th>{header}</th>)}
          </tr>
          </thead>
          <tbody>
          {records.map(record => makeRecordRow(record))}
          </tbody>
        </table>
      </div>
      <footer>
        <ul>
          <li>
            ソースコード:
            <a href="https://github.com/sakuramochi0/kinpri-and-pretty-series-box-office-watcher">
              sakuramochi0/kinpri-and-pretty-series-box-office-watcher
            </a>
          </li>
          <li>
            埋め込みグラフ（仮）:
            <a
              href="https://docs.google.com/spreadsheets/d/1fG0GpgVOnwaFCuwKsP_6qh06lW6V9Z_vcY0irF4Cw6s/edit?gid=1434128340#gid=1434128340">
              『KING OF PRISM -Dramatic PRISM.1-』販売座席数 - Google スプレッドシート
            </a>
          </li>
        </ul>
      </footer>
    </>
  )
}

function makeRecordRow(record: Record) {
  if (record.record == null) {
    return <></>
  }

  const {
    meta: { record_date, url },
    record: { rank, sales, shows, since_last_week, theaters, total_seats }
  } = record

  const sinceLastWeekString = typeof since_last_week === 'string'
    ? '-'
    : `${since_last_week.toFixed(0)}%`

  return <tr>
    <td>{new Date(record_date).toISOString().slice(0, 10)}</td>
    <td>{rank}</td>
    <td>{sales.toLocaleString()}</td>
    <td>{total_seats.toLocaleString()}</td>
    <td>{shows}</td>
    <td>{theaters}</td>
    <td>{sinceLastWeekString}</td>
    <td><a href={url} target='_blank'>Source</a></td>
  </tr>
}

export default App
