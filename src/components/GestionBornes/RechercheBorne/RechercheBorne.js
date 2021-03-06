import React, { Component } from 'react';
import { Container, Row, Col, Collapse, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { Divider } from '@material-ui/core';

import rollDown from "./rollDown.svg";
import rollUp from "./rollUp.svg";
import './RechercheBorne.css';

import axios from "axios";
import { getToken } from '../../../scripts/Network';
import ListBornes from '../ListBornes';



const API_BORNES = process.env.REACT_APP_GESTION_BORNES_URL;
const MICROSERVICES = { wilayas: 'wilaya/', filtres: 'filter/' }

class RechercheBorne extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Form state
            wilaya: '',
            commune: '',
            capacite: '',
            qtt: 'min',
            placesLibres: '',
            id: '',

            // Data from DB
            wilayas: [],
            toutesCommunes: [],
            communes: [],

            // State of UI elements
            collapse: false,
            bornes: null,
            staticBornes: null
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    /**
     * recupère les bornes disponibles et modifie l'état du composant
     */
    componentDidMount() {
        let tokenStr = getToken();
        let MICROSERVICE = API_BORNES + MICROSERVICES['wilayas']
        let allWilayas = [], allCommunesWil = [], allCommunes = []

        axios.get(MICROSERVICE, { headers: { "authorization": `Bearer ${tokenStr}` } })
            .then((res) => {
                for (const elt of res.data) {
                    allWilayas.push(elt['wilaya'])
                }

                // Remplissage de la liste des wilayas
                this.setState({ wilayas: allWilayas.sort() })

                // Partie commentée : servait dans une version précédente à 
                // remplir la liste des wilayas en parcourant toutes les bornes
                /*this.setState({
                    wilayas: (allWilayas.filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    })).sort()
                })*/

                // Si tout ce qui précède s'est bien déroulé, on exécute les requêtes suivantes (communes)
                allWilayas.forEach(elt => {
                    axios.get(MICROSERVICE + elt + '/commune', { headers: { "authorization": `Bearer ${tokenStr}` } })
                        .then((result) => {
                            allCommunesWil = []
                            allCommunesWil.push()
                            result.data.forEach(datac => {
                                allCommunesWil.push(datac['commune'])
                            })
                            allCommunesWil.sort()
                            allCommunes.push(elt, allCommunesWil)
                        }).catch(error => {
                            this.errorHandler()
                        })
                })

                // Remplissage de la liste des communes
                this.setState({ toutesCommunes: allCommunes })

            }).catch(error => {
                this.errorHandler(error)
            })
    }

    /**
     * change l'état du composant selon les entrées de l'utilisateur
     * @param {Event} e 
     */
    handleChange(e) {
        const name = e.target.name
        this.setState({
            [name]: e.target.value
        })

        // On ajuste la liste des communes selon la wilaya sélectionnée
        if (name === 'wilaya') {
            this.customListCommunes(e.target.value)
        }
    }

    /**
     * envoie une liste de bornes au composant d'affichage de liste
     * @param {Event} e 
     */
    handleSubmit(e) {
        e.preventDefault();

        let MICROSERVICE;
        let newProps = [];
        //Cas où l'on a une recherche par l'id (service get borne par id)
        let tokenStr = getToken();
        if (this.state.id != '') {
            MICROSERVICE = API_BORNES + this.state.id.toString() + '/'
            axios.get(MICROSERVICE, { headers: { "authorization": `Bearer ${tokenStr}` } })
                .then((res) => {
                    this.setState({ bornes: res.data })
                    this.setState({ staticBornes: res.data })
                })
                .catch(error => {
                    this.errorHandler(error)
                })


            //Cas où l'on a une recherche multicritères
        } else {
            MICROSERVICE = API_BORNES + MICROSERVICES['filtres']
            let tokenStr = getToken();
            let capacite = this.checkCapacite(this.state.capacite)

            axios.post(MICROSERVICE, {
                //idBorne: this.state.id != '' ? parseInt(this.state.id) : null,
                wilaya: this.state.wilaya != '' ? this.state.wilaya : null,
                commune: this.state.commune != '' ? this.state.commune : null,
                nbVehiculesMin: parseInt(capacite[0]),
                nbVehiculesMax: parseInt(capacite[1]),
                nbPlacesOp: this.state.qtt,
                nbPlaces: this.state.placesLibres != '' ? parseInt(this.state.placesLibres) : (this.state.qtt == 'min' ? 0 : 99999)
            }, { headers: { "authorization": `Bearer ${tokenStr}` } }).then((res) => {
                this.setState({ bornes: res.data })
                //this.setState({ staticBornes: res.data })
            }).catch(error => {
                this.errorHandler(error)
            })
        }
    }

    /**
     * récupère la liste des communes selon la wilaya spécifiée
     * @param {String} valWilaya le nom de la wilaya 
     */
    customListCommunes(valWilaya) {
        let stop = false, i = 0
        let commWilaya = []

        this.state.communes = []

        while (stop === false && i < this.state.toutesCommunes.length) {
            if (this.state.toutesCommunes[i] === valWilaya) {
                commWilaya = this.state.toutesCommunes[i + 1]
                stop = true
            }
            i += 2
        }

        this.setState({ communes: commWilaya })
    }

    /**
     * remet le composant à son état par défaut
     */
    setToDefault() {
        this.state.wilaya = '';
        this.state.capacite = '';
        this.state.id = '';
        this.state.placesLibres = '';
        this.state.commune = '';
    }
    /**
     * vérifie si une borne remplit le critère de capacité
     * @param {String} capacite 
     * @returns {Array} of int 
     */
    checkCapacite(capacite) {
        let res = [];
        switch (capacite) {
            case '10':
                res = [0, 9]
                break;
            case '50':
                res = [10, 50]
                break;
            case '100':
                res = [50, 100]
                break;
            case '101':
                res = [100, 99999]
                break;
            default:
                res = [0, 99999]
                break;
        }
        return res;
    }

    /**
     * change l'état d'affichage du composant de recherche
     * @param {Event} e 
     * @returns {Boolean} 
     */
    onCollapseClick(e) {
        e.preventDefault();
        this.setState((state, props) => ({
            collapse: !state.collapse
        }));
        return this.state.collapse;
    }

    /**
     * affiche un message selon l'erreur qui s'est produite
     */
    errorHandler(err) {
        if (err && err.response) {
            window.alert("Erreur : " + err.response.status + " - " + err.response.data.error);
        } else if (err.request) {
            window.alert("Pas de réponse ou requête non envoyée !");
        } else {
            window.alert("Une erreur est survenue !");
        }
    }

    render() {
        return (
            <>
                <div className="main-content">
                    <Container>
                        <Row>
                            <Col xs={12}>
                                <Row>
                                    <Col xs={3}>
                                        <h2>Rechercher une borne</h2>
                                    </Col>
                                    <Col xs={1}>
                                        <div>
                                            <a onClick={(e) => this.onCollapseClick(e)}>
                                                <img src={(this.state.collapse) ? rollUp : rollDown}
                                                    alt="collapse" />
                                            </a>
                                        </div>
                                    </Col>
                                    <Col xs={8}></Col>
                                </Row>

                                <Collapse isOpen={this.state.collapse} style={{ backgroundColor: '#ffffff', padding: '2.5%' }}> {/* Permettre un affichage lors du clic */}
                                    <Form onSubmit={this.handleSubmit}>
                                        <Row>
                                            <Col xs={12} md={9}>
                                                <Row>
                                                    <Col xs={12} md={4}>
                                                        <FormGroup>
                                                            <Label for="rb-wilaya">Wilaya</Label>
                                                            <Input type="select" name="wilaya" id="rb-wilaya"
                                                                value={this.state.wilaya} onChange={this.handleChange}>
                                                                <option value="">-</option>
                                                                {this.state.wilayas.map((wil) => {
                                                                    return <option value={wil}>{wil}</option>
                                                                })}
                                                            </Input>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col xs={12} md={4}>
                                                        <FormGroup>
                                                            <Label for="rb-commune">Communes</Label>
                                                            <Input type="select" name="commune" id="rb-commune"
                                                                value={this.state.commune} onChange={this.handleChange}>
                                                                <option value="">-</option>
                                                                {this.state.communes.map((comm) => {
                                                                    return <option value={comm}>{comm}</option>
                                                                })}
                                                            </Input>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col xs={12} md={4}>
                                                        <FormGroup>
                                                            <Label for="rb-capacite">Places totales</Label>
                                                            <Input type="select" name="capacite" id="rb-capacite"
                                                                value={this.state.capacite} onChange={this.handleChange}>
                                                                <option value="">-</option>
                                                                <option value="10">Moins de 10</option>
                                                                <option value="50">Entre 10 et 50</option>
                                                                <option value="100">Entre 50 et 100</option>
                                                                <option value="101">Plus de 100</option>
                                                            </Input>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col xs={12} md={6}>
                                                        <Label for="rb-qtt">Places libres</Label>
                                                        <Row>
                                                            <Col xs={6}>
                                                                <Input type="select" name="qtt" id="rb-qtt"
                                                                    value={this.state.qtt} onChange={this.handleChange}>
                                                                    <option value="min">min</option>
                                                                    <option value="max">max</option>
                                                                </Input>
                                                            </Col>
                                                            <Col xs={6}>
                                                                <Input type="select" name="placesLibres" id="rb-plibres"
                                                                    value={this.state.placesLibres} onChange={this.handleChange}>
                                                                    <option value="">-</option>
                                                                    <option value="5">5</option>
                                                                    <option value="10">10</option>
                                                                    <option value="30">30</option>
                                                                    <option value="50">50</option>
                                                                    <option value="100">100</option>
                                                                </Input>
                                                            </Col>
                                                        </Row>
                                                    </Col>

                                                    <Col xs={12} md={6}>
                                                        <FormGroup>
                                                            <Label for="rb-id">id</Label>
                                                            <Input type="number" name="id" id="rb-id" placeholder="Saisissez l'id de la borne"
                                                                value={this.state.id} onChange={this.handleChange} />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            {/*JSON.stringify(this.state)*/}

                                            <Col xs={12} md={3} className="mt-md-6 mt-xs-0">
                                                <FormGroup>
                                                    <Button type="submit" className="custom-btn-default" style={{ backgroundColor: '#252834', color: '#ffffff' }}>LANCER</Button>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <em><center>Remarque : Lorsque vous effectuez une recherche par id, les autres champs sont ignorés.</center></em>
                                </Collapse>
                            </Col>
                            <Divider variant="inset" style={{ width: "90%" }} />
                        </Row>
                    </Container >
                    <ListBornes bornes={this.state.bornes}></ListBornes>
                </div>
            </>
        )
    };
}

