import React from 'react';
import {Card} from 'material-ui/Card';
import {
    Table,
    TableRow,
    TableRowColumn,
    TableBody,
    TableHeader,
    TableHeaderColumn,
} from 'material-ui/Table';
import PaginationControls from './PaginationControls.js'
import TableDialog from './TableDialog.js'


class TableBodyRow extends React.Component {
    handleClick = () => {
        this.props.handleRowClick(this.props.instrument);
    }

    render() {
        return (
            <TableRow className="review-table-body-row" onClick={this.handleClick}>
                {Object.keys(this.props.instrument).map(key =>
                    <TableRowColumn key={key} >{this.props.instrument[key]}</TableRowColumn>
                )}
            </TableRow>
        );
    }
}


export default class InstrumentTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            pageId: 1,
            activeInstrument: {},
            headings: ["Tech record ID", "Name", "foo/bar"],
            instruments: {},
            filteredInstruments: {},
            paginatedInstruments: {},
        };
    }

    handleRowClick = (event) = (instrument) => {
        this.setState({modalOpen: true});
        this.setState({activeInstrument: instrument});
    };

    handleModalClose = () => {
        this.setState({modalOpen: false});
    };

    handlePaginationChange = (event) = (filter, value) => {
        let instruments = this.state.instruments;
        let filteredInstruments = {}
        if (filter === 'fooBar') {
            Object.keys(instruments).forEach(function(key) {
                if (instruments[key].field_3 === value) {
                    console.log(instruments[key].field_3);
                    filteredInstruments[key] = instruments[key];
                }
            });
        }
        this.setState({filteredInstruments: filteredInstruments}, () => {
            this.handlePageChange(1);
        });
    };

    handlePageChange = (event) = (pageId) => {
        let limit = 10;
        let bottomIndex = (pageId - 1) * limit;
        let topIndex = bottomIndex + limit;
        let instruments = this.state.filteredInstruments;

        let subKeys = Object.keys(instruments).slice(bottomIndex, topIndex);

        let paginatedInstruments = {};
        subKeys.forEach(function(key) {
            paginatedInstruments[key] = instruments[key];
        });

        this.setState({paginatedInstruments: paginatedInstruments});
    };

    loadTrades = () => {
        return fetch('/api')
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((response) => {
                if (response.status === 'ok') {
                    this.setState({instruments: response.data});
                    this.setState({filteredInstruments: response.data}, () => {
                        this.handlePageChange(1);
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    componentDidMount() {
        this.loadTrades();
    }

    render() {
        return (
            <div>
                <Card>
                    <Table className="review-table">
                        <TableHeader
                            className="review-table-head"
                            displaySelectAll={false}
                            adjustForCheckbox={false}
                        >
                            <TableRow className="review-table-head-row">
                                {this.state.headings.map(function(heading, i) {
                                    return <TableHeaderColumn key={i} >{heading}</TableHeaderColumn>
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="review-table-body">
                            {Object.keys(this.state.paginatedInstruments).map(key =>
                                <TableBodyRow
                                    key={key}
                                    instrument={this.state.instruments[key]}
                                    handleRowClick={this.handleRowClick}
                                />
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <PaginationControls handlePaginationChange={this.handlePaginationChange}/>

                <TableDialog
                    instrument={this.state.activeInstrument}
                    open={this.state.modalOpen}
                    handleClose={this.handleModalClose}
                />
            </div>
        )
    }
}