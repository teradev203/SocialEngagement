import { useCallback, useState } from "react";
import { AppBar, Toolbar, Box, Button, SvgIcon, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ReactComponent as MenuIcon } from "../../assets/icons/hamburger.svg";
import OhmMenu from "./OhmMenu.jsx";
import ThemeSwitcher from "./ThemeSwitch.jsx";
import ConnectMenu from "./ConnectMenu.jsx";
import "./topbar.scss";
import LogoImg from '../../assets/icons/olympus-nav-header.png'
import { ReactComponent as StakeIcon } from "../../assets/icons/stake.svg";
import { ReactComponent as ZapIcon } from "../../assets/icons/zap.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard.svg";
import { NavLink } from "react-router-dom";
import Social from "../Sidebar/Social";

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: "100%",
      padding: "10px",
    },
    justifyContent: "flex-end",
    alignItems: "flex-end",
    background: "transparent",
    backdropFilter: "none",
    zIndex: 10,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("981")]: {
      display: "none",
    },
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "20px",
  },
  logoTitle: {
    fontFamily: "Black Han Sans, Sans-serif",
    color: "#00AB44",
    fontSize: "1.7138rem",
    fontWeight: "bold",
    paddingLeft: "10px",
    paddingRight: "35px",
    paddingTop: "5px"
  },
  buttonProp: {
    paddingLeft: "50px",
  }
}));

function TopBar({ theme, toggleTheme, handleDrawerToggle }) {
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [isActive] = useState();

  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("state") >= 0 && page === "state") {
      return true;
    }
    if (currentPath.indexOf("wallet") >= 0 && page === "wallet") {
      return true;
    }
    if (currentPath.indexOf("swap") >= 0 && page === "swap") {
      return true;
    }
    return false;
  }, []);

  const ButtonGroup = () => {
    return (
      <>
      {isSmallScreen ? <div> </div> : 
      <div className={classes.logo}>
        <a href="https://memekong.io/" target="blank">
          <img src={LogoImg} alt="" style={{ height: "40px" }} />
        </a>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link
            component={NavLink}
            id="dash-nav"
            to="/dashboard"
            isActive={(match, location) => {
              return checkPage(match, location, "dashboard");
            }}
            className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h3" className={classes.buttonProp} >
              Home
            </Typography>
          </Link>
          <Link
            component={NavLink}
            id="dash-nav"
            to="/dashboard"
            isActive={(match, location) => {
              return checkPage(match, location, "dashboard");
            }}
            className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h3" className={classes.buttonProp} >
              Social
            </Typography>
          </Link>
          <Link
            component={NavLink}
            id="stake-nav"
            to="/stake"
            isActive={(match, location) => {
              return checkPage(match, location, "stake");
            }}
          // className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h3" className={classes.buttonProp}>
              Wallet
            </Typography>
          </Link>
        </div>
      </div>
      }
    </>
    );
  };

  return (
    <AppBar position="sticky" className={classes.appBar} elevation={0}>
      <Toolbar disableGutters className="dapp-topbar">
        <Button
          id="hamburger"
          aria-label="open drawer"
          edge="start"
          size="large"
          variant="contained"
          color="secondary"
          onClick={handleDrawerToggle}
          className={classes.menuButton}
        >
          <SvgIcon component={MenuIcon} />
        </Button>
        <Box display="flex" justifyContent="space-between" width="100%">
          <ButtonGroup/>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConnectMenu theme={theme} />
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
