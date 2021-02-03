import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { fade, makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { useState } from "react";
import Link from "@material-ui/core/Link";
import auth from "./FirebaseAuth.js";
import { useHistory } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import CssBaseline from "@material-ui/core/CssBaseline";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#A9A9A9",
  },
  con: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(256px, 1fr))",
    gridTemplateRows: "1fr",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 70,
    gap: 10,
  },
  img: {
    "&:hover": {
      opacity: 0.8,
    },
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
  //import styles
  const classes = useStyles();
  let history = useHistory();
  const [hasMore, setHasMore] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [imageList, setImagelist] = useState({
    items: [],
    page: 0,
  });
  //fectching
  let fetchMoreData = () => {
    if (!hasMore) {
      return;
    }
    auth.auth().onAuthStateChanged((user) => {
      if (user) {
        var uid = user.uid;
        auth
          .auth()
          .currentUser.getIdToken(/* forceRefresh */ true)
          .then(function (idToken) {
            const option2 = {
              method: "GET", //GET, POST, PUT, DELETE, etc.
              mode: "cors", // no-cors, *cors, same-origin
              headers: {
                Authorization: idToken,
              },
            };
            fetch(
              `http://localhost:5000/getImages?page=${imageList.page}`,
              option2
            )
              .then((result) => result.json())
              .then((result) => {
                if (result.length == 0) {
                  setHasMore(false);
                  return;
                }
                setImagelist({
                  items: imageList.items.concat(result),
                  page: imageList.page + 1,
                });
              });
          });
        // ...
      } else {
        // User is signed out
        history.push("/");
      }
    });
  };

  let addData = (event) => {
    if (event.keyCode == 13) {
      setDisabled(true);
      const link = event.target.value;
      event.target.value = ""
      auth
        .auth()
        .currentUser.getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          const option = {
            method: "POST", //GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            headers: {
              Authorization: idToken,
              "Content-Type": "text/plain",
            },
            body: link,
          };

          fetch("http://localhost:5000/addImage", option)
            .then((reponse) => reponse.json())
            .then((reponse) => {
              setImagelist({
                items: reponse.concat(imageList.items),
                page: imageList.page,
              });
              setDisabled(false);
            })
            .catch((e) => {
              console.log(e);
              setDisabled(false);
            });
        })
        .catch(function (error) {
          // Handle error
        });
    }
  };

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

  if (imageList.items.length == 0 && imageList.page == 0) fetchMoreData();

  return (
    <CssBaseline>
      <div className={classes.root}>
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
                disabled={disabled}
                onKeyDown={addData}
                inputProps={{ "aria-label": "search" }}
              />
            </div>
            <Link
              href="/"
              color="inherit"
              onClick={signOut}
              className={classes.signout}
            >
              <Typography className={classes.title}>Sign Out</Typography>
            </Link>
          </Toolbar>
        </AppBar>

        <InfiniteScroll
          className={classes.con}
          dataLength={imageList.items.length} //This is important field to render the next data
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          /*    endMessage={
            <Typography>Yay! You have seen it all</Typography>
        } */
        >
          {imageList.items.map((i, index) => {
            if (i) {
              return (
                <Link href={i.web_link} target="_blank" key={index}>
                  <img
                    src={i.image_link}
                    style={{ width: "100%", height: "100%" }}
                    className={classes.img}
                    alt="website image"
                  />
                </Link>
              );
            }
          })}
        </InfiniteScroll>
      </div>
    </CssBaseline>
  );
}
