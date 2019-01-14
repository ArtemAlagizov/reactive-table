import React, {Component} from 'react';
import {Select} from 'antd';
import {assoc, isNil, range} from 'ramda';
import logo from './logo.svg';
import exampleData from './exampleData.json';
import TabulatorWrapper from './components/tabulator-wrapper';
import './App.css';
import 'antd/dist/antd.css';

const Option = Select.Option;

class App extends Component {
  defaultBorder = '3px solid';
  selectedCellBorderStyle = `${this.defaultBorder} #336699`;
  notSelectedCellBorderStyle = `${this.defaultBorder} transparent`;

  selectionInfo = {
    selectedCell: null,
    selectedCellRow: null,
    selectedKpiCell: null,
    selectedKpiCellField: null
  };

  fields = {
    layer: {
      id: 'LES_KEY_LAYER_ID',
      displayName: 'Layer'
    },
    product: {
      id: 'LES_PRODUCT_ID',
      displayName: 'Product'
    },
    machine: {
      id: 'LES_MACHINE_ID',
      displayName: 'Machine'
    }
  };

  allData = {
    layer: null,
    product: null,
    machine: null
  };

  state = {
    field: null,
    columns: null,
    data: null
  };

  constructor() {
    super();

    window.addEventListener('sendDataToReactApp', event => {
      const data = event.detail;

      this.allData = {
        layer: data.layer || null,
        product: data.product || null,
        machine: data.machine || null
      };

      this.setDataBasedOnGroupByType('layer');
    }, false);
  }

  setDataBasedOnGroupByType = groupByType => {
    const data = this.allData;
    const spotfireData = data[groupByType] ? data[groupByType].data : [];
    const spotfireColumns = data[groupByType] ? data[groupByType].columns : [];

    this.setCurrentData(spotfireData, spotfireColumns, groupByType);
  };

  setCurrentData = (data, columns, field) => {
    const fields = this.fields;
    const resultingColumns = columns.map(columnTitle => {
      return !isNil(fields[field]) && columnTitle === fields[field].id ?
        {title: fields[field].displayName, field: fields[field].id} :
        this.buildKpiColumn(columnTitle, columnTitle, this.defaultKpiColumn)
    });
    const resultingData = data.map(row => {
      const values = row.items;
      const results = {
        id: row.hints.index
      };

      range(0, 4).map(columnNumber => {
        results[columns[columnNumber]] = {
          value: values[columnNumber],
          threshold: Math.floor(Math.random() * 6) + 1
        };
      });

      results[columns[4]] = values[4];

      return results;
    });

    this.resetSelectedCellIfNeeded(field);

    this.setState({
      field: field,
      columns: resultingColumns,
      data: resultingData
    });
  };

  resetSelectedCellIfNeeded = field => {
    if (this.state.field !== field) {
      const selectionInfo = this.selectionInfo;

      selectionInfo.selectedCell = null;
      selectionInfo.selectedCellRow = null;
      selectionInfo.selectedKpiCell = null;
      selectionInfo.selectedKpiCellField = null;
      selectionInfo.selectedCell = null;
    }
  };

  handleChange = value => this.setDataBasedOnGroupByType(value);
  tooltip = cell => `Threshold value is ${cell.getValue().threshold}`;
  sorter = (a, b) => a.value - b.value;
  buildKpiColumn = (title, field, column) => assoc('field', field, assoc('title', title, column));

  cellFormatter = cell => {
    const cellValue = cell.getValue();
    const {threshold, value} = cellValue;

    if (!isNil(value)) {
      if (value <= threshold) {
        cell.getElement().style.backgroundColor = '#FF3333';
      }

      cell.getElement().style.padding = '3px';
      cell.getElement().style.border = this.isCurrentCellSelected(cell) ? this.selectedCellBorderStyle : this.notSelectedCellBorderStyle;
    }

    return isNil(value) ? '' : value;
  };

  cellClick = (event, cell) => {
    const borderCss = cell.getElement().style.border;
    const currentCellSelected = borderCss !== this.notSelectedCellBorderStyle;

    // deselect cell selected previously
    if (!isNil(this.selectionInfo.selectedCell)) {
      this.selectionInfo.selectedCell.getElement().style.border = this.notSelectedCellBorderStyle;
    }

    // select/deselect current cell
    cell.getElement().style.border = currentCellSelected ? this.notSelectedCellBorderStyle : this.selectedCellBorderStyle;

    const currentCellStateAfterClick = {
      field: this.state.field,
      selectedCell: cell,
      selectedCellRow: currentCellSelected ? null : cell.getData(),
      selectedKpiCell: currentCellSelected ? null : cell.getValue(),
      selectedKpiCellField: currentCellSelected ? null : cell.getField()
    };

    this.updateInterestedParties(currentCellStateAfterClick);
  };

  defaultKpiColumn = {
    align: 'left',
    formatter: this.cellFormatter,
    cellClick: this.cellClick,
    tooltip: this.tooltip,
    sorter: this.sorter
  };

  isCurrentCellSelected = cell => {
    if (isNil(this.selectionInfo.selectedKpiCell)) return false;

    const currentCellRow = cell.getData();
    const currentCellField = cell.getField();
    const {selectedKpiCellField, selectedCellRow} = this.selectionInfo;
    const isSameRow = selectedCellRow.id === currentCellRow.id;
    const isSameKey = selectedKpiCellField === currentCellField;

    return isSameKey && isSameRow;
  };

  updateInterestedParties = currentCellStateAfterClick => {
    // trigger an event to update the document property with the selected cell
    const updateDocumentProperty = new CustomEvent('updateDocumentProperty', {
      detail: currentCellStateAfterClick
    });

    window.dispatchEvent(updateDocumentProperty);

    this.selectionInfo = currentCellStateAfterClick;
  };

  sendSetDataEvent = () => {
    const spotfireData = exampleData;
    const sendDataToReactApp = new CustomEvent('sendDataToReactApp', {
      detail: spotfireData
    });

    window.dispatchEvent(sendDataToReactApp);
  };

  render() {
    const select = <Select defaultValue="layer"
                           style={{width: 120, borderRadius: 0}}
                           onChange={this.handleChange}>
      <Option value="layer">Layer</Option>
      <Option value="product">Product</Option>
      <Option value="machine">Machine</Option>
    </Select>;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo}
               className="App-logo"
               alt="logo"/>
        </header>
        <div className="container">
          <div className="select-container">
            <div className="select-label">Groupby:</div>
            {select}</div>
          <div><TabulatorWrapper data={this.state.data}
                                 columns={this.state.columns}/></div>
          <div>
            <button onClick={this.sendSetDataEvent}>set layer data</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
