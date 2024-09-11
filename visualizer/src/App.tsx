import './assets/pico.classless.orange.min.css'

import './App.css'

import data from '../../data/converted/kinpri-dramatic-prism-1.json'

type Record = typeof data.records[0]

function App() {
  const headers = [
    '日付',
    '順位',
    '販売座席数（先週比）',
    '合計座席数',
    '上映回数',
    '上映館数',
    '累積販売数',
    '推定興行収入',
  ]

  const records: Record[] = data.records
    .sort((r1, r2) => r1.meta.record_date > r2.meta.record_date ? 1 : -1)
    .filter(r => r.meta.title.startsWith('（独立系を含む）デイリー合算ランキング'))

  const lastRecord = records.filter(r=>r.record.sales !== null).slice(-1)[0]

  return (
    <>
      <h1>📊プリティーシリーズの映画の座席販売数と興行収入</h1>
      <p>
        最終更新日時: {formatDate(data.updated + 'Z', true)}
      </p>
      <p>
        このウェブページは、「<a target="_blank" href="https://mimorin2014.com/">興行収入を見守りたい！</a>」さんが公開している座席販売数のデータをもとに、「KING
        OF PRISM（キンプリ）」を含む「<a
        target="_blank" href="https://www.takaratomy-arts.co.jp/specials/prettyseries/">プリティーシリーズ</a>」の映画の座席販売数・興行収入の変化を表やグラフで確認できるようにしたものです。販売座席数のテーブルは1日1回自動更新されます。現在は『<a
        href="https://kinpri.com/">KING OF PRISM -Dramatic PRISM.1-</a>』に対応しています。
      </p>
      <p>
        <strong>注意：</strong>元データに当日ランキング上位25位までの映画のデータしか掲載されないため、26位以下の日のデータが欠けていて、推定興行収入やグラフが不完全な形になっています。
      </p>
      <p>
        2024/09/10追記：出典の資料を直接確認できてはいませんが、実際の興行収入がこのページの数値の約2倍という情報を見かけたので、数値は不正確な可能性が高いです。多くの人が鑑賞した舞台挨拶が正しく集計されていないのかもしれません。販売座席数の増減の傾向を知るための参考情報だと考えたほうがよさそうです。
      </p>
      <h2>最新データ</h2>
      <div id="latest-data">
        <div>
          日付<br/>
          <span className="value">{formatDate(lastRecord.meta.record_date)}</span></div>
        <div>
          販売座席数（先週比）<br/>
          <span className="value">{lastRecord.record.sales}</span>座席（{lastRecord.record.since_last_week}%）
        </div>
        <div>
          累積販売数<br/>
          <span className="value">{lastRecord.record.cumulative_sales?.toLocaleString()}</span>座席
        </div>
        <div>
          推定興行収入<br/>
          <span className="value">{formatEstimatedBoxOffice(lastRecord.record.estimated_box_office)}</span>
        </div>
      </div>
      <h2>座席販売数と先週比のグラフ（仮）</h2>
      <div className="chart">
        <iframe
          src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQK4EQdeuxlXz1Iy3RDWbAP0v1KYJDpFMWVGr6wguoPRl-9kMa5LA_ZaJcBM8uEHKKB1WLH38ZgpWOj/pubchart?oid=1244534495&format=interactive'></iframe>
      </div>
      <h2>データテーブル</h2>
      <div className="table">
        <table>
          <thead>
          <tr>
            {headers.map(header => <th>{header}</th>)}
          </tr>
          </thead>
          <tbody>
          {records.map((record, index) => makeRecordRow(record, index + 1))}
          </tbody>
        </table>
      </div>
      <footer>
        <ul>
          <li>
            ソースコード:{' '}
            <a href="https://github.com/sakuramochi0/kinpri-and-pretty-series-box-office-watcher">
              sakuramochi0/kinpri-and-pretty-series-box-office-watcher
            </a>
          </li>
          <li>
            埋め込みグラフ（仮）:{' '}
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

function formatDate(dateString: string, includeTime: Boolean = false) {
  const date = new Date(dateString);
  const day = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short' }).format(date)
  const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(date)
  const time = new Intl.DateTimeFormat('ja', {
    timeStyle: 'long'
  }).format(date)
  return `${day}(${weekday})${includeTime ? ` ${time}` : ''}`
}

function makeRecordRow(record: Record, index: number) {
  if (record.record == null) {
    return <></>
  }

  const {
    meta: { record_date, url },
    record: { rank, sales, shows, since_last_week, theaters, total_seats, cumulative_sales, estimated_box_office }
  } = record

  const sinceLastWeekString = typeof since_last_week === 'string' || !since_last_week
    ? ''
    : `（${since_last_week.toFixed(0)}%）`

  const estimatedBoxOfficeString = formatEstimatedBoxOffice(estimated_box_office)

  return <tr>
    <td>{formatDate(record_date)}<sup><a title="出典" href={url} target='_blank'>[{index}]</a></sup></td>
    <td>{rank ?? '-'}</td>
    <td>{sales?.toLocaleString() ?? '-'}{sinceLastWeekString}</td>
    <td>{total_seats?.toLocaleString() ?? '-'}</td>
    <td>{shows ?? '-'}</td>
    <td>{theaters ?? '-'}</td>
    <td>{cumulative_sales?.toLocaleString() ?? '-'}</td>
    <td>{estimatedBoxOfficeString}</td>
  </tr>
}

function formatEstimatedBoxOffice(estimatedBoxOffice: number | null) {
  if (!estimatedBoxOffice) {
    return '-'
  }

  return `${(estimatedBoxOffice / 10_000).toLocaleString('us', { maximumFractionDigits: 0 })}万円`
}

export default App
