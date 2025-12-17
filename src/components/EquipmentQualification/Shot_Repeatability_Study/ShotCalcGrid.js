import React from 'react';
import Table from 'react-bootstrap/Table';
import '../../../assets/custom-stylesheet/grid_stylecss.css';

const ShotCalcGrid = ({ Average, MaxPart, MinPart, Range, Header1, Header2, Header3, Percentage, Acceptable_variation }) => {

    return (
        <div>
            <div className="spreadsheet equipmentShortGrid" id="BackPress-Calc-Grid" style={{ width: '100%', height: '150px' }}>

                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='row'>
                                <div>
                                    <div /*className="Cavity-Grid-Container"*/ style={{ border: '1px solid #573DAC' }}>
                                        <div>
                                            <Table striped bordered hover responsive-table variant="light">
                                                <thead>
                                                    <tr>
                                                        <th style={{ backgroundColor: "#acb5a7", color: "black" }}> <span> {"Title"} </span> </th>

                                                        {[Header1, Header2, Header3].map((value, key) => (
                                                            <React.Fragment key={key}>
                                                                <th key={key} style={{ width: '160px', backgroundColor: "#acb5a7", color: "black" }}> <span> {value} </span> </th>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="grid_style">

                                                    <tr>
                                                        <td> {"Average"} </td>
                                                        {[1, 2, 3].map((value1, key1) => (
                                                            <React.Fragment key={key1}>
                                                                <td> {Average[key1] || ''} </td>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td> {"Min"} </td>

                                                        {[1, 2, 3].map((value1, key1) => (
                                                            <React.Fragment key={key1}>
                                                                <td> {isFinite(MinPart[key1]) ? MinPart[key1] : ''} </td>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td> {"Max"} </td>
                                                        {[1, 2, 3].map((value1, key1) => (
                                                            <React.Fragment key={key1}>
                                                                <td> {isFinite(MaxPart[key1]) ? MaxPart[key1] : ''} </td>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td> {"Range"} </td>

                                                        {[1, 2, 3].map((value1, key1) => (
                                                            <React.Fragment key={key1}>
                                                                <td> {isFinite(Range[key1]) ? Range[key1] : ''} </td>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td> {"% Variation"} </td>

                                                        {[1, 2, 3].map((value1, key1) => (
                                                            <React.Fragment key={key1}>
                                                                <td style={{ color: parseFloat(Acceptable_variation) > parseFloat(Percentage[key1]) ? '' : 'red' }}> {Percentage[key1] || ''} </td>
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>

                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default ShotCalcGrid;