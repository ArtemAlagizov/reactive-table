import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import {assoc, flatten} from 'ramda';

import 'react-tabulator/lib/styles.css';
import 'react-tabulator/lib/css/tabulator.min.css'; // theme
import {ReactTabulator} from 'react-tabulator';

class App extends Component {
  defaultBorder = '0.2em solid';

  render() {
    const cellFormatter = cell => {
      const cellValue = cell.getValue();
      const {threshold, value} = cellValue;

      if (value <= threshold) {
        cell.getElement().style.backgroundColor = '#FF3333';
      }

      cell.getElement().style.border = `${this.defaultBorder} transparent`;

      return value;
    };

    const cellClick = (event, cell) => {
      const borderCss = cell.getElement().style.border;
      const selectedCellBorderStyle = `${this.defaultBorder} rgb(51, 102, 153)`;
      const notSelectedCellBorderStyle = `${this.defaultBorder} transparent`;
      const currentCellSelected = borderCss !== notSelectedCellBorderStyle;
      const allCells = flatten(cell.getTable().getRows().map(row => row.getCells()));

      // deselect all cells
      allCells.map(cell => cell.getElement().style.border = notSelectedCellBorderStyle);

      // select/deselect current cell
      cell.getElement().style.border = currentCellSelected ? notSelectedCellBorderStyle : selectedCellBorderStyle;

      // add current cell to the resulting data
      window.spotfireData = currentCellSelected ? {} : {
        selectedCellRow: cell.getData(),
        selectedKpiCell: cell.getValue()
      };
    };

    const tooltip = cell => `Threshold value is ${cell.getValue().threshold}`;
    const sorter = (a, b) => a.value - b.value;
    const buildKpiColumn = (title, field, column) => assoc('field', field, assoc('title', title, column));

    const defaultKpiColumn = {
      align: 'left',
      formatter: cellFormatter,
      cellClick: cellClick,
      tooltip: tooltip,
      sorter: sorter
    };

    const columns = [
      {title: 'Layer', field: 'layer'},
      buildKpiColumn('KPI 1', 'kpi1', defaultKpiColumn),
      buildKpiColumn('KPI 2', 'kpi2', defaultKpiColumn),
      {title: 'Rating', field: 'thresholdKpi1', align: 'center', formatter: 'star'}
    ];

    const data = [
      {id: 1, layer: 'Oli Bob', kpi1: {value: 13, threshold: 16}, kpi2: {value: 15, threshold: 2}},
      {id: 2, layer: 'Bobby', kpi1: {value: 12, threshold: 11}, kpi2: {value: 15, threshold: 24}},
    ];

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo}
               className="App-logo"
               alt="logo"/>
        </header>
        <div>
          <ReactTabulator data={data}
                          columns={columns}
                          tooltips={true}
                          layout={'fitData'}/>
        </div>
      </div>
    );
  }
}

export default App;
