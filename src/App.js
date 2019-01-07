import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import {assoc, isNil, range} from 'ramda';

import 'react-tabulator/lib/styles.css';
import 'react-tabulator/lib/css/tabulator.min.css'; // theme
import {ReactTabulator} from 'react-tabulator';

class App extends Component {
  defaultBorder = '0.2em solid';
  selectedCellBorderStyle = `${this.defaultBorder} #336699`;
  notSelectedCellBorderStyle = `${this.defaultBorder} transparent`;
  data = [];
  columns = [];

  state = {
    selectedCell: null,
    selectedCellRow: null,
    selectedKpiCell: null,
    selectedKpiCellField: null
  };

  constructor() {
    super();

    const tooltip = cell => `Threshold value is ${cell.getValue().threshold}`;
    const sorter = (a, b) => a.value - b.value;
    const buildKpiColumn = (title, field, column) => assoc('field', field, assoc('title', title, column));

    const cellFormatter = cell => {
      const cellValue = cell.getValue();
      const {threshold, value} = cellValue;

      if (!isNil(value)) {
        if (value <= threshold) {
          cell.getElement().style.backgroundColor = '#FF3333';
        }

        cell.getElement().style.border = isCurrentCellSelected(cell) ? this.selectedCellBorderStyle : this.notSelectedCellBorderStyle;
      }

      return isNil(value) ? '' : value;
    };

    const cellClick = (event, cell) => {
      const borderCss = cell.getElement().style.border;
      const currentCellSelected = borderCss !== this.notSelectedCellBorderStyle;

      // deselect cell selected previously
      if (!isNil(this.state.selectedCell)) {
        this.state.selectedCell.getElement().style.border = this.notSelectedCellBorderStyle;
      }

      // select/deselect current cell
      cell.getElement().style.border = currentCellSelected ? this.notSelectedCellBorderStyle : this.selectedCellBorderStyle;

      const currentCellStateAfterClick = {
        selectedCell: cell,
        selectedCellRow: currentCellSelected ? null : cell.getData(),
        selectedKpiCell: currentCellSelected ? null : cell.getValue(),
        selectedKpiCellField: currentCellSelected ? null : cell.getField()
      };

      updateInterestedParties(currentCellStateAfterClick);
    };

    const defaultKpiColumn = {
      align: 'left',
      formatter: cellFormatter,
      cellClick: cellClick,
      tooltip: tooltip,
      sorter: sorter
    };

    const isCurrentCellSelected = cell => {
      if (isNil(this.state.selectedKpiCell)) return false;

      const currentCellRow = cell.getData();
      const currentCellField = cell.getField();
      const {selectedKpiCellField, selectedCellRow} = this.state;
      const isSameRow = selectedCellRow.id === currentCellRow.id;
      const isSameKey = selectedKpiCellField === currentCellField;

      return isSameKey && isSameRow;
    };

    const updateInterestedParties = currentCellStateAfterClick => {
      // trigger an event to update the document property with the selected cell
      const updateDocumentProperty = new CustomEvent('updateDocumentProperty', {
        detail: currentCellStateAfterClick
      });

      window.dispatchEvent(updateDocumentProperty);

      this.setState(currentCellStateAfterClick);
    };

    const spotfireData = window.spotfireData ? window.spotfireData.layer : {data: [], columns: []};
    const columnsSpotfire = spotfireData.columns;

    this.columns = columnsSpotfire.map(columnTitle => {
      return columnTitle === 'LES_KEY_LAYER_ID' ?
        {title: 'Layer', field: 'LES_KEY_LAYER_ID'} :
        buildKpiColumn(columnTitle, columnTitle, defaultKpiColumn)
    });
    this.data = spotfireData.data.map(row => {
      const values = row.items;
      const results = {
        id: row.hints.index
      };

      range(0, 4).map(columnNumber => {
        results[columnsSpotfire[columnNumber]] = {
          value: values[columnNumber],
          threshold: Math.floor(Math.random() * 6) + 1
        };
      });

      results[columnsSpotfire[4]] = values[4];

      return results;
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo}
               className="App-logo"
               alt="logo"/>
        </header>
        <div>
          <ReactTabulator data={this.data}
                          columns={this.columns}
                          tooltips={true}
                          height="500px"
                          layout="fitData"
                          options={{pagination: 'local', paginationSize: 16}}/>
        </div>
      </div>
    );
  }
}

export default App;
