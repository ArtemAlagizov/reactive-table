import React, {Component} from 'react';
import Tabulator from 'tabulator-tables'; //import Tabulator library
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet

class TabulatorWrapper extends Component {
  element = React.createRef();

  tabulator = null;

  componentDidMount() {
    //instantiate Tabulator when element is mounted
    this.tabulator = new Tabulator(this.element, {
      data: [], //link data to table
      columns: [], //define table columns
      layout: 'fitColumns',
      tooltips: true,
      pagination: 'local',
      paginationSize: 16
    });
  }

  render() {
    const {data, columns, filteredColumns} = this.props;
    const tabulator = this.tabulator;

    if (tabulator && data) {
      tabulator.setData(data);
      tabulator.setColumns(columns);
      tabulator.getColumns().map(column => {
        const isToBeHidden = filteredColumns.includes(column.getField());

        if (isToBeHidden) {
          column.hide();
        }
      });

      tabulator.redraw();
    }

    return (<div ref={element => (this.element = element)}/>);
  }
}

export default TabulatorWrapper;