import React from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Legend,
  Label,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  customTooltip: {
    width: 200,
    fontSize: 12,
    backgroundColor: '#fff',
    padding: '0 15px',
    border: '1px solid #ccc',
    borderRadius: 10,
    opacity: 0.8,
  },
  paragraph: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
})

const CustomTooltip = ({ active, payload, label }) => {
  const classes = useStyles()

  if (active && payload && payload.length) {
    return (
      <div className={classes.customTooltip}>
        <p className={classes.paragraph}>
          <b>Date:</b>{' '}{label}</p>
        <p className={classes.paragraph}>
          <b>Path:</b>{' '}{payload[0].payload.path}</p>
        <p className={classes.paragraph}>
          <b>Value:</b>{' '}{payload[0].payload.val} ms</p>
        <p className={classes.paragraph}>
          <b>Avg:</b>{' '}{payload[0].payload.avg}</p>
      </div>
    );
  }

  return null;
};

function ReCharts({ data }) {
  const [valOpacity, setValOpacity] = React.useState(1)
  const [avgOpacity, setAvgOpacity] = React.useState(0.5)

  const handleMouseEnter = (o) => {
    if (o.dataKey === 'avg') {
      setValOpacity(0.5)
    }

    if (o.dataKey === 'val') {
      setAvgOpacity(0.1)
    }
  };

  const handleMouseLeave = (o) => {
    if (o.dataKey === 'avg') {
      setValOpacity(1)
    }

    if (o.dataKey === 'val') {
      setAvgOpacity(0.5)
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 15,
          right: 30,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis>
          <Label value="TTFB (s)" angle={-90} offset={-15} position="left" />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Brush dataKey="name" height={30} stroke="#8884d8" />
        <Legend
          verticalAlign="top"
          wrapperStyle={{ lineHeight: '40px' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <Line type="monotone" dataKey="val" strokeOpacity={valOpacity} stroke="#8884d8" activeDot={{ r: 8 }} />
        <Area type="monotone" dataKey="avg" fillOpacity={avgOpacity} stroke="#FF7F50" fill="#FF7F50" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default ReCharts