export default RechercheBorne;






// ------------------------------------------------------------------------------------------------------
/******* DEPRECATED METHODS *******/
/*
 * filtre les bornes selon les critères de recherche de l'utilisateur
 * @param {String} id
 * @param {String} wilaya
 * @param {String} commune
 * @param {String} qtt
 * @param {String} pLibre
 * @param {String} capacite
 * @returns {Array} of Bornes
 *//*
getBornesOnConditions(id = "", wilaya = "", commune = "", qtt = "", pLibre = "", capacite = "") {
return this.state.bornes.filter(borne =>
(id != "" ? (borne[0] == id ? true : false) : true)
&& (wilaya != "" ? (borne[1] == wilaya ? true : false) : true)
&& (commune != "" ? (borne[2] == commune ? true : false) : true)
&& (pLibre != "" ? (this.checkPlacesLibres(qtt, pLibre, borne) ? true : false) : true)
&& (capacite != "" ? (this.checkCapacite(capacite, borne) ? true : false) : true)
)
}

/**
* vérifie si une borne remplit le critère de places libres
* @param {String} qtt
* @param {Stirng} pLibre
* @param {String} borne
* @returns {Boolean}
*//*
checkPlacesLibres(qtt, pLibre, borne) {
   if (qtt == "min") {
       if (parseInt(pLibre) <= parseInt(borne[3])) {
           return true
       } else {
           return false
       }
   } else {
       if (parseInt(pLibre) >= (parseInt(borne[3]))) {
           return true
       } else {
           return false
       }
   }
}*/