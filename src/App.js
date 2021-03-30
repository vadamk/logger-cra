import React from 'react'
import dayjs from 'dayjs'
import clsx from 'clsx'
import _ from 'lodash'
import { makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

import ReCharts from './ReCharts'

const useStyles = makeStyles({
  toolbar: { display: 'flex', alignItems: 'center', padding: 15 },
  title: { display: 'flex', alignItems: 'center' },
  chartContainer: { height: 400 },
  updateButton: { marginRight: 10, fontSize: 40, cursor: 'pointer' },
})

const valueToSeconds = val => +Number(val / 1000).toFixed(2)

const logToChartData = (logData) => logData
  .filter(d => d.value)
  .map(d => ({
    date: dayjs(d.startTime).format('MMM D hh:mm'),
    val: valueToSeconds(d.value),
    path: d.location
  }))

const getHourlyAverage = (points) => {
  const dateValuePoints = points.map(d => ({
    date: dayjs(d.date).format('MM/DD HH:00'),
    val: d.val,
  }))

  const uniqAvgDates = _
    .uniq(dateValuePoints, 'date')
    .map(point => point.date)

  const avgPoints = uniqAvgDates.map(date => {
    const dateValues = dateValuePoints
      .filter(p => p.date === date)
      .map(p => p.val)

    const valuesSum = dateValues.reduce((sum, cur) => sum + Number(cur), 0)
    return { date, val: Number(valuesSum / dateValues.length).toFixed(2 ) }
  })

  return points.map(point => {
    const roundedDate = dayjs(point.date).format('MM/DD HH:00')
    return {
      ...point,
      avg: avgPoints.find(p => p.date === roundedDate)?.val,
    }
  })
}

function App() {
  const classes = useStyles()

  const [data, setData] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const [isError, setError] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('https://www.lysq.click/logger')
      const data = await response.json()
      setData(getHourlyAverage(logToChartData(data)))
    } catch (err) {
      setError(true)
      console.log(err);
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isError) return <h1>Error!</h1>
  
  return (
    <div>
      <div className={classes.toolbar}>
        <h1 className={classes.title}>
          <CachedIcon
            className={clsx(classes.updateButton, loading && 'rotating')}
            onClick={fetchData}
          />
          {loading && ' Loading...'}
        </h1>
      </div>
      {data && (
        <div className={classes.chartContainer}>
          <ReCharts data={data} />
        </div>
      )}
    </div>
  )
}

export default App;
