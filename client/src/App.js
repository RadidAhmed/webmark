import "./App.css";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import React from "react";
import UserWindow from "./UserWindow"
import auth from "./FirebaseAuth.js";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useHistory, Link as RouterLink } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div>
         <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/SignIn">SignIn</Link>
            </li>
          </ul>
        </nav>
 
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route exact path="/userWindow">
            <UserWindow />
          </Route>
          <Route exact path="/SignIn">
            <SignIn />
          </Route>
          <Route exact path="/SignUp">
            <SignUp />
          </Route>
          <Route path="/">
          <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  let history = useHistory();
  auth.auth().onAuthStateChanged((user) => {
    if (user) {
      history.push("/userWindow");
      var uid = user.uid;
      console.log("ID IS ", uid);
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
  return <h1> Home </h1>;
}

function About() {
  var user = auth.auth().currentUser;
  console.log(user);
  if (user)
    return <h2>The user { user.displayName} has signed up to the service</h2>;
  else return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}
