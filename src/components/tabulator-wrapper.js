import React, {Component} from 'react';
import Tabulator from 'tabulator-tables'; //import Tabulator library
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet

class TabulatorWrapper extends Component {
  element = React.createRef();

  tabulator = null; //variable to hold your table

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
    const {data, columns, height} = this.props;

    if (this.tabulator && data) {
      this.tabulator.setData(data);
      this.tabulator.setHeight(height);
      this.tabulator.setColumns(columns);
    }

    return (<div ref={element => (this.element = element)}/>);
  }
}

export default TabulatorWrapper;