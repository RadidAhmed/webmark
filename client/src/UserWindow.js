import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { fade, makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import Button from "@material-ui/core/Button";
import { useState } from "react";
import Link from "@material-ui/core/Link";
import auth from "./FirebaseAuth.js";
import { useHistory, Link as RouterLink } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

const style = {
  height: 200,
  width: 200,
  border: "1px solid green",
  margin: 6,
  padding: 8,
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  con: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
    gridTemplateRows: "auto",

  },

  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: theme.spacing(1, 1, 1, 1),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {},

  signout: {
    padding: theme.spacing(0, 1, 0, 2),
  },
  search: {
    position: "relative",
    borderRadius: 30,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "70vw",
      "&:focus": {
        width: "80vw",
      },
    },
  },
}));

export default function ButtonAppBar() {
  let history = useHistory();
  const [hasMore, setHasMore] = useState(true);
  const [items, setItems] = useState(Array.from({ length: 5 }));

  //Check if logged in
  auth.auth().onAuthStateChanged((user) => {
    if (user) {
      var uid = user.uid;
      console.log("ID IS ", uid);
      // ...
    } else {
      // User is signed out
      history.push("/Home");
    }
  });

  //import styles
  const classes = useStyles();


//signout function
  const signOut = () => {
    auth
      .auth()
      .signOut()
      .then(() => {
        console.log("signed out");
      })
      .catch((error) => {
        console.log("something went wrong with signout!");
      });
  };

  //fectching
  let fetchMoreData = () => {
    if (items.length >= 500) {
      setHasMore(false);
      return;
    }
    // a fake async api call like which sends
    // 20 more records in .5 secs
    console.log("iteams are", items.length);
    setTimeout(() => {
      console.log("iteams are", items.length);
      setItems(items.concat(Array.from({ length: 20 })));
      console.log("iteams are", items.length);
    }, 500);
  };

  let addData = () => { 
    setItems(Array.from("a").concat(items));
  }

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar className={classes.container}>
          <Typography variant="h6" className={classes.title}>
            WebMark
          </Typography>

          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onClick={addData}
              inputProps={{ "aria-label": "search" }}
            />
          </div>
          <Link
            href="/"
            color="inherit"
            onClick={signOut}
            className={classes.signout}
          >
            <Typography className={classes.title}>SingOut</Typography>
          </Link>
        </Toolbar>
      </AppBar>

      <InfiniteScroll
        className={classes.con}
        dataLength={items.length} //This is important field to render the next data
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {items.map((i, index) => {
          if (i) {
            return (
              <div style={style} key={index}>
                div - #{i}
              </div>
            )
          } else { 
            return (
              <div style={style} key={index}>
                div - #{index}
              </div>
            )
          }
        })}
      </InfiniteScroll>
    </div>
  );
}
