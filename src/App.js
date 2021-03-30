import React from 'react'
import dayjs from 'dayjs'
import clsx from 'clsx'
import _ from 'lodash'
import { makeStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CachedIcon from '@material-ui/icons/Cached';

import ReCharts from './ReCharts'

// const BASIC_URL = 'https://www.lysq.click/'
const BASIC_URL = 'http://localhost:8081'

const OPTIONS = [
  {
    value: 'day',
    label: 'Day',
  },
  {
    value: 'week',
    label: 'Week',
  },
  {
    value: 'month',
    label: 'Month',
  },
  {
    value: 'hour',
    label: 'Hour',
  },
  {
    value: 'minute',
    label: 'Minute',
  },
]

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  title: {
    display: 'flex',
    alignItems: 'center'
  },
  chartContainer: {
    height: 400
  },
  updateButton: {
    marginRight: 10,
    fontSize: 40,
    cursor: 'pointer'
  },
  rightPanel: {
    display: 'flex',
    width: 260,
    justifyContent: 'space-between',
  },
})

const valueToSeconds = val => +Number(val / 1000).toFixed(2)

const logToChartData = (logData) => logData
  .filter(d => d.value)
  .map(d => ({
    date: dayjs(d.startTime).format('MMM D hh:mm'),
    val: valueToSeconds(d.value),
    path: d.location
  }))

const addAverageData = (points) => {
  const dateValuePoints = points.map(d => ({
    date: dayjs(d.date).format('YYYY/MM/DD HH:mm'),
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
    const roundedDate = dayjs(point.date).format('YYYY/MM/DD HH:mm')
    return {
      ...point,
      avg: avgPoints.find(p => p.date === roundedDate)?.val,
    }
  })
}

function App() {
  const classes = useStyles()

  const [data, setData] = React.useState()
  const [unit, setUnit] = React.useState('day')
  const [unitNum, setUnitNum] = React.useState(1)

  const [loading, setLoading] = React.useState(true)
  const [isError, setError] = React.useState(false)

  const fetchData = React.useCallback(async ({ unit, unitNum }) => {
    try {
      setLoading(true)
      const response = await fetch(`${BASIC_URL}/logger?unit=${unit}&num=${unitNum}`)
      const data = await response.json()
      setData(addAverageData(logToChartData(data)))
    } catch (err) {
      setError(true)
      console.log(err);
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData({ unit: 'day', unitNum: 1 })
  }, [fetchData])

  const handleUnitChange = (e, option) => {
    setUnit(option.props.value)
    fetchData({ unit: option.props.value, unitNum })
  }

  const handleUnitNumChange = (e, value) => {
    setUnitNum(value)
  }

  const handleUnitNumChangeCommitted = (e, value) => {
    fetchData({ unit, unitNum: value })
  }

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
        <div className={classes.rightPanel}>
          <FormControl variant="outlined">
            <InputLabel id="selectUnitLabel">Unit</InputLabel>
            <Select
              labelId="selectUnitLabel"
              id="selectUnit"
              value={unit}
              label="Unit"
              onChange={handleUnitChange}
            >
              {OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box width={160}>
            <Typography id="discrete-slider" gutterBottom style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
              Number ({unitNum})
            </Typography>
            <Slider
              value={unitNum}
              step={1}
              min={1}
              max={30}
              valueLabelDisplay="auto"
              onChange={handleUnitNumChange}
              onChangeCommitted={handleUnitNumChangeCommitted}
            />
          </Box>
        </div>
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
