import { useEffect } from 'react';

import { Chart, ScriptableLineSegmentContext } from 'chart.js/auto';
import { formatDate } from './utils.ts';

import type { Record } from './types.d.ts'

// dotted line style for missing data points
const skipped = (ctx: ScriptableLineSegmentContext, value: number[]) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

export function SalesChart(props: {
  records: Record[]
}) {
  useEffect(() => {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: props.records.map(r => formatDate(r.meta.record_date)),
        datasets: [{
          type: 'bar',
          label: '座席販売数',
          data: props.records.map(r => r.record.sales),
          backgroundColor: '#f66',
        }, {
          type: 'line',
          yAxisID: 'y2',
          label: '先週比%',
          data: props.records.map(r => r.record.since_last_week),
          spanGaps: true,
          segment: {
            borderDash: ctx => skipped(ctx, [6, 6]),
          },
          pointRadius: 5,
          borderColor: 'gold',
          backgroundColor: 'gold',
        }]
      },
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: '座席販売数'
            },
            beginAtZero: true,
            max: 10_000,
            ticks: {
              stepSize: 2000,
            },
          },
          y2: {
            title: {
              display: true,
              text: '先週比%'
            },
            beginAtZero: true,
            position: 'right',
            max: 250,
            grid: {
              lineWidth: 0,
            },
            ticks: {
              stepSize: 50,
            },
          },
        },
        animation: false
      }
    })

    return () => {
      chart.destroy()
    }
  }, [])

  return <>
    <h2>座席販売数と先週比のグラフ</h2>

    <div>
      <canvas id="myChart"></canvas>
    </div>
  </>
}
