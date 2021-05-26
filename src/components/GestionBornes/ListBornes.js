import React, { Component } from 'react';
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { Container, Row, Col } from 'reactstrap';

import {
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    DropdownToggle,
    Button
}  from "reactstrap";

import Map from "./Map.js"
import AddBorne from "./AddBorne.js"
const API_All_BORNES= process.env.REACT_APP_GESTION_BORNES_URL+'all';
const API_DELETE_BORNE = process.env.REACT_APP_GESTION_BORNES_URL+'all';




class ListBornes extends Component{
    constructor(props){
        super(props)
        this.onRowSelection = this.onRowSelection.bind(this);
        this.onRowsSuprrimer = this.onRowsSuprrimer.bind(this);
        this.onHideAddBorneModal = this.onHideAddBorneModal.bind(this);
        this.showAddBorneModal = this.showAddBorneModal.bind(this);
            this.state = {
                selected: [36.7029047,3.1428341],
                data: [],
                showModal: false,
                showAlertIrreversible: false,
                showSuccessOperation: false,
                keyModal:0,  // we change the key of the modal so react re render it with shown state as true 
            }
    }

    componentDidMount(){
        if(this.props.bornes==null){    
          let bornes = []
          this.setState({data:bornes});
         axios.get(API_All_BORNES)
        .then((res) => {
            let bornes = []
            for (const borne of res.data) {
                bornes.push([borne['idBorne'],borne['wilaya'],borne['nbVehicules'],borne['nbPlaces'],[borne['latitude'],borne['longitude']],borne['nomBorne']])
            }
           this.setState({data:bornes});

        })
        .catch(err => {
          if (err.response) {
            window.alert(err.response.data)
          } else if (err.request) {
            // client never received a response, or request never left
            window.alert("Pas de réponse ou requête non envoyée !")
          } else {
            window.alert("une erreur est survenue !")
          }}
          )
    }else{
         this.setState({data:this.props.bornes});
    }    
    }
    //without using async i had a problem : setState doesnt set the state immediatly so accesing the state right  after setting it returns an old value
    async onRowSelection(rowData, rowMeta){
          await this.setState({selected : rowData[4],popup:rowData[5]});
    }

    async componentWillReceiveProps(nextProps) {
     // await this.setState({ position: nextProps.coordonnes ,popup: nextProps.popup});
     let newBornes = []
     for (const borne of nextProps.bornes) {
      newBornes.push([borne['idBorne'],borne['wilaya'],borne['nbVehicules'],borne['nbPlaces'],[borne['latitude'],borne['longitude']],borne['nomBorne']])
     }
     await this.setState({data:newBornes});
     }

     onRowsSuprrimer(rowsDeleted){
        //const idsToDelete = rowsDeleted.data.map(d => data[d.dataIndex].id); // array of all ids to to be deleted
        console.log(rowsDeleted);
  //  console.log(this.state.data[rowsDeleted.data[0].dataIndex])
        return true
     }

      showAddBorneModal(){
        this.setState({showModal:true,keyModal: this.state.keyModal + 1 % 2})
     }

     onHideAddBorneModal(success){
         this.setState({showSuccessOperation:success})
     }


    render(){
        const columns = [
        {
                name: "ID",
                options: {
                    sort: true
                }
        }, 
        {
            name: "Wilaya",
            options: {
                sort: true
            }
        },
        {
            name: "Capacité",
            options: {
                sort: true
            }
        },
        {
            name: "Places libres",
            options: {
                sort: true
            }
        },
        {
            name: "cordonnees",
            options: {
              display: false,
            }
        },
        {
            name: "nom",
            options: {
              display: false,
            }
        },
        {
            name: "",
            options: {
              filter: false,
              sort: false,
              empty: true,
              customBodyRenderLite: (dataIndex) => {
                return (                  
                  <UncontrolledDropdown>
                  <DropdownToggle
                    className="btn-icon-only text-light"
                    href="#pablo"
                    role="button"
                    size="sm"
                    color=""
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fas fa-ellipsis-v" />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-arrow" right>
                    <DropdownItem
                      href="#"
                      onClick={(e) => {e.preventDefault(); console.log(dataIndex);}}
                    >
                      Détails
                    </DropdownItem>
                    <DropdownItem
                      href="#"
                      onClick={(e) => {e.preventDefault(); console.log(dataIndex); this.onRowsSuprrimer(dataIndex);}}
                      style={{color:'#F5365C'}}
                    >
                      Supprimer
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                );
              }
            }
          }
        ];

        const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        responsive: 'simple',
        filter: false,
        print: false,
        onRowClick: this.onRowSelection,
        onRowsDelete: this.onRowsSuprrimer,
        textLabels: {
          body: {
            noMatch: "Désolé, Aucune donnée trouvée",
            toolTip: "Trier",
          },
          pagination: {
            next: "Page suivante",
            previous: "Page précédente",
            rowsPerPage: "Ligne par page:",
            displayRows: "/",
          },
          selectedRows: {
            text: "ligne(s) sélectionné(s)",
            delete: "Supprimer",
            deleteAria: "Supprimer les lignes choisies",
          },
        },
        };
        return(
            <div className="main-content">
            <div className="mt-40">
                <Container>    
                    <Row>
                        <Col xs={6} md={8}>
                            <h2>Liste des bornes</h2>
                            <MUIDataTable
                                title={
                                <div>
                                  <Row>
                                    <Col md={8}>
                                        <h3>{"Toutes les bornes ("+this.state.data.length+" résultats)"}</h3>
                                    </Col>
                                    <Col md={4}>
                                       <Button onClick={this.showAddBorneModal}>Ajouter</Button>
                                    </Col>
                                  </Row>
                                </div>}
                                data={this.state.data}
                                columns={columns}
                                options={options}
                                />
                        </Col>
                        <Col xs={6} md={4}>
                            <h2>Position sur la carte</h2>
                        <Map coordonnes={this.state.selected} popup={this.state.popup}></Map>
                        </Col>
                    </Row>
                    <AddBorne key={this.state.keyModal} shown={this.state.showModal} onHide={this.onHideAddBorneModal}></AddBorne>
            </Container>
            </div>
           </div>)
            
}}
export default ListBornes; 