import './App.css';
import Sidebar from "./components/Sidebar/Sidebar"
import ListeVehicules from "./components/GestionVehicules/ListeVehicules"
import HistoriqueVehicule from "./components/GestionVehicules/HistoriqueVehicule"
import DetailsVehicule from "./components/GestionVehicules/DetailsVehicule"
import Login from "./components/Auth/Connexion"
//Dashboard
import DashboardView from "./components/Dashboard/DashboardView"

import ListLocataires from "./components/GestionUtilisateurs/ListLocataires"
import ListBornes from "./components/ListBornes.js"
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import Locataire from './components/GestionUtilisateurs/Locataire';
import Navs from './components/GestionUtilisateurs/Tab'
import Admin from './components/GestionUtilisateurs/Admin';
import Agent from './components/GestionUtilisateurs/Agent';

function App() {
  return (

      <Router>
        <Sidebar> 
        </Sidebar>

        <Switch>
          <Route path="/login">
            <Login/>
          </Route>
          <Route path="/dashboard">
            <DashboardView></DashboardView>
          </Route>
          <Route exact path="/vehicules">
              <ListeVehicules></ListeVehicules>          
          </Route>
          <Route path="/historique">
            <HistoriqueVehicule></HistoriqueVehicule>
          </Route>
          <Route path="/vehicules/:id" component= {props => (
            <DetailsVehicule
              {...props}
            />
          )} />
          <Route exact path="/bornes">
              <ListBornes bornes={null}></ListBornes>         
          </Route>
          
          <Route exact path="/utilisateurs">
              <Navs></Navs>          
          </Route>
          <Route path="/locataires/:id" component={Locataire}/>
          <Route path="/administrateurs/:id" component={Admin}/>
          <Route path="/agents/:id" component={Agent}/>
        </Switch>
        
      </Router>

  );
}

export default App;
